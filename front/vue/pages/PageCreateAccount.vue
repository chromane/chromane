<script setup lang="ts">
//
const props = defineProps<{
  ctrl: any;
}>();
//
import local_google from "@common/svg/google.svg?raw";
import mdi_mail from "@mdi/svg/svg/email-outline.svg?raw";
import mdi_eye_off from "@mdi/svg/svg/eye-off.svg?raw";
import mdi_eye from "@mdi/svg/svg/eye.svg?raw";
import mdi_key from "@mdi/svg/svg/key-variant.svg?raw";
import mdi_incognito from "@mdi/svg/svg/incognito.svg?raw";

import Button from "@chromane/front/vue/comp/Button.vue";
import CardError from "@chromane/front/vue/comp/CardError.vue";
import Divider from "@chromane/front/vue/comp/Divider.vue";
import { reactive } from "vue";

let model = reactive({
  //
  email: "",
  username: "",
  school_key: "",
  pass: "",
  pass2: "",
  pass_type: "password",
  pass_type2: "password",
  errors: [] as string[],
  //
  active_page_name: "log_in",
  //
  option_continue_with_email_button: {
    text: "Continue with email",
    color: "primary",
    icon: mdi_mail,
  },
  option_continue_with_key_button: {
    text: "Continue with key",
    color: "primary",
    icon: mdi_key,
  },
  //
  continue_with_email_button: {
    text: "Continue with email",
    color: "primary",
    icon: mdi_mail,
  },
  continue_with_google_button: {
    text: "Continue with google",
    color: "white",
    icon: local_google,
    invert_icon: false,
  },
  continue_without_logging_in_button: {
    text: "Continue without logging in",
    color: "white",
    icon: mdi_incognito,
    invert_icon: false,
  },
  //
  continue_with_username_log_in_button: {
    text: "Log in",
    color: "primary",
    icon: mdi_key,
  },
  continue_with_username_sign_in_button: {
    text: "Sign up",
    color: "primary",
    icon: mdi_key,
  },
  //
});
let methods = {
  close_error(text) {
    for (let i = model.errors.length; i--; ) {
      if (model.errors[i] === text) {
        model.errors.splice(i, 1);
        break;
      }
    }
  },
  async handle_click_cred_auth() {
    model.errors = [];
    if (model.pass === model.pass2) {
      let result = await props.ctrl.firebase_manager.create_account(model.email, model.pass);
      if (result.success) {
        model.email = "";
        model.pass = "";
      } else {
        if (result.code === "auth/invalid-email") {
          model.errors = ["Could not create account. Email is invalid."];
        } else if (result.code === "auth/invalid-login-credentials") {
          model.errors = ["Could not create account. Invalid email/password combination."];
        } else if (result.code === "auth/weak-password") {
          model.errors = ["Could not create account. Password is too weak."];
        } else if (result.code === "auth/email-already-in-use") {
          model.errors = ["Could not create account. That email is already in use."];
        } else {
          model.errors = ["Could not create account."];
        }
      }
    } else {
      model.errors = ["Passwords don't match."];
    }
  },
  clear_errors() {
    if (model.errors.length > 0) {
      model.errors = [];
    }
  },
  continue_with_google_button() {
    props.ctrl.firebase_manager.sign_in_with_google();
  },
  continue_without_logging_in() {
    props.ctrl.firebase_manager.continue_without_logging_in();
  },
  goto(page_name) {
    props.ctrl.goto(page_name);
  },
  handle_click_eye_pass(field: string) {
    if (model[field] === "password") {
      model[field] = "text";
    } else {
      model[field] = "password";
    }
  },
};
</script>

<template>
  <div class="page page-auth">
    <div class="form">
      <div class="form__title">Create an account</div>
      <div
        class="form__error"
        v-if="model.errors && model.errors.length > 0"
      >
        <CardError
          v-on:my_close="methods.close_error"
          :text="error"
          v-for="error in model.errors"
          :key="error"
        />
      </div>
      <div class="page-auth-cred">
        <div class="page-auth-cred__field">
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            v-model="model.email"
          />
        </div>
        <div class="page-auth-cred__field">
          <label>Password</label>
          <div class="page-auth-pass">
            <input
              :type="model.pass_type"
              placeholder="Password"
              v-model="model.pass"
            />
            <div
              class="page-auth-pass__eye"
              v-html="model.pass_type === 'password' ? mdi_eye : mdi_eye_off"
              @click="() => methods.handle_click_eye_pass('pass_type')"
            ></div>
          </div>
        </div>
        <div class="page-auth-cred__field">
          <label>Repeat password</label>
          <div class="page-auth-pass">
            <input
              :type="model.pass_type"
              placeholder="Repeat password"
              v-model="model.pass2"
            />
            <div
              class="page-auth-pass__eye"
              v-html="model.pass_type === 'password' ? mdi_eye : mdi_eye_off"
              @click="() => methods.handle_click_eye_pass('pass_type')"
            ></div>
          </div>
        </div>
        <Button
          v-on:button_click="methods.handle_click_cred_auth"
          :model="model.continue_with_email_button"
        ></Button>
      </div>
      <Divider text="or" />
      <div class="form__other">
        <Button
          class="mb-2"
          v-on:button_click="methods.continue_with_google_button"
          :model="model.continue_with_google_button"
        ></Button>
        <Button
          v-on:button_click="methods.continue_without_logging_in"
          :model="model.continue_without_logging_in_button"
        ></Button>
      </div>
      <div style="margin-top: 24px">
        Already have an account?
        <span
          class="action-text"
          v-on:click="methods.goto('log_in')"
          >Log in</span
        >
      </div>
    </div>
  </div>
</template>

<style></style>
