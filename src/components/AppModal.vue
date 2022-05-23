<style>
/* TODO make a component for this or something */
.app-modal__card {
  border-radius: 5px;
  background: white;
  padding: 20px;
}
</style>

<style scoped>
.app-modal__container {
  z-index: 1000;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.app-modal__scrim {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #eeea;
}
.app-modal__content {
  position: relative;
  margin-top: 100px;
  margin-left: auto;
  margin-right: auto;
  width: 520px;
}
</style>

<template>
  <teleport to="body">
    <div class="app-modal__container">
      <div class="app-modal__scrim" @click="$emit('close')"></div>
      <div class="app-modal__content">
        <slot></slot>
      </div>
    </div>
  </teleport>
</template>
