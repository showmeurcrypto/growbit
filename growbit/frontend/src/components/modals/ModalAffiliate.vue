<template>
  <div class="level-info">
    <div class="top">
      <span>Affiliate</span>
      <div class="close" @click="modalsSetShow(null)">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>
    <div class="content">
      <div class="text">
        Join the Affiliate Program and earn commissions by referring new
        players! Climb through the ranks based on the total earnings. You need a
        total earn of 10k for Level 2 and 30k for Level 3.
      </div>

      <div>
        <div class="slider-container">
          <div class="slider_wrapper">
            <div class="slider">
              <!--               <img
                class="level-circle"
                src="../../assets/images/level1.svg"
                :style="{ left: '30px' }"
              />
              <img
                class="level-circle"
                src="../../assets/images/level2.svg"
                :style="{ left: 0, right: 0, margin: 'auto' }"
              />
              <img
                class="level-circle"
                src="../../assets/images/level3.svg"
                :style="{ right: '50px' }"
              /> -->

              <input
                disabled
                type="range"
                id="volume"
                name="volume"
                min="0"
                max="100"
              />
            </div>
          </div>

          <p>Your commission rate</p>
          <p>{{ level * 10 }}%</p>

          <div class="bonus-formula">
            (Edge as decimal * wagered / 2) * commission rate
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "jquery-ui/ui/widget.js";
import "jquery-ui/ui/widgets/mouse";
import "jquery-ui/ui/widgets/slider";

import { mapActions } from "vuex";
import CloseIcon from "@/assets/images/close.svg";

export default {
  name: "AffiliateMOdal",
  mounted() {
    let maxLevelWager = 30000;
    let progress = Math.min(
      100,
      ((this.modalsData.earned || 0) / maxLevelWager) * 100
    );
    this.progress = progress;
    let slider = $(".slider > input");

    slider.css(
      "background",
      `linear-gradient(to right, #F7BE2C ${progress}%, grey ${progress}%)`
    );
  },
  components: {},
  data() {
    return {
      progress: 0,
      CloseIcon,
    };
  },
  computed: {
    level() {
      return Math.min(Math.floor((this.modalsData.wager || 0) / 100000) + 1, 3);
    },
  },
  methods: {
    ...mapActions(["modalsSetShow", "modalsData"]),
  },
};
</script>

<style lang="scss">
@import "../../../node_modules/jquery-ui/themes/base/slider.css";

.level-info {
  border-radius: 18px;
  border: 4px solid #090c1d;
  background: var(--dark-blue);
  max-width: 920px;

  @media screen and (max-width: 991px) {
    background: transparent;
  }

  .top {
    padding: 30px;
    background: #090c1d;
    display: flex;
    flex-direction: row;
    gap: 15px;
    border-radius: 15px 15px 0 0;

    span {
      font-weight: 900;
      font-size: 1.714rem;
    }

    .close {
      width: 40px;
      height: 40px;
      background: #22224a;
      border-radius: 8px;
      display: grid;
      cursor: pointer;
      place-content: center;
      margin-left: auto;
    }

    @media screen and (max-width: 991px) {
      display: none;
    }
  }

  .content {
    padding: 20px;
  }

  .slider-container {
    padding-inline: 30px;

    padding-top: 50px;
    padding-bottom: 30px;
    margin-top: 20px;
    height: 100%;
    border-radius: 9px;
    min-height: 300px;
    display: flex;
    align-items: center;
    flex-direction: column;
    background: #22224a;
  }

  .bonus-formula {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 69px;
    border: 2px dashed #616498;
    border-radius: 10px;
    padding-inline: 15px;
    font-style: normal;
    font-weight: 400;
    font-size: 1.29rem;
    color: #616498;
  }

  p:first-of-type {
    margin-top: 30px;

    font-style: normal;
    font-weight: 400;
    font-size: 1.429rem;
    text-align: center;
    color: #ffffff;
    margin-bottom: 0;
  }

  p:nth-of-type(2) {
    margin-top: 0;
    margin-bottom: 10px;

    font-style: normal;
    font-weight: 800;
    font-size: 1.429rem;
    text-align: center;
    color: #ffffff;
  }

  .slider_wrapper {
    width: 100%;
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: center;

    .ticks {
      width: 100%;
      padding: -30px 30px 0 30px;
      display: flex;
      justify-content: space-between;

      .tick {
        height: 20px;
        border-right: 0.822165px solid #3f315e;
      }
    }

    .slider {
      padding: 20px 0px 20px 0px;
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
      height: unset;

      .level-circle {
        position: absolute;
        height: 60px;
      }

      input {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 7px;
        background: #f7be2c;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 38px;
          width: 38px;
          background: transparent;
          background-size: cover;
          border-radius: 50%;
          transition: 0.2s ease-in-out;
        }

        /*Firefox */
        &::-moz-range-thumb {
          height: 38px;
          width: 38px;
          background: transparent;
          background-size: cover;
          border: none;
          border-radius: 50%;
          transition: 0.2s ease-in-out;
        }
      }
    }
  }

  h1 {
    font-style: normal;
    font-weight: 400;
    font-size: 40px;
    color: #eeeeee;
    margin-bottom: 37px;
  }

  .text {
    align-items: center;
    padding: 15px;
    width: 100%;
    background: #22224a;
    border-radius: 9px;
    font-style: normal;
    font-weight: 500;
    font-size: 1.143rem;
    color: #616498;
  }
}
</style>
