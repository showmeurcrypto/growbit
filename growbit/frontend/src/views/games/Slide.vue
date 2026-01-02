<template>
  <div class="slide-container">
    <div class="slide">
      <SlideHeader v-if="!isMobile" />
      <SlideGame />
      <div class="bottom-container">
        <SlideControls />
        <SlideBets />
      </div>
      <SlideHeader v-if="isMobile" />
    </div>
    <GameFooter :name="'slide'"></GameFooter>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import SlideHeader from "@/components/games/gameSlide/SlideHeader.vue";
import SlideGame from "@/components/games/gameSlide/SlideGame.vue";
import SlideControls from "@/components/games/gameSlide/SlideControls.vue";
import SlideBets from "@/components/games/gameSlide/SlideBets.vue";
import GameFooter from "@/components/GameFooter.vue";

export default {
  name: "Slide",
  metaInfo: {
    title: "Slide ",
  },
  data() {
    return {
      isMobile: false,
    };
  },
  components: {
    GameFooter,
    SlideHeader,
    SlideGame,
    SlideControls,
    SlideBets,
  },
  methods: {
    ...mapActions([
      "socketConnectSlide",
      "socketDisconnectSlide",
      // 'slideGetDataSocket'
    ]),
    onResize() {
      this.isMobile = window.innerWidth <= 991;
    },
  },
  created() {
    this.socketConnectSlide();
    window.addEventListener("resize", this.onResize);
    this.onResize();
    // this.slideGetDataSocket({});
  },
  beforeRouteLeave(to, from, next) {
    this.socketDisconnectSlide();
    next();
  },
};
</script>

<style scoped lang="scss">
.slide-container {
  width: 100%;
  max-width: 1100px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media only screen and (max-width: 991px) {
    margin-bottom: 20px;
  }

  .slide {
    width: 100%;
    max-width: 1100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    margin: 30px 40px 0 40px;

    @media only screen and (max-width: 991px) {
      padding: 0;
      padding-inline: 10px;
      margin: 0;
    }

    background: var(--dark-blue);
    border: 4px solid #090c1d;
    border-radius: 10px;

    .bottom-container {
      width: 100%;
      padding: 25px;
      @media only screen and (max-width: 991px) {
        padding: 0 0 15px 0;
      }
    }
  }

  @media only screen and (max-width: 1330px) {
    .slide {
      width: 100%;
      background: transparent;
      border: none;
    }
  }
}
</style>
