<template>
  <div class="main-container">
    <div class="wrapper">
      <div class="actions">
        <!-- <div> -->
        <router-link v-if="!isRewardBox" class="link-back" to="/cases">
          <ArrowLeft></ArrowLeft>
        </router-link>
        <router-link v-else class="link-back" to="/rewards">
          <ArrowLeft></ArrowLeft>
        </router-link>
        <!-- </div> -->

        <div class="logo">
          <img src="@/assets/images/growbit.png" />
        </div>

        <div class="heart quick" :class="{ active: this.unboxQuick }">
          <button class="button-sound" @click="unboxToggleQuick()">
            <QuickIcon></QuickIcon>
            <!-- <img :src="MutedIcon" v-else /> -->
          </button>
        </div>

        <div class="heart">
          <button class="button-sound" @click="toggleMute()">
            <VolumeIcon v-if="!soundMuted"></VolumeIcon>
            <img :src="MutedIcon" v-else />
          </button>
        </div>
        <div class="heart" @click="unboxFairButton()">
          <FairnessIcon></FairnessIcon>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { mapActions, mapGetters } from "vuex";
import axios from "axios";
import HeartIcon from "@/assets/images/heart.svg?inline";

import FullScreenIcon from "@/assets/images/full-screen.svg?inline";
import ArrowLeft from "@/assets/images/arrow_left.svg?inline";
import MutedIcon from "@/assets/images/volume_muted.png?inline";
import FairnessIcon from "@/assets/images/fairness.svg?inline";
import QuickIcon from "@/assets/images/quick.svg?inline";
import VolumeIcon from "@/assets/images/volume.svg?inline";
import GameFooter from "@/components/GameFooter.vue";
import SimilarSlots from "@/components/SimilarSlots.vue";
import AppLoader from "@/components/AppLoader.vue";
import { rewardBoxes } from "@/utils";

export default {
  components: {
    HeartIcon,
    FullScreenIcon,
    ArrowLeft,
    VolumeIcon,
    FairnessIcon,
    QuickIcon,
  },
  data() {
    return {
      MutedIcon,
      show: false,
    };
  },
  async created() {},

  watch: {},

  mounted() {},
  computed: {
    ...mapGetters([
      "soundMuted",
      "fiatRates",
      "authUser",
      "selectedCurrency",
      "unboxQuick",
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
    isRewardBox() {
      const lastSegment = this.$route.path.split("/").pop();
      return rewardBoxes.includes(lastSegment);
    },
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "modalsSetShow",
      "toggleMute",
      "modalsSetData",
      "unboxToggleQuick",
    ]),
    unboxFairButton() {
      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        return;
      }
      this.modalsSetData({ game: "cases", data: {} });
      this.modalsSetShow("ProvabilityFair");
    },
    pickCurrency(currency) {
      this.setCurrency(currency);
      this.show = false;
    },
    toggleFavourite() {
      if (this.gameId) {
        this.toggleFavouriteSlot(this.gameId);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.mobile-wrapper {
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

  padding-bottom: 10px;

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
    @media screen and (max-width: 500px) {
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

      .logo {
        max-width: 300px;
        padding-left: 30px;
        margin-inline: auto;
        svg {
          height: 50px;
          width: auto;
        }

        @media screen and (max-width: 991px) {
          img {
            height: 17px;
          }
          padding-left: 0px;
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

      > div:nth-last-of-type(1),
      > div:nth-last-of-type(2),
      > div:nth-last-of-type(3),
      .link-back {
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

      .quick.active .button-sound svg {
        path {
          stroke: #f6be2c;
          fill: #f6be2c;
        }
      }

      .heart .button-sound {
        margin-top: 6px;
      }

      .quick.active {
        border-style: solid;
        border-color: #f6be2c;
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
