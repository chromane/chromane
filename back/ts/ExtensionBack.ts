// firebase admin
import * as admin from "firebase-admin";
import { cert } from "firebase-admin/app";

const { exec, spawn, execSync } = require("child_process");
// firebase regular
// external
import { GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, signInWithCredential, signInWithEmailAndPassword } from "firebase/auth";
import sgMail from "@sendgrid/mail";
import Stripe from "stripe";
import { FirebaseApp, initializeApp } from "firebase/app";
const { google } = require("googleapis");
import { FieldValue, QueryDocumentSnapshot, Query } from "firebase-admin/firestore";
// import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import fs_extra from "fs-extra";

import util from "@common/ts/util";
import { Bucket } from "@google-cloud/storage";
import Busboy from "busboy";

import { BackendCodes, BackendResponse, PaginationMethod, TableGetRowsRequestConfig } from "@chromane/shared/types";

//
import Authenticator from "@shared/tools/authenticator/backend/Authenticator";
import Signspaces from "../teams/signspaces/backend";
import OtherworkLlc from "../teams/otherwork_llc/backend";
import { FBTableMeta, FBTableRow } from "../types/fb_table";
//
export default class ExtensionBack {
  // props
  ext_name: string;
  ext_config: any;
  ext_secrets: any;
  shared_config: any;
  shared_secrets: any;
  //
  app: admin.app.App;
  db: admin.firestore.Firestore;
  bucket: Bucket;
  //
  constructor(ext_name, ext_config, ext_secrets, shared_config, shared_secrets, admin_app) {
    //
    this.ext_name = ext_name;
    this.ext_config = ext_config;
    this.shared_config = shared_config;
    this.ext_secrets = ext_secrets;
    this.shared_secrets = shared_secrets;
    //
    this.app = admin_app;
    this.db = this.app.firestore();
    this.bucket = admin.storage().bucket();
    //
  }
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
  async get_user_data(token) {
    var decoded_token = await admin.auth().verifyIdToken(token);
    let result = await this.db.collection("users").doc(decoded_token.uid).get();
    let name = decoded_token.name || "";
    let user_doc;
    if (result.exists) {
      user_doc = result.data();
    } else {
      user_doc = {
        email: decoded_token.email || "",
        name,
        status: "free",
      };
      await this.db.collection("users").doc(decoded_token.uid).set(user_doc);
    }
    //
    // transfer claims from user_doc to token
    // todo: refresh a token immediately after this
    // let claims = decoded_token;
    // console.log("claims", claims);
    // for (let claim_name of this.jwt_claims) {
    //   if (
    //     //
    //     user_doc.hasOwnProperty(claim_name) === true &&
    //     // claims.hasOwnProperty(claim_name) === true &&
    //     user_doc[claim_name] !== claims[claim_name]
    //   ) {
    //     await admin.auth().setCustomUserClaims(decoded_token.uid, { [claim_name]: user_doc[claim_name] });
    //   }
    // }
    //
    return user_doc;
  }
  async redirect(query_params) {
    //
    // console.log("req", req);
    // console.log("state", query_params.state);
    // let state: any = util.decode_json(atob(query_params.state));
    // console.log("state", state);
    return {
      _redirect: true,
      location: `chrome-extension://${this.ext_config.extension_id}/pages/redirect/index.html?code=${query_params.code}&state=${query_params.state}&event_name=${query_params.event_name}`,
    };
  }
  // oauth and search console api
  get_default_oauth_client() {
    //
    let client_id = this.ext_config.google_cloud_oauth_client_id;
    let client_secret = this.ext_secrets.google_cloud_oauth_client_secret;
    let redirect_url = `${this.shared_config.urls.backend_root}/${this.ext_config.backend_module_name}.redirect`;
    //
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_url);
    //
    return oauth2Client;
    //
  }
  // oauth and search console api
  get_oauth_client(client_id, client_secret) {
    //

    let redirect_url = `${this.shared_config.urls.backend_root}/${this.ext_config.backend_module_name}.redirect`;
    //
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_url);
    //
    return oauth2Client;
    //
  }

  async refresh_tokens(req) {
    let r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.ext_config.google_cloud_oauth_client_id,
        client_secret: this.ext_secrets.google_cloud_oauth_client_secret,
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
  // todo: security
  // todo: add security here
  // only allow authenticated users with the right roles to add rows
  //
  async table_get_meta(token, collection) {
    await admin.auth().verifyIdToken(token);

    const ref = this.db.collection(collection);
    const snapshot = await ref.count().get();
    let count = snapshot.data().count;
    return {
      count,
    };
  }
  async table_get_rows(
    token: string,
    collection: string,
    query_config: TableGetRowsRequestConfig = {
      limit: 50,
      cursor_id: "",
      pagin_method: null,
    }
  ): Promise<{ docs: FBTableRow[]; meta?: FBTableMeta }> {
    await admin.auth().verifyIdToken(token);

    const col_ref = this.db.collection(collection);
    // todo: make "limit" configureable

    let query: Query = col_ref;

    // *Filter
    if (query_config.filter) {
      console.log(query_config.filter, "Q C FILTER");

      query_config.filter.forEach((item) => {
        // @ts-ignore
        query = query.where(...item);
      });
    }
    // *Sorting
    if (query_config.sort) {
      query = query.orderBy(query_config.sort.field, query_config.sort.dir);
    }

    // *Pagination
    if (query_config.pagin_method && query_config.cursor_id) {
      const cursor_doc = await col_ref.doc(query_config.cursor_id).get();
      if (!cursor_doc.exists) {
        throw Error("Can not get cursor doc");
      }
      query = query.startAfter(cursor_doc);
    }

    // *Meta
    const meta: FBTableMeta = { count: 0 };
    if (query_config.include_query_meta) {
      const snapshot_count = await query.count().get();
      const count = snapshot_count.data().count;
      meta.count = count;
    }

    query = query.limit(query_config.limit);
    let snapshot = await query.get();

    let docs: any = [];
    snapshot.forEach((doc) => {
      let data = doc.data();
      data.id = doc.id;
      docs.push(data);
    });

    // *Response
    const resp: { docs: FBTableRow[]; meta?: FBTableMeta } = { docs };
    if (query_config.include_query_meta) {
      resp.meta = meta;
    }
    return resp;
  }
  async table_row_add(token, collection, data) {
    const decoded_token = await admin.auth().verifyIdToken(token);
    if (decoded_token.role_admin || true) {
      if (data.id) {
        await this.db.collection(collection).doc(data.id).set(data);
      } else {
        await this.db.collection(collection).doc().set(data);
      }
      return true;
    } else {
      return 123;
    }
  }
  async table_row_delete(token, collection, row_id) {
    const decoded_token = await admin.auth().verifyIdToken(token);
    if (decoded_token.role_admin) {
      //
      await this.db.collection(collection).doc(row_id).delete();
      //
      return true;
    } else {
      return false;
    }
  }
  async table_row_edit(token, collection, data) {
    const decoded_token = await admin.auth().verifyIdToken(token);
    if (decoded_token.role_admin || true) {
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
        method: ["GET", "PUT", "POST"],
        origin: ["*"],
        responseHeader: ["content-type", "authorization"],
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
  async get_config() {
    let ref = this.db.collection("settings").doc("default");
    let doc = await ref.get();
    return doc.data();
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
      const decoded = util.decode_jwt(tokens.id_token) as any;
      console.log("decoded", decoded);
      let custom_token = await admin.auth().createCustomToken(decoded.sub, { custom_token: true, email: decoded.email, name: decoded.name });
      return custom_token;
    }
    return tokens;
    //
  }
  // Auth
  async send_verification_email(email) {
    //
    let querySnapshot = await this.db.collection("users").where("email", "==", email).get();
    let snapshots: Array<any> = [];
    querySnapshot.forEach((doc) => {
      snapshots.push(doc);
    });
    //
    if (snapshots.length === 0) {
      // first check if an account with such an email already exists
      let email_code = util.get_code();
      console.log("email_code", email_code);
      //
      await this.db.collection("codes").doc(email_code).set({ email });
      //
      sgMail.setApiKey(this.shared_secrets.sendgrid_api_key);
      const msg = {
        to: email,
        from: {
          email: "bot@chromane.com",
          name: "Chromane",
        },
        subject: `${this.ext_config.title} chrome extension email verification.`,
        html: `<p>Please use thise code to verify your email:</p><p><strong>${email_code}</strong></p>`,
      };
      //ES6
      await sgMail.send(msg);
    } else {
      return {
        code: "auth/email-already-in-use",
      };
    }
    return {
      code: BackendCodes.SUCCESS,
    };
  }
  async verify_email(code, email, password) {
    let doc = await this.db.collection("codes").doc(code).get();
    if (doc.exists) {
      let data = doc.data();
      if (data && data.email === email) {
        //
        let app = initializeApp(this.ext_config.firebase_config, this.ext_config.ext_name);
        let auth = getAuth(app);
        let result = await createUserWithEmailAndPassword(auth, email, password);
        let user = result.user as any;
        //
        await this.db.collection("users").doc(user.uid).set({
          email: email,
          name: "",
          status: "free",
        });
        //
        let refresh_token = user.stsTokenManager.refreshToken;
        let access_token = user.stsTokenManager.accessToken;
        // let scopes = decode_jwt(access_token);
        console.log("result", result);
        await this.db.collection("codes").doc(code).delete();
        //
        return {
          code: BackendCodes.SUCCESS,
          refresh_token,
          access_token,
        };
      } else {
        return { code: BackendCodes.ITEM_NOT_FOUND };
      }
    } else {
      return { code: BackendCodes.ITEM_NOT_FOUND };
    }
  }
  async sign_in_with_google_code(code) {
    //
    let ext_config: any = this.ext_config;
    let ext_secrets: any = this.ext_secrets;
    //
    let client = this.get_oauth_client(
      //
      ext_config.google_cloud_oauth_client_id,
      ext_secrets.google_cloud_oauth_client_secret
    );
    //
    const { tokens } = await client.getToken(code);
    console.log("tokens", tokens);
    let app = initializeApp(ext_config.firebase_config);
    let auth = getAuth(app);
    const credential = GoogleAuthProvider.credential(tokens.id_token);
    let result = await signInWithCredential(auth, credential);
    //
    let user = result.user as any;
    //
    let user_doc = await this.db.collection("users").doc(user.uid).get();
    if (user_doc.exists === false) {
      await this.db
        .collection("users")
        .doc(user.uid)
        .set({
          email: user.user,
          name: user.name || "",
          status: "free",
        });
    }
    //
    let refresh_token = user.stsTokenManager.refreshToken;
    let access_token = user.stsTokenManager.accessToken;
    console.log("result", result);
    return { code: "success", refresh_token, access_token };
    //
  }
  async log_in_with_email(email, password) {
    //
    let ext_config: any = this.ext_config;
    //
    let app = initializeApp(ext_config.firebase_config);
    let auth = getAuth(app);
    let result = await signInWithEmailAndPassword(auth, email, password);
    //
    let user = result.user as any;
    let refresh_token = user.stsTokenManager.refreshToken;
    let access_token = user.stsTokenManager.accessToken;
    console.log("result", result);
    return {
      code: BackendCodes.SUCCESS,
      refresh_token,
      access_token,
    };
    //
  }
  //
}
