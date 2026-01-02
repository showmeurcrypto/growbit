<template>
  <div class="coinflip-games">
    <div class="games-my">
      <div class="my-header">
        <div class="header-title">
          <span>My Games</span>
          {{ coinflipGetGames.user.length }}
        </div>
      </div>
      <div class="my-content">
        <transition name="fade" mode="out-in">
          <div
            v-if="socketCoinflip.connected === false"
            class="content-loading"
            key="loading"
          >
            <LoadingAnimation></LoadingAnimation>
          </div>
          <div
            v-else-if="coinflipGetGames.user.length > 0"
            class="content-list"
            key="data"
          >
            <CoinflipGamesElement
              v-for="game of coinflipGetGames.user"
              v-bind:key="game._id"
              v-bind:game="game"
            />
          </div>
          <div v-else class="content-empty" key="empty">
            Your Coinflip games will appear here. Create one now!
          </div>
        </transition>
      </div>
    </div>
    <div class="games-all">
      <div class="all-header">
        <div class="header-title">
          <span>Open Games</span>
          {{ openGamesCount }}
        </div>

        <div class="sort">
          <AppDropdown
            :height="'40px'"
            :items="
              ['ascending', 'descending', 'new'].map((s) => ({
                name: 'Sort ' + s,
                onSelect: () => {
                  this.coinflipSetFilterSort(s);
                },
              }))
            "
          ></AppDropdown>
        </div>
      </div>
      <div class="all-content" ref="listContainer">
        <div
          v-if="socketCoinflip.connected === false"
          class="content-loading"
          key="loading"
        >
          <LoadingAnimation></LoadingAnimation>
        </div>
        <div class="content-list" key="data">
          <CoinflipGamesElement
            v-for="game of coinflipGetGames.all"
            v-bind:key="game._id"
            v-bind:game="game"
          />

          <div
            v-if="!isMobile && emptySlots"
            class="placeholder"
            v-for="e in emptySlots"
          ></div>
          <div ref="bottomObserver"></div>
        </div>

        <div
          v-if="!coinflipGetGames.all.length && isMobile"
          class="content-empty"
          key="empty"
        >
          No games. Create one now!
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppDropdown from "@/components/AppDropdown";
import CoinflipGamesElement from "@/components/games/coinflip/CoinflipGamesElement";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

export default {
  name: "CoinflipGames",
  components: {
    AppDropdown,
    CoinflipGamesElement,
    LoadingAnimation,
  },
  data() {
    return {
      isMobile: false,
      showCount: 15,
      openGamesCount: 0,
    };
  },
  mounted() {
    this.createObserver();
  },
  created() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },
  methods: {
    onResize() {
      this.isMobile = window.innerWidth <= 991;
    },
    createObserver() {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.showCount = Math.max(
              6,
              Math.min(this.showCount + 6, this.openGamesCount)
            );
          }
        },
        { threshold: 1 }
      );

      if (this.$refs.bottomObserver) {
        this.observer.observe(this.$refs.bottomObserver);
      }
    },
  },
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  computed: {
    ...mapGetters([
      "socketCoinflip",
      "authUser",
      "coinflipFilterSort",
      "coinflipGames",
    ]),
    emptySlots() {
      let count = 6 - this.coinflipGetGames.all.length;
      if (count <= 0) return [];
      return new Array(count);
    },
    coinflipGetGames() {
      let games = { user: [], all: [] };

      for (const game of this.coinflipGames) {
        if (
          this.authUser.user !== null &&
          (game.author?._id === this.authUser.user._id ||
            game.secondPlayer?._id === this.authUser.user._id)
        ) {
          games.user.push(game);
        } else {
          games.all.push(game);
        }
      }

      if (this.coinflipFilterSort === "descending") {
        games.all.sort(function (a, b) {
          return b.amount - a.amount;
        });
      } else if (this.coinflipFilterSort === "ascending") {
        games.all.sort(function (a, b) {
          return a.amount - b.amount;
        });
      } else {
        games.all.sort(function (a, b) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      }

      this.openGamesCount = games.all.length;

      games.all = games.all.slice(0, this.showCount);

      return games;
    },
  },
};
</script>

<style scoped lang="scss">
@use "/src/assets/sass/mixins" as m;

.sort {
  width: 100%;
  max-width: 200px;
}
.placeholder {
  width: 100%;
  height: 175px;

  background: #161533;
  border-radius: 15px;
  display: flex;
}
.coinflip-games {
  max-width: 1100px;
  width: 100%;
  margin-top: 30px;
}

.coinflip-games .games-my,
.coinflip-games .games-all {
  width: 100%;
}

.coinflip-games .games-all {
  margin-top: 26px;
  padding-bottom: 20px;
}

.coinflip-games .my-header,
.coinflip-games .all-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
}

.coinflip-games .my-header::before {
  left: 120px;
}

.coinflip-games .all-header::before {
  left: 125px;
  right: 177px;
}

.coinflip-games .header-title {
  font-size: 14px;
  font-weight: 800;
  color: #f7be2c;
}

.coinflip-games .header-title span {
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
}

.coinflip-games .header-actions {
  display: flex;
  align-items: center;
}

.coinflip-games .my-content {
  width: 100%;
  min-height: 75px;
  display: flex;
  flex-wrap: wrap;
  margin-top: 25px;
}

.coinflip-games .all-content {
  max-height: 375px;
  margin-top: 25px;
  overflow-y: scroll;
  @include m.hide_scrollbar();
}

.coinflip-games .content-loading {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  height: 158px;
  display: grid;
  place-content: center;
}

.coinflip-games .content-list {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;

  @media only screen and (max-width: 1300px) {
    grid-template-columns: 1fr 1fr;
  }

  @media only screen and (max-width: 991px) {
    grid-template-columns: 1fr;
  }
}

.coinflip-games .content-empty {
  top: 30px;
  width: 100%;
  height: 75px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 900;
}

@media only screen and (max-width: 1250px) {
  .coinflip-games .all-content {
    margin-right: 0;
  }
}

@media only screen and (max-width: 1180px) {
  .coinflip-games {
    width: 100%;
  }
}
</style>
