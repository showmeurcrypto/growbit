<template>
  <div class="tower">
    <div class="tower-container">
      <div class="actions-controls">
        <div class="controls-mode">
          <button
            v-on:click="setMode('manual')"
            class="button-mode"
            v-bind:class="{ 'button-selected': mode === 'manual' }"
            :disabled="autoActive === true"
          >
            Manual
          </button>
          <button
            v-on:click="setMode('auto')"
            class="button-mode"
            v-bind:class="{ 'button-selected': mode === 'auto' }"
            :disabled="
              towersGame !== null &&
              towersGame.state !== 'completed' &&
              mode !== 'auto'
            "
          >
            Auto
          </button>
        </div>
        <div class="controls-main">
          <BetAmount
            :change="(value) => (this.betAmount = value)"
            :max-bet="maxBet"
            :disabled="towersGame?.state === 'created' || autoActive"
          ></BetAmount>
          <div v-if="mode !== 'auto'" class="controls-amount-title">
            Next profit
          </div>
          <div v-if="mode !== 'auto'" class="profit">
            <span>{{ getDisplayCurrencyAmountFormatted(nextProfit) }}</span>
            <Currency />
          </div>
          <AppDropdown
            height="42px"
            :selectedInput="towersRisk"
            :disabled="towersGame?.state === 'created' || autoActive"
            :items="
              Object.keys(difficulties).map((c) => ({
                name: difficulties[c].name,
                value: c,
                onSelect: () => {
                  towersClearGame();
                  towersClearSelected();
                  towersSetRisk(c);
                },
              }))
            "
          />

          <div v-if="mode === 'auto'" class="controls-count">
            <div class="controls-amount-title">Number Of Bets</div>

            <div class="count-content">
              <input
                v-model="count"
                type="number"
                min="0"
                max="1000"
                :disabled="autoActive"
              />
              <InfinityIcon v-if="Number(count) === 0"></InfinityIcon>
            </div>
          </div>
          <div class="controls-bet">
            <app-button
              :fullwidth="true"
              v-if="
                (towersGame === null && !autoActive) ||
                (towersGame !== null &&
                  towersGame.state === 'completed' &&
                  (mode !== 'auto' || autoActive === false))
              "
              :click="playButton"
              :disabled="
                socketSendLoading !== null ||
                animationInProgress ||
                (mode === 'auto' && !this.towersSelected.length)
              "
              class="button-create"
            >
              {{ mode === "auto" ? "Start Autobet" : "Place Bet" }}
            </app-button>

            <app-button
              v-else-if="mode === 'auto' || autoActive !== false"
              :click="stopAuto"
              :red="true"
              :fullwidth="true"
            >
              Stop Autobet
            </app-button>
            <app-button
              v-else
              :fullwidth="true"
              :disabled="towersGame.revealed.length === 0"
              :click="towersCashoutButton"
              class="button-create"
            >
              Cashout
              {{ getDisplayCurrencyAmountFormatted(towersGetCashoutAmount) }}
            </app-button>
          </div>
        </div>
      </div>
      <div class="game-container">
        <div
          class="grid"
          :class="{ two: C === 2, three: C == 3, four: C == 4 }"
        >
          <div
            v-for="(cell, index) in cells"
            :key="index"
            :class="cell.className"
            @click="onCellClick(cell.col, index)"
          >
            <img v-if="cell.image" :src="cell.image" :alt="cell.alt" />
          </div>
        </div>
        <transition v-if="!autoActive" name="slide-fade">
          <div
            v-if="
              towersGame !== null &&
              towersGame.state === 'completed' &&
              towersGame.payout > 0
            "
            class="game-result"
          >
            <div class="result-inner">
              <div class="inner-multiplier">
                x{{
                  parseFloat(towersGame.payout / towersGame.amount).toFixed(2)
                }}
              </div>
              <div class="inner-won">
                You Won <Currency></Currency>
                <div class="won-value">
                  {{ getDisplayCurrencyAmountFormatted(towersGame.payout) }}
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <div class="footer">
      <GameFooter :name="'towers'" :maxBet="maxBet"></GameFooter>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppButton from "@/components/AppButton.vue";
import AppDropdown from "@/components/AppDropdown.vue";

import GameFooter from "@/components/GameFooter.vue";
import InfinityIcon from "@/assets/images/infinity.svg?inline";
import axios from "axios";
import BetAmount from "@/components/BetAmount.vue";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import { towersGetGamePayout, towersGetCurrentMultiplier } from "@/utils";

export default {
  name: "Tower",
  mixins: [currencyExchangeRatesMixin],
  metaInfo: {
    title: "Tower",
  },
  components: {
    Currency,
    BetAmount,
    GameFooter,
    AppButton,
    AppDropdown,

    InfinityIcon,
  },
  data() {
    return {
      mode: "manual",
      autoActive: false,
      autoInfinite: false,
      animationInProgress: false,
      betAmount: "0.00",
      autobetPicks: [],
      difficulties: {
        easy: { cols: 4, bombs: 1, name: "Easy" },
        med: { cols: 3, bombs: 1, name: "Medium" },
        hard: { cols: 2, bombs: 1, name: "Hard" },
        insane: { cols: 3, bombs: 2, name: "Insane" },
        ultraInsane: { cols: 4, bombs: 3, name: "Ultra Insane" },
      },
      count: 0,
      R: 10,
      cellsState: [],
    };
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "playSoundRoll",
      "playMinesReveal",
      "playSoundLose",
      "socketConnectTowers",
      "socketDisconnectTowers",
      "towersSetRisk",
      "towersSendBetSocket",
      "towersSendCashoutSocket",
      "towersSendRevealSocket",
      "towersPushToSelected",
      "towersPopFromSelected",
      "towersAutobetSocket",
      "towersClearGame",
      "towersClearSelected",
    ]),
    onCellClick(col, index) {
      if (this.mode === "manual") {
        if (!this.towersGame) {
          return;
        }

        let row = 9 - Math.floor(index / this.C);

        if (
          this.towersGame?.state !== "created" ||
          row !== this.towersGame.revealed.length
        ) {
          return;
        }

        const data = { tile: col };
        this.towersSendRevealSocket(data);
      } else if (!this.autoActive) {
        let selectedColumn = this.R - Math.floor(index / this.C) - 1;
        if (this.towersSelected.length === selectedColumn) {
          this.towersPushToSelected({ tile: col });
        } else if (
          this.towersSelected.length - 1 === selectedColumn &&
          this.towersSelected[this.towersSelected.length - 1] === col
        ) {
          this.towersPopFromSelected();
        }
      }
    },
    setMode(mode) {
      if (
        this.mode == mode ||
        (this.towersGame && this.towersGame.state == "created") ||
        this.autoActive
      ) {
        return;
      }
      if (mode === "manual") {
        this.autoInfinite = false;
        this.autoActive = false;
      } else {
        this.towersClearSelected();
        this.towersClearGame();
      }

      this.mode = mode;
    },

    playButton() {
      if (this.mode === "auto") {
        if (Math.floor(this.count) === 0) {
          this.autoInfinite = true;
        }

        this.autoActive = true;
      }

      this.play();
    },
    stopAuto() {
      this.autoInfinite = false;
      this.autoActive = false;
    },
    towersCashoutButton() {
      this.towersSendCashoutSocket({});
    },
    async play() {
      if (!this.authUser.user) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        this.stopAuto();
        return;
      }

      const amount = Number(this.betAmount);

      this.count = Math.floor(this.count);

      if (amount === null || isNaN(amount) === true || amount <= 0) {
        this.notificationShow({
          type: "error",
          message: "Please enter a valid bet amount.",
        });
        this.stopAuto();
        return;
      }

      if (
        this.mode === "auto" &&
        (this.count === null || isNaN(this.count) === true || this.count < 0)
      ) {
        this.notificationShow({
          type: "error",
          message: "Please enter a valid bet number.",
        });
        this.stopAuto();
        return;
      }

      const dlsAmount = this.getDlsAmountForBetting(amount);

      if (dlsAmount > this.maxBet) {
        this.notificationShow({
          type: "error",
          message: "Max bet exceeded!",
        });
        return;
      }

      if (this.mode === "auto" && this.autoActive) {
        if (!this.towersSelected?.length) {
          return this.notificationShow({
            type: "error",
            message: "Cells not selected!",
          });
        }

        const data = {
          amount: dlsAmount,
          risk: this.towersRisk,
          tiles: this.towersSelected,
        };
        let last = this.count === 0 && !this.autoInfinite;
        if (this.count > 0 || this.autoInfinite) {
          this.towersAutobetSocket(data);
        }
        if (this.autoInfinite === false && this.count > 0) {
          this.countAuto = this.countAuto - 1;
        }

        if (this.autoInfinite === false) this.count = this.count - 1;

        if ((this.count >= 0 && !last) || this.autoInfinite) {
          clearTimeout(this.autoplayTimer);
          this.autoplayTimer = setTimeout(() => {
            if (this.autoActive) {
              this.towersClearGame();
              setTimeout(() => {
                this.play();
              }, 200);
            } else {
              this.towersClearGame();
            }
          }, 1000);
        } else {
          this.count = Math.max(this.count, 0);
          this.stopAuto();
          this.towersClearGame();
        }
      } else {
        const data = { amount: dlsAmount, risk: this.towersRisk };
        this.towersSendBetSocket(data);
      }
    },
  },
  computed: {
    ...mapGetters([
      "generalSettings",
      "authUser",
      "gameConfig",
      "socketSendLoading",
      "towersRisk",
      "towersGame",
      "fiatRates",
      "selectedCurrency",
      "towersSelected",
    ]),

    nextProfit() {
      return (
        (this.towersGame?.amount || 0) *
        towersGetCurrentMultiplier(
          {
            risk: this.towersRisk,
            revealed: new Array((this.towersGame?.revealed?.length || 0) + 1),
          },
          this.gameConfig.towersEdge
        )
      );
    },
    towersGetCashoutAmount() {
      return (
        this.towersGame.amount *
        towersGetCurrentMultiplier(this.towersGame, this.gameConfig.towersEdge)
      );
    },
    maxBet() {
      const maxMulti = towersGetCurrentMultiplier(
        { risk: this.towersRisk, revealed: new Array(9) },
        this.gameConfig.towersEdge
      );
      return Math.max(20, this.gameConfig.maxWin / maxMulti);
    },
    C() {
      return this.difficulties[this.towersRisk].cols;
    },
    cells() {
      const output = [];
      let foundDead = false;

      for (let r = 0; r < this.R; r++) {
        for (let c = this.C - 1; c >= 0; c--) {
          if (this.mode === "auto" && !this.autoActive) {
            const key = `cell ${r} ${c}`;
            let baseClass = "cell";
            if (this.towersSelected[r] === c) {
              baseClass += " picked";
            }
            output.unshift({
              key,
              col: c,
              className: baseClass,
            });
            continue;
          }

          const isCurrentRow =
            this.towersGame?.state !== "completed" &&
            this.towersGame?.revealed?.length === r;
          let baseClass = "cell";

          let rowData =
            this.towersGame?.deck?.[r] || this.towersGame?.revealed?.[r]?.row;

          if (
            (isCurrentRow && this.mode === "manual") ||
            (this.autoActive && this.towersSelected[r] === c)
          ) {
            if (
              rowData &&
              rowData[c] === "lose" &&
              !foundDead &&
              this.autoActive
            ) {
              baseClass += " dead";
              foundDead = true;
            } else {
              baseClass += " picked";
            }
          }

          const key = `cell ${r} ${c}`;

          let clicked =
            r < this.towersGame?.revealed?.length &&
            this.towersGame?.revealed[r].tile == c;

          if (clicked) {
            baseClass += " clicked";
          }

          if (
            (!clicked && this.towersGame?.state === "created") ||
            !rowData ||
            (this.towersGame?.state !== "completed" &&
              this.towersGame?.revealed?.length <= r)
          ) {
            output.unshift({ key, col: c, className: baseClass });
          } else if (rowData[c] === "lose") {
            if (clicked) {
              output.unshift({
                key,
                col: c,
                className: [baseClass, "mine"].join(" "),
                image: "/img/tower/mine.png",
                alt: "mine",
              });
            } else {
              output.unshift({ key, col: c, className: baseClass });
            }
          } else {
            let classes = [baseClass];
            if (clicked) {
              classes.push("coin");
            }
            output.unshift({
              key,
              col: c,
              className: classes.join(" "),
              image: "/img/tower/coin.png",
              alt: "coin",
            });
          }
        }
      }

      return output;
    },
  },
  beforeRouteLeave(to, from, next) {
    this.autoInfinite = false;
    this.autoActive = false;
    this.socketDisconnectTowers();
    next();
  },
  created() {
    this.socketConnectTowers();
  },
};
</script>

<style scoped lang="scss">
.tower {
  ::v-deep .dropdown-container {
    button {
      border: none;
    }

    margin-top: 10px;
  }

  .profit {
    margin-left: auto;
    margin-bottom: 5px;
    width: 100%;
    height: 42px;
    margin-top: 5px;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 15px;
    background: #22224a;
    border: 2px solid #161533;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
    border-radius: 5px;

    img {
      margin-left: auto;
      margin-right: 8px;
    }

    input {
      max-width: 100px;
    }
  }

  max-width: 1100px;
  width: 100%;
  padding: 30px 0 0 0;
  margin-inline: auto;
  .footer {
    max-width: 1100px;
    margin-inline: auto;
  }

  .mode {
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    width: 100%;
    gap: 5px;

    button {
      &.active {
        background: var(--purple);
      }
      padding: 5px 0;
      max-width: 50%;
      width: 100%;
      border-radius: 4px;
      background: #22224a;
      border: 2px solid #161533;
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
      img {
        margin-top: 5px;
      }
    }
  }
}

.tower .tower-container {
  width: 100%;
  gap: 10px;
  display: flex;
  justify-content: center;
  @media screen and (max-width: 991px) {
    padding-inline: 10px;
  }
}

.tower .actions-controls {
  flex-shrink: 0;
  width: 300px;
  height: 570px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media screen and (max-width: 991px) {
    justify-content: unset;
    width: 100%;
    height: unset;
    display: grid;
  }
}

.tower {
  .controls-main {
    background: var(--dark-blue);
    border: 4px solid #090c1d;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 20px;
    flex-grow: 1;
    @media screen and (max-width: 991px) {
      padding: 10px;
      display: grid;
      width: 100%;
      grid-template-columns: 1fr;
    }
  }

  .controls-mode {
    background: var(--dark-blue);
    border: 4px solid #090c1d;
    border-radius: 10px;
    padding: 10px;

    width: 100%;
    display: flex;
    margin-bottom: 15px;
    @media screen and (max-width: 991px) {
      grid-row-start: 10;
      margin-bottom: 0;
      margin-top: 20px;
    }
    button.button-mode {
      width: 100%;
      height: 39px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      background: #22224a;

      &:first-of-type {
        margin-right: 0;
        border-radius: 5px 0px 0px 5px;
      }

      &:last-of-type {
        margin-right: 0;
        border-radius: 0 5px 5px 0;
      }

      &.button-selected {
        background: var(--purple);
      }
    }
  }
}

.tower .input-content img {
  width: 17px;
  position: absolute;
  top: 50%;
  left: 18px;
  transform: translate(0, -50%);
}

.tower .input-content input {
  width: 100%;
  height: 58px;
  padding: 0 160px 0 48px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  background-color: transparent;
}

.tower .input-content input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tower .content-buttons {
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  top: 0;
  right: 0;
}

.tower .content-buttons button.button-amount {
  margin: 0 15px;
  padding: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #626c7e;
  background-color: transparent;
  transition: all 0.3s ease;
  cursor: not-allowed;
}

.tower .content-buttons button.button-amount.button-active {
  cursor: pointer;
}

.tower .content-buttons button.button-amount.button-active:hover {
  color: #ffffff;
}

.tower .controls-rows {
  width: 100%;
  margin-top: 24px;
}

.tower .rows-content {
  width: 100%;
  margin-top: 12px;
}

.tower .controls-risk {
  width: 100%;
  display: flex;
  margin-top: 18px;
}

.tower .controls-risk button.button-risk {
  width: calc(33.33% - 10px);
  height: 39px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #22224a;
  box-shadow: 0px 2px 0px 0px #1d222a;
  cursor: not-allowed;

  &.button-selected {
    background-color: var(--purple);
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.25);
  }
}

.tower .controls-risk button.button-risk.button-active {
  cursor: pointer;
}

.tower .controls-risk button:last-of-type {
  margin-right: 0;
}

.tower .controls-count {
  margin-top: 10px;
  width: 100%;
}

.tower .count-title {
  width: 100%;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 700;
  color: #596076;
}

.tower .count-content {
  width: 100%;
  display: flex;
  margin-top: 12px;
  height: 42px;
  align-items: center;
  border: 2px solid #22224a;
  border-radius: 5px;
  padding-right: 10px;
}

.tower .count-content input {
  width: 90%;
  padding: 0 17px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  -moz-appearance: textfield;
}

.tower .count-content input::-webkit-outer-spin-button,
.tower .count-content input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.tower .actions-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.tower .actions-info a.link-fair,
.tower .actions-info button.button-sound {
  width: calc(50% - 8px);
  height: 41px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 700;

  background-color: #22224a;
  border-bottom: 2px solid #1d222a;
  transition: all 0.3s ease;
}

.tower .actions-info a.link-fair:hover,
.tower .actions-info button.button-sound:hover {
  color: #ffffff;
}

.tower .actions-info a.link-fair svg,
.tower .actions-info button.button-sound svg {
  width: 16px;
  margin-right: 8px;
  fill: #767c8b;
  transition: fill 0.3s ease;
}

.tower .actions-info a.link-fair:hover svg,
.tower .actions-info button.button-sound:hover svg {
  fill: #fff;
}

@media only screen and (max-width: 1330px) {
  .tower {
    width: 100%;
    padding: 10px 0;
  }
}

@media only screen and (max-width: 991px) {
  .tower .tower-container {
    flex-direction: column-reverse;
  }

  .tower .container-actions {
    width: 100%;
    height: auto;
    margin-top: 0;
  }
}

.controls-bet {
  margin-top: 15px;
  width: 100%;
  padding: 8px 4px 4px 4px;
  border-radius: 8px;
  background: #090c1d;
  @media screen and (max-width: 991px) {
    margin-top: 0;
    margin-bottom: 10px;
    grid-row-start: 1;
  }
}

.controls-amount {
  margin-left: auto;
  width: 100%;
  height: 42px;
  margin-top: 5px;
  margin-bottom: 10px;
  border-radius: 5px;
  overflow: hidden;
  border: 2px solid #22224a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 15px;

  img {
    margin-left: auto;
    margin-right: 8px;
  }

  input {
    max-width: 100px;
  }

  .cashout-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-inline: 13px;
    height: 100%;
    background: #22224a;

    button div {
      font-weight: 900;
      font-size: 1.143rem;
      color: #eeeeee;
    }
  }
}

.controls-amount-title {
  font-family: "Excon";
  font-style: normal;
  font-weight: 500;
  font-size: 1rem;
  line-height: 20px;
  color: #eeeeee;
}

.game-container {
  position: relative;
  max-height: 570px;
  overflow: hidden;
  width: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  background-image: url("/img/tower/bg.png");

  @media only screen and (min-width: 600px) and (max-width: 991px) {
    background-repeat: round;
  }

  @media only screen and (max-width: 600px) {
    background-position: right;
  }

  border: 4px solid #090c1d;
  border-radius: 10px;
}

.result_box {
  border-radius: 12px;
  background: #0f2624;
  border: 2px solid #00c74d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  z-index: 99;
  position: absolute;
  font-size: 40px;
  place-content: center;

  padding: 40px 20px;

  &.lost {
    border: 4px solid var(--red);
  }

  span {
    width: 100%;

    color: #488e70;

    &.lost {
      color: var(--red);
    }

    &:nth-of-type(1) {
      padding-inline: 60px;
      font-weight: 900;
      font-size: 20px;
    }
    &:nth-of-type(3) {
      padding-inline: 60px;
      font-weight: 500;
      font-size: 18px;
    }
  }

  margin-bottom: 100px;

  .line {
    margin: 15px 0;
    border: 2px solid #373c52;
    width: 100%;
  }
}

div.row {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
}

.grid {
  margin-left: 15px;
  margin-right: 15px;
  position: relative;
  //z-index: 10;
  display: grid;
  max-width: 430px;
  width: 100%;
  background: url("/img/tower/tower.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-size: 100% 100%;
  padding: 55px 15px 25px 15px;
  &.two {
    grid-template-columns: repeat(2, 1fr);
  }
  &.three {
    grid-template-columns: repeat(3, 1fr);
  }
  &.four {
    grid-template-columns: repeat(4, 1fr);
  }
  gap: 6px;
  height: fit-content;
  border-radius: 4px;
}

.cell {
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Field */

  width: 100%;
  height: 36px;

  background: #2f333a;
  /* Modal shadow */
  border-radius: 4px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;

  &:hover {
    transition: transform 500ms;
    transform: translateY(-3px);
  }

  svg,
  img {
    max-height: 50px;
  }

  &:not(.clicked) img {
    opacity: 0.5;
  }

  @media only screen and (max-width: 991px) {
    height: 35px;
    svg,
    img {
      max-height: 25px;
    }
  }
}

.mine {
  pointer-events: none;
  background: rgba(174, 36, 69, 0.4);
  border: 2.1px solid #ae2445;
}

.coin {
  pointer-events: none;

  background: rgba(49, 157, 41, 0.4);
  border: 2.1px solid #319d29;
}

.dead {
  background: #6e0202;
}

.picked {
  background: #5b46bc;
}

.game-container .game-result {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  //z-index: 1000;
}

.game-container .game-result .slide-fade-enter-active {
  transition: all 0.3s;
}

.game-container .game-result .slide-fade-enter {
  transform: translateY(20px);
  opacity: 0;
}

.game-container .result-inner {
  width: 230px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background: #0f2624;
  border: 2px solid #00c74d;
}

.game-container .inner-multiplier {
  font-size: 28px;
  font-weight: 700;
  color: #00c74d;
}

.game-container .inner-won {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 0.857rem;
  font-weight: 700;
  color: #fff;
}

.game-container .inner-won img {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}

.game-container .won-value {
  margin-left: 8px;
  font-size: 0.857rem;
  font-weight: 700;
  color: #00c74d;
}

.game-container .game-inner {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
