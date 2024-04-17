<script setup lang="ts">
const props = defineProps<{
  ctrl: any;
  store: any;
}>();

import Button from "@chromane/front/vue/comp/Button.vue";
// import NameValues from "@chromane/front/vue/comp/NameValues.vue";
// import OverlayConfirm from "@chromane/front/vue/comp/OverlayConfirm.vue";

import NameValues from "@chromane/front/vue/comp/NameValues.vue";
import Overlay from "@chromane/front/vue/comp/Overlay.vue";
import OverlayConfirm from "@chromane/front/vue/comp/OverlayConfirm.vue";

import { reactive } from "vue";
import mdi_account_remove from "@mdi/svg/svg/account-remove.svg?raw";

import { watch } from "vue";

import Message from "@chromane/front/vue/comp/Message.vue";

let model = reactive({
  nvm: {},
});
watch(
  () => props.store.auth,
  () => {
    if (props.store.auth && props.store.auth.claims) {
      if (props.store.auth.claims.name) {
        model.nvm = {
          Name: props.store.auth.claims.name,
          Email: props.store.auth.claims.email,
        };
      } else {
        model.nvm = {
          Email: props.store.auth.claims.email,
        };
      }
    }
  },
  { deep: true, immediate: true }
);

let message_model = {
  type: "warning",
  headline: "Upgrade required",
  body: "You can create only 3 templates on free account. Please upgrade to create more accounts.",
};

async function delete_account_callback() {
  // await ctrl.user_delete();
}

async function handle_click_manage_sub() {
  // await ctrl.manage_sub();
}

function handle_click_delete_account() {}
</script>

<template>
  <div class="page">
    <div class="page-inner">
      <div class="section">
        <div class="title">My Account</div>
        <div class="text">In this section you can see information about your account and your usage statistics.</div>
        <NameValues
          v-if="props.store.auth && props.store.auth.claims"
          :model="model.nvm"
        ></NameValues>
      </div>
      <div class="section hidden">
        <div class="title">Delete Account</div>
        <div class="text">Use this section to delete your account and all information, associated with it from our servers.</div>
        <Button
          :model="{
            icon: mdi_account_remove,
            color: 'red',
            text: 'Delete account',
          }"
          v-on:button_click="handle_click_delete_account"
        >
        </Button>
      </div>
      <div
        class="section"
        v-if="props.store.auth && props.store.auth.doc && props.store.auth.doc.status !== 'unlimited'"
      >
        <div class="title">Your subscription</div>
        <div class="text">You are now on a free plan. Click the button below to upgrade.</div>
        <div class="actions">
          <!-- <Button
            :model="{
              color: 'primary',
              text: 'Upgrade',
            }"
            v-on:button_click="ctrl.trigger_upgrade()"
          >
          </Button> -->
        </div>
      </div>
      <div
        class="section"
        v-if="props.store.auth && props.store.auth.doc && props.store.auth.doc.status === 'unlimited'"
      >
        <div class="title">Your subscription</div>
        <div class="text">You are now on a premium plan. Click the button below to manage your subscription.</div>
        <div class="actions">
          <!-- <Button
            :model="{
              color: 'primary',
              text: 'Manage subscription',
            }"
            v-on:button_click="ctrl.trigger_portal()"
          >
          </Button> -->
        </div>
      </div>
    </div>
    <!-- Popups and Overlays -->
    <Teleport to="#portal">
      <Overlay ref="ref_overlay"></Overlay>
      <OverlayConfirm ref="ref_overlay_confirm"></OverlayConfirm>
    </Teleport>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 20px;
}

.section-text {
  margin-bottom: 10px;
  font-size: 16px;
}

.my-account-section {
  padding: 24px;
  max-width: 600px;
  background-color: #e3f2fd;
  color: #161616;
  border-radius: 4px;
  margin-bottom: 20px;
}
.my-account-section.red {
  background-color: #ffc7c7;
}

.section-button button {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  letter-spacing: inherit;
  font-family: inherit;
  color: #fafafa;
  font-weight: 500;
  min-width: 100px;
  margin: 10px 0;
}

.section-button--danger button {
  background-color: #f44336;
}

.section-button--primary button {
  background-color: #1e88e5;
}
</style>
