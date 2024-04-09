import { Bucket } from "@google-cloud/storage";
import * as admin from "firebase-admin";
import { cert } from "firebase-admin/app";
import { decode_jwt } from "@chromane/shared/ts/util";
import Stripe from "stripe";
const { google } = require("googleapis");
// import { FirebaseApp, initializeApp } from "firebase/app";
// import { GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, signInWithCredential, signInWithEmailAndPassword } from "firebase/auth";
import sgMail from "@sendgrid/mail";
import { BackendCodes } from "@chromane/shared/types/types";

let _config: any = {};
let _secrets: any = {};

function get_default_oauth_client() {
  let client_id = _config.google_client_id;
  let client_secret = _secrets.google_client_secret;
  let redirect_url = `${_config.urls.backend_root}/auth.redirect`;
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_url);
  return oauth2Client;
}

class Common {
  async ping() {
    return "pong";
  }
  async send_user_feedback(data) {
    if (data.client_id === "website") {
      // gc_log("website", data);
      sgMail.setApiKey(_secrets.sendgrid_api_key);
      //
      const msg = {
        to: "vlas@chromane.com",
        from: {
          email: "bot@chromane.com",
          name: "Chromane",
        },
        subject: `Message from ${data.hostname}`,
        html: `
            <b>Name:</b><br></br>
            <i>${data.name}</i><br></br><br></br>
            <b>Email:</b><br></br>
            <i>${data.email}</i><br></br><br></br>
            <b>Message:</b><br></br>
            <i>${data.message}</i>
            `,
      };
      await sgMail.send(msg);
      return { code: BackendCodes.SUCCESS };
    } else {
      return null;
    }
  }
}

class Auth {
  async redirect(query_params) {
    return {
      _redirect: true,
      location: `chrome-extension://${_config.extension_id}/pages/redirect/index.html?code=${query_params.code}&state=${query_params.state}&event_name=${query_params.event_name}`,
    };
  }

  async sign_in_with_google_code(code) {
    let client = get_default_oauth_client();
    const { tokens } = await client.getToken(code);
    console.log("tokens", tokens);
    return tokens;
    // let app = initializeApp(this.config.firebase_config);
    // let auth = getAuth(app);
    // const credential = GoogleAuthProvider.credential(tokens.id_token);
    // let result = await signInWithCredential(auth, credential);
    // //
    // let user = result.user as any;
    // let refresh_token = user.stsTokenManager.refreshToken;
    // let access_token = user.stsTokenManager.accessToken;
    // console.log("result", result);
    // return { refresh_token, access_token };
    //
  }
}

export default class BackendDefault {
  // props
  // jwt_claims: any;
  // config: any;
  // secrets: any;
  // //
  // app: any;
  // db: admin.firestore.Firestore;
  // bucket: Bucket;
  // modules = {
  //   chromane: {

  //   },
  // };
  // init
  common: Common;
  auth: Auth;
  constructor(config, secrets) {
    _config = config;
    _secrets = secrets;
    this.common = new Common();
    this.auth = new Auth();
    // _secrets = secrets;
    // this.jwt_claims = jwt_claims;
    // this.config = config;
    // this.secrets = secrets;
    // //
    // this.app = admin.initializeApp({
    //   credential: cert(secrets.service_account as admin.ServiceAccount),
    //   storageBucket: config.firebase_config.storageBucket,
    // });
    // this.db = this.app.firestore();
    // this.bucket = admin.storage().bucket();
  }
  //
}
