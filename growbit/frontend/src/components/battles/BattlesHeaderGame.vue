<template>
<!--   <div class="battles-header-game">
    <router-link to="/battles" class="link-back">
      <div class="link-inner">
        <svg
          width="14"
          height="12"
          viewBox="0 0 14 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0.519893 4.88899C-0.173298 5.40596 -0.173297 6.69838 0.519893 7.21535L5.97877 11.2865C6.67196 11.8035 7.53845 11.1573 7.53845 10.1233V9.06113H14V3.04304H7.53845V1.98103C7.53845 0.947086 6.67196 0.300873 5.97877 0.817844L0.519893 4.88899Z"
          />
        </svg>
        GO BACK
      </div>
    </router-link>
    <div class="game-cost">
      TOTAL BATTLE COST
      <div class="cost-amount">
        <div class="amount-value">
          <span>{{ getDisplayCurrencyAmountFormatted(battlesGetAmount) }}</span>
          <Currency></Currency>
        </div>
      </div>
    </div>
    <div class="game-info">
      <div
        v-if="
          battlesGameData.game === null ||
          ['created', 'countdown', 'pending', 'completed'].includes(
            battlesGameData.game.state
          ) === true
        "
        class="info-text"
      >
        {{ battlesGetState }}
      </div>
      <div v-else class="info-running">
        <div class="running-case">
          {{ battlesGetBoxes[battlesGetRound - 1].name }}
        </div>
        <div class="running-box"></div>
        <div class="running-round">Round {{ battlesGetRound }}</div>
      </div>
      <div class="info-cases">
        <BattlesGameBoxes v-bind:game="battlesGameData.game" />
      </div>
    </div>
    <div class="game-right">
      <div
        v-if="battlesGameData.game !== null"
        class="right-info"
        v-bind:class="{
          'info-cursed': battlesGameData.game.options.cursed === true,
          'info-terminal': battlesGameData.game.options.terminal === true,
        }"
      >
        STANDARD
      </div>
      <div class="right-actions">
        <button
          v-on:click="battlesCopyButton(battlesGetLink)"
          class="button-link"
        >
          <div class="button-inner">
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.1967 1.16684L6.74187 4.6216C6.7352 4.62824 6.73105 4.6363 6.72441 4.64301C7.5755 4.51905 8.44983 4.60403 9.26032 4.92008L11.6051 2.57532C12.3819 1.79852 13.6452 1.79852 14.422 2.57532C15.1988 3.35205 15.1988 4.61545 14.422 5.39218C14.2896 5.52471 10.7675 9.04676 10.9673 8.84694C10.1843 9.62995 8.89983 9.59645 8.15032 8.84694C7.76214 8.45876 7.13012 8.45876 6.74187 8.84694L6.13721 9.45161C6.30492 9.73658 6.4972 10.0108 6.74187 10.2555C8.21718 11.7308 10.7566 11.8486 12.3543 10.2729C12.361 10.2663 12.369 10.2621 12.3757 10.2555L15.8305 6.8007C17.3862 5.24492 17.3862 2.72262 15.8305 1.16684C14.2747 -0.388945 11.7524 -0.388945 10.1967 1.16684Z"
              />
              <path
                d="M7.74452 12.0696L5.39219 14.422C4.61546 15.1988 3.35205 15.1988 2.57533 14.422C1.79853 13.6452 1.79853 12.3818 2.57533 11.605C2.70779 11.4726 6.23737 7.94299 6.03762 8.14274C6.82056 7.3598 8.10505 7.39323 8.85455 8.14274C9.24273 8.53099 9.87479 8.53099 10.263 8.14274L10.8677 7.53807C10.7 7.2531 10.5077 6.97889 10.263 6.73429C8.79052 5.26174 6.25294 5.13645 4.65055 6.71679C4.64388 6.72343 4.63585 6.72762 4.62914 6.73429L1.16681 10.1966C-0.388904 11.7523 -0.38897 14.2747 1.16681 15.8305C2.72259 17.3862 5.24496 17.3862 6.80067 15.8305L10.263 12.3681C10.2696 12.3615 10.2738 12.3535 10.2804 12.3467C9.42934 12.4707 8.55504 12.3857 7.74452 12.0696Z"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
 -->
 <div class="main-container">
  <div class="container">
    <div class="wrapper">
      <div class="actions">
        <!-- <div> -->
        <router-link class="link-back" to="/battles">
          <ArrowLeft></ArrowLeft>
        </router-link>
        <div class="battles-info">
          <div class="battles-type"> 
            BATTLES TYPE
          </div>
          <div class="battles-mode"> 
            BATTLES MODE
          </div>
        </div>

        <div class="box-info">
          <div class="box-name"> 
            BOX TYPE
          </div>
          <div class="box-price-info"> 
            </Currency></Currency>
            <div>
              0.17
            </div>
          </div>
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
        <div class="heart" @click="unboxFairButton()">
          <FairnessIcon></FairnessIcon>
        </div>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="wrapper">
      <div class="actions">
        <div class="round-info">
          <div class="round-number"> 
            ROUND 5 OF 13
          </div>
          <div class="round-type"> 
            PRIVATE
          </div>
        </div>

        <div class="boxes-info">
          BOXES
        </div>

        <div class="battle-value-info">
          <div class="battle-value"> 
            BATTLE VALUE
          </div>
          <div class="box-value-price"> 
            </Currency></Currency>
            <div>
              2.89
            </div>
          </div>
        </div>
      </div>
    </div> 
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import BattlesGameBoxes from "@/components/battles/BattlesGameBoxes";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import Currency from "@/components/Currency.vue";

export default {
  name: "BattlesHeaderGame",
  mixins: [currencyExchangeRatesMixin],
  components: {
    BattlesGameBoxes,
    Currency
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "soundSetBattles",
      "modalsSetData",
      "modalsSetShow",
    ]),
    battlesFormatValue(value) {
      return parseFloat(Math.floor(value / 10) / 100)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    battlesCopyButton(value) {
      const el = document.createElement("textarea");
      el.value = value;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);

      this.notificationShow({
        type: "success",
        message: "Copied to your clipboard.",
      });
    },
  },
  computed: {
    ...mapGetters(["soundBattles", "authUser", "battlesGameData"]),
    battlesGetAmount() {
      let amount = 0;

      if (this.battlesGameData.game !== null) {
        amount = this.battlesGameData.game.amount;
      }

      return amount;
    },
    battlesGetState() {
      let state = "Waiting to start...";

      if (this.battlesGameData.game !== null) {
        if (this.battlesGameData.game.state === "pending") {
          state = "Awaiting EOS Block";
        } else if (this.battlesGameData.game.state === "completed") {
          state = "Game Ended";
        }
      }

      return state;
    },
    battlesGetBoxes() {
      let boxes = [];

      if (this.battlesGameData.game !== null) {
        for (const box of this.battlesGameData.game.boxes) {
          for (let i = 0; i < box.count; i++) {
            boxes.push(box.box);
          }
        }
      }

      return boxes;
    },
    battlesGetRound() {
      let round = 1;

      if (
        this.battlesGameData.game.bets[0].outcomes !== undefined &&
        this.battlesGameData.game.bets[0].outcomes.length >= 1
      ) {
        round = this.battlesGameData.game.bets[0].outcomes.length;
      }

      return round;
    },
    battlesGetOption() {
      let option = "";

      if (
        this.battlesGameData.game.options.cursed === true &&
        this.battlesGameData.game.options.terminal === false
      ) {
        option = "CURSED MODE";
      } else if (
        this.battlesGameData.game.options.cursed === false &&
        this.battlesGameData.game.options.terminal === true
      ) {
        option = "TERMINAL MODE";
      }

      return option;
    },
    battlesGetLink() {
      let link = "hypedraft.com/battles/";

      if (this.battlesGameData.game !== null) {
        link = "growduel.com/battles/" + this.battlesGameData.game._id;
      }

      return link;
    },
  },
};
</script>

<style scoped>
.mobile-wrapper {
}

.mobile-container {
  height: 90% !important;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.container {

  padding-bottom: 10px;

  display: flex;
  align-items: center;
  flex-direction: column;
  border-bottom: 1px solid black;
  justify-content: space-between;
  width: 100%;
  > div {
    max-width: 1300px;
  }
  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: var(--dark-blue);

    border-radius: 10px;
    @media screen and (max-width: 500px) {
    }

    .actions {
      height: 75px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-inline: 20px;
      @media screen and (max-width: 991px) {
        padding-inline: 10px;
      }

      .battles-info {
        display: flex;
        flex-direction: column;
      }

      .battles-info .battles-type {

      }

      .battles-info .battles-mode {
       
       }

      .box-info {
        display: flex;
        flex-direction: column;
        margin-inline: auto;
      }

      .box-info .box-name {

      }

      .box-info .box-price {
        display: flex;
        flex-direction: row;
      }

      .box-info .box-price img {

      }

      .box-info .box-price div {

      }

      .round-info {
        display: flex;
        flex-direction: column;
      }

      .round-info .round-type {
        > img {

        }
      }

      .round-info .round-number {

      }

      .boxes-info {

      }

      .battles-value-info {
        display: flex;
        flex-direction: column;
      }

      .battles-value-info .battle-value {

      }

      .battles-value-info .box-value-price {
        display: flex;
        flex-direction: row;
      }

      .battles-value-info .box-value-price img {

      }

      .battles-value-info .box-value-price div {

      }

      .heart,
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
</style>
