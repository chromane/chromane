<script setup lang="ts">
//
import type CloudIframe from "@chromane/front/ts/CloudIframe";
const props = defineProps<{
  ctrl: CloudIframe;
}>();
//
import local_google from "@chromane/front/svg/google.svg?raw";
import mdi_mail from "@mdi/svg/svg/email-outline.svg?raw";
import mdi_eye_off from "@mdi/svg/svg/eye-off.svg?raw";
import mdi_eye from "@mdi/svg/svg/eye.svg?raw";
import mdi_key from "@mdi/svg/svg/key-variant.svg?raw";
import mdi_info_box from "@mdi/svg/svg/information-box.svg?raw";

import Button from "@chromane/front/vue/comp/Button.vue";
import MessageSimple from "@chromane/front/vue/comp/MessageSimple.vue";
import CardError from "@chromane/front/vue/comp/CardError.vue";
import Divider from "@chromane/front/vue/comp/Divider.vue";
import { reactive } from "vue";
import { BackendCodes } from "@chromane/shared/types/types";

type PageName = "create_account" | "email_code" | "log_in";
let model = reactive({
  //
  stage_name: "log_in" as PageName,
  //
  // email: "",
  // email_code: "",
  // pass: "",
  // pass2: "",
  //
  email: "",
  email_code: "",
  pass: "",
  pass2: "",
  //
  pass_type: "password",
  pass_type2: "password",
  errors: [] as string[],
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
  clear_errors() {
    if (model.errors.length > 0) {
      model.errors = [];
    }
  },
  async continue_with_google_button() {
    props.ctrl.firebase_manager.sign_in_with_google();
  },
  goto(page_name) {
    model.stage_name = page_name;
    // props.ctrl.goto(page_name);
  },
  handle_click_eye_pass(field: string) {
    if (model[field] === "password") {
      model[field] = "text";
    } else {
      model[field] = "password";
    }
  },
  async handle_click_email_create_account() {
    model.errors = [];
    if (model.pass && model.pass.length < 8) {
      model.errors = ["Your password should be at least 8 characters long."];
    } else if (model.pass === model.pass2) {
      // let result = await props.ctrl.firebase_manager.create_account(model.email, model.pass);
      props.ctrl.blocking_inc();
      let result = await props.ctrl.backend_module.send_verification_email(model.email);
      //
      if (result.code === BackendCodes.SUCCESS) {
        model.stage_name = "email_code";
      } else if (result.code === "auth/invalid-email") {
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
      props.ctrl.blocking_dec();
      //
    } else {
      model.errors = ["Passwords don't match."];
    }
  },
  async handle_click_email_log_in() {
    if (!model.email || !model.pass) {
      model.errors = ["Email or password is empty"];
      return;
    }
    let result = await props.ctrl.firebase_manager.log_in(model.email, model.pass);
    if (result.code === BackendCodes.SUCCESS) {
      model.email = "";
      model.pass = "";
      props.ctrl.firebase_manager.after_successfully_auth(result.access_token, result.refresh_token);
    } else if (result.code === "auth/invalid-email") {
      model.errors = ["Could not log in. Email is invalid."];
    } else if (result.code === "auth/invalid-login-credentials") {
      model.errors = ["Could not log in. Invalid email/password combination."];
    } else if (result.code === "auth/weak-password") {
      model.errors = ["Could not log in. Password is too weak."];
    } else {
      model.errors = ["Could not log in."];
    }
  },
  async verify_email() {
    props.ctrl.blocking_inc();
    let result = await props.ctrl.backend_module.verify_email(model.email_code, model.email, model.pass);
    console.log("result", result);
    if (result.code === BackendCodes.SUCCESS) {
      props.ctrl.firebase_manager.after_successfully_auth(result.access_token, result.refresh_token);
    } else if (result.code === "auth/invalid-email") {
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
    props.ctrl.blocking_dec();
  },
};
</script>

<template>
  <div class="page page-auth">
    <div
      class="form"
      v-if="model.stage_name === 'create_account'"
    >
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
          v-on:button_click="methods.handle_click_email_create_account"
          :model="model.continue_with_email_button"
        ></Button>
      </div>
      <Divider text="or" />
      <div class="form__other">
        <Button
          v-on:button_click="methods.continue_with_google_button"
          :model="model.continue_with_google_button"
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
    <div
      class="form"
      v-if="model.stage_name === 'email_code'"
    >
      <div class="form__title">Verify your email</div>
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
      <MessageSimple
        class="mb-3"
        :model="{
          type: 'info',
          icon: mdi_info_box,
          title: 'Please verify your email',
          text: `We sent a verifycation code to ${model.email}. Please enter it in the field below to continue your registration.`,
        }"
      ></MessageSimple>
      <div class="page-auth-cred">
        <div class="page-auth-cred__field">
          <label>Code</label>
          <input
            type="text"
            placeholder="6-character code like this: F43URW"
            v-model="model.email_code"
          />
        </div>
        <Button
          v-on:button_click="methods.verify_email"
          :model="{
            text: 'Verify',
            color: 'primary',
            icon: mdi_mail,
          }"
        ></Button>
      </div>
      <Divider text="or" />
      <div class="form__other">
        <Button
          v-on:button_click="methods.continue_with_google_button"
          :model="model.continue_with_google_button"
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
    <div
      class="form"
      v-if="model.stage_name === 'log_in'"
    >
      <div class="form__title">Log in</div>
      <div
        class="form__error"
        v-if="model.errors && model.errors.length > 0"
      >
        <CardError
          v-on:my_close="methods.close_error"
          :text="error"
          v-for="error in model.errors"
          :key="error"
          :is_close="false"
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
        <Button
          v-on:button_click="methods.handle_click_email_log_in"
          :model="model.continue_with_email_button"
        ></Button>
      </div>
      <Divider text="or" />
      <div class="form__other">
        <Button
          v-on:button_click="methods.continue_with_google_button"
          :model="model.continue_with_google_button"
        ></Button>
      </div>
      <div style="margin-top: 24px">
        Not registered yet?
        <span
          class="action-text"
          v-on:click="methods.goto('create_account')"
          >Create an account</span
        >
      </div>
      <!-- Todo: implement this: -->
      <div style="margin-top: 4px">
        Forgot your password?
        <span
          class="action-text"
          v-on:click="methods.goto('create_account')"
          >Reset password</span
        >
      </div>
    </div>
  </div>
</template>

<style></style>

<style>
.page.page-auth {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 48px 48px 24px 48px;
  margin: 0 auto;
}

.page-auth .form {
  width: 100%;
  max-width: 420px;
}
.page-auth .button {
  min-width: 320px;
}

.page-auth .form .form__title {
  width: 100%;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: rgba(0, 0, 0, 0.8);
  margin: 0px 0px 20px 0px;
}

.page-auth-header {
  display: flex;
  width: 100%;
  justify-content: center;
  margin: 0px 0px 16px 0px;
  color: var(--color-primary-black);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px; /* 142.857% */
}
.page-auth-header__block {
  width: 100px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--color-divider-gray);
  cursor: pointer;
  transition: all 0.1s ease;
  user-select: none;
}
.page-auth-header__block.active {
  color: var(--color-primary-green);
  border-bottom-color: var(--color-primary-green);
  cursor: pointer;
}

.page-auth-form {
  max-width: 720px;
  width: 100%;
}

.page-auth-form {
  line-height: 22px;
}

.auth-card .form {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding-top: 60px;
  min-width: 440px;
  min-height: 540px;
}

.form__error {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  margin: 0px 0px 20px 0px;
}

.page-auth-cred {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.page-auth-cred__field {
  display: flex;
  flex-direction: column;
  margin: 0px 0px 12px 0px;
}

.page-auth-cred label {
  color: var(--color-secondary-gray);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  margin: 0px 0px 5px 0px;
}
.page-auth-cred input {
  height: 36px;
  width: 100%;
  border-radius: 4px;
  color: var(--color-ttip-gray);
  border: 1px solid var(--color-divider-gray);
  padding: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}
.page-auth-cred input::placeholder {
  color: rgba(0, 0, 0, 0.3);
  letter-spacing: 0.2px;
}
.page-auth-cred input:hover {
  border-color: var(--color-secondary-gray);
}
.page-auth-cred input:focus {
  outline: none;
  border-color: var(--color-secondary-gray);
}

.page-auth-pass {
  display: flex;
  position: relative;
}
.page-auth-pass input {
  padding-right: 40px;
}
.page-auth-pass__eye {
  position: absolute;
  right: 10px;
  transform: translate(0px, -50%);
  top: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  cursor: pointer;
}

.page-auth-pass__eye svg {
  width: 100%;
  height: 100%;
  fill: var(--color-secondary-gray);
}
.page-auth-other {
  display: flex;
  flex-direction: column;
  row-gap: 20px;
}

.action-text {
  cursor: pointer;
  color: #445da1;
}
</style>
