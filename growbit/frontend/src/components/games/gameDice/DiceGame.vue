<template>
  <div class="game-dice row h-100" :class="targetMode">
    <div class="dice-history">
      <div v-for="h of history" :class="{ win: h[0] }">
        {{ h[1] }}
      </div>
    </div>
    <div class="col-12 dice-column">
      <div class="diceCanvas"></div>

      <div class="dice-wrapper-1">
        <div class="dice-wrapper">
          <!-- <div class="target">{{ target }}</div> -->
          <div class="dice-slider"></div>
        </div>
      </div>
    </div>
    <div class="dice-footer">
      <div class="col">
        <div class="dice-header">Multiplier</div>
        <div class="position-relative">
          <input class="dice-payout" :value="multi" readonly type="text" />
          <MultiplierIcon></MultiplierIcon>
        </div>
      </div>
      <div class="col">
        <div class="dice-header dice-target">
          {{ targetMode }}
        </div>
        <div class="position-relative">
          <input
            class="dice-number"
            type="number"
            step="1"
            @input="handleNumInput($event.target.value, 0)"
          />
          {{ double ? " - " : "" }}
          <input
            :style="{ opacity: double ? 1 : 0 }"
            class="dice-number-2"
            type="number"
            step="1"
            @input="handleNumInput($event.target.value, 1)"
          />
          <LowerHigherIcon> </LowerHigherIcon>
        </div>
      </div>

      <div class="col">
        <div class="dice-header">Chance</div>
        <div class="position-relative">
          <input class="dice-chance" readonly type="text" />
          <ChanceIcon></ChanceIcon>
        </div>
      </div>
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

import { getDiceChance } from "@/utils";

import { mapActions, mapGetters } from "vuex";

export default {
  props: ["onTargetChange", "targetMode"],
  data() {
    return {
      hideResultTimer: null,
      target: 50,
      target2: 70,
      history: [],
      amount: 1,
      isMobile: null,
    };
  },
  computed: {
    ...mapGetters(["gameConfig", "authUser"]),
    multi(target, target2, targetMode) {
      let winningChance = getDiceChance(
        this.target,
        this.target2,
        this.targetMode
      );
      let multi = (100 - this.gameConfig.diceEdge) / winningChance;
      return multi.toFixed(2);
    },

    double() {
      return ["between", "outside"].includes(this.targetMode);
    },
  },
  components: {
    MultiplierIcon,
    LowerHigherIcon,
    ChanceIcon,
  },
  mounted() {
    $(".game-dice")
      .find(".dice-slider")
      .slider({
        range: this.double ? true : "min",
        min: 1,
        max: 100,
        value: this.double ? null : 50,
        values: this.double ? [50, 70] : null,
        slide: (event, ui) => {
          if (this.double) {
            if (
              ui.values[0] < 4 ||
              ui.values[0] > 96 ||
              ui.values[1] < 4 ||
              ui.values[1] > 96 ||
              ui.values[1] - ui.values[0] < 3
            )
              return false;

            setTimeout(this.update, 30);
            this.playSoundTick();
          } else {
            if (ui.value < 4 || ui.value > 95) return false;
            $("#tooltip-value").html(ui.value);
            setTimeout(this.update, 30);
            this.playSoundTick();
          }
        },
      });

    const tooltip = $(
      '<div class="d_slider-tooltip_container"><div class="d_slider-tooltip"><span id="tooltip-value">50</span></div></div>'
    ).hide();

    $(".game-dice")
      .find(".dice-slider")
      .append(
        $('<div id="circle" class="d_slider-circle" style="display: none" />')
      )
      .append(
        $(
          `<div id="result" class="d_slider-result" style="opacity: 0"><span></span></div>`
        )
      )
      .find(".ui-slider-handle")
      .append(tooltip)
      .hover(
        function () {
          tooltip.stop(true).fadeIn("fast");
        },
        function () {
          tooltip.stop(true).fadeOut("fast");
        }
      );

    this.update();
  },
  watch: {
    targetMode() {
      this.update();
    },
  },
  created() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },
  methods: {
    ...mapActions(["playSoundWin", "playSoundLose", "playSoundTick"]),
    handleNumInput(val, index) {
      if (!this.double) {
        const value = parseInt(val);
        if (isNaN(value) || value < 1 || value > 99) {
          $(".dice-number").toggleClass("error", true);
          return;
        }

        $(".dice-number").toggleClass("error", false);

        $(".game-dice").find(".dice-slider").slider("value", value);
        this.update();
      } else {
        const value = parseInt(val);
        if (isNaN(value) || value < 1 || value > 99) {
          $(".dice-number").toggleClass("error", true);
          return;
        }

        $(".dice-number").toggleClass("error", false);

        if (value <= this.target + 2) {
          return;
        }

        if (index == 1) {
          this.target2 = value;
        }

        let newValues = [this.target, this.target2];

        newValues[index] = value;

        $(".game-dice").find(".dice-slider").slider("values", newValues);
        this.update();
      }
    },
    onResize() {
      const regex =
        /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      this.isMobile =
        regex.test(navigator.userAgent) || window.innerWidth <= 991;
    },
    update() {
      // const value = $(".game-dice .dice-slider").slider("value") || 50;
      // console.log("value is " + value);
      // let values = $(".game-dice .dice-slider").slider("values");

      // if (!values.length) {
      //   values = [35, 85];
      // }
      // const currentRange = $(".game-dice .dice-slider").slider("option").range;

      const currentRange = $(".game-dice .dice-slider").slider("option").range;

      if (this.double) {
        if (currentRange !== true) {
          $("#tooltip-value").html("");

          $(".game-dice")
            .find(".dice-slider")
            .slider({
              range: true,
              min: 1,
              max: 100,
              value: null,
              values: [35, 85],
              slide: (event, ui) => {
                if (
                  ui.values[0] < 4 ||
                  ui.values[0] > 96 ||
                  ui.values[1] < 4 ||
                  ui.values[1] > 96 ||
                  ui.values[1] - ui.values[0] < 2
                )
                  return false;

                setTimeout(this.update, 30);
                this.playSoundTick();
              },
            });
        }
      } else {
        if (currentRange !== "min") {
          $(".game-dice")
            .find(".dice-slider")
            .slider({
              range: "min",
              min: 1,
              max: 100,
              values: null,
              value: 50,
              slide: (event, ui) => {
                if (ui.value < 4 || ui.value > 96) return false;
                $("#tooltip-value").html(ui.value);
                setTimeout(this.update, 30);
                this.playSoundTick();
              },
            });
        }
      }

      const value = $(".game-dice .dice-slider").slider("value") || 50;
      // console.log("value is " + value);
      let values = $(".game-dice .dice-slider").slider("values");

      if (!values.length) {
        values = [35, 85];
      }

      // $(".game-dice .dice-slider")
      // .slider.range = ["between","outside"].includes(this.targetMode) ? true : 'min';

      if (this.double) {
        this.target = values[0];
        this.target2 = values[1];
        $(".dice-number").val(values[0]);
        $(".dice-number-2").val(values[1]);
      } else {
        this.target = value;
        $(".dice-number").val(value);
      }

      this.onTargetChange(this.double ? values[0] : value, values[1]);

      $(".dice-chance").val(
        getDiceChance(
          this.double ? values[0] : value,
          values[1],
          this.targetMode
        ) + "%"
      );

      let pxDeduct = this.isMobile ? "% - 15px)" : "% - 14px)";
      $(".target").css({ textIndent: "calc(" + value + pxDeduct });
      $(".target").css({
        paddingLeft: value <= 30 ? 0.23 * (40 - value) + "px" : "",
      });
      $(".target").css({
        marginLeft: value >= 70 ? 0.19 * (100 - value) + "px" : "",
      });
    },
    callback(win, result) {
      $("#circle, #result").css({ transition: "1200ms" });

      $("#circle").fadeIn("fast");
      $("#circle").css({
        left: "calc(" + result.toFixed(2) + "% - 21px)",
        color: win ? "green" : "red",
      });

      $("#result").toggleClass("lose", !win);
      $("#result > span").text(result);
      $("#result").toggleClass("win", win);

      $("#result").css({ opacity: 1 });
      $("#result").css({ left: "calc(" + result + "% - 21px)" });

      setTimeout(() => {
        if (win) {
          this.playSoundWin();
        } else {
          //this.playSoundLose();
        }
      }, 150);

      if (this.hideResultTimer != null) clearTimeout(this.hideResultTimer);
      this.hideResultTimer = setTimeout(function () {
        $("#result").css({ opacity: 0 });
        $("#circle").fadeOut("fast");
      }, 7000);

      this.history.unshift([win, result]);

      if (this.history.length > 20) {
        this.history = this.history.slice(0, 10);
      }
    },
  },
};
</script>

<style lang="scss">
@import "../../../../node_modules/jquery-ui/themes/base/slider.css";

.game-dice {
  padding: 20px;
  @media screen and (max-width: 991px) {
    padding: 10px;
  }
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

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

  .dice-target {
    text-transform: capitalize;
  }

  .dice-history {
    position: absolute;
    display: flex;
    max-width: 90%;
    overflow: hidden;
    flex-wrap: wrap;
    max-height: 26px;
    @media screen and (max-width: 991px) {
      max-height: 24px;
    }
    gap: 5px;

    > div {
      flex-shrink: 0;
      font-weight: 700;
      font-size: 1rem;

      text-align: center;

      color: #090c1d;

      width: 45px;

      border-radius: 3px;

      background: var(--red);
      box-shadow: inset 0 -4px #0003;
      padding-bottom: 3px;
      &.win {
        background: var(--green);
      }
    }
  }

  .position-relative {
    display: flex;
    align-items: center;
    padding: 10px;
    justify-content: flex-start;
    height: 41px;
    background: #090c1d;
    border-radius: 5px;

    svg {
      margin-left: auto;
    }
  }
  .diceCanvas {
    margin-top: 120px;
    @media screen and (max-width: 991px) {
      margin-top: 50px;
    }
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -15px;
    width: calc(100% + 30px);
  }

  .dice-header {
    margin-bottom: 5px;
    font-weight: 700;
    font-size: 1rem;
    color: #eeeeee;
  }

  .dice-wrapper-1 {
    padding: 10px;
    background: #090c1d;
    margin: 60px 0px 70px;
    width: calc(100% - 0px);
    border-radius: 50px;
  }

  .dice-wrapper {
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

      //      color: #eeeeee;
      //    font-weight: 700;
      //  font-size: 1.29rem;
      //  height: 78px;
      //padding-bottom: 10px;
      // background: url(/img/dice-hover.png) no-repeat !important;
    }

    .d_slider-tooltip {
      display: inline-block;
      position: relative;
      //  font-weight: 700;
      //  font-size: 1.29rem;
      //  color: #eeeeee;
      // text-decoration: none;
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

  .dice-column {
  }

  .dice-footer {
    margin-top: auto;
    display: flex;
    gap: 20px;

    > div {
      width: 100%;
      input {
        max-width: 28px;

        &.dice-number-2 {
          margin-left: 15px;
        }
      }
      display: flex;
      flex-direction: column;
    }
  }

  .game-history {
    height: 65px;
  }

  .history-dice {
    border: 1px solid white !important;

    border-radius: 3px;
    padding: 5px 10px;
    font-weight: 600;
  }

  .dice-wrapper-overview {
    margin: 110px 0 0 !important;
    position: unset !important;
    width: unset !important;
  }

  .customHistory {
    top: 15px;
    transform: unset;
    right: 15px;
    width: auto;
    height: auto;
    flex-direction: row-reverse;
    background: none;
    justify-content: end;
    gap: 10px;

    .color {
      min-width: 45px !important;
      height: 30px;
      border-radius: 3px !important;
      margin-right: 5px;
      padding: 4px 5px;
      color: var(--dark-blue-2);
      font-size: 1rem;
      font-weight: bold;
      -webkit-box-shadow: inset 0px -3px 0px 0px rgba(0, 0, 0, 0.19);
      -moz-box-shadow: inset 0px -3px 0px 0px rgba(0, 0, 0, 0.19);
      box-shadow: inset 0px -3px 0px 0px rgba(0, 0, 0, 0.19);

      &:nth-of-type(1n + 5) {
        display: none;
      }
    }
  }

  canvas {
    margin-top: 35px;
  }
}

//@include media-breakpoint-down(lg) {
//  .game-content-dice {
//    min-height: 450px !important;
//  }
//}
//
//@include media-breakpoint-down(md) {
//  .dice-column {
//    height: auto;
//    order: 1;
//  }
//
//  .game-content-dice {
//    min-height: 450px !important;
//  }
//
//  .dice-footer-column {
//    position: unset;
//    height: 0;
//    bottom: 100px !important;
//  }
//
//  .dice-wrapper {
//    position: unset !important;
//    width: unset !important;
//  }
//
//  .dice-wrapper-1 {
//    margin-top: -130px;
//  }
//}
//
//@media (max-width: 1500px) {
//  .diceCanvas {
//    canvas {
//      width: 40% !important;
//      height: unset !important;
//    }
//  }
//}
</style>
