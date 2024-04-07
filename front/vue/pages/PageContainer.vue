<script setup lang="ts">
const props = defineProps<{
  ctrl: any;
  store: any;
}>();
</script>

<template>
  <div class="page_container">
    <component
      :class="{
        page: true,
        active: true,
      }"
      v-if="props?.store?.active_page_comp_name"
      :is="props.store.active_page_comp_name"
      :team_config="props.store.team_config"
      :tool_config="props.store.tool_config"
      :name="props.store.active_page_comp_name"
      :tool="props.store.active_app"
      :ctrl="props.ctrl"
      :store="props.store"
    ></component>
  </div>
</template>

<style>
.page_container {
  display: block;
  width: 100%;
  height: calc(100% - 55px);
}

.tool_container {
  display: block;
  width: 100%;
  height: 100%;
}

.page {
  overflow: auto;

  width: 100%;
  height: 100%;

  padding: 24px;
}

.page.active {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.page_header {
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  height: 40px;
  width: 100%;
  padding: 0px 20px;

  background-color: hsla(127, 44%, 31%, 1);
}
</style>
