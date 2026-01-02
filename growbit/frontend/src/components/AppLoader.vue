<template>
  <div class="app-loader">
    <div class="central-container">
      <img src="@/assets/images/logo.webp" alt="" />
      <div class="loader-line"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AppMaintenance",
};
</script>

<style scoped>
.app-loader {
  width: 100%;
  height: 100%;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  z-index: 100;
  opacity: 1;
  background: var(--dark-blue-2);
}

.app-loader .central-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
  img {
    height: 80px;

    @media screen and (max-width: 991px) {
      height: 50px;
    }
  }
}

.loader-line {
  width: 90%;
  height: 3px;
  position: relative;
  overflow: hidden;
  background-color: #564f80;
  margin: 30px auto;
  @media screen and (max-width: 991px) {
    margin: 20px auto;
  }
  -webkit-border-radius: 20px;
  -moz-border-radius: 20px;
  border-radius: 20px;
}

.loader-line:before {
  content: "";
  position: absolute;
  left: -50%;
  height: 3px;
  width: 40%;
  background-color: #c6caff;
  -webkit-animation: lineAnim 1s linear infinite;
  -moz-animation: lineAnim 1s linear infinite;
  animation: lineAnim 1s linear infinite;
  -webkit-border-radius: 20px;
  -moz-border-radius: 20px;
  border-radius: 20px;
}

@keyframes lineAnim {
  0% {
    left: -40%;
  }
  50% {
    left: 20%;
    width: 80%;
  }
  100% {
    left: 100%;
    width: 100%;
  }
}
</style>
