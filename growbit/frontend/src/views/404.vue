<template>
  <div class="container">
    <img src="../assets/images/404image.png" alt="missing-pika" />
    <div class="title">
      Damn ni**a, seems this page is <span> missing! </span>
    </div>
    <div class="subtitle">
      Just like your luck(you've lost 4,723 DLS this month so far).
    </div>

    <router-link to="/" as="div" class="home">
      <p>Go home</p>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "404",
  metaInfo: {
    title: "404 ",
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  margin-inline: auto;
  width: 100%;
  max-width: 1100px;
  min-height: calc(100vh - 112px);
  padding: 40px;
  @media screen and (max-width: 991px) {
    padding: 10px;
  }
}

.container .title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #ededed;
  @media (max-width: 500px) {
    max-width: 400px;
    font-size: 1.3rem;
    font-weight: 900;
  }
}

.container .title span {
  color: #ffce00;
}

.container .subtitle {
  color: #616498;
  @media (max-width: 500px) {
    max-width: 400px;
    font-size: 0.9rem;
    font-weight: 900;
  }
}

.container img {
}

.container .home {
  padding-top: 40px;
}
</style>
