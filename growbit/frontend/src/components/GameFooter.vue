<template>
  <div class="game-footer">
    <div v-if="game && !GAMING_PROVIDERS[game.type]" class="mobile-actions">
      <button @click="fairButton"><FairnessIcon></FairnessIcon></button>
      <button class="button-sound" @click="toggleMute()">
        <VolumeIcon v-if="!soundMuted"></VolumeIcon>
        <img :src="MutedIcon" v-else />
      </button>
    </div>
    <div class="game-description-container" v-if="game">
      <div class="head-cont">
        <div class="header">
          <h1>{{ game.name }}</h1>
          <p>{{ GAMING_PROVIDERS[game.type] || "Growbit Originals" }}</p>

          <img :src="`/img/game/icon-${game.icon}.svg`" alt="" width="50px" />
        </div>

        <div v-if="!GAMING_PROVIDERS[game.type]" class="buttons">
          <button @click="fairButton"><FairnessIcon></FairnessIcon></button>
          <button class="button-sound" @click="toggleMute()">
            <VolumeIcon v-if="!soundMuted"></VolumeIcon>
            <img :src="MutedIcon" v-else />
          </button>
        </div>
      </div>

      <div class="info_bar">
        <div v-if="game.houseEdge && isOriginal">
          <span>RTP:</span>
          <span>{{ (100 - game.houseEdge).toFixed(2) }}%</span>
        </div>
        <!--         <div>
          <span>Max Multiplier:</span>
          <span>{{ maxMultiplier }}x</span>
        </div> -->
        <div v-if="maxBet || game.maxBet">
          <span>Max Bet:</span>
          <span>
            {{
              (
                (maxBet || game.maxBet) *
                (fiatRates.data?.[selectedCurrency] || 1)
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </span>
        </div>
        <div v-if="game.maxWin">
          <span>Max Win:</span>
          <span>
            {{
              (
                game.maxWin * (fiatRates.data?.[selectedCurrency] || 1)
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </span>
        </div>
      </div>

      <p>
        {{ game.description }}
      </p>
      <!--      <p-->
      <!--          v-else-if="-->
      <!--              gameInstance.footerDisplay === 'BIG' ||-->
      <!--              gameInstance.footerDisplay === 'LUCKY'-->
      <!--            "-->
      <!--      >-->
      <!--        <top-wins-->
      <!--            :game-name="game.name"-->
      <!--            :type="gameInstance.footerDisplay"-->
      <!--        ></top-wins>-->
      <!--      </p>-->
      <!--      <p v-else-if="gameInstance.footerDisplay === 'CHALLENGES'">-->
      <!--        <challenges-footer :game-name="game.name"></challenges-footer>-->
      <!--      </p>-->
    </div>
  </div>
</template>

<script>
import VolumeIcon from "@/assets/images/volume.svg?inline";
import MutedIcon from "@/assets/images/volume_muted.png?inline";
import FairnessIcon from "@/assets/images/fairness.svg?inline";

import { mapActions, mapGetters } from "vuex";
import { GAMING_PROVIDERS } from "@/utils";

export default {
  props: ["name", "type", "maxBet"],
  components: {
    VolumeIcon,
    FairnessIcon,
  },
  data() {
    return {
      MutedIcon,
      topGames: null,
      descriptions: {
        mines:
          "A strategy-based game where players uncover safe tiles on a grid while avoiding hidden mines. Each uncovered tile increases the potential payout, encouraging risk-taking. Players can choose to cash out at any point or continue to reveal more tiles for higher rewards. However, uncovering a mine ends the game and results in losing all accumulated winnings. The thrill comes from balancing caution with daring as the grid becomes riskier to navigate.",
        slide:
          "A roulette-style game where players choose one of three colors and hope for a winning outcome. Each round involves a spinning indicator that determines the result, with odds and payouts varying by color choice. Some colors offer higher payouts but lower chances of winning, while others are safer bets with smaller rewards. Players can strategize based on their risk tolerance, making Slide a game of both luck and decision-making. The anticipation builds as the indicator slows down, keeping players on the edge of their seats.",
        crash:
          "A fast-paced multiplier game where players decide when to cash out before the multiplier crashes to zero. The multiplier starts at 1x and increases rapidly, creating the opportunity for significant gains. However, the risk lies in waiting too long, as the crash is unpredictable and results in losing all bets. Players must weigh their greed against their instincts, striking a balance between maximizing rewards and playing it safe. Each round is short but packed with adrenaline, offering a high-stakes experience.",
        slots:
          "Play NAME on GrowBit, the Fastest Growing Growtopia Casino! Dive into a massive library of 3,300+ thrilling games, featuring titles from top providers like PROVIDER. Enjoy all kinds of slot games with DLs, Bitcoin, Ethereum, and other cryptocurrencies, or try NAME for free in Fun Mode. Join the fastest-growing Growtopia gambling community and experience the thrill of endless entertainment today!",
        plinko:
          "A game of pure luck where players drop a ball into a pegged board, hoping it lands in a high-paying slot. Players can influence the starting position of the ball, adding an element of strategy to the randomness. As the ball bounces unpredictably through the pegs, the anticipation grows until it finally settles in a prize slot. The payout varies based on where the ball lands, with some slots offering significantly higher rewards. Plinko combines simplicity, suspense, and the thrill of an unexpected outcome.",
        dice: "A probability-based game where players bet on the outcome of a dice roll, making predictions about whether the result will be higher or lower than a chosen target. Players can customize their bets, adjusting the odds and potential payouts to suit their strategy. The simplicity of the game allows for quick rounds, but understanding the probabilities behind each roll can give players an edge. Dice strikes a perfect balance between luck and strategy, making it an engaging choice for risk-takers and cautious players alike.",
        coinflip:
          "A probability-based pvp game where two players bet on the outcome of a coinflip, making predictions about whether the result will be heads or tails.",
        keno: "Keno /kiːnoʊ/ is a lottery-like gambling game often played at modern casinos, and also offered as a game in some lotteries. Players wager by choosing numbers ranging from 1 through (usually) 80. After all players make their wagers, 20 numbers (some variants draw fewer numbers) are drawn at random, either with a ball machine similar to ones used for lotteries and bingo, or with a random number generator.",
        reme: "Both you and the house spin a wheel. Your number is calculated by adding the digits of your spin together. For example, if you spin a 17, your final number would be 1 + 7 = 8. If your total is a two-digit number, only the last digit is considered. Example: If your spin is 29, that's 2 + 9 = 11 → final number is 1. The house also spins and calculates its final number the same way. The player with the higher final number wins. However, if your final number ties with the house, you lose. But if your final number is 0, you win 3 times your bet.",
        cases:
          "An unboxing casino game is a gambling-style game where players open virtual boxes or cases to reveal random prizes.",
        towers:
          "Climb the tower and multiply your winnings! Tower is a high-stakes, high-reward casino game where every level brings you closer to massive prizes. Choose a safe tile on each floor to advance higher—pick wrong, and you fall. Cash out anytime or risk it all for the top! With simple mechanics and thrilling gameplay, Tower keeps you on the edge with every click. Will you make it to the top?",
      },
    };
  },
  computed: {
    GAMING_PROVIDERS() {
      return GAMING_PROVIDERS;
    },
    ...mapGetters([
      "authUser",
      "soundMuted",
      "gameList",
      "fiatRates",
      "selectedCurrency",
    ]),
    game() {
      let g = this.gameList?.filter((g) => g.id === this.name)[0];

      if (!g) {
        return {
          ...g,
          name: this.name,
          description: this.descriptions[this.name] || "",
          icon: "slots",
        };
      }

      if (g.type === "Originals") {
        return {
          ...g,
          description: this.descriptions[this.name],
          icon: this.name,
        };
      }

      return {
        ...g,
        type: g.category,
        icon: "slots",
        description: this.descriptions["slots"]
          .replaceAll("NAME", g.name)
          .replace("PROVIDER", this.GAMING_PROVIDERS[g.category]),
      };
    },
    isOriginal() {
      return this.game?.type === "Originals";
    },
  },
  created() {},
  methods: {
    ...mapActions(["modalsSetShow", "notificationShow", "toggleMute"]),
    fairButton() {
      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        return;
      }

      this.modalsSetShow("ProvabilityFair");
    },
  },
};
</script>

<style lang="scss">
.game-footer {
  width: 100%;
}
.info_bar {
  display: flex;
  margin-top: 15px;
  flex-wrap: wrap;
  width: 100%;
  align-items: center;
  gap: 10px;

  > div {
    gap: 10px;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 9px 10px;
    height: 38px;

    background: #22224a;
    border: 2px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;

    > span {
      font-style: normal;
      font-weight: 700;
      font-size: 1rem;
      line-height: 17px;

      &:first-of-type {
        color: #616498;
      }
    }
  }
}

.button-sound img {
  opacity: 0.75;
  height: 18px;
  width: 18px;
}

.mobile-actions {
  @media screen and (min-width: 991px) {
    display: none;
  }
  margin-top: 25px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px;
  height: 70px;
  margin-bottom: 20px;

  position: relative;
  background: var(--dark-blue);

  /*  &:before {
    position: absolute;
    content: "";
    height: 70px;
    top: 0;
    left: -10px;
    right: -10px;
    z-index: -1;
    background: var(--dark-blue);
  }
*/
  button {
    padding: 5px;
    display: grid;
    place-content: center;
    background: #22224a;
    border: 2px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    width: 40px;
    height: 40px;
  }
}
.game-description-container {
  margin-top: 15px;
  height: fit-content;
  left: 360px;
  top: 625px;
  background: var(--dark-blue);
  border: 4px solid #090c1d;

  @media screen and (max-width: 991px) {
    border: none;
    border-top: 4px solid #090c1d;
    border-radius: 0;
    //&:before {
    //  border-top: 4px solid #090c1d;
    //  position: absolute;
    //  content: "";
    //  height: 100%;
    //  left: -10px;
    //  right: -10px;
    //  z-index: -1;
    //  background: var(--dark-blue);
    //}
  }
  border-radius: 10px;

  width: 100%;
  box-shadow: none;
  padding: 0 20px 20px 20px;

  .head-cont {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .game-footer {
      display: flex;
      position: relative;
      align-items: center;
      margin-top: 0 !important;
      margin-right: 15px;

      .action {
        margin-top: 0;
      }
    }
  }

  .buttons {
    display: flex;

    @media screen and (max-width: 991px) {
      display: none;
    }
    gap: 10px;
    button {
      padding: 5px;
      display: grid;
      place-content: center;
      background: #22224a;
      border: 2px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;
    }
  }

  .header {
    background: url(/img/game/description.png) no-repeat;
    background-size: contain;
    max-width: 330px;
    width: 100%;
    height: 84px;
    position: relative;

    img {
      position: absolute;
      top: 15px;
      right: 15px;
    }

    h1 {
      text-transform: capitalize;
      padding: 10px 0 0 20px;
      margin: 0;
      font-size: 1.429rem;
      max-width: 250px;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      padding: 0 0 10px 20px;
      margin: 0;
      opacity: 0.5;
      font-family: "Excon";
      font-style: normal;
      font-weight: 500;
      font-size: 1.143rem;
      color: var(--purple-2);
    }
  }

  p {
    opacity: 0.5;
    padding-top: 15px;
    margin: 0;
    font-family: "Excon";
    font-style: normal;
    font-weight: 400;
    font-size: 1.143rem;
    color: var(--purple-2);
  }
}
</style>
