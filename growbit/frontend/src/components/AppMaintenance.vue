<template>
  <div class="app-maintenance">
    <img src="/img/private_profile.webp" />
    <div class="maintenance-text">
      We’re making some updates to improve your experience. Our website will be
      back shortly. Thank you for your patience!
    </div>
  </div>
</template>

<script>
export default {
  name: "AppMaintenance",
};
</script>

<style scoped lang="scss">
.app-maintenance {
  width: 100%;
  padding: 105px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  @media only screen and (max-width: 991px) {
    padding: 20px;
  }

  img {
    width: 200px;
  }

  .maintenance-text {
    margin-inline: auto;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    text-align: center;
    font-size: 1.29rem;
    color: white;
    font-weight: 800;
  }
}
</style>
