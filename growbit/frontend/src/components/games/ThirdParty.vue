<template>
  <div class="main-container">
    <div class="wrapper" :class="{ mobileWrapper: isMobile() }">
      <div
        class="thirdPartyContainer"
        :class="{ mobileContainer: isMobile(), error: error }"
      >
        <!-- <span class="loader"></span> -->
        <iframe
          id="frame"
          :src="url"
          v-if="!fetchingUrl && url"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope"
          allowfullscreen=""
        ></iframe>
        <div v-if="fetchingUrl" class="app-loader">
          <div class="central-container">
            <!-- <img src="@/assets/images/logo.webp" alt="" /> -->
            <div class="loader-line"></div>
          </div>
        </div>
        <div v-if="!fetchingUrl && error" class="error">Error</div>
        <!-- <AppLoader v-if="!fetchingUrl"></AppLoader> -->
      </div>
      <div class="actions">
        <div @click="toggleFullscreen()">
          <FullScreenIcon></FullScreenIcon>
        </div>
        <div
          class="heart"
          @click="toggleFavourite()"
          :class="{
            favourite: authUser?.user?.favouriteSlots?.includes(this.gameId),
          }"
        >
          <HeartIcon></HeartIcon>
        </div>

        <div class="currency">
          <img
            @click="show = !show"
            :src="`/img/currencies/${selectedCurrency}.${
              selectedCurrency === 'DLS' ? 'png' : 'svg'
            }`"
            alt=""
          />
          <span @click="show = !show"> {{ selectedCurrency }} </span>

          <transition name="currency-picker">
            <div class="third-party-rows-menu" v-if="show === true">
              <div class="third-party-menu-inner">
                <button
                  @click="pickCurrency(item.currency)"
                  v-if="item.currency !== 'DLS'"
                  v-for="(item, index) in currencies"
                  :class="{ active: item.currency === selectedCurrency }"
                >
                  <img
                    :src="`/img/currencies/${item.currency}.${
                      item.currency === 'DLS' ? 'png' : 'svg'
                    }`"
                    alt=""
                  />
                  <span> {{ item.currency }} </span>
                </button>
              </div>
            </div>
          </transition>
        </div>

        <div
          class="logo"
          :style="{
            paddingLeft: this.isLive ? '0' : '40px',
            paddingRight: this.isLive ? '90px' : '0px',
          }"
        >
          <img src="@/assets/images/growbit.png" />
        </div>

        <div class="demo" v-if="!this.isLive">
          <span>Fun <span>Play</span></span>
          <button
            @click="toggleDemo()"
            class="button-toggle"
            :class="{
              'button-active': !demo,
            }"
          ></button>
          <span>Real <span>Play</span></span>
        </div>
      </div>
    </div>
    <GameFooter :name="this.gameId"></GameFooter>
    <SimilarSlots :provider="this.gameProvider"></SimilarSlots>
  </div>
</template>

<script>
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { mapActions, mapGetters } from "vuex";
import axios from "axios";
import HeartIcon from "@/assets/images/heart.svg?inline";

import FullScreenIcon from "@/assets/images/full-screen.svg?inline";
import GameFooter from "@/components/GameFooter.vue";
import SimilarSlots from "@/components/SimilarSlots.vue";
import AppLoader from "@/components/AppLoader.vue";

export default {
  components: {
    SimilarSlots,
    GameFooter,
    LoadingAnimation,
    HeartIcon,
    FullScreenIcon,
    AppLoader,
  },
  data() {
    return {
      loading: false,
      url: null,
      demo: false,
      gameName: null,
      isLive: null,
      gameId: null,
      gameProvider: null,
      expand: false,
      show: false,
      error: null,
      fetchingUrl: true,
    };
  },
  async created() {
    // if(this.isMobile) {
    //   this.$refs.thirdPartyContainer.style.height = '90%';
    //   this.$refs.wrapper.style.height = 'calc(100dvh - 130px)';
    // }

    if (!this.gameList) {
      this.getGames();
    }
    if (this.authUser?.user?.username && this.gameList) {
      if (this.selectedCurrency == "DLS") {
        this.setCurrency("USD");
      } else {
        await this.launchGame();
      }
    }
    // else {
    //   this.gameName = this.$route.params.provider + "/" + this.$route.params.slot;
    // }
  },

  watch: {
    gameList: {
      async handler(state, oldState) {
        if (!oldState?.length && !this.url && state?.length) {
          await this.launchGame();
        }
      },
    },
    selectedCurrency: {
      async handler(state, oldState) {
        console.log("currency change", oldState, state);
        this.launchGame();
      },
    },
  },

  mounted() {},
  computed: {
    ...mapGetters([
      "gameList",
      "fiatRates",
      "gameListLoading",
      "authUser",
      "selectedCurrency",
    ]),
    currencies() {
      if (!this.fiatRates.data) {
        return [];
      }

      let list = [];

      for (let f in this.fiatRates.data) {
        list.push({
          currency: f,
        });
      }

      return list;
    },
  },
  methods: {
    ...mapActions([
      "toggleFavouriteSlot",
      "notificationShow",
      "setCurrency",
      "getGames",
    ]),
    async launchGame() {
      try {
        this.fetchingUrl = true;
        this.error = null;
        let game = this.gameList;
        console.log(
          "url game is: " +
            this.$route.params.provider +
            "/" +
            this.$route.params.slot
        );
        game = game.filter(
          (g) =>
            g.id === this.$route.params.provider + "/" + this.$route.params.slot
        );
        if (!game?.[0]) {
          this.$router.push("/");
          return;
        }

        this.isLive = game[0].subcategory === "live";

        if (game[0].subcategory === "live" && this.demo) {
          return;
        }

        this.gameId = game[0].id;
        this.gameProvider = game[0].category;

        const requestBody = {
          provider_code: game[0].category,
          game_code: game[0].id,
          user_code: this.authUser.user.username,
          demo: this.demo,
          currency:
            this.selectedCurrency === "DLS" ? "USD" : this.selectedCurrency,
        };

        const response = await axios.post("/slots/launch", requestBody);
        this.fetchingUrl = false;
        this.url = response.data.url + (this.isMobile ? "&mobile=true" : "");
        console.log("game url is: " + this.url);
      } catch (error) {
        this.notificationShow(error);
        this.error = true;
        this.fetchingUrl = false;
        console.error("Error launching game:", error);
      } finally {
        setTimeout(() => {}, 1000);
      }
    },
    isMobile() {
      const regex =
        /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return regex.test(navigator.userAgent);
    },
    pickCurrency(currency) {
      this.setCurrency(currency);
      this.show = false;
    },
    callback(response) {
      this.url = response.link;
      this.loading = false;
    },
    toggleFavourite() {
      if (this.gameId) {
        this.toggleFavouriteSlot(this.gameId);
      }
    },
    toggleDemo() {
      this.demo = !this.demo;
      this.launchGame();
    },
    toggleFullscreen() {
      const iframe = document.getElementById("frame");
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.mozRequestFullScreen) {
        // Firefox
        iframe.mozRequestFullScreen();
      } else if (iframe.webkitRequestFullscreen) {
        // Chrome, Safari and Opera
        iframe.webkitRequestFullscreen();
      } else if (iframe.msRequestFullscreen) {
        // IE/Edge
        iframe.msRequestFullscreen();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.mobile-wrapper {
  height: calc(100dvh - 130px) !important;
}
.mobile-container {
  height: 90% !important;
}
.main-container {
  .demo {
    display: flex;
    align-items: center;
    gap: 10px;
    @media screen and (max-width: 991px) {
      gap: 7px;
    }

    @media screen and (max-width: 991px) {
      margin-left: auto;
    }

    span {
      font-weight: 700;
      font-size: 1rem;
      color: #616498;

      > span {
        @media screen and (max-width: 991px) {
          display: none;
        }
      }
    }
    button.button-toggle {
      width: 56px;
      height: 30px;
      position: relative;

      &:before {
        content: "";
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 34px;
        background: #3a3a65;
      }

      &:after {
        content: "";
        width: 22px;
        height: 22px;
        position: absolute;
        left: 4px;
        top: 4px;
        border-radius: 50%;
        background: #22224a;
        transition: transform 0.3s ease;
      }

      &.button-active:before {
        background: #616498;
      }

      &.button-active:after {
        transform: translateX(26px);
        background: #22224a;
      }
    }
  }

  padding-top: 20px;
  @media screen and (max-width: 991px) {
    padding: 10px 5px;
  }
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  > div {
    max-width: 1100px;
  }
  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: var(--dark-blue);

    border-radius: 10px;
    border: 4px solid #090c1d;
    @media screen and (max-width: 500px) {
      height: calc(100dvh - 130px);
    }
    .thirdPartyContainer {
      width: 100%;

      display: grid;
      place-content: center;
      margin: auto;
      overflow: hidden;
      position: relative;
      z-index: 10;

      aspect-ratio: 16 / 9;

      @media screen and (min-height: 951px) {
        min-height: 450px;
      }

      @media screen and (max-width: 500px) {
        height: 90%;
      }
      background: var(--dark-blue);

      &.error {
        background: black;
      }

      .error {
        text-align: center;
        font-size: 26px;
        color: var(--red);
      }

      iframe {
        border: none;
        width: 100%;
        min-height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }
    }
    .actions {
      height: 75px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding-inline: 20px;
      @media screen and (max-width: 991px) {
        padding-inline: 10px;
      }
      border-top: 4px solid #090c1d;

      .logo {
        max-width: 300px;
        margin-inline: auto;
        svg {
          height: 50px;
          width: auto;
        }

        @media screen and (max-width: 991px) {
          display: none;
        }
      }

      .currency {
        display: flex;
        cursor: pointer;
        background: #22224a;
        border-radius: 8px;
        height: 40px;
        width: 90px;
        padding-inline: 10px;

        @media screen and (max-width: 991px) {
          width: fit-content;
          position: relative;
          justify-content: center;
          padding-inline: 9px;
        }

        align-items: center;
        gap: 10px;
        font-size: 0.857rem;
        font-weight: 600;

        .third-party-rows-menu {
          position: relative;
          top: 115px;

          transform: translate(-100%, 0);
          left: 15%;

          @media screen and (max-width: 991px) {
            top: 45px;
            transform: none;
            left: unset;
            position: absolute;
          }

          z-index: 9;

          &.currency-picker-enter-active,
          &.currency-picker-leave-active {
            overflow: hidden;
            transition: height 0.2s ease;
          }

          &.currency-picker-enter-to,
          &.currency-picker-leave {
            height: 125px;
          }

          &.currency-picker-enter,
          &.currency-picker-leave-to {
            height: 0;
          }
        }

        .third-party-menu-inner {
          @media screen and (max-width: 991px) {
            position: relative;
          }
          padding: 5px 0;
          border-radius: 5px;
          background-color: #22224a;
          max-height: 300px;
          overflow: scroll;

          button {
            height: 40px;

            display: flex;
            align-items: center;
            gap: 10px;
            justify-content: space-between;
            padding: 0 17px;
            border-radius: 0;
            font-size: 0.857rem;
            font-weight: 600;
            color: #ffffff;
            background-color: transparent;
            border: none;
            transition: all 0.3s ease;
            @media screen and (max-width: 991px) {
              width: fit-content;
              padding: 0 13px;
            }
            span {
              @media screen and (max-width: 991px) {
                display: none;
              }
            }

            img {
              height: 18px;
              width: 18px;
            }

            &:hover,
            &.active {
              background-color: #292950;
            }
          }
        }
      }

      .currency > span {
        @media screen and (max-width: 991px) {
          display: none;
        }
      }

      .currency > img {
        height: 24px;
        width: 24px;
      }

      > div:first-of-type,
      > div:nth-of-type(2) {
        flex-shrink: 0;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        width: 40px;
        height: 40px;
        background: #22224a;
        border-radius: 8px;
      }

      .heart.favourite svg {
        fill: #8e4848;
        path {
          stroke: #8e4848;
        }
      }
    }
  }
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #616498;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

.app-loader .central-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
  height: 80px;
  width: 450px;

  @media screen and (max-width: 991px) {
    height: 50px;
    width: 300px;
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

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
