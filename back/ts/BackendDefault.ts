import { Bucket } from "@google-cloud/storage";
import * as admin from "firebase-admin";
import { cert } from "firebase-admin/app";
import { decode_jwt } from "@chromane/shared/ts/util";
import Stripe from "stripe";
const { google } = require("googleapis");
import { FirebaseApp, initializeApp } from "firebase/app";
import { GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, signInWithCredential, signInWithEmailAndPassword } from "firebase/auth";

function str_arr_to_str(input: string | string[] | undefined) {
  if (input instanceof Array) {
    if (input[0]) {
      return input[0];
    } else {
      return "";
    }
  } else if (input) {
    return input;
  } else {
    return "";
  }
}
function customer_to_status(customer: any, premium_product_id: string) {
  try {
    let sub_data_arr = customer.subscriptions.data;
    console.log(sub_data_arr);
    console.log(JSON.stringify(sub_data_arr));
    for (let sub_data of sub_data_arr) {
      if (sub_data.status === "active" || sub_data.status === "trialing") {
        try {
          let sub_product_id = sub_data.items.data[0].price.product;
          if (sub_product_id === premium_product_id) {
            return "unlimited";
          }
        } catch (e) {}
      }
    }
  } catch (e) {
    return "free";
  }
  return "free";
}

export default class BackendDefault {
  // props
  jwt_claims: any;
  config: any;
  secrets: any;
  //
  app: any;
  db: admin.firestore.Firestore;
  bucket: Bucket;
  //   init
  constructor(config, secrets, jwt_claims) {
    this.jwt_claims = jwt_claims;
    this.config = config;
    this.secrets = secrets;
    //
    this.app = admin.initializeApp({
      credential: cert(secrets.service_account as admin.ServiceAccount),
      storageBucket: config.firebase_config.storageBucket,
    });
    this.db = this.app.firestore();
    this.bucket = admin.storage().bucket();
  }
  // save_user_as_lead

  // public
  async get_user(req) {
    const decoded_token = await admin.auth().verifyIdToken(req.body.token);
    const user = await admin.auth().getUser(decoded_token.uid);
    return { user };
  }
  async update_user(req) {
    const decoded_token = await admin.auth().verifyIdToken(req.body.token);
    const update_data = req.body.data;
    const user = await admin.auth().updateUser(decoded_token.uid, update_data);
    return { user };
  }
  async delete_user(req) {
    const decoded_token = await admin.auth().verifyIdToken(req.body.token);
    const user_ref = this.db.collection("users").doc(decoded_token.uid);

    await admin.auth().deleteUser(decoded_token.uid);
    await user_ref.delete();

    return { deleted: true };
  }
  async get_user_data(req) {
    var decoded_token = await admin.auth().verifyIdToken(req.body.token);
    let result = await this.db.collection("users").doc(decoded_token.uid).get();
    let name;
    if (req.body.data && req.body.data.name) {
      name = req.body.data.name || "";
    } else {
      name = decoded_token.name || "";
    }
    let user_doc;
    if (result.exists) {
      user_doc = result.data();
    } else {
      user_doc = {
        email: decoded_token.email || "",
        name,
        status: "new",
      };
      await this.db.collection("users").doc(decoded_token.uid).set(user_doc);
    }
    // transfer claims from user_doc to token
    // todo: refresh a token immediately after this
    let claims = decoded_token;
    console.log("claims", claims);
    for (let claim_name of this.jwt_claims) {
      if (
        //
        user_doc.hasOwnProperty(claim_name) === true &&
        // claims.hasOwnProperty(claim_name) === true &&
        user_doc[claim_name] !== claims[claim_name]
      ) {
        await admin.auth().setCustomUserClaims(decoded_token.uid, { [claim_name]: user_doc[claim_name] });
      }
    }
    //
    return user_doc;
  }
  // redirects
  async redirect(req) {
    return {
      _redirect: true,
      location: `chrome-extension://${this.config.extension_id}/pages/redirect/index.html?code=${req.query.code}&state=${req.query.state}&event_name=${req.query.event_name}`,
    };
  }

  // oauth and search console api
  get_default_oauth_client() {
    //
    let client_id = this.config.google_cloud_oauth_client_id;
    let client_secret = this.secrets.google_cloud_oauth_client_secret;
    let redirect_url = `${this.config.urls.backend_root}/redirect`;
    //
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_url);
    //
    return oauth2Client;
    //
  }
  //   todo: replace this with a front-end function
  async get_authorize_url_from_scopes(req) {
    //
    let scopes = req.body.data.scopes;
    //
    let client = this.get_default_oauth_client();
    // generate a url that asks permissions for Blogger and Google Calendar scopes
    const url = client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",
      scope: scopes,
      prompt: "select_account",
      include_granted_scopes: true,
      // If you only need one scope you can pass it as a string
    });
    return url;
    //
  }
  async refresh_tokens(req) {
    let r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.config.google_cloud_oauth_client_id,
        client_secret: this.secrets.google_cloud_oauth_client_secret,
        refresh_token: req.body.data.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    let json = await r.json();
    console.log("refresh_token json", json);
    return json;
  }
  async auth_code_to_tokens(req) {
    let code = req.body.data.code;
    let client = this.get_default_oauth_client();
    const { tokens } = await client.getToken(code);
    return tokens;
  }
  // table apis
  async table_get_meta(req) {
    const decoded_token = await admin.auth().verifyIdToken(req.body.token);
    if (decoded_token.role_admin) {
      let { collection } = req.body.data;
      const ref = this.db.collection(collection);
      const snapshot = await ref.count().get();
      let count = snapshot.data().count;
      return {
        count,
      };
    } else {
      return false;
    }
  }
  async table_get_rows(req) {
    const decoded_token = await admin.auth().verifyIdToken(req.body.token);
    if (decoded_token.role_admin) {
      let { collection } = req.body.data;
      this.db.collection(collection);
      let snapshot = await this.db.collection(collection).limit(50).get();
      let docs: any = [];
      snapshot.forEach((doc) => {
        let data = doc.data();
        data.id = doc.id;
        docs.push(data);
      });
      return docs;
    } else {
      return false;
    }
  }
  // todo: add security here
  // only allow authenticated users with the right roles to add rows
  //
  async table_row_add(req) {
    const decoded_token = await admin.auth().verifyIdToken(req.body.token);
    if (decoded_token.role_admin) {
      let { collection, data } = req.body.data;
      //
      await this.db.collection(collection).doc().set(data);
      //
      return true;
    } else {
      return false;
    }
  }
  async table_row_delete(req) {
    const decoded_token = await admin.auth().verifyIdToken(req.body.token);
    if (decoded_token.role_admin) {
      let { collection, row_id } = req.body.data;
      //
      await this.db.collection(collection).doc(row_id).delete();
      //
      return true;
    } else {
      return false;
    }
  }
  async table_row_edit(req) {
    const decoded_token = await admin.auth().verifyIdToken(req.body.token);
    if (decoded_token.role_admin) {
      let { collection, data } = req.body.data;
      //
      await this.db.collection(collection).doc(data.id).set(data);
      //
      return true;
    } else {
      return false;
    }
  }
  async enable_bucket_cors() {
    await this.bucket.setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ["GET"],
        origin: ["*"],
        // responseHeader: ["Content-Type"],
        // responseHeader: [responseHeader],
      },
    ]);
  }
  async table_file_cell_get_download_url(req) {
    //
    let { file_name } = req.body.data;
    let [url] = await this.bucket.file(file_name).getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 1000 * 60 * 2, // 2 minutes
    });
    return url;
  }
  //
  async get_customer_action_records(req) {
    let { collection, customer_id } = req.body.data;
    let snapshot = await this.db.collection(collection).where("customer_id", "==", customer_id).limit(50).get();
    let docs: any = [];
    snapshot.forEach((doc) => {
      let data = doc.data();
      data.id = doc.id;
      docs.push(data);
    });
    return docs;
  }
  // saves the google sheet information in firestore
  async get_config() {
    let ref = this.db.collection("settings").doc("default");
    let doc = await ref.get();
    return doc.data();
  }
  async get_prompt(req) {
    //
    let { prompt_id } = req.body.data;
    var decoded_token = await admin.auth().verifyIdToken(req.body.token);
    let user_doc = await this.db.collection("users").doc(decoded_token.uid).get();
    let user_data = user_doc.data() as any;
    let prompt_doc = await this.db.collection("prompts").doc(prompt_id).get();
    let prompt_data = prompt_doc.data() as any;
    if (user_data.number_of_propts_used) {
      user_data.number_of_propts_used += 1;
    } else {
      user_data.number_of_propts_used = 1;
    }
    await await this.db.collection("users").doc(decoded_token.uid).update({
      number_of_propts_used: user_data.number_of_propts_used,
    });
    return { prompt: prompt_data.text, user_number_of_propts_used: user_data.number_of_propts_used };
  }
  async create_custom_token(req) {
    //
    let { code } = req.body.data;
    let client = await this.get_default_oauth_client();
    const result = await client.getToken(code);
    console.log("result", result);
    let tokens = result.tokens;
    console.log("tokens", tokens);
    //
    tokens;
    //
    if (tokens) {
      console.log("tokens", tokens);
      const decoded = decode_jwt(tokens.id_token) as any;
      console.log("decoded", decoded);
      let custom_token = await admin.auth().createCustomToken(decoded.sub, { custom_token: true, email: decoded.email, name: decoded.name });
      return custom_token;
    }
    return tokens;
    //
  }
  //
  async send_password_reset() {
    // this.app.auth();
    // admin.auth().pa
  }
  async sign_in_with_google_code(req) {
    let code = req.body.data.code;
    let client = this.get_default_oauth_client();
    const { tokens } = await client.getToken(code);
    console.log("tokens", tokens);
    let app = initializeApp(this.config.firebase_config);
    let auth = getAuth(app);
    const credential = GoogleAuthProvider.credential(tokens.id_token);
    let result = await signInWithCredential(auth, credential);
    //
    let user = result.user as any;
    let refresh_token = user.stsTokenManager.refreshToken;
    let access_token = user.stsTokenManager.accessToken;
    console.log("result", result);
    return { refresh_token, access_token };
    //
  }
  async log_in_with_email(req) {
    //
    let { email, password } = req.body.data;
    let app = initializeApp(this.config.firebase_config);
    let auth = getAuth(app);
    let result = await signInWithEmailAndPassword(auth, email, password);
    //
    let user = result.user as any;
    let refresh_token = user.stsTokenManager.refreshToken;
    let access_token = user.stsTokenManager.accessToken;
    console.log("result", result);
    return { refresh_token, access_token };
    //
  }
  async create_account_with_email(req) {
    // todo: add email validation here
    let { email, password } = req.body.data;
    let app = initializeApp(this.config.firebase_config);
    let auth = getAuth(app);
    let result = await createUserWithEmailAndPassword(auth, email, password);
    //
    let user = result.user as any;
    let refresh_token = user.stsTokenManager.refreshToken;
    let access_token = user.stsTokenManager.accessToken;
    let scopes = decode_jwt(access_token);
    console.log("result", result);
    return { refresh_token, access_token, scopes };
    //
  }
  // stripe endpoints
  async stripe_create_checkout_session(req) {
    let { stripe, stripe_config } = this.get_stripe_instance();
    if (req.body.price_name === "unlimited_month") {
      var price_id = stripe_config.price_id_month;
    } else if (req.body.price_name === "unlimited_year") {
      var price_id = stripe_config.price_id_year;
    } else {
      var price_id = stripe_config.price_id_year;
    }
    var decoded_token = await admin.auth().verifyIdToken(req.body.token);
    let result = await this.generate_stripe_customer_id(stripe, decoded_token.uid, decoded_token.email || "");
    //
    let page_name;
    if (req.body.page_name === "extension_redirect") {
      page_name = "extension_redirect";
    } else {
      page_name = "stripe_redirect";
    }
    let success_url = `${this.config.urls.backend_root}/redirect?event_name=payment_confirmation`;
    let cancel_url = `${this.config.urls.backend_root}/redirect?event_name=payment_cancel`;
    if (result) {
      let { stripe_customer_id } = result;
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: stripe_customer_id,
        payment_method_types: ["card"],
        // customer_email: decoded_token.email,
        allow_promotion_codes: true,
        line_items: [
          {
            price: price_id,
            quantity: 1,
          },
        ],
        success_url,
        cancel_url,
      });
      return session.url;
    } else {
      return "";
    }
  }
  async stripe_create_customer_portal_session(req) {
    let { stripe } = this.get_stripe_instance();
    var decoded_token = await admin.auth().verifyIdToken(req.body.token);
    var user_ref = this.db.collection("users").doc(decoded_token.uid);
    var doc = await user_ref.get();
    var user_data = doc.data();
    if (user_data) {
      let return_url = `${this.config.urls.backend_root}/redirect?event_name=stripe_portal_return`;
      const session = await stripe.billingPortal.sessions.create({
        customer: user_data.stripe_customer_id,
        return_url,
      });
      return session.url;
    } else {
      return "";
    }
  }
  async stripe_customer_delete(req) {
    let { stripe } = this.get_stripe_instance();
    var decoded_token = await admin.auth().verifyIdToken(req.body.token);
    var user_ref = this.db.collection("users").doc(decoded_token.uid);
    var doc = await user_ref.get();
    var user_data = doc.data();
    if (user_data) {
      if (user_data.stripe_customer_id) {
        try {
          await stripe.customers.del(user_data.stripe_customer_id);
        } catch (e) {}
      }
      await admin.auth().deleteUser(decoded_token.uid);
      await user_ref.delete();
    }
    return { deleted: true };
  }
  // stripe
  async generate_stripe_customer_id(stripe: Stripe, uid: string, email: string) {
    var user_ref = this.db.collection("users").doc(uid);
    var user_doc = await user_ref.get();
    var user_data = user_doc.data();
    if (user_data) {
      let stripe_customer_id;
      if (user_data.stripe_customer_id) {
        stripe_customer_id = user_data.stripe_customer_id;
        return { stripe_customer_id };
      } else {
        let stripe_customer = await stripe.customers.create({
          email,
          name: user_data.name,
        });
        await user_ref.set(
          {
            stripe_customer_id: stripe_customer.id,
          },
          { merge: true }
        );
        stripe_customer_id = stripe_customer.id;
        return { stripe_customer_id };
      }
    } else {
      return null;
    }
  }
  get_stripe_instance() {
    var stripe = new Stripe(this.secrets.stripe.prod.api_key, {
      apiVersion: "2022-11-15",
    });
    var stripe_config = this.secrets.stripe.prod;
    return { stripe, stripe_config };
  }
  async stripe_webhook(req) {
    req.headers;
    let { stripe, stripe_config } = this.get_stripe_instance();
    const sig: string = str_arr_to_str(req.headers["stripe-signature"]);
    let event: Stripe.Event = stripe.webhooks.constructEvent(req.rawBody, sig, stripe_config.whsec);
    let subscription: any = event.data.object;
    let customer = await stripe.customers.retrieve(subscription.customer, { expand: ["subscriptions"] });
    if (customer.deleted !== true) {
      let status = customer_to_status(customer, stripe_config.product_id);
      let querySnapshot = await this.db.collection("users").where("stripe_customer_id", "==", customer.id).get();
      let snapshots: Array<any> = [];
      querySnapshot.forEach((doc) => {
        snapshots.push(doc);
      });
      for (let doc of snapshots) {
        await doc.ref.update({
          stripe_customer_id: customer.id,
          status,
        });
      }
      return "";
    } else {
      return "";
    }
  }
  //
}
