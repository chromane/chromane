<script>
import img_ripple from "~/src/img/ripple.svg";

export default {
  props: [],
  data() {
    return { img_ripple };
  },
  methods: {},
};
</script>

<template>
  <div class="progress_overlay">
    <img :src="img_ripple" />
  </div>
</template>

<style>
.progress_overlay {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 110000;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  background-color: white;
}
</style>
