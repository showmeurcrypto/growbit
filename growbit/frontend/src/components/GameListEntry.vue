<template>
  <div
    :class="{ responsive: this.responsive, challenge: this.challenge }"
    class="category-game"
    @click="
      game.isDisabled
        ? false
        : $router.push((slot || live ? '/external/' : '/') + game.id)
    "
  >
    <img
      ref="img"
      @error="onImageError"
      :data-attr="game.name"
      :src="game.image_long ? game.image_long : game.image"
      :alt="game.name"
    />
  </div>
</template>

<script>
export default {
  props: ["game", "responsive", "challenge"],
  methods: {
    onImageError() {
      if (this.$refs.img.src !== this.game.image) {
        this.$refs.img.src = this.game.image;
      }
    },
  },
  computed: {
    slot() {
      return this.game.type.includes("video-slots");
    },
    live() {
      return this.game.type.includes("live");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/sass/variables";

.category-game {
  &:not(.challenge):hover {
    transform: translateY(-4px);
    transition: 200ms transform ease-in-out;
  }

  img {
    width: 100%;
    height: 100%;
    //padding-top: 2px;
    font-size: 19px;
    line-height: 25px;
    font-weight: 900;
    text-transform: uppercase;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    // box-shadow: 8px 8px 15px rgba(10, 10, 10, 3.5);
    // padding: 5px;

    position: relative;

    &:-moz-broken {
      opacity: 0;
    }

    &::after {
      content: attr(data-attr);
      display: grid;
      place-content: center;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #22224a;
      //box-shadow: 8px 8px 15px rgba(0, 0, 0, 0.5);
    }
  }
  overflow: hidden;
  flex-shrink: 0;
  border-radius: 10px;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);
  background: #22224a;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  height: 170px;
  width: 126.23px;

  @media (max-width: 650px) {
    width: 101px;
    height: 139px;
  }

  &.responsive {
    width: 100%;
    height: auto;
  }

  &.challenge {
    width: 100%;
    height: 100%;
  }
}
</style>
