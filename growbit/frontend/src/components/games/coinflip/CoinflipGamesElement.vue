<template>
  <div
    class="match"
    :key="game._id"
    @click="remove()"
    :class="{ lost: youLost, won: youWon }"
  >
    <div class="players">
      <div class="player">
        <div class="avatar">
          <div class="wrapper">
            <AvatarImage :avatarNumber="game.author.avatar"></AvatarImage>
          </div>
          <img
            v-if="game.pick === 'tails'"
            class="pick"
            src="@/assets/images/coinflip/tail.png"
            alt=""
          />
          <img
            v-else
            class="pick"
            src="@/assets/images/coinflip/head.png"
            alt=""
          />
        </div>
        <span class="username">{{ game.author.username }}</span>
        <div class="amount" :class="{ green: animationOver && authorWon }">
          <span>{{ authorAmount }}</span>
          <Currency />
        </div>
      </div>

      <span v-if="game.state === 'created'" class="vs">VS</span>
      <span class="fairness" v-else-if="game.state === 'fairness'"
        >Waiting for EOS Block #{{ game.fair.blockNum }}</span
      >
      <div
        v-if="game.state === 'completed' || game.state === 'fairness'"
        class="coin"
        :class="{ inactive: game.state !== 'completed' }"
        ref="coin"
      >
        <img class="heads" src="@/assets/images/coinflip/head.png" alt="" />
        <img class="tails" src="@/assets/images/coinflip/tail.png" alt="" />
      </div>
      <div
        class="player"
        v-if="game.state === 'completed' || game.state === 'fairness'"
      >
        <div class="avatar">
          <div class="wrapper">
            <AvatarImage
              :avatarNumber="game.secondPlayer?.avatar || 1"
            ></AvatarImage>
          </div>
        </div>
        <span class="username">{{ game.secondPlayer?.username || "Bot" }}</span>
        <div class="amount" :class="{ green: animationOver && opponentWon }">
          <span>{{ opponentAmount }}</span>
          <Currency />
        </div>
      </div>
      <div class="call" v-else>
        <span class="waiting">Waiting for opponent</span>
        <AppButton :click="() => joinOrBot()">{{
          yourGame ? "Bot" : "Join"
        }}</AppButton>
      </div>
    </div>
  </div>
</template>

<script>
import Currency from "@/components/Currency";

import AvatarImage from "@/components/AvatarImage";
import AppButton from "@/components/AppButton";

import { mapGetters, mapActions } from "vuex";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
export default {
  name: "CoinflipGamesElement",
  mixins: [currencyExchangeRatesMixin],

  components: {
    AvatarImage,
    Currency,
    AppButton,
  },
  data() {
    return {
      animationOver: false,
    };
  },
  props: ["game"],
  methods: {
    ...mapActions([
      "coinflipSendJoinSocket",
      "coinflipCallCoinflipBotSocket",
      "coinflipRemoveGame",
    ]),

    animateFlip(side) {
      const animationOptions = {
        fill: "forwards",
        duration: 3000,
      };

      const heads = [
        { transform: `rotateX(0)` },
        { transform: `rotateX(2520deg)` },
      ];

      const tails = [
        { transform: `rotateX(0)` },
        { transform: `rotateX(2340deg)` },
      ];

      const coin = this.$refs.coin;
      if (coin) {
        const animation = coin.animate(
          side == "heads" ? heads : tails,
          animationOptions
        );
        animation.finished.then(() => {
          this.animationOver = true;
          if (!this.myGame) {
            setTimeout(() => {
              this.coinflipRemoveGame(this.game);
            }, 1500);
          }
        });
      }
    },

    remove() {
      if (this.game.state === "completed" && this.animationOver) {
        this.coinflipRemoveGame(this.game);
      }
    },
    joinOrBot() {
      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        return;
      }

      const data = { gameId: this.game._id };
      if (this.yourGame) {
        this.coinflipCallCoinflipBotSocket(data);
      } else {
        this.coinflipSendJoinSocket(data);
      }
    },
  },
  computed: {
    ...mapGetters([
      "authUser",
      "generalTimeDiff",
      "coinflipFilterAnimation",
      "coinflipGameData",
    ]),
    youLost() {
      return (
        this.myGame &&
        this.game.winner?.toString() != this.authUser?.user?._id?.toString() &&
        this.animationOver
      );
    },
    youWon() {
      return (
        this.myGame &&
        this.game.winner?.toString() == this.authUser?.user?._id?.toString() &&
        this.animationOver
      );
    },

    yourGame() {
      return this.authUser?.user?._id?.toString() === this.game?.author._id;
    },
    myGame() {
      return (
        this.authUser?.user?._id?.toString() === this.game?.author._id ||
        this.authUser?.user?._id?.toString() === this.game?.secondPlayer?._id
      );
    },
    authorWon() {
      return this.game.winner == this.game.author._id;
    },
    opponentWon() {
      return this.game.winner == this.game?.secondPlayer?._id;
    },
    authorAmount() {
      if (!this.animationOver) {
        return this.getDisplayCurrencyAmountFormatted(this.game.amount);
      }

      if (this.authorWon) {
        return this.getDisplayCurrencyAmountFormatted(this.game.payout);
      }

      return 0;
    },
    opponentAmount() {
      if (!this.animationOver) {
        return this.getDisplayCurrencyAmountFormatted(this.game.amount);
      }

      if (this.opponentWon) {
        return this.getDisplayCurrencyAmountFormatted(this.game.payout);
      }

      return 0;
    },
  },
  watch: {
    game: {
      deep: true,
      immediate: true,
      handler(state, oldState) {
        if (state?.state === "completed" && state?.side) {
          setTimeout(() => {
            this.animateFlip(state.side);
          }, 100);
        }
      },
    },
  },
};
</script>

<style scoped lang="scss">
@keyframes flip-head {
  0% {
    transform: rotateX(0);
  }
  100% {
    transform: rotateX(2520deg);
  }
}

@keyframes flip-tail {
  0% {
    transform: rotateX(0);
  }
  100% {
    transform: rotateX(2340deg);
  }
}

.coin {
  cursor: pointer;
  position: relative;
  margin: 0;
  transform-style: preserve-3d;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;

  @media (min-width: 650px) and (max-width: 1300px) {
    height: 90px;
  }

  @media (max-width: 500px) {
    height: 60px;
  }

  aspect-ratio: 165 / 173;
  flex-shrink: 0;
  margin-inline: 10px;

  &.inactive {
    opacity: 0.3;
  }

  > img {
    top: 0;
    left: 0;
    right: 0;
    position: absolute;
    height: 100%;
    width: 100%;
    aspect-ratio: 165 / 173;
    backface-visibility: hidden;
  }

  .tails {
    transform: rotateX(180deg);
    z-index: 99;
    border-radius: 50%;
    backface-visibility: hidden;
  }

  .heads {
    z-index: 99;
    border-radius: 50%;
    backface-visibility: hidden;
  }
}

.match {
  padding: 15px;
  position: relative;
  cursor: pointer;
  overflow: hidden;

  height: 175px;

  background: #090c1d;
  border: 2px solid #111026;
  border-radius: 15px;

  &.won {
    border: 2px solid var(--green);
    background: rgb(87, 142, 61);

    .players .player {
      opacity: 0.8;
    }
  }
  &.lost {
    background: rgb(142, 35, 88);
    border: 2px solid var(--red);
    .players .player {
      opacity: 0.8;
    }
  }

  &.won,
  &.lost {
    &:hover::before {
      z-index: 100;
      left: 0;
      right: 0;
      position: absolute;
      color: white;
      font-size: 22px;
      font-weight: 900;
      content: "hide";
      display: grid;
      place-content: center;
      width: 100%;
      height: 100%;
      background: black;
      opacity: 0.6;
    }
  }
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;

  &:has(.fairness) {
    background: #22224a;
    .player {
      opacity: 0.4;
    }
  }

  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;

  .points {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 7px 12px;
    width: fit-content;
    min-width: 76px;
    height: 36px;
    color: #eeeeee;
    border-radius: 5px;

    font-style: normal;
    font-weight: 800;
    font-size: 16px;
    background: #282746;

    &.win {
      color: #161533;
      background: #f7be2c;
    }
  }

  .join-match {
    background: #f7be2c;
    cursor: pointer;

    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    color: #161533;
    display: grid;
    place-content: center;
    border: 0;
    padding: 8px 15px 13px 15px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.75),
      inset 0px -5px 0px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
  }

  .info {
    display: flex;

    div {
      background: rgba(255, 255, 255, 0.03);
      padding: 0 10px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;

      &:last-child {
        margin-left: 5px;
        padding: 0 10px;
      }

      span {
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        margin-left: 10px;
      }
    }
  }

  .players {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 145px;

    .avatar {
      position: relative;

      .wrapper {
        overflow: hidden;
        border-radius: 8px !important;
      }

      .pick {
        height: 16px;
        width: 16px;
        position: absolute;
        bottom: -8px;
        right: -10px;
      }
    }

    .call {
      padding: 10px 20px;
      height: 100%;
      display: grid;
      border-radius: 8px;
      background: #111026;
      width: 115px;
      flex-shrink: 0;

      place-content: center;
      gap: 15px;

      .waiting {
        font-size: 12px;
        text-align: center;
        gap: 5px;
        color: #9789cd;
      }
    }
    .player {
      width: 115px;
      display: flex;
      padding: 20px;
      flex-shrink: 0;

      background: #111026;

      height: 100%;
      display: flex;
      border-radius: 8px;
      justify-content: flex-start;
      flex-direction: column;
      gap: 5px;
      align-items: center;

      span.username {
        font-size: 0.86rem;
        font-weight: 600;

        font-size: 12px;

        max-width: 95px;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .amount {
        display: flex;
        display: flex;
        flex-wrap: wrap;

        span {
          font-size: 0.86rem;

          align-items: center;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        justify-content: center;
        font-weight: 800;
        gap: 3px;

        &.green span {
          color: var(--green);
        }
      }
    }

    .vs {
      text-align: center;
      @media (max-width: 991px) {
      }
      flex-shrink: 0;

      color: #9789cd;

      font-size: 1fr;
    }

    .fairness {
      position: absolute;
      display: grid;
      place-content: center;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      font-size: 1.2fr;
      font-weight: 800;
      margin: 0 10px;
      color: var(--red);
    }

    .avatar {
      flex-shrink: 0;
      width: 50px;
      height: 50px;
      border: 3px solid #282746;
      border-radius: 8px;

      &.win {
        box-shadow: inset 1px -5px 3px rgba(0, 0, 0, 0.2);
        filter: drop-shadow(0px 0px 25px rgba(236, 180, 55, 0.25));
        border-color: #f7be2c;
      }

      &.lose {
        filter: grayscale(1);
      }
    }
  }
}
</style>
