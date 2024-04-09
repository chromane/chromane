<script lang="ts">
export default { props: ["text"] };
</script>

<template>
  <div class="divider">
    <span v-text="this.text"></span>
  </div>
</template>

<style scoped>
.divider {
  margin: 20px -10px;
  color: rgb(96 96 96);
  display: flex;
  justify-content: center;
  align-items: center;
}
.divider span {
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 14px;
  white-space: nowrap;
}
.divider span::before,
.divider span::after {
  content: "";
  display: block;
  width: 100%;
  height: 1px;
  background: rgb(96, 96, 96);
  margin: 0px 10px;
}
</style>
