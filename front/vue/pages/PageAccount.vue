<script setup lang="ts">
const methods = {};
</script>

<template>
  <div class="page account"></div>
</template>

<style scoped>
.page.account {
  display: flex;
  flex-direction: column;
}
.account-headline {
  margin-bottom: 40px;
}
.account-section {
  display: flex;
  column-gap: 24px;
}

.account-section__avatar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.account-section__avatar img {
  width: 87px;
  height: 87px;
  border-radius: 50%;
  object-fit: contain;
}

.account-section__default {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 87px;
  height: 87px;
  overflow: hidden;
}

.account-section__info {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
  margin-top: 5px;
}
.account-section-text {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  column-gap: 15px;
  color: #000;
  font-size: 16px;
  font-weight: 400;
  word-break: break-all;
}
.account-section-text span {
  font-weight: 700;
  word-break: keep-all;
}

.account-footer {
  display: flex;
  justify-content: flex-end;
}

.account-footer__delete {
  background: var(--color-secondary-red);
}
</style>
