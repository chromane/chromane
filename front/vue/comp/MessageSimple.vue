<script setup lang="ts">
const props = defineProps<{
  model: any;
}>();
const emit = defineEmits<{
  action_click: [action: any];
}>();

import mdi_info from "@mdi/svg/svg/information-box.svg?raw";
import mdi_check_circle from "@mdi/svg/svg/check-circle.svg?raw";
import mdi_fire_circle from "@mdi/svg/svg/fire-circle.svg?raw";

function get_icon() {
  if (props.model.icon) {
    return props.model.icon;
  } else if (props.model.type === "success" || props.model.type === "positive") {
    return mdi_check_circle;
  } else if (props.model.type === "failure" || props.model.type === "negative") {
    return mdi_fire_circle;
  } else {
    return mdi_info;
  }
}
</script>
<template>
  <div
    class="message-simple"
    v-bind:class="{
      'style-positive': props.model.type === 'positive' || props.model.type === 'success',
      'style-negative': props.model.type === 'negative' || props.model.type === 'failure',
      'style-warning': props.model.type === 'warning',
      'style-info': props.model.type === 'info',
    }"
  >
    <div
      class="svg"
      v-html="get_icon()"
    ></div>
    <div class="details">
      <div class="headline">
        <div v-text="props.model.title"></div>
      </div>
      <div
        class="body"
        v-text="props.model.text"
      ></div>
      <div class="action-cont">
        <div
          class="action"
          v-for="action in props.model.actions"
          v-text="action.text"
          v-on:click="emit('action_click', action)"
        ></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.message-simple {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
  width: 100%;
  max-width: 520px;
  border-radius: 4px;
  padding: 16px 24px 16px 12px;

  .svg {
    svg {
      width: 20px;
      height: 20px;
    }
  }

  .details {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
    width: 10px;
    margin-left: 8px;
    margin-top: 1px;
    flex-grow: 1;
    .headline {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-size: 21px;
      color: rgba(27, 27, 27, 1);
      font-size: 16px;
      font-weight: 700;
    }
    .headline .button-icon {
      margin-right: 16px;

      background-color: red;
      border-radius: 4px;
    }
    .button-icon svg path {
      fill: white;
    }
    .body {
      margin-top: 6px;
      font-size: 14px;
      line-height: 20px;
      word-break: break-word;
      white-space: pre-line;
    }
  }

  .action-cont {
    display: flex;
    flex-wrap: wrap;
    margin-left: -8px;
    margin-top: 4px;

    .action {
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 4px 8px;
      margin: 4px 4px 0px 0px;
      border-radius: 4px;
      user-select: none;
      &:hover {
        background-color: rgba(0, 0, 0, 0.12);
      }
    }
  }

  &.style-warning {
    background-color: rgb(255, 252, 217);
    color: rgb(133 77 14);
    .svg {
      svg {
        fill: rgb(133 77 14);
      }
    }
    .headline {
      color: rgb(133 77 14);
    }
  }

  &.style-info {
    background-color: #e6f7fc;
    color: rgb(1, 67, 97);
    .svg {
      svg {
        fill: rgb(1, 67, 97);
      }
    }
    .headline {
      color: rgb(1, 67, 97);
    }
  }

  &.style-positive {
    background-color: #e6fcea;
    color: rgb(9, 97, 1);
    .svg {
      svg {
        fill: rgb(9, 97, 1);
      }
    }
    .headline {
      color: rgb(9, 97, 1);
    }
  }

  &.style-negative {
    background-color: #fce6e6;
    color: rgb(97, 1, 1);
    .svg {
      svg {
        fill: rgb(97, 1, 1);
      }
    }
    .headline {
      color: rgb(97, 1, 1);
    }
  }
}
</style>
