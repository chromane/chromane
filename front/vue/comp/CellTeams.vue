<script setup lang="ts">
import { Team } from "@chromane/shared/types/types";

const props = defineProps<{
  items: Team[];
}>();
</script>

<template>
  <div class="cell-teams">
    <div
      class="cell-teams-item"
      v-for="item in props.items"
      v-text="item.name"
    ></div>
  </div>
</template>

<style scoped>
.cell-teams-item {
  width: 100%;
  background-color: rgb(13, 71, 161);
  color: white;
  border-radius: 4px;
  display: inline-block;
  padding: 2px 4px;
  margin: 0px 4px 4px 0px;
  width: fit-content;
}
</style>
