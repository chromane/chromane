<script setup lang="ts">
import ctrl from "./ext_ctrl";
import store from "./ext_store";

import icon_check from "@mdi/svg/svg/check.svg?raw";
import mdi_alert_box from "@mdi/svg/svg/alert-box.svg?raw";
import svg_bg_1 from "../slots/pattern.svg?raw";

import Button from "@common/vue/comp/Button.vue";
import { reactive } from "vue";

import MessageSimple from "@common/vue/comp/MessageSimple.vue";

let model = reactive({
  svg_bg_1,
  icon_check,
  active_toggle_option: "individuals",
  plans: [
    {
      section: "individuals",
      title: "Free Plan",
      name: "free",
      price: "$0",
      price_time: "/month",
      items: [
        //
        "Itm wefwiojf wefij owfiw ejf.",
      ],
    },
    {
      section: "individuals",
      title: "Yearly Plan",
      name: "year",
      price: "$39.99",
      price_time: "/year",
      items: [
        //
        "Unlimited jweijf wifj wifw ifjwfi wf!",
        "Ability to fweifj weofi fjiwef jweojfwei fjwoejf we.",
        "Priority support.",
      ],
    },
    {
      section: "individuals",
      title: "Monthly Plan",
      name: "month",
      price: "$4.99",
      price_time: "/month",
      items: [
        //
        "Everything from yearly plan.",
      ],
    },
  ],
});
let methods = {
  async select_plan(plan_name) {
    if (plan_name === "free") {
      ctrl.go_back();
    } else {
      store.ui_number_of_blocking_operations += 1;
      let r = await ctrl.firebase_manager.backend("stripe_create_checkout_session", {
        price_name: plan_name,
      });
      let url = r.result;
      window.open(url);
      store.ui_number_of_blocking_operations -= 1;
    }
    // ctrl.select_plan(plan_name);
  },
  set_toggle_option(option) {
    model.active_toggle_option = option;
  },
  handle_click_close() {
    // ctrl.close_app();
  },
};
</script>

<template>
  <div class="page-pricing">
    <div class="background-inner"></div>
    <div class="svg-bg"></div>
    <div class="page-pricing-fg">
      <MessageSimple
        v-if="store.free_limit_reached_flag"
        :model="{
          type: 'info',
          title: 'Free daily limit reached.',
          text: 'ChatGPT Prompt Generator for Business gives you 3 free prompts per day totally free. Please upgrade your account if you want to access UNLIMITED propmpts EVERY DAY.',
          icon: mdi_alert_box,
        }"
      ></MessageSimple>
      <div class="page-pricing-header">Try Patch Tagger for free for 14 Days</div>
      <div class="page-pricing-header-sub">Subscribe now. Cancel anytime.</div>
      <div class="pricing-plan-container">
        <div
          class="pricing-plan"
          v-for="plan in model.plans"
          v-bind:class="{ active: plan.section === model.active_toggle_option }"
          :key="plan.title"
        >
          <div
            class="pricing-plan-header"
            v-if="plan.section === 'individuals'"
          >
            <div
              class="pricing-plan-header-content"
              v-if="plan.name === 'year'"
            >
              Save 33%
            </div>
          </div>
          <div class="pricing-plan-body">
            <div
              class="pricing-plan-title"
              v-text="plan.title"
              v-if="plan.section === 'individuals'"
            ></div>
            <div
              class="pricing-plan-price"
              v-if="plan.section === 'individuals'"
            >
              <span v-text="plan.price"></span>
              <span v-text="plan.price_time"></span>
            </div>
            <div
              class="pricing-plan-price"
              v-if="plan.section === 'education'"
              style="text-align: start; font-size: 21px"
            >
              Designed for schools and districts. Contact us for customized pricing.
            </div>
            <div
              class="pricing-plan-price"
              v-if="plan.section === 'business'"
              style="text-align: start; font-size: 21px"
            >
              Designed for businesses and organizations. Contact us for customized pricing.
            </div>
            <div
              class="pricing-button primary"
              v-if="plan.name === 'education'"
              v-on:click="methods.select_plan(plan.name)"
            >
              Request quote
            </div>
            <div
              class="pricing-button primary"
              v-if="plan.name === 'business'"
              v-on:click="methods.select_plan(plan.name)"
            >
              Request quote
            </div>
            <div
              class="pricing-button secondary"
              v-if="plan.name === 'free'"
              v-on:click="methods.select_plan(plan.name)"
            >
              Continue without perks
            </div>
            <div
              class="pricing-button primary"
              v-if="plan.name === 'month'"
              v-on:click="methods.select_plan(plan.name)"
            >
              Try Free for 14 Days
            </div>
            <div
              class="pricing-button primary"
              v-if="plan.name === 'year'"
              v-on:click="methods.select_plan(plan.name)"
            >
              Try Free for 14 Days
            </div>
            <div class="pricing-plan-items">
              <div
                class="pricing-plan-item"
                v-for="item in plan.items"
                :key="item"
              >
                <div
                  class="icon"
                  v-html="icon_check"
                ></div>
                <span v-text="item"></span>
              </div>
            </div>
            <div style="flex-grow: 1"></div>
            <div
              class="pricing-plan-footer"
              v-if="plan.name === 'education'"
            >
              Not ready for a quote yet?<br />
              Contact <a href="mailto:support@signspaces.com">support@signspaces.com</a>
            </div>
            <div
              class="pricing-plan-footer"
              v-if="plan.name === 'business'"
            >
              Not ready for a quote yet?<br />
              Contact <a href="mailto:support@signspaces.com">support@signspaces.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ButtonClose @click="methods.handle_click_close"></ButtonClose>
  </div>
</template>

<style lang="scss">
.page-pricing .btn-close {
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
}
.svg-bg {
  position: absolute;
  z-index: 9;
  overflow: hidden;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(169deg, #2854ff -2.68%, #00020c 116.81%);
}
.svg-bg svg {
  opacity: 0.4;
  flex-shrink: 0;
  min-width: 100%;
  min-height: 100%;
}
.background-inner {
  position: absolute;
  z-index: 99;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  background-image: url(/static/x/patch_tagger/pattern.svg);
  background-repeat: repeat;
  filter: brightness(0.75);
  filter: grayscale(1);
  opacity: 0.8;
}
.page-pricing-toggle {
  display: flex;
  margin-bottom: 24px;
}
.page-pricing-toggle-option {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  width: 180px;
  cursor: pointer;
  background-color: white;
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 24px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}
.page-pricing-toggle-option:first-child {
  border-radius: 90px 0px 0px 90px;
}
.page-pricing-toggle-option:last-child {
  border-radius: 0px 90px 90px 0px;
  border-right: none;
}
.page-pricing-toggle-option.active {
  background-color: #02a6ed;
  color: white;
}
.page-pricing {
  position: relative;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}
.page-pricing-fg {
  position: absolute;
  z-index: 999;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  overflow: auto;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 36px 24px 24px 24px;
}
.page-pricing-header {
  font-size: 36px;
  font-weight: 600;
  color: rgba(256, 256, 256, 1);
  filter: drop-shadow(2px 3px 2px rgba(0, 0, 0, 0.235));
  margin-bottom: 12px;
  margin-top: 36px;
}
.page-pricing-header-sub {
  font-size: 16px;
  font-weight: 600;
  color: rgba(256, 256, 256, 0.8);
  filter: drop-shadow(2px 3px 2px rgba(0, 0, 0, 0.235));
  margin-bottom: 24px;
}
.pricing-plan-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.pricing-plan {
  display: none;
  flex-direction: column;
  margin: 0px 12px;
  /* border: 1px solid rgba(0, 0, 0, 0.12); */
  border-radius: 4px;
  width: 280px;
  height: 100%;
  min-height: 500px;
  overflow: hidden;
  background-color: white;
}

.pricing-plan.active {
  display: flex;
}
.pricing-plan-header-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--gradient-primary);
  color: white;
}
.pricing-plan-body {
  padding: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.pricing-plan-title {
  margin-bottom: 12px;
  color: black;
  text-align: center;
}
.pricing-plan-price {
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: bold;
  text-align: center;
}
.pricing-plan-price > span:first-child {
  font-size: 36px;
  font-weight: bold;
  text-align: center;
}
.pricing-plan-price > span:last-child {
  font-size: 16px;
}
.pricing-button {
  width: 100%;
  padding: 12px;
  cursor: pointer;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 24px;
  transition: all 0.2s ease;
}
.pricing-button.primary {
  color: white;
  background: var(--gradient-primary);
}
.pricing-button.primary:hover {
  color: white;
  background-color: #008fcc;
}
.pricing-button.secondary {
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.pricing-plan-header {
  height: 40px;
}
.pricing-plan-item {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 12px;
  .icon {
    margin-right: 4px;
  }
  .icon svg {
    height: 16px;
    width: 16px;
    margin-top: 2px;
    fill: var(--color-primary-2);
  }
  span {
    width: 10px;
    flex-grow: 1;
  }
}

.pricing-plan-footer {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  a {
    color: var(--color-primary-2);
  }
  a:visited {
    color: var(--color-primary-2);
  }
}
</style>
