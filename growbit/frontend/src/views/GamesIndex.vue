<template>
  <div class="category-container">
    <div class="top">
      <div>
        <span>{{ title.title }}</span>
      </div>
    </div>

    <div class="container">
      <div
        class="filters"
        v-if="
          this.title.subtitle.includes('Slots') ||
          this.title.title === 'Growbit recommends'
        "
      >
        <Search
          :on-search="
            (v) => {
              search = v;
            }
          "
        ></Search>
        <div class="provider-dropdown">
          <AppDropdown
            v-if="
              this.providers?.length &&
              (this.title.subtitle.includes('Slots') ||
                this.title.title === 'Growbit recommends')
            "
            :height="'48px'"
            :items="
              providers.map((p) => ({
                name: GAMING_PROVIDERS[p] || p,
                onSelect: () => {
                  providerFilter = p;
                  gamesPerPage = 20;
                },
              }))
            "
          ></AppDropdown>
        </div>
      </div>

      <LoadingAnimation v-if="gameListLoading"></LoadingAnimation>
      <div v-else class="game-list">
        <game-list-entry
          v-for="game in games.list"
          :key="game.id"
          :game="game"
          :responsive="true"
        ></game-list-entry>
      </div>
      <div class="load-more-container">
        <div
          class="progress-bar"
          :style="`background: linear-gradient(90deg, #5B46BC ${
            games.total == 0 ? 0 : (gamesPerPage / games.total) * 100
          }%, transparent ${
            games.total == 0 ? 0 : (gamesPerPage / games.total) * 100
          }%)`"
        ></div>
        <span
          >Displaying {{ Math.min(games.total, gamesPerPage) }} of
          {{ games.total }} games</span
        >
        <div
          class="load-more"
          v-if="games.hasMore"
          @click="() => (gamesPerPage += 24)"
        >
          Show more
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GameListEntry from "@/components/GameListEntry.vue";
import Search from "@/components/Search.vue";
import { mapGetters } from "vuex";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import AppDropdown from "@/components/AppDropdown.vue";

import { GAMING_PROVIDERS, getSlotPopularity, removedProviders } from "@/utils";

export default {
  components: {
    AppDropdown,
    LoadingAnimation,
    GameListEntry,
    Search,
  },
  data() {
    return {
      search: "",
      gamesPerPage: 24,
      hasMore: false,
      providerFilter: null,
      GAMING_PROVIDERS,
    };
  },
  mounted() {
    if (this.$route.query.provider) {
      this.providerFilter = this.$route.query.provider;
    }
  },
  computed: {
    ...mapGetters(["gameList", "homeGames", "gameListLoading", "authUser"]),
    games() {
      const category = this.$route.params.category;
      const query = this.$route.query.filter;

      let filtered = this.gameList;
      if (category === "originals") {
        filtered = this.homeGames.originals;
      } else if (category === "slots") {
        filtered = filtered.filter((game) => game.type !== "Originals");

        if (query === "live") {
          filtered = filtered.filter((game) => game.subcategory === "live");
          filtered = filtered.sort(
            (a, b) => getSlotPopularity(b) - getSlotPopularity(a)
          );
        } else if (query === "new") {
          filtered = filtered.sort(
            (a, b) => new Date(b.releasedAt) - new Date(a.releasedAt)
          );
        } else if (query === "popular") {
          filtered = filtered.sort(
            (a, b) => getSlotPopularity(b) - getSlotPopularity(a)
          );
        } else if (query === "favourite") {
          filtered = filtered.filter((game) =>
            this.authUser.user.favouriteSlots.includes(game.id)
          );
        } else if (query === "recommended") {
          filtered = this.homeGames.recommends;
        }
      }

      if (this.providerFilter && this.providerFilter !== "All") {
        filtered = filtered.filter(
          (game) => game.category === this.providerFilter
        );
      }

      if (this.search) {
        filtered = filtered.filter((g) =>
          g.name?.toLowerCase()?.includes(this.search?.toLowerCase())
        );
      }

      const hasMore = filtered.length > this.gamesPerPage;

      return {
        hasMore,
        total: filtered.length,
        list: filtered.slice(0, this.gamesPerPage),
      };
    },

    providers() {
      const query = this.$route.query.filter;

      const list = this.gameList
        ?.filter(
          (game) =>
            game.type !== "Originals" &&
            ((query === "live" && game.subcategory === "live") ||
              (query !== "live" && game.subcategory !== "live"))
        )
        ?.map((game) => game.category);

      if (!list) {
        return [];
      }

      let unique = Array.from(new Set(list));

      unique = unique.filter(
        (provider) => !removedProviders.includes(provider)
      );
      // if (query === "recommended") {
      //   let providers = Array.from(GROWBIT_RECOMMENDS).map((game) =>
      //     game.substring(0, game.indexOf("/"))
      //   );
      //   unique = unique.filter((provider) => providers.includes(provider));
      // }
      unique.sort();
      unique.unshift("All");

      return unique;
    },

    title() {
      const category = this.$route.params.category;
      const query = this.$route.query.filter;

      if (category === "originals") {
        return {
          title: "Growbit Games",
          subtitle: "Classic Crypto Games",
        };
      } else if (query === "favourite") {
        return { title: "Your Favorites", subtitle: "" };
      } else if (query === "new") {
        return { title: "New Slots", subtitle: "Slots" };
      } else if (query === "recommended") {
        return { title: "Growbit recommends", subtitle: "" };
      } else {
        return {
          title: query
            ? query === "live"
              ? query + " Games"
              : query + " Slots"
            : "Slots",
          subtitle: "Slots",
        };
      }
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.category-container {
  position: relative;

  .container {
    width: 100%;
    max-width: 1180px;
    margin-inline: auto;
    padding: 0 40px 40px 40px;
    @media (max-width: 650px) {
      padding: 10px;
    }
  }

  .load-more-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
    margin-inline: auto;

    span {
      font-style: normal;
      font-weight: 700;
      font-size: 1.143rem;
      line-height: 23px;
      text-align: center;

      color: #9789cd;
    }

    .progress-bar {
      width: 270px;
      border: 2px solid #22224a;
      height: 8px;
      border-radius: 5px;
    }

    .load-more {
      cursor: pointer;

      font-weight: 700;
      font-size: 1.29rem;

      width: fit-content;

      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 10px 50px;

      background: #22224a;
      border-radius: 5px;
    }
  }

  .filters {
    display: flex;
    gap: 15px;

    > div {
      width: 100%;
    }

    .provider-dropdown {
      margin-left: auto;
      width: 100%;
      max-width: 300px;
    }
  }
  .game-list {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 16px;
    margin-top: 35px;
    margin-bottom: 40px;

    @media screen and (max-width: 1500px) {
      gap: 10px;
      grid-template-columns: repeat(7, 1fr);
    }

    @media screen and (max-width: 1100px) {
      grid-template-columns: repeat(6, 1fr);
    }

    @media screen and (max-width: 800px) {
      grid-template-columns: repeat(5, 1fr);
    }

    @media screen and (max-width: 550px) {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      margin-top: 25px;
    }

    @media screen and (max-width: 450px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .top {
    height: 125px;
    @media screen and (max-width: 600px) {
      height: 100px;
    }
    display: flex;
    width: 100%;
    align-items: center;
    margin-bottom: 25px;

    background: rgba(34, 34, 74, 0.5);

    > div {
      padding-inline: 40px;
      @media (max-width: 650px) {
        padding: 10px;
      }
      margin-inline: auto;
      max-width: 1180px;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 10px;

      > span {
        font-weight: 700;
        font-size: 28px;
        color: #eeeeee;
        text-transform: capitalize;
      }
    }
  }
}
</style>
