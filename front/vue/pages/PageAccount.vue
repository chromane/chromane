<script setup lang="ts">
const props = defineProps<{
  ctrl: any;
  store: any;
}>();
import icon_check from "@mdi/svg/svg/check.svg?raw";
import NameValues from "../comp/NameValues.vue";
import Button from "../comp/Button.vue";
import { reactive, watch } from "vue";

let model = reactive({
  icon_check,
  nvm: {},
});

watch(
  () => props.store.auth,
  () => {
    if (props.store.auth && props.store.auth.claims) {
      model.nvm = {
        Name: props.store.auth.claims.name,
        Email: props.store.auth.claims.email,
      };
    }
  },
  { deep: true, immediate: true }
);
let methods = {};
</script>

<template>
  <div class="page account">
    <div class="section">
      <div class="title">My account</div>
      <div class="text">In this section you can see information about your account and your usage statistics.</div>
      <NameValues
        v-if="props.store.auth && props.store.auth.doc"
        :model="model.nvm"
      ></NameValues>
    </div>
    <div
      class="section"
      v-if="props.store.auth && props.store.auth.doc && props.store.auth.doc.status !== 'unlimited'"
    >
      <div class="title">Your subscription</div>
      <div class="text">You are now on a free plan. Click the button below to upgrade.</div>
      <div class="actions">
        <Button
          :model="{
            color: 'primary',
            text: 'Upgrade',
          }"
          v-on:button_click="ctrl.trigger_upgrade()"
        >
        </Button>
      </div>
    </div>
    <div
      class="section"
      v-if="props.store.auth && props.store.auth.doc && props.store.auth.doc.status === 'unlimited'"
    >
      <div class="title">Your subscription</div>
      <div class="text">You are now on a premium plan. Click the button below to manage your subscription.</div>
      <div class="actions">
        <Button
          :model="{
            color: 'primary',
            text: 'Manage subscription',
          }"
          v-on:button_click="ctrl.trigger_portal()"
        >
        </Button>
      </div>
    </div>
    <div class="section">
      <div class="title">Delete account</div>
      <div class="text">If you want us to delete all data associated with your account - click the button below.</div>
      <div class="actions">
        <Button
          :model="{
            color: 'red',
            text: 'Delete account',
          }"
        >
        </Button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.page.account {
  .name-value-cont {
    padding: 4px 24px 4px 12px;
    border-left: 1px solid var(--color-primary);
  }
  .section {
    width: 100%;
    max-width: 520px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 24px;
    .title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .text {
      margin-bottom: 12px;
      font-size: 13px;
    }
  }
}
</style>
