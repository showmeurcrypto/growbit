<template>
  <div class="game-modal slot">
    <div class="top_menu">
      <div class="name">
        <img :src="getImage(modalsData.game.method)" />
        {{ modalsData.game.method }}
      </div>
      <div class="close" @click="modalsSetShow(null)">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>

    <div class="slot-content">
      <div class="thumbnail" v-if="slotInfo">
        <img
          ref="img"
          @error="onImageError"
          :data-attr="slotInfo.name"
          :src="slotInfo.image_long ? slotInfo.image_long : slotInfo.image"
          :alt="slotInfo.name"
        />
      </div>
      <div class="thumbnail" v-else-if="isOriginal">
        <img
          class="original_img"
          :src="'/img/game/' + modalsData.game.method + '.png'"
          :alt="modalsData.game.method"
        />
      </div>
      <div class="items-slot">
        <div class="item">
          <span class="name">Time</span>
          <span class="outpot">
            {{ new Date(modalsData.game.updatedAt).toLocaleTimeString() }}</span
          >
        </div>

        <div class="item">
          <span class="name">By</span>
          <span class="outpot">
            {{ modalsData.game?.user?.username || "Hidden" }}
          </span>
        </div>

        <div class="item">
          <span class="name">Bet amount</span>
          <div class="money">
            <span class="outpot">{{
              getDisplayCurrencyAmountFormatted(modalsData.game.amount)
            }}</span>
            <Currency></Currency>
          </div>
        </div>

        <div class="item">
          <span class="name">Multiplier</span>
          <span class="outpot"
            >{{ (modalsData.game.multiplier || 0).toFixed(2) }}x</span
          >
        </div>

        <div class="item" :class="{ wide: !isOriginal }">
          <span class="name">Payout</span>
          <div class="money">
            <span class="outpot">{{
              getDisplayCurrencyAmountFormatted(modalsData.game.payout)
            }}</span>
            <Currency></Currency>
          </div>
        </div>

        <div v-if="nonce" class="item">
          <span class="name">Nonce</span>
          <span class="outpot">{{ nonce }}</span>
        </div>

        <div v-if="seedClient" class="item">
          <span class="name">Client Seed</span>
          <span :data-tooltip="seedClient" class="outpot">{{
            seedClient
          }}</span>
        </div>

        <div v-if="seedPublic" class="item">
          <span class="name">Public Seed</span>
          <span :data-tooltip="seedPublic" class="outpot">{{
            seedPublic
          }}</span>
        </div>
        <div v-if="hashedSeedServer && !seedServer" class="item">
          <span class="name">Server Seed (hashed)</span>
          <span :data-tooltip="hashedSeedServer" class="outpot">{{
            hashedSeedServer
          }}</span>
        </div>
        <div v-if="seedServer" class="item">
          <span class="name">Server Seed</span>
          <span :data-tooltip="seedServer" class="outpot">{{
            seedServer
          }}</span>
        </div>
        <div v-if="prevHash" class="item">
          <span class="name">Next Seed (hashed)</span>
          <span :data-tooltip="prevHash" class="outpot">{{ prevHash }}</span>
        </div>
        <div v-if="blockNum" class="item">
          <span class="name">Block Number</span>
          <span :data-tooltip="blockNum" class="outpot">{{ blockNum }}</span>
        </div>
      </div>

      <div class="result" v-if="isOriginal">
        <mines-result
          v-if="modalsData.game.method === 'mines'"
          :game="modalsData.game"
        ></mines-result>
        <towers-result
          v-else-if="modalsData.game.method === 'towers'"
          :game="modalsData.game"
        ></towers-result>
        <h2 v-else-if="modalsData.game.method === 'crash'">
          {{ crashOutcome }}
        </h2>
        <img
          class="coinflip-res"
          v-else-if="modalsData.game.method === 'coinflip' && outcome != null"
          :src="coinflipSide(outcome)"
          alt=""
        />
        <h2 v-else-if="modalsData.game.method === 'plinko'">
          {{ (modalsData.game.multiplier || 0).toFixed(2) }}x
        </h2>
        <h2 v-else-if="modalsData.game.method === 'reme'">
          {{ modalsData.game.data.rolls[0] }} ,
          {{ modalsData.game.data.rolls[1] }}
        </h2>
        <img
          class="slide-res"
          v-else-if="modalsData.game.method === 'slide' && outcome != null"
          :src="slideColor(outcome)"
          alt=""
        />
        <img
          class="slide-res"
          v-else-if="modalsData.game.method === 'cases'"
          :src="'/img/cases/items/' + modalsData.game.data.itemImage"
          alt=""
        />
        <DiceResult
          v-else-if="modalsData.game.method === 'dice'"
          :game="modalsData.game"
        ></DiceResult>

        <div class="keno-nums" v-else-if="modalsData.game.method === 'keno'">
          <div
            v-for="num in modalsData.game.data.numbers"
            :class="{ hit: modalsData.game.data.picks?.includes(num) }"
          >
            {{ num }}
          </div>
        </div>
      </div>
      <div class="slot-buttons">
        <app-button
          v-if="modalsData.game.amount"
          :fullwidth="true"
          :click="() => playButton()"
          height="44px"
          >{{ isOriginal && seedServer ? "Verify Hash" : "Play Game" }}
        </app-button>
        <app-button
          v-else
          :fullwidth="true"
          :click="() => goToRewards()"
          height="44px"
        >
          Go To Rewards
        </app-button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import MinesResult from "@/components/modals/game_view/MinesResult.vue";
import AppButton from "@/components/AppButton.vue";
import Avatar from "@/components/Avatar.vue";
import CloseIcon from "@/assets/images/close.svg";
import Red from "@/assets/images/slide/red_new.png";
import Purple from "@/assets/images/slide/purple_new.png";
import Head from "@/assets/images/coinflip/head.png";
import Tail from "@/assets/images/coinflip/tail.png";
import Yellow from "@/assets/images/slide/yellow_new.png";
import { getWinningColour, isGameOriginal } from "@/utils";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import Currency from "@/components/Currency.vue";
import { getSHA256Hash } from "@/utils/provability_fair";
import DiceResult from "@/components/modals/game_view/DiceResult.vue";
import TowersResult from "@/components/modals/game_view/TowersResult.vue";

export default {
  mixins: [currencyExchangeRatesMixin],
  components: {
    DiceResult,
    TowersResult,
    Currency,
    Avatar,
    MinesResult,
    AppButton,
    Red,
    Purple,
    Yellow,
    Head,
    Tail,
  },
  data() {
    return {
      CloseIcon,
      multiplayerGame: null,
      originals: new Set([
        "plinko",
        "mines",
        "crash",
        "keno",
        "slide",
        "dice",
        "coinflip",
        "cases",
        "towers",
      ]),
    };
  },
  created() {},
  methods: {
    ...mapActions(["modalsSetShow", "notificationShow", "modalsSetData"]),
    onImageError() {
      if (this.$refs.img.src !== this.slotInfo.image) {
        this.$refs.img.src = this.slotInfo.image;
      }
    },
    getImage(name) {
      if (!this.originals.has(name)) {
        return `/img/game/icon-slots.svg`;
      }

      return `/img/game/icon-${name}.svg`;
    },

    slideColor(outcome) {
      const colour = getWinningColour(outcome).winningColour;
      if (colour === "red") {
        return Red;
      } else if (colour === "purple") {
        return Purple;
      } else {
        return Yellow;
      }
    },
    coinflipSide(outcome) {
      if (outcome === "heads") {
        return Head;
      } else {
        return Tail;
      }
    },
    playButton() {
      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        return;
      }

      if (this.isOriginal) {
        if (this.seedServer) {
          this.modalsSetData({
            game: this.modalsData.game.method,
            data: this.modalsData.game?.data,
            seedServer: this.seedServer,
            seedPublic: this.seedPublic || this.seedClient,
            seedClient: this.seedClient || this.seedPublic,
            nonce: this.nonce,
            mines: this.modalsData.game.deck?.reduce(
              (total, x) => (x === "mine" ? total + 1 : total),
              0
            ),
            minesGrid: this.modalsData.game.gridSize || 25,
            plinkoRows: this.modalsData.game.data?.rows,
            plinkoRisk: this.modalsData.game.data?.risk,
            towersRisk: this.modalsData.game.risk || "med",
          });

          this.modalsSetShow("ProvabilityFair");
        } else {
          this.$router.push(`/${this.modalsData.game.method}`);
          this.modalsSetShow(null);
        }
      } else {
        if (this.modalsData.game.gameCode) {
          this.$router.push("/external/" + this.modalsData.game.gameCode);
          this.modalsSetShow(null);
        }
      }
    },
    goToRewards() {
      this.$router.push("/rewards");
      this.modalsSetShow(null);
    },
  },
  computed: {
    ...mapGetters(["modalsData", "authUser", "gameList"]),
    crashOutcome() {
      if (this.seedServer && this.seedPublic) {
        const divisible = (hash, mod) => {
          let val = 0;
          let o = hash.length % 4;
          for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
            val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
          }
          return val === 0;
        };

        const combined = `${this.seedPublic}-${this.seedServer}`;
        const hash = getSHA256Hash(combined);

        const mod = parseInt(100 / (0.05 * 100));
        if (divisible(hash, mod) === true) {
          return 1;
        }
        const h = parseInt(hash.slice(0, 52 / 4), 16);
        const e = Math.pow(2, 52);
        return (
          Number(Math.floor((100 * e - h) / (e - h)) / 100).toFixed(2) + "x"
        );
      } else {
        return "Game In Progress";
      }
    },
    isOriginal() {
      const name = this.modalsData.game.method;
      return isGameOriginal(name);
    },
    slotInfo() {
      if (this.isOriginal) {
        return null;
      }
      const gameCode = this.modalsData.game.gameCode;
      return this.gameList?.filter((g) => g.id_hash === gameCode)[0];
    },
    nonce() {
      return (
        this.modalsData.game?.fair?.nonce ||
        this.modalsData.game?.fair?.seed?.nonce
      );
    },

    seedPublic() {
      //console.log(this.modalsData.game);
      return (
        this.modalsData.game?.game?.fair?.seedPublic ||
        this.modalsData.game?.fair?.seed?.seedPublic
      );
    },
    seedClient() {
      return (
        this.modalsData.game?.fair?.seed?.seedClient ||
        this.modalsData.game?.fair?.seedPublic ||
        this.modalsData.game?.game?.fair?.seed?.seedClient
      );
    },
    outcome() {
      if (this.modalsData.game?.side) {
        return this.modalsData.game?.side;
      }
      if (
        this.modalsData.game?.game?.outcome ||
        this.modalsData.game?.game?.outcome === 0
      ) {
        return this.modalsData.game?.game?.outcome;
      }
      return this.modalsData.game?.outcome;
    },
    hashedSeedServer() {
      return (
        this.modalsData.game?.fair?.seed?.hash ||
        this.modalsData.game?.game?.fair?.seed?.hash
      );
    },
    seedServer() {
      return (
        this.modalsData.game?.fair?.seed?.seedServer ||
        this.modalsData.game?.fair?.seedServer ||
        this.modalsData.game?.game?.fair?.seed?.seedServer
      );
    },
    prevHash() {
      return (
        this.modalsData.game?.game?.fair?.seed?.previousHash ||
        this.modalsData.game?.fair?.seed?.previousHash
      );
    },
    blockNum() {
      if (!this.modalsData.game.method === "coinflip") {
        return null;
      }
      return this.modalsData.game?.fair?.blockNum;
    },
  },
};
</script>

<style lang="scss" scoped>
.slot-content {
  width: 100%;
  padding: 20px;
  display: grid;
  gap: 15px;
  grid-template-columns: auto 1fr;

  @media screen and (max-width: 991px) {
    display: flex;
    flex-direction: column;
    margin: auto;
  }

  .slot-buttons {
    margin-top: 5px;
    width: 100%;
    grid-column: 1 / 3;
  }

  .thumbnail {
    img {
      width: 150px;

      &.original_img {
        @media (min-width: 991px) {
          width: 200px;
        }
      }
      height: auto;
      //padding-top: 2px;
      font-size: 19px;
      line-height: 25px;
      font-weight: 900;
      text-transform: uppercase;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
      // box-shadow: 8px 8px 15px rgba(10, 10, 10, 3.5);
      // padding: 5px;
      border-radius: 10px;

      position: relative;

      &:-moz-broken {
        opacity: 0;
      }

      &::after {
        content: attr(data-attr);
        display: grid;
        place-content: center;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #22224a;
        //box-shadow: 8px 8px 15px rgba(0, 0, 0, 0.5);
      }
    }
    overflow: hidden;
    flex-shrink: 0;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    width: fit-content;
    height: auto;

    @media screen and (max-width: 991px) {
      margin: auto;
    }
  }

  .items-slot {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 1fr;

    @media screen and (max-width: 991px) {
      grid-template-columns: 1fr;
    }

    .money {
      display: flex;
      align-items: center;
      gap: 5px;
      width: fit-content;
    }

    .item {
      width: 100%;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      font-size: 1rem;
      border-radius: 9px;
      gap: 5px;
      overflow: hidden;
      padding-inline: 15px;

      background: #090c1d;
      padding: 5px 15px;

      &.wide {
        @media screen and (min-width: 991px) {
          grid-column-end: 3;
          grid-column-start: 1;
        }
      }

      @media screen and (max-width: 991px) {
        flex-direction: row;
        justify-content: space-between;
        font-size: 1.29rem;
        border-radius: 9px;

        background: #22224a;
        align-items: center;
        padding: 10px 15px;
        gap: 5px;
      }
      .name {
        display: flex;
        align-items: center;
        text-wrap: nowrap;
        font-style: normal;
        font-weight: 500;
        color: #635b8f;

        @media screen and (max-width: 991px) {
          color: #fff;
        }
      }

      .outpot {
        overflow: hidden;
        text-overflow: ellipsis;
        color: #eeeeee;
        max-width: 100%;

        @media screen and (max-width: 991px) {
          color: #616498;
        }

        &[data-tooltip]:hover::after {
          display: block;
          position: absolute;
          content: attr(data-tooltip);
          border: 1px solid black;
          background: #eee;
          color: black;
          border-radius: 4px;
          padding: 0.25em;
        }
      }
    }
  }
}
.top_menu {
  padding: 20px;
  background: #090c1d;
  display: flex;
  flex-direction: row;
  height: 80px;
  align-items: center;
  gap: 15px;
  @media (max-width: 991px) {
    display: none;
  }

  .name {
    text-transform: capitalize;
    font-style: normal;
    font-weight: 700;
    font-size: 1.714rem;
    color: #eeeeee;
    display: flex;
    align-items: center;
    gap: 15px;

    img {
      width: 40px;
      height: 40px;
      filter: invert(100%) sepia(99%) saturate(0%) hue-rotate(0)
        brightness(200%) contrast(100%);
    }
  }
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

.game-modal {
  @media (min-width: 991px) {
    width: 700px;
  }
  @media (max-width: 991px) {
    width: 100%;
  }

  height: fit-content;

  @media (min-width: 991px) {
    background: var(--dark-blue);
    border: 4px solid #090c1d;
  }
  border-radius: 15px;

  .content {
    padding: 20px;
  }
}

.buttons {
  margin-top: 20px;
  width: 100%;
}

.result {
  overflow: hidden;
  padding: 20px 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  grid-column: 1 / 3;

  h2 {
    font-size: 48px;
    font-weight: 900;
    color: #5b46bc;
  }

  .keno-nums {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    > div {
      width: 50px;
      display: grid;
      place-content: center;
      height: 50px;
      background: #161533;
      text-align: center;
      box-shadow: inset 0px -5px 0px rgba(0, 0, 0, 0.2);
      border: 2px solid #22224a;
      border-radius: 10px;
      font-size: 1.2rem;
      font-weight: 700;

      &.hit {
        background: #5b46bc url("/img/keno-gem.svg") center no-repeat;
        background-size: contain;
      }
    }
  }

  .slide-res {
    height: 100px;
  }

  .coinflip-res {
    height: 100px;
  }

  background: #090c1d;
  border-radius: 9px;
}

.items {
  margin-top: 25px;

  .money {
    display: flex;
    align-items: center;
    gap: 5px;
    width: fit-content;
  }

  .item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 1.29rem;
    border-radius: 9px;

    background: #22224a;

    margin-bottom: 15px;
    height: 50px;
    align-items: center;
    padding: 0 15px;
    gap: 5px;
    .name {
      color: #fff;
      display: flex;
      align-items: center;
      text-wrap: nowrap;
    }

    .outpot {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #616498;

      &[data-tooltip]:hover::after {
        display: block;
        position: absolute;
        content: attr(data-tooltip);
        border: 1px solid black;
        background: #eee;
        color: black;
        border-radius: 4px;
        padding: 0.25em;
      }
    }
  }
}
</style>
