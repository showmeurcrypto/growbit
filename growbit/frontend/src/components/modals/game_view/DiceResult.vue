<template>
  <div class="dice-result-container" :class="game.data.mode || 'under'">
    <div class="dice-wrapper">
      <!-- <div class="target">{{ target }}</div> -->
      <div class="dice-slider"></div>
    </div>
  </div>
</template>

<script>
import "jquery-ui/ui/widget.js";
import "jquery-ui/ui/widgets/mouse";
import "jquery-ui/ui/widgets/slider";

import MultiplierIcon from "@/assets/images/multiplier.svg?inline";
import LowerHigherIcon from "@/assets/images/lower_higher.svg?inline";
import ChanceIcon from "@/assets/images/chance.svg?inline";
import { mapActions, mapGetters } from "vuex";

export default {
  props: ["game"],
  data() {
    return {
      isMobile: null,
    };
  },
  computed: {},
  mounted() {
    let values = ["between", "outside"].includes(this.game.data.mode)
      ? [this.game.data.target, this.game.data.target2]
      : [];
    $(".dice-result-container .dice-slider").slider({
      range: ["between", "outside"].includes(this.game.data.mode)
        ? true
        : "min",
      min: 1,
      max: 100,
      values: values,
      value: this.game.data.target,
      slide: (event, ui) => {
        return false;
      },
    });

    // console.log(this.game.data);

    const tooltip = $(
      '<div class="d_slider-tooltip_container"><div class="d_slider-tooltip"><span id="tooltip-value">50</span></div></div>'
    ).hide();

    $(".dice-result-container")
      .find(".dice-slider")
      .append(
        $(
          `<div id="roll" class="d_slider-result" style="opacity: 0"><span></span></div>`
        )
      )
      .find(".ui-slider-handle")
      .append(tooltip);

    this.setResult(this.game.payout > 0, this.game.data.roll);
  },
  watch: {},
  created() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },
  methods: {
    ...mapActions(["playSoundWin", "playSoundLose", "playSoundTick"]),
    onResize() {
      const regex =
        /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      this.isMobile =
        regex.test(navigator.userAgent) || window.innerWidth <= 991;
    },
    setResult(win, result) {
      // console.log("set result", $("#roll"));

      $("#roll").toggleClass("lose", !win);
      $("#roll > span").text(result);
      $("#roll").toggleClass("win", win);

      $("#roll").css({ opacity: 1 });
      $("#roll").css({ left: "calc(" + result + "% - 21px)" });
    },
  },
};
</script>

<style lang="scss">
@import "../../../../node_modules/jquery-ui/themes/base/slider.css";

.dice-result-container {
  padding: 85px 10px 20px 10px;
  width: 100%;
  display: flex;

  .ui-corner-all {
    background: var(--red);
  }

  div.ui-slider-range.ui-widget-header {
    border-radius: 50px;
    background: var(--green);
  }

  &.over,
  &.outside {
    .ui-corner-all {
      background: var(--green);
    }

    div.ui-slider-range.ui-widget-header {
      border-radius: 50px;
      background: var(--red);
    }
  }

  .dice-wrapper {
    width: 100%;
    padding: 15px;
    border-radius: 50px;
    background: var(--dark-blue);
    position: relative;
    //overflow-y: hidden;

    .d_slider-tooltip_container {
      position: absolute;
      top: -65px;
      text-align: center;
      z-index: 50;
      width: 56px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .d_slider-tooltip {
      display: inline-block;
      position: relative;
    }

    .d_slider-tooltip > span {
      font-weight: 900;
      font-size: 1.4rem;
      color: #eeeeee;
    }

    .target {
      //margin-left: 10px;
      //margin-right: 3px;
      position: absolute;
      top: -40px;
      width: calc(96%);
      // padding-left: 15px;
      // text-align: center;
      //left: 18px;
      font-weight: 700;
      font-size: 1.29rem;
      color: #eeeeee;
      opacity: 0;
      transition: opacity 600ms ease-in-out;
    }

    &:has(.ui-state-hover:hover) {
      .target {
        opacity: 1;
      }
    }
    .ui-state-hover:active {
      .target {
        opacity: 1;
      }
    }
    @media (pointer: coarse) {
      &:has(.ui-state-hover:active) {
        .target {
          opacity: 1;
        }
      }
    }
  }

  .d_slider-tooltip_container {
    position: absolute;
    top: -73px;
    text-align: center;
    z-index: 50;
    width: 56px;
    display: flex;
    justify-content: center;
    align-items: center;

    color: var(--orange);
    font-size: 1.29rem;
    font-weight: 500;
    height: 78px;
    padding-bottom: 10px;
  }

  .d_slider-tooltip {
    display: inline-block;
    position: relative;
    text-decoration: none;
  }

  .d_slider-result {
    width: 40px;
    height: 50px;
    text-indent: -50px;
    display: flex;
    justify-content: center;
    align-items: center;

    color: var(--orange);

    span {
      position: absolute;
      left: 45px;
      top: -25px;
      font-size: 1.29rem;
      font-weight: 800;
      text-align: center;
    }

    background-image: url(/img/dice.svg) !important;
    background-size: contain;
    background-repeat: no-repeat;
    position: absolute;
    top: -75px;
    z-index: 2;
    transition: border-color 0.3s ease, color 0.3s ease, left 1s ease,
      opacity 0.2s ease;

    display: flex !important;
    justify-content: center;
    align-items: center;

    left: -13px;
    padding: 8px 8px 18px;
  }

  .win {
    border-color: #27ae60;
    span {
      color: var(--green);
    }
  }

  .lose {
    border-color: #e74c3c;
    span {
      color: #e74c3c;
    }
  }

  .lose.d_slider-result:after {
    border-top-color: #e74c3c;
    color: #e74c3c;
  }

  .win.d_slider-result:after {
    border-top-color: #27ae60;
    color: #27ae60;
  }

  .dice-slider {
    outline: 5px solid #090c1d;
  }
  .d_slider-border {
    padding: 35px;
  }

  .d_slider-circle {
    display: none !important;
    width: 7px;
    height: 7px;
    background: white;
    border-radius: 12px;
    position: absolute;
    z-index: 4;
    left: 3px;
    top: -1px;
    transform: translateX(-50%);
    margin-left: calc(55px / 2);
    transition: left 1s ease;
  }

  #slider-range,
  .ui-state-default,
  .ui-widget-content .ui-state-default,
  .ui-widget-header .ui-state-default,
  .ui-button,
  html .ui-button.ui-state-disabled:hover,
  html .ui-button.ui-state-disabled:active {
    border: none;
  }

  .ui-slider-horizontal .ui-slider-handle {
    top: -0.7em;
    margin-left: -1.5em;
    width: 50px;
    height: 28px;
    border-radius: 5px;

    background: transparent url(/img/slider.png) no-repeat !important;
    border: 0 !important;
  }

  .ui-slider-handle {
    user-select: none;
    border-radius: 50%;
    border: none;
    outline: 0;
    background-color: white;

    transition: background-color 0.3s ease, color 0.3s ease;
    box-shadow: 0 0 5px rgba(black, 0.5);
    z-index: 10;

    i {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.8em;
      color: black !important;
    }

    &:hover {
      color: white;
      cursor: grab;
    }

    &:active {
      background-color: darken(white, 2.5%);
      cursor: grabbing;
    }
  }

  .ui-widget-content {
    border: none !important;
    border-radius: 50px;
    height: 8px;
  }
}
</style>
