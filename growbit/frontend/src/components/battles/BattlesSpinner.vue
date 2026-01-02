<template>
<!--   <div class="spinner-header">
    <div class="inner-info">
      <div
        class="info-user"
        :class="[
          'user-' + (firstBet.bot ? 'bot' : battlesGetRank(firstBet.user)),
          'user-' + battlesGetLevelColor(firstBet.user)
        ]"
      >
        <div class="user-avatar">
          <AvatarImage :image="firstBet.bot ? null : firstBet.user.avatar"/>
        </div>
        <span v-html="firstBet.bot ? battlesGetBotName : firstBet.user.username"></span>
      </div>
      <div class="info-amount">
        <div class="amount-value">
          <span>
            {{ getDisplayCurrencyAmountFormatted(firstOutcomeAmount) }}
          </span>
          <Currency/>
        </div>
      </div>
    </div>
  </div> -->
  <div ref="battles-spinner" class="battles-spinner">
    <div class="spinner-row" v-for="(bet, index) in battlesGetBets">
      <div class="row-content">
        <div class="spinner-header" >
          <div v-if="bet !== null"  class="inner-info">
            <div
             class="info-user"
              :class="[
                'user-'+(bet.bot?'bot':battlesGetRank(bet.user)),
               'user-'+battlesGetLevelColor(bet.user)
             ]"
            >
              <div class="user-avatar">
                <div class="avatar-wrapper">
                  <AvatarImage :image="bet.bot ? 0 : extractNumberFromPng(bet.user.avatar)" />
                </div>
                  <span v-html=" bet.bot ? battlesGetBotName : bet.user.username "></span>

              </div>
            </div>
            <div class="info-amount">
              <div class="amount-value">
                <span>{{ getDisplayCurrencyAmountFormatted(getOutcomeAmount(bet)) }}</span>
                <Currency/>
              </div>
            </div>
          </div>
          <div v-else class="inner-info">
            <div
             class="info-user "
            >
<!--               <div class="user-avatar">
                <div class="avatar-wrapper">
                  <AvatarImage :image="bet.bot ? 0 : extractNumberFromPng(bet.user.avatar)" />
                </div>
                  <span v-html=" bet.bot ? battlesGetBotName : bet.user.username "></span>

              </div> -->

              <span>WAITING</span>
            </div>
            <div class="info-amount">
              <div class="amount-value">
                <span>{{ getDisplayCurrencyAmountFormatted(0) }}</span>
                <Currency/>
              </div>
            </div>
          </div>
        </div>
        <div class="spinner-inner">
        <div v-if="battlesGameData.game.state === 'pending'" class="inner-waiting">
          <div class="waiting-info">
            <div class="info-inner">
              <div class="inner-box"></div>
              Awaiting EOS Block
            </div>
          </div>
        </div>

        <div class="inner-element">
          <transition name="fade" mode="out-in">
            <div
              v-if="
                ['created', 'countdown'].includes(battlesGameData.game.state) ===
                  true && bet === null
              "
              class="element-waiting"
            >
              <svg
                width="25"
                height="27"
                viewBox="0 0 25 27"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.2869 6.62293C14.9566 6.62293 16.3102 5.26943 16.3102 3.5998C16.3102 1.93016 14.9566 0.57666 13.2869 0.57666C11.6172 0.57666 10.2637 1.93016 10.2637 3.5998C10.2637 5.26943 11.6172 6.62293 13.2869 6.62293Z"
                />
                <path
                  d="M13.2864 26.4238C14.2881 26.4238 15.1002 25.6117 15.1002 24.6101C15.1002 23.6084 14.2881 22.7964 13.2864 22.7964C12.2847 22.7964 11.4727 23.6084 11.4727 24.6101C11.4727 25.6117 12.2847 26.4238 13.2864 26.4238Z"
                />
                <path
                  d="M5.85686 9.39614C7.3597 9.39614 8.57799 8.1779 8.57799 6.67512C8.57799 5.17234 7.3597 3.9541 5.85686 3.9541C4.35403 3.9541 3.13574 5.17234 3.13574 6.67512C3.13574 8.1779 4.35403 9.39614 5.85686 9.39614Z"
                />
                <path
                  d="M20.7148 23.0434C21.5496 23.0434 22.2264 22.3666 22.2264 21.5318C22.2264 20.697 21.5496 20.0203 20.7148 20.0203C19.8799 20.0203 19.2031 20.697 19.2031 21.5318C19.2031 22.3666 19.8799 23.0434 20.7148 23.0434Z"
                />
                <path
                  d="M2.78032 16.5219C4.11575 16.5219 5.19833 15.4393 5.19833 14.104C5.19833 12.7686 4.11575 11.686 2.78032 11.686C1.44489 11.686 0.362305 12.7686 0.362305 14.104C0.362305 15.4393 1.44489 16.5219 2.78032 16.5219Z"
                />
                <path
                  d="M23.7915 15.3134C24.459 15.3134 25 14.7724 25 14.105C25 13.4375 24.459 12.8965 23.7915 12.8965C23.1241 12.8965 22.583 13.4375 22.583 14.105C22.583 14.7724 23.1241 15.3134 23.7915 15.3134Z"
                />
                <path
                  d="M4.36239 20.0367C3.53545 20.8636 3.53545 22.2015 4.36239 23.0284C5.18834 23.8553 6.5283 23.8553 7.35425 23.0284C8.18118 22.2015 8.18118 20.8636 7.35425 20.0367C6.5283 19.2088 5.18932 19.201 4.36239 20.0367Z"
                />
                <path
                  d="M20.714 7.58346C21.2146 7.58346 21.6204 7.17767 21.6204 6.6771C21.6204 6.17654 21.2146 5.77075 20.714 5.77075C20.2134 5.77075 19.8076 6.17654 19.8076 6.6771C19.8076 7.17767 20.2134 7.58346 20.714 7.58346Z"
                />
              </svg>
              <div class="waiting-text">
                <div class="text-box"></div>
                WAITING FOR PLAYER
              </div>
              <button
                v-on:click="
                  authUser.user !== null &&
                  authUser.user._id === battlesGameData.game.bets[0].user._id
                    ? battlesBotButton()
                    : battlesJoinButton()
                "
                class="button-join"
                v-bind:disabled="socketSendLoading !== null"
              >
                <div class="button-inner">
                  <transition name="fade" mode="out-in">
                    <ButtonLoading
                      v-if="
                        socketSendLoading === 'BattlesJoin' ||
                        socketSendLoading === 'BattlesCall'
                      "
                    />
                    <div v-else class="inner-content">
                      <div
                        v-if="
                          authUser.user !== null &&
                          authUser.user._id ===
                            battlesGameData.game.bets[0].user._id
                        "
                        class="content-bot"
                      ></div>
                      <svg
                        v-else
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47861 8.33238L6.15342 11.0087L5.08395 12.0789L6.15493 13.1499L5.08471 14.2201L3.21144 12.3469L1.07023 14.4881L0 13.4178L2.14121 11.2759L0.267935 9.40336L1.33816 8.33313L2.40839 9.4026L3.47861 8.33238ZM0.413256 0.456299L3.09715 0.458569L12.0412 9.40336L13.1122 8.33313L14.1824 9.40336L12.3099 11.2766L14.4503 13.4178L13.3801 14.4881L11.2389 12.3469L9.36561 14.2201L8.29539 13.1499L9.36561 12.0789L0.415526 3.12884L0.413256 0.456299ZM11.3554 0.456299L14.0371 0.458569L14.0386 3.12505L10.971 6.19192L8.29463 3.51636L11.3554 0.456299Z"
                        />
                      </svg>

                      {{
                        authUser.user !== null &&
                        authUser.user._id === battlesGameData.game.bets[0].user._id
                          ? "CALL BOT"
                          : "JOIN BATTLE"
                      }}
                    </div>
                  </transition>
                </div>
              </button>

            </div>
            <div
              v-else-if="
                ['created', 'countdown'].includes(battlesGameData.game.state) ===
                  true && bet !== null
              "
              class="element-ready"
            >
              <div class="ready-text">
                <div class="text-box"></div>
                <span>READY TO START</span>
              </div>
            </div>
            <div
              v-else-if="
                ['pending', 'rolling'].includes(battlesGameData.game.state) ===
                true
              "
              class="element-wheel"
            >
                <div class="arrow-left"></div>
               <div  class="arrow-right"></div>
              <BattlesReel
                v-bind:ref="'reel-' + (index + 1)"
                v-bind:style="battlesReelStyle"
                v-bind:reel="battlesReels[index + 1]"
                v-bind:pos="battlesReelsPos"
                v-bind:running="battlesRunning"
              />
            </div>
            <div
              v-else-if="
                ['completed'].includes(battlesGameData.game.state) === true
              "
              class="element-completed"
              v-bind:class="{ 'completed-winner': bet.payout > 0 }"
            >
              <svg
                width="24"
                height="23"
                viewBox="0 0 24 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.68826 12.879L10.0621 17.2554L8.31332 19.0054L10.0646 20.7567L8.31456 22.5067L5.25137 19.4435L1.75004 22.9449L0 21.1948L3.50132 17.6923L0.43813 14.6303L2.18817 12.8803L3.93822 14.6291L5.68826 12.879ZM0.675759 0L5.06448 0.00371299L19.6898 14.6303L21.4411 12.8803L23.1912 14.6303L20.1292 17.6935L23.6293 21.1948L21.8793 22.9449L18.3779 19.4435L15.3147 22.5067L13.5647 20.7567L15.3147 19.0054L0.679472 4.37016L0.675759 0ZM18.5685 0L22.9535 0.00371299L22.956 4.36397L17.9398 9.37894L13.5635 5.00384L18.5685 0Z"
                />
              </svg>
              <div class="completed-text">
                {{ bet.payout > 0 ? "WINNER" : "LOST" }}
              </div>
              <div class="completed-amount">
                <div class="amount-value">
                  <span>{{ getDisplayCurrencyAmountFormatted(bet.payout) }}</span
                  ></Currency></Currency>
                </div>
              </div>
              <div class="completed-action">
                <button
                  v-if="
                    index === 0 &&
                    authUser.user !== null &&
                    authUser.user._id === bet.user._id
                  "
                  v-on:click="battlesCreateButton()"
                  class="button-recreate"
                  v-bind:disabled="socketSendLoading !== null"
                >
                  <div class="button-inner">
                    <transition name="fade" mode="out-in">
                      <ButtonLoading
                        v-if="socketSendLoading === 'BattlesCreate'"
                      />
                      <div v-else class="inner-content">
                        <svg
                          width="15"
                          height="14"
                          viewBox="0 0 15 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.47861 7.85824L6.15342 10.5285L5.08395 11.5963L6.15493 12.6649L5.08471 13.7327L3.21144 11.8636L1.07023 14L0 12.9322L2.14121 10.7951L0.267935 8.9268L1.33816 7.859L2.40839 8.92605L3.47861 7.85824ZM0.413256 0L3.09715 0.00226551L12.0412 8.9268L13.1122 7.859L14.1824 8.9268L12.3099 10.7958L14.4503 12.9322L13.3801 14L11.2389 11.8636L9.36561 13.7327L8.29539 12.6649L9.36561 11.5963L0.415526 2.66649L0.413256 0ZM11.3554 0L14.0371 0.00226551L14.0386 2.66271L10.971 5.72264L8.29463 3.05313L11.3554 0Z"
                          />
                        </svg>
                        RE-CREATE BATTLE
                      </div>
                    </transition>
                  </div>
                </button>
              </div>
            </div>
          </transition>


        </div>
    </div>
  </div>
    </div>

  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ButtonLoading from "@/components/ButtonLoading";
import BattlesReel from "@/components/battles/BattlesReel";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import Currency from "@/components/Currency.vue";
import AvatarImage from "@/components/AvatarImage";

export default {
  name: "BattlesSpinner",
  mixins: [currencyExchangeRatesMixin],
  components: {
    ButtonLoading,
    BattlesReel,
    Currency,
    AvatarImage
  },
  data() {
    return {
      battlesRunning: false,
      battlesReelsPosRepeater: null,
      battlesReelsPos: 20,
      battlesReels: {
        1: [],
        2: [],
        3: [],
        4: [],
      },
      battlesReelStyle: {
        transform: "translateX(0px) translateY(-2416.5px)",
        transition: "none",
      },
    };
  },
  methods: {
    ...mapActions([
        "battlesSendCreateSocket",
        "battlesSendBotSocket",
        "battlesSendJoinSocket",
        ]),
    extractNumberFromPng(path) {
      const match = path.match(/(\d+)(?=\.png$)/);
      return match ? match[1] : null;
    },
    battlesFormatValue(value) {
      return parseFloat(Math.floor(value / 10) / 100)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    battlesGetRank(user) {
      let rank = user.rakeback;

      if (user.rank !== "user") {
        rank = user.rank;
      }

      return rank;
    },
        battlesGetLevelColor(user) {
      let color = "";

      if (user.level >= 2 && user.level < 26) {
        color = "blue";
      } else if (user.level >= 26 && user.level < 51) {
        color = "green";
      } else if (user.level >= 51 && user.level < 76) {
        color = "orange";
      } else if (user.level >= 76 && user.level < 100) {
        color = "red";
      } else if (user.level >= 100) {
        color = "purple";
      }

      return color;
    },
        battlesBotButton() {
      const data = { gameId: this.battlesGameData.game._id };
      this.battlesSendBotSocket(data);
    },
    battlesJoinButton() {
      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        return;
      }

      const data = { gameId: this.battlesGameData.game._id, slot: this.pos };
      this.battlesSendJoinSocket(data);
    },
    battlesGetItemsFormated(items) {
      // let pos = 0;

      // for (let item of items) {
      //   pos = pos + item.tickets;

      //   if (pos < 1000 - 1) {
      //     item.color = "yellow";
      //   } else if (pos < 5000 - 1) {
      //     item.color = "red";
      //   } else if (pos < 20000 - 1) {
      //     item.color = "green";
      //   } else if (pos < 50000 - 1) {
      //     item.color = "purple";
      //   } else {
      //     item.color = "blue";
      //   }
      // }

      return items;
    },
    battlesGetBoxItems(box) {
      // let items = [];

      // for (let item of this.battlesGetItemsFormated(box.items)) {
      //   const count = Math.floor(item.tickets / 1000);
      //   for (let i = 0; i < (count <= 0 ? 1 : count); i++) {
      //     items.push(item);
      //   }
      // }

      // return items;
      let items = [];

      for (let item of this.battlesGetItemsFormated(
        box.items
      )) {
        const count = Math.floor(item.frequency * 100);
        for (let i = 0; i < (count <= 0 ? 1 : count); i++) {
          items.push(item);
        }
      }

      return items;
    },
    battlesGetOutcomeItem(outcome, items) {
      // let outcomeItem = null;
      // let pos = 0;

      // for (const item of this.battlesGetItemsFormated(items)) {
      //   pos = pos + item.tickets;
      //   if (outcome <= pos) {
      //     outcomeItem = item;
      //     break;
      //   }
      // }

      // return outcomeItem;
      let pos = 0;
      let outcomeItem = null;

      for (const item of this.battlesGetItemsFormated(
        items
      )) {
        pos = pos + item.frequency * 100000;
        if (outcome <= pos) {
          outcomeItem = item;
          break;
        }
      }

      return outcomeItem;
    },
    battlesAddReels() {
      let items = this.battlesGetBoxItems(
        this.battlesGetBoxes[
          this.battlesGameData.game.bets[0].outcomes.length - 1
        ]
      );
      console.log("Items: ");
      console.log(items);
      this.battlesReels = { 1: [], 2: [], 3: [], 4: [] };

      for (const reel of Object.keys(this.battlesReels)) {
        for (let i = 0; i < 80; i++) {
          this.battlesReels[reel].push(
            items[Math.floor(Math.random() * items.length)]
          );
        }
      }
    },
    battlesGetReelsPos() {
      const offset =
        this.$refs["reel-1"][0].$el.getBoundingClientRect().top +
        this.$refs["reel-1"][0].$el.getBoundingClientRect().height / 2 -
        this.$refs["battles-spinner"].getBoundingClientRect().height / 2 -
        this.$refs["battles-spinner"].getBoundingClientRect().top;
      const pos = Math.round(Math.abs(offset + 2416.5) / 125) + 20;

      if (this.battlesReelsPos !== pos) {
        this.battlesReelsPos = pos;

        if (this.battlesRunning === true && this.soundBattles === 1) {
          this.soundTick.volume = this.soundVolume;
          this.soundTick.currentTime = 0;
          this.soundTick.play();
        }
      }

      this.battlesReelsPosRepeater = requestAnimationFrame(
        this.battlesGetReelsPos
      );
    },
    battlesCreateButton() {
      const boxes = this.battlesGameData.game.boxes.map((element) => ({
        _id: element.box._id,
        count: element.count,
      }));

      const data = {
        boxes: boxes,
        playerCount: this.battlesGameData.game.playerCount,
        mode: this.battlesGameData.game.mode,
        levelMin: this.battlesGameData.game.options.levelMin,
        funding: this.battlesGameData.game.options.funding,
        private: this.battlesGameData.game.options.private,
        affiliateOnly: this.battlesGameData.game.options.affiliateOnly,
        cursed: this.battlesGameData.game.options.cursed,
        terminal: this.battlesGameData.game.options.terminal,
      };
      this.battlesSendCreateSocket(data);
    },
    getOutcomeAmount(bet) {
      if (!bet || !bet.outcomes) return 0;
     
      return bet.outcomes
        .map((o,i) => this.battlesGetOutcomeItem(o, this.battlesGetBoxes[i].items))
        .reduce((sum, itm) => sum + (itm?.itemPrice||0), 0);
    }
  },
  computed: {
    ...mapGetters([
      "soundVolume",
      "soundBattles",
      "soundTick",
      "soundUnbox",
      "soundCash",
      "generalTimeDiff",
      "socketSendLoading",
      "authUser",
      "battlesGameData",
    ]),
        battlesGetBotName() {
      let name = "Redcliff";

      if (this.pos === 2) {
        name = "Redcliff Jr.";
      } else if (this.pos === 3) {
        name = " Redcliff Sr.";
      }

      return name;
    },
    battlesGetBets() {
      let bets = [];

      for (let bet = 0; bet < this.battlesGameData.game.playerCount; bet++) {
        const index = this.battlesGameData.game.bets.findIndex(
          (element) => element.slot === bet
        );

        bets.push(index !== -1 ? this.battlesGameData.game.bets[index] : null);
      }

      console.log("bets"); 
      console.log(bets);
      return bets;
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
    firstBet() {
      return this.battlesGetBets[0] || {};
    },
    // firstOutcomeAmount() {
    //   if (!this.firstBet || !this.firstBet.outcomes) return 0;
     
    //   return this.firstBet.outcomes
    //     .map((o,i) => this.battlesGetOutcomeItem(o, this.battlesGetBoxes[i].items))
    //     .reduce((sum, itm) => sum + (itm?.itemPrice||0), 0);
    // }
  },
  watch: {
    battlesGameData: {
      deep: true,
      handler(data, dataOld) {
        if (this.battlesGameData.game.state === "rolling") {
          this.battlesAddReels();
          this.battlesGetReelsPos();
          this.battlesRunning = true;

          for (const [index, bet] of this.battlesGameData.game.bets.entries()) {
            this.battlesReelStyle = {
              transform: "translateX(0px) translateY(-2416.5px)",
              transition: "none",
            };

            this.battlesReels[index + 1][60] = this.battlesGetOutcomeItem(
              bet.outcomes[bet.outcomes.length - 1],
              this.battlesGetBoxes[bet.outcomes.length - 1].items
            );

            setTimeout(() => {
              const timeEnding =
                new Date(this.battlesGameData.game.updatedAt).getTime() + 5000;
              let timeLeft =
                timeEnding - (new Date().getTime() + this.generalTimeDiff);
              timeLeft = timeLeft > 0 ? timeLeft : 0;

              this.battlesReelStyle = {
                transform:
                  "translateX(0px) translateY(-" +
                  (7364 +
                    (105 / 8) * Math.floor(Math.random() * (7 - 1 + 1)) +
                    1) +
                  "px)",
                transition:
                  "transform " +
                  timeLeft / 1000 +
                  "s cubic-bezier(0.1, 0, 0.2, 1)",
              };

              setTimeout(() => {
                this.battlesReelStyle = {
                  transform: "translateX(0px) translateY(-7416.5px)",
                  transition: "transform 0.25s cubic-bezier(0.1, 0, 0.2, 1)",
                };

                cancelAnimationFrame(this.battlesReelsPosRepeater);
                setTimeout(() => {
                  this.battlesRunning = false;

                  if (this.soundBattles === 1) {
                    this.soundUnbox.volume = this.soundVolume;
                    this.soundUnbox.currentTime = 0;
                    this.soundUnbox.play();
                  }
                }, 250);
              }, timeLeft + 100);
            }, 250);
          }
        } else if (this.battlesGameData.game.state === "completed") {
          if (this.soundBattles === 1) {
            this.soundCash.volume = this.soundVolume;
            this.soundCash.currentTime = 0;
            this.soundCash.play();
          }
        }
      },
    },
  },
};
</script>

<style scoped>
.battles-spinner {
  width: 100%;
  height: 346px;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 1px;
  z-index: 1;
  

}

/*.battles-spinner::before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: #0b2840;
  clip-path: polygon(
    24px 0,
    calc(100% - 24px) 0,
    100% 24px,
    100% calc(50% - 8px),
    calc(100% - 8px) 50%,
    100% calc(50% + 8px),
    100% calc(100% - 24px),
    calc(100% - 24px) 100%,
    24px 100%,
    0 calc(100% - 24px),
    0 calc(50% + 8px),
    8px 50%,
    0 calc(50% - 8px),
    0 24px
  );
  z-index: -1;
}

.battles-spinner::after {
  content: "";
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  position: absolute;
  top: 1px;
  left: 1px;
  background: #041f36;

  z-index: -1;
}*/

.battles-spinner .spinner-inner {
  width: 100%;
  height: 88%;
/*  position: relative;*/
  display: flex;
  flex-direction: row;
  background: rgba(2, 21, 36, 0.33);
/*  border: 3px solid black;*/
  z-index: 1;
/*  justify-content: space-between;*/
  align-items: center;
}

.battles-spinner .spinner-inner:before {
  content: "";
  width: 50%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 8px,
    rgba(2, 21, 36, 0.08) 8px,
    rgba(2, 21, 36, 0.08) 14px
  );
  z-index: -1;
}

.battles-spinner .spinner-inner:after {
  content: "";
  width: 50%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 8px,
    rgba(2, 21, 36, 0.08) 8px,
    rgba(2, 21, 36, 0.08) 14px
  );
  z-index: -1;
}

.battles-spinner .inner-waiting {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  background: rgba(2, 21, 36, 0.6);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.battles-spinner .waiting-info {
  width: 330px;
  height: 110px;
  position: relative;
  padding: 1px;
}

.battles-spinner .waiting-info:before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(180deg, rgba(0, 255, 194, 0) 0%, #00ffc2 100%);
  clip-path: polygon(
    10px 0,
    calc(100% - 10px) 0,
    100% 10px,
    100% calc(50% - 6px),
    calc(100% - 5px) 50%,
    100% calc(50% + 6px),
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    10px 100%,
    0 calc(100% - 10px),
    0 calc(50% + 6px),
    5px 50%,
    0 calc(50% - 6px),
    0 10px
  );
}

.battles-spinner .info-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  background: radial-gradient(
      60% 60% at 50% 50%,
      rgba(10, 238, 179, 0.2) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    #021524;
  clip-path: polygon(
    10px 0,
    calc(100% - 10px) 0,
    100% 10px,
    100% calc(50% - 6px),
    calc(100% - 5px) 50%,
    100% calc(50% + 6px),
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    10px 100%,
    0 calc(100% - 10px),
    0 calc(50% + 6px),
    5px 50%,
    0 calc(50% - 6px),
    0 10px
  );
}

.battles-spinner .inner-box {
  width: 14px;
  height: 14px;
  margin-bottom: 10px;
  transform: rotate(45deg);
  background: linear-gradient(256deg, #00ffc2 0%, #00aa6d 100%);
  border: 1px solid #00ffc2;
}

.battles-spinner .inner-element {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  border: 3px solid;
  border-color: black;
/*  padding-bottom: 10px;*/
}

.battles-game.game-3 .battles-spinner .inner-element {
  width: 33.33%;
}

.battles-game.game-4 .battles-spinner .inner-element {
  width: 25%;
}

.battles-game .element-waiting,
.battles-game .element-ready,
.battles-game .element-completed {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.battles-game .element-completed {
  justify-content: flex-end;
  padding-bottom: 84px;
}

.battles-game .element-completed.completed-winner {
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(1, 241, 180, 0.2) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}

.battles-game .element-completed:after {
  content: "";
  width: 160px;
  height: 3px;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 0);
  background: linear-gradient(263deg, #f55046 45%, #9a322c 100%);
/*  clip-path: polygon(3px 0, calc(100% - 3px) 0, 100% 100%, 0 100%);*/
}

.battles-game .element-completed.completed-winner:after {
  background: linear-gradient(256deg, #00ffc2 0%, #00aa6d 100%);
}

.battles-game .element-waiting svg {
  fill: #6e95b6;
  animation: bet_loading_animation 1.5s infinite linear both;
}

.battles-game .element-ready svg {
  width: 23px;
  height: 23px;
}

.battles-game .waiting-text,
.battles-game .ready-text {
  display: flex;
  align-items: center;
  margin-top: 9px;
  font-size: 14px;
  font-weight: 800;
  color: #6e95b6;
}

.battles-game .ready-text span {
  background: linear-gradient(255deg, #00ffc2 0%, #00aa6d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.battles-game .text-box {
  width: 10px;
  height: 10px;
  margin-right: 9px;
  transform: rotate(45deg);
}

.battles-game .waiting-text .text-box {
  background: radial-gradient(
    140% 140% at 50% 50%,
    #062944 0%,
    rgba(6, 41, 68, 0) 100%
  );
  border: 1px solid #0a304f;
}

.battles-game .ready-text .text-box {
  background: radial-gradient(
    140% 140% at 50% 50%,
    #01db9e 0%,
    rgba(6, 41, 68, 0) 100%
  );
  border: 1px solid #01e0a3;
}

.battles-game .element-completed svg {
  fill: #f24034;
}

.battles-game .element-completed.completed-winner svg {
  fill: #00ffc2;
}

.battles-game .completed-text {
  margin-top: 9px;
  font-size: 14px;
  font-weight: 800;
  background: linear-gradient(224deg, #f24034 37.24%, #792c00 178.55%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.battles-game .element-completed.completed-winner .completed-text {
  background: linear-gradient(255deg, #00ffc2 0%, #00aa6d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.battles-game .completed-amount {
  margin-top: 6px;
  display: flex;
  align-items: center;
}

.battles-game .completed-amount img {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.battles-game .amount-value {
  display: flex;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #bbbfd0;
}

.battles-game .amount-value span {
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  margin-right: 5px;
}

.battles-game .completed-action {
  height: 35px;
  margin-top: 35px;
}

.battles-game button.button-recreate {
  width: 200px;
  height: 100%;
  position: relative;
  padding: 1px;
}

.battles-game button.button-recreate:before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(180deg, rgba(0, 170, 109, 0) 0%, #00ffc2 100%);
  clip-path: polygon(
    7px 0,
    calc(100% - 7px) 0,
    100% 25%,
    100% 75%,
    calc(100% - 7px) 100%,
    7px 100%,
    0 75%,
    0 25%
  );
}

.battles-game button.button-recreate .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(255deg, #00ffc2 0%, #00aa6d 100%);
  clip-path: polygon(
    7px 0,
    calc(100% - 7px) 0,
    100% 25%,
    100% 75%,
    calc(100% - 7px) 100%,
    7px 100%,
    0 75%,
    0 25%
  );
}

.battles-game button.button-recreate .button-loading.fade-leave-active {
  transition: opacity 0.1s;
}

.battles-game button.button-recreate .button-loading.fade-leave-to {
  opacity: 0;
}

.battles-game button.button-recreate .inner-content.fade-enter-active {
  transition: opacity 0.1s;
}

.battles-game button.button-recreate .inner-content.fade-enter {
  opacity: 0;
}

.battles-game button.button-recreate .inner-content {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
}

.battles-game button.button-recreate .inner-content svg {
  margin-right: 8px;
  fill: #ffffff;
}

.battles-spinner .element-wheel {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.battles-spinner .element-wheel .arrow-left {
  position: absolute;
  bottom: 47%;
  right: 0px;
  width: 0;
  height: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;

  border-right: 20px solid #22224a;

  @media screen and (max-width: 991px) {
    bottom: 40%;
  }
}

.battles-spinner .element-wheel .arrow-right {
  position: absolute;
  bottom: 47%;
  left: 0px;
  width: 0;
  height: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;

  border-left: 20px solid #22224a;

  @media screen and (max-width: 991px) {
    bottom: 40%;
  }
}

.battles-spinner .element-seperator {
  width: 1px;
  height: 100%;
  position: relative;
  background: linear-gradient(
    146deg,
    rgba(4, 28, 48, 0.35) 0%,
    rgba(1, 213, 152, 0.35) 100%
  );
}

.battles-game.game-created .battles-spinner .element-seperator {
  background: linear-gradient(146deg, rgba(4, 28, 48, 0.35) 0%, #173246 100%);
}

.battles-spinner .inner-element:last-child .element-seperator {
  display: none;
}

.battles-spinner .seperator-box {
  width: 35px;
  height: 28px;
  position: absolute;
  top: 50%;
  left: -17px;
  transform: translate(0, -50%);
  padding: 1px;
}

.battles-spinner .seperator-box:before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(180deg, rgba(0, 255, 194, 0) 0%, #00ffc2 100%);
/*  clip-path: polygon(
    5px 0,
    calc(100% - 5px) 0,
    100% 25%,
    100% 75%,
    calc(100% - 5px) 100%,
    5px 100%,
    0 75%,
    0 25%
  );*/
}

.battles-game.game-created .battles-spinner .seperator-box:before {
  background: linear-gradient(180deg, rgba(0, 255, 194, 0) 0%, #4c667c 100%);
}

.battles-spinner .box-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(10, 238, 179, 0.2) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    #051f33;
  clip-path: polygon(
    5px 0,
    calc(100% - 5px) 0,
    100% 25%,
    100% 75%,
    calc(100% - 5px) 100%,
    5px 100%,
    0 75%,
    0 25%
  );
}

.battles-game.game-created .battles-spinner .box-inner {
  mix-blend-mode: luminosity;
}

.battles-spinner .box-inner svg {
  width: 16px;
  height: 16px;
}

.battles-game.game-created .battles-spinner .box-inner svg {
  mix-blend-mode: luminosity;
  opacity: 0.8;
}

@keyframes bet_loading_animation {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner-headers {
  display: flex;
  flex-direction: row;

}

.battles-spinner .spinner-header .element-top,
.battles-spinner .spinner-header .inner-actions,
.battles-spinner .spinner-header .actions-funding,
.battles-spinner .spinner-header .button-join {
  display: none !important;
}

.battles-spinner .spinner-header {
  width: 50%;

  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent; 
  z-index: 2;
}

.battles-game.game-3 .battles-spinner .spinner-header {
  width: 33.33%;
}

.battles-game.game-3 .battles-spinner .spinner-header {
  width: 25%;
}


.battles-spinner .spinner-header .inner-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.battles-spinner .spinner-header .info-user {
  font-size: 14px;
  color: #fff;
}
.battles-spinner .spinner-header .info-amount {
  font-size: 14px;
  color: #fff;
}

.battles-spinner .spinner-header {
/*  border-bottom: 1px solid rgba(255,255,255,0.1);*/
}

.spinner-row {
  display: flex;
  flex-direction: column;
  width: calc(50% - 9px);
  height: 346px;
  border: 1px solid #0a273f;
/*  justify-content: center;*/
  align-items: center;
  width: calc(50% - 9px);
  overflow: hidden;
}


.spinner-row .row-content {
  justify-content: space-between;  
  align-items: center;
  width: 100%;
  min-height: 346px;
}

.spinner-row .row-content .spinner-header { 
  justify-content: space-between;
  width: 100%;
 }


.battles-game.game-3 .spinner-row {
  width: calc(33.33% - 10px);
}

.battles-game.game-4 .spinner-row {
  width: calc(25% - 4.5px);
}

/*.avatar-image img {
  width: 22px !important;
  height: 22px !important;
}*/
.avatar-wrapper {
  &::after {
    position: absolute;
    background: linear-gradient(to bottom, #191939, #32325a);
    content: "";
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: 8px;

    z-index: -1;
    margin: -5px;
  }

  position: relative;
  background: #090c1d;

  /* Pfp */

  width: 22px;
  height: 22px;

  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 8px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;

  cursor: pointer;
  display: grid;
  place-content: center;

  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));

  > div {
    border-radius: 6px;
  }

/*  > span {
    margin-left: 80px;
  }*/
}
.user-avatar {
  display: flex;
  flex-direction: row;

  > span {
    margin-left: 10px;
  }
}
</style>
