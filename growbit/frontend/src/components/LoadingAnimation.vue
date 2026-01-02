<template>
  <div class="loading-animation">
    <div class="animation-point"></div>
    <div class="animation-point"></div>
    <div class="animation-point"></div>
    <div class="animation-point"></div>
  </div>
</template>

<script>
export default {
  name: "LoadingAnimation",
};
</script>

<style scoped>
.loading-animation {
  width: 60px;
  height: 10px;
  position: relative;
  display: inline-block;
}

.loading-animation .animation-point {
  width: 9px;
  height: 9px;
  position: absolute;
  border-radius: 50%;
  background: #fff;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
  opacity: 0.7;
}

.loading-animation .animation-point:first-child {
  left: 6px;
  animation: loading_animation_1 0.6s infinite;
}

.loading-animation .animation-point:nth-child(2) {
  left: 6px;
  animation: loading_animation_list_2-125a34ac 0.6s infinite;
}

.loading-animation .animation-point:nth-child(3) {
  left: 26px;
  animation: loading_animation_list_2-125a34ac 0.6s infinite;
}

.loading-animation .animation-point:nth-child(4) {
  left: 46px;
  animation: loading_animation_list_3-125a34ac 0.6s infinite;
}

@keyframes loading_animation_list_1-125a34ac {
  0% {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
}

@keyframes loading_animation_list_2-125a34ac {
  0% {
    transform: translate(0);
  }

  to {
    transform: translate(20px);
  }
}

@keyframes loading_animation_list_3-125a34ac {
  0% {
    transform: scale(1);
  }

  to {
    transform: scale(0);
  }
}

/* .loading-animation {
    width: 100%;
    max-width: 45px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.loading-animation .animation-element {
    width: 10px;
    height: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: rotate(45deg);
    background-color: rgba(255, 255, 255, 0.3);
}

.loading-animation .element-inner {
    width: 10px;
    height: 10px;
    background-color: #ff4232;
    animation: loading_animation 1.5s infinite ease-in-out both;
    background-color: rgba(255, 255, 255, 0.5);
}

.loading-animation .animation-element:nth-child(1) .element-inner {
    animation-delay: -320ms;
}

.loading-animation .animation-element:nth-child(2) .element-inner {
    animation-delay: -160ms;
}

@keyframes loading_animation {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
} */
</style>
