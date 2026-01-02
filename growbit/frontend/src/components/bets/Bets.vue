<template>
  <div class="bets-container">
    <div class="tabs">
      <div
        @click="betsSetTab('all')"
        :class="`tab ${betsTab === 'all' ? 'active' : ''}`"
      >
        <AllIcon></AllIcon>
        <span> All Bets</span>
      </div>

      <div
        v-if="authUser?.user"
        @click="betsSetTab('my')"
        :class="`tab ${betsTab === 'my' ? 'active' : ''}`"
      >
        <MyBetsIcon></MyBetsIcon>
        <span>My Bets</span>
      </div>

      <div
        @click="betsSetTab('whale')"
        class="whale"
        :class="`tab ${betsTab === 'whale' ? 'active' : ''}`"
      >
        <HighRoll></HighRoll>
        <span>High Rollers</span>
      </div>
      <div
        @click="betsSetTab('lucky')"
        class="lucky"
        :class="`tab ${betsTab === 'lucky' ? 'active' : ''}`"
      >
        <LuckyIcon></LuckyIcon>
        <span>Lucky </span>
      </div>
      <div
        @click="betsSetTab('race')"
        :class="`tab ${betsTab === 'race' ? 'active' : ''}`"
      >
        <RaceIcon></RaceIcon>
        <span> Race <span>Leaderboard</span></span>
      </div>
    </div>

    <transition name="fade" mode="out-in">
      <div
        v-if="
          (betsTab === 'race' && leaderboardData.loading) ||
          (betsTab !== 'race' && generalBets.loading === true)
        "
        class="bets-content"
      >
        <div class="content-loading" key="loading">
          <LoadingAnimation />
        </div>
      </div>
      <div
        v-else-if="
          (betsTab !== 'race' && betsGetList.length) ||
          (betsTab === 'race' && leaderboardData.data?.winners?.length)
        "
        class="live_table_container"
      >
        <table class="live-table">
          <thead v-if="betsTab !== 'race'">
            <tr>
              <th>Game</th>
              <th class="playerHead">Player</th>
              <th class="hide_on_small d-xl-table-cell">Time</th>
              <th class="hide_on_small d-xl-table-cell">Bet</th>
              <th class="d-none d-xl-table-cell">Multiplier</th>
              <th class="end">Payout</th>
            </tr>
          </thead>
          <thead v-else>
            <tr>
              <th>Player</th>
              <th>Points</th>
              <th>Reward</th>
            </tr>
          </thead>
          <tbody v-if="betsTab !== 'race'" :class="{ odd: odd }">
            <tr
              v-for="game in betsGetList"
              :key="game._id + betsTab"
              @click="openGameDetails(game)"
            >
              <td>
                <div class="name">
                  <img class="hide_on_small" :src="getImage(game.method)" />
                  <span v-if="game.amount">{{ game.method }}</span>
                  <span v-else :class="game.data.box">
                    {{ game.data.box.toUpperCase() + " CASE" }}
                  </span>
                </div>
              </td>
              <td>
                <div class="player">
                  <span>
                    {{ game.user?.username || "Hidden" }}
                  </span>

                  <img
                    v-if="getUserLevel(game.user).level"
                    :src="`/img/badges/small/level_${
                      getUserLevel(game.user).level
                    }.png`"
                  />
                </div>
              </td>
              <td class="hide_on_small">
                {{
                  new Date(game.updatedAt).toLocaleString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })
                }}
              </td>
              <td class="hide_on_small">
                <div v-if="game.amount" class="money">
                  {{ getDisplayCurrencyAmountFormatted(game.amount) }}
                  <Currency></Currency>
                </div>
                <div v-else class="money" :class="game.data.box">
                  <img :src="`/img/keys/${game.data.box.toLowerCase()}.png`" />
                </div>
              </td>
              <td class="multi" :class="{ lost: !game.multiplier }">
                {{ game.multiplier?.toFixed(2) || parseFloat(0).toFixed(2) }}x
              </td>
              <td class="end">
                <div class="money">
                  {{ getDisplayCurrencyAmountFormatted(game.payout) }}
                  <Currency></Currency>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr
              v-for="winner in leaderboardData.data.winners"
              :key="winner._id"
            >
              <td>
                {{ winner?.user?.username || "Hidden" }}
              </td>
              <td>
                <div class="money">
                  {{ winner.points?.toFixed(2) }}
                </div>
              </td>
              <td>
                <div class="money">
                  {{ winner.prize?.toFixed(2) }}
                  <img src="@/assets/images/mmo_coin.png" alt="" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="bets-content">
        <div v-if="betsTab === 'race'" class="no-race" key="no-race">
          <img src="/img/race_missing.webp" alt="" />
          <p>Oh no! Race is not active!</p>
        </div>
        <div v-else class="no-race" key="no-bets">
          <img src="/img/challenges_missing.webp" alt="" />
          <p>No bets found!</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import LoadingAnimation from "@/components/LoadingAnimation";
import MyBetsIcon from "@/assets/images/my_bets.svg?inline";
import HighRoll from "@/assets/images/high_roll.svg?inline";
import LuckyIcon from "@/assets/images/lucky.svg?inline";
import ThunderIcon from "@/assets/images/thunder_icon.svg?inline";
import AllIcon from "@/assets/images/cube.svg?inline";
import RaceIcon from "@/assets/images/weekly_race.svg?inline";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

import { getUserLevel } from "@/utils";

export default {
  name: "Bets",
  mixins: [currencyExchangeRatesMixin],
  components: {
    Currency,
    LoadingAnimation,
    ThunderIcon,
    HighRoll,
    AllIcon,
    MyBetsIcon,
    RaceIcon,
    LuckyIcon,
  },
  data() {
    return {
      odd: true,
      betsTab: "all",
      originals: new Set([
        "plinko",
        "mines",
        "crash",
        "keno",
        "slide",
        "dice",
        "coinflip",
        "cases",
        "reme",
        "towers",
      ]),
    };
  },
  methods: {
    ...mapActions([
      "generalGetBetsDataSocket",
      "modalsSetData",
      "modalsSetShow",
      "leaderboardGetDataSocket",
    ]),
    getUserLevel(user) {
      return getUserLevel(user);
    },
    betsSetTab(tab) {
      if (tab === "race") {
        this.leaderboardGetDataSocket();
      }
      this.betsTab = tab;
    },
    getImage(name) {
      if (!this.originals.has(name)) {
        return `/img/game/icon-slots.svg`;
      }

      return `/img/game/icon-${name}.svg`;
    },
    openGameDetails(game) {
      this.modalsSetData({ game: game });
      this.modalsSetShow("GameView");
    },
  },
  computed: {
    ...mapGetters(["authUser", "generalBets", "leaderboardData"]),
    betsGetList() {
      let bets = [];
      if (this.generalBets.bets?.[this.betsTab]) {
        let isAdmin = this.authUser?.user?.rank === "admin";

        let tabBets = this.generalBets.bets[this.betsTab];

        // tabBets = tabBets.filter((b) => !(b.method === "towers" && !isAdmin));

        bets = tabBets.slice(0, 12);
      }
      return bets;
    },
  },
  watch: {
    betsGetList: {
      handler(state, oldState) {
        if (
          oldState?.length &&
          state?.length &&
          state[0]._id !== oldState[0]._id
        ) {
          this.odd = !this.odd;
        }
      },
    },
  },
  created() {
    if (this.generalBets.bets === null && this.generalBets.loading === false) {
      const data = {};
      this.generalGetBetsDataSocket(data);
    }
  },
};
</script>

<style lang="scss" scoped>
@use "/src/assets/sass/mixins" as m;

.player {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 150px;
  overflow: hidden;

  @media (max-width: 800px) {
    width: 100px;
  }

  span {
    text-wrap: no-wrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  img {
    height: 18px;
    width: auto;
  }
}

.playerHead {
  width: 150px;

  @media (max-width: 800px) {
    width: 100px;
  }
}

.end {
  text-align: right;
  padding-right: 10px;
  div.money {
    justify-content: flex-end;
  }
}

.bets-container {
  margin-top: 15px;

  @media screen and (min-width: 991px) {
    margin-top: 30px;
  }

  @media screen and (max-width: 991px) {
    padding-inline: 10px;
  }

  width: 100%;

  .no-race {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin: auto;
    img {
      height: 200px;
    }

    p {
      font-size: 1.143rem;
      color: var(--purple-2);
    }
  }
  .money {
    justify-content: center;
    display: flex;
    gap: 5px;
    align-items: center;
    img {
      height: 20px;
    }
  }
}

.hide_on_small {
  @media screen and (max-width: 600px) {
    display: none;
  }
}
.tabs {
  display: flex;
  width: 100%;
  gap: 15px;
  flex-direction: row;
  align-items: center;
  padding: 5px 7px;
  margin-bottom: 10px;
  overflow: scroll;
  @include m.hide_scrollbar();

  background: #1d1c44;
  border-radius: 5px;

  > div {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    text-wrap: nowrap;
    padding: 13px 20px;
    @media screen and (max-width: 991px) {
      padding: 10px 17px;
    }
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    gap: 10px;
    span > span {
      @media screen and (max-width: 991px) {
        display: none;
      }
    }

    span {
      text-wrap: no-wrap;
      font-size: 1.143rem;
    }

    svg {
      path {
        fill: #616498;
      }
    }

    &.active {
      background: #3a3a65;

      font-weight: 900;

      svg {
        path {
          fill: white;
        }
      }
    }
  }
}

table {
  width: 100%;
  border-collapse: collapse;
  position: relative;

  &::before {
    content: "";
    width: 100%;
    height: 250px;
    position: absolute;
    pointer-events: none;
    bottom: 0;
    left: 0;
    background: linear-gradient(transparent, #0e0d1f);
    z-index: 10;
  }

  .name {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
    width: 100px;
    span {
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &.bronze {
        color: #916051;
      }
      &.silver {
        color: #566d98;
      }
      &.gold {
        color: #da8924;
      }
      &.sapphire {
        color: #1069d2;
      }
      &.emerald {
        color: #007651;
      }
      &.ruby {
        color: #e0115f;
      }
      &.diamond {
        color: #b9f2ff;
        //color: #000;
      }
      &.onyx {
        color: #353839;
      }
      &.opal {
        color: #a8c3bc;
      }
    }
    img {
      //filter: invert(100%) sepia(99%) saturate(0%) hue-rotate(0)
      // brightness(200%) contrast(100%);
      width: 18px;
      height: auto;
    }
  }
  th {
    font-weight: 400;
    font-size: 1rem;
    padding: 10px 0;
    position: sticky;
    top: 0;
    background: #111026;
    z-index: 2;

    color: var(--purple-2);

    &:first-of-type {
      text-align: left;
      padding-left: 10px;
    }
  }

  td {
    cursor: pointer;
    text-align: center;
    font-weight: 700;
    font-size: 1rem;
    padding: 10px 0;

    span {
      font-weight: 700;
      font-size: 1rem;
    }

    &:first-of-type {
      padding-left: 10px;
      text-transform: capitalize;
      text-align: left;
      border-radius: 5px 0 0 5px;
    }

    &:last-of-type {
      border-radius: 0 5px 5px 0;
    }

    &.multi {
      color: var(--green);
    }

    &.lost {
      color: rgba(97, 100, 152, 0.5);
    }
  }

  @media screen and (min-width: 991px) {
    tbody:not(.odd) tr:nth-of-type(even) td {
      background: #22224a;
    }

    tbody.odd tr:nth-of-type(odd) td {
      background: #22224a;
    }
  }
}

.content-loading {
  display: grid;
  width: 100%;
  place-content: center;
  height: 451px;
}

@keyframes slideOdd {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideEven {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

tbody {
  overflow: clip;

  & > tr:nth-child(even) {
    animation: slideOdd 0.5s ease-out;
  }

  & > tr:nth-child(odd) {
    animation: slideEven 0.5s ease-out;
  }
}
</style>
