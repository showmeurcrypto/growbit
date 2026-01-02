<template>
  <div class="lists-container">
    <template v-if="gameListLoading">
      <div class="loading-container">
        <LoadingAnimation></LoadingAnimation>
      </div>
    </template>
    <template v-if="!gameListLoading && popularSlots" class="game-list">
      <div class="category">
        <div class="name">
          More from {{ GAMING_PROVIDERS[provider] || provider || "provider" }}
        </div>

        <div class="games-arrows">
          <router-link
            tag="div"
            :to="`/casino/slots?provider=${provider}`"
            class="all"
            :class="cant('slots-carousel', 'all')"
            >View all
          </router-link>

          <div
            @click="scroll('slots-carousel', -1)"
            :class="cant('slots-carousel', 'left')"
          >
            <img :src="ArrowLeft" alt="" />
          </div>
          <div
            @click="scroll('slots-carousel', +1)"
            :class="cant('slots-carousel', 'right')"
          >
            <img :src="ArrowLeft" alt="" />
          </div>
        </div>
      </div>
      <div class="category-games slots-carousel">
        <game-list-entry
          v-for="game in popularSlots"
          :key="game.id"
          :game="game"
        ></game-list-entry>
      </div>
    </template>
  </div>
</template>

<script>
import GameListEntry from "./GameListEntry.vue";
import CompassIcon from "@/assets/images/compass.svg";
import ArrowLeft from "@/assets/images/arrow_left.svg";
import { mapGetters } from "vuex";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { GAMING_PROVIDERS, getSlotPopularity } from "@/utils";

export default {
  components: { LoadingAnimation, GameListEntry },
  props: ["provider"],
  data() {
    return {
      ArrowLeft,
      OriginalsIcon: CompassIcon,
      gamesPerView: 0,
      GAMING_PROVIDERS,
      page: [],
      width: 0,
      providers: ["PgSoft"],

      scrollState: {
        "slots-carousel": {
          canGoLeft: false,
          canGoRight: true,
          all: true,
        },
      },
    };
  },
  watch: {},
  computed: {
    ...mapGetters(["gameList", "gameListLoading"]),
    popularSlots() {
      if (!this.provider) {
        return null;
      }
      return this.gameList
        ?.filter((g) => g.category === this.provider)
        .sort((a, b) => getSlotPopularity(b) - getSlotPopularity(a))
        .slice(0, 10);
    },
  },
  mounted() {
    this.scroll("originals-carousel", 0); // Init canGoRight for originals
    this.listen("originals-carousel");
    this.listen("slots-carousel");
    this.listen("live-slots-carousel");
  },
  methods: {
    listen(selector) {
      const element = document.getElementsByClassName(selector)[0];
      if (element) {
        element.addEventListener("scroll", (event) => {
          setTimeout(() => {
            this.scroll(selector, 0);
          }, 300);
        });
      }
    },

    scroll(selector, dir) {
      const element = document.getElementsByClassName(selector)[0];
      if (element) {
        const pos = element.scrollLeft + 300 * dir;

        if (dir) {
          element.scrollLeft = pos;
        }

        const canGoLeft = pos > 0;

        let scrollLeftMax = element.scrollLeftMax; //Firefox

        if (scrollLeftMax == undefined) {
          scrollLeftMax = element.scrollWidth - element.clientWidth;
        }

        const canGoRight = pos < scrollLeftMax;

        this.scrollState[selector].canGoLeft = canGoLeft;
        this.scrollState[selector].canGoRight = canGoRight;
      }
    },

    cant(selector, dir) {
      if (dir == "left") {
        if (this.scrollState[selector].canGoLeft == false) {
          return "cant";
        }
      } else if (dir == "right") {
        if (this.scrollState[selector].canGoRight == false) {
          return "cant";
        }
      } else {
        if (this.scrollState[selector].all == false) {
          return "cant";
        }
      }
      return "";
    },
  },
};
</script>

<style lang="scss" scoped>
.loading-container {
  margin-inline: auto;
  padding: 20px 0 40px 0;
}

.all {
  flex-shrink: 0;
}

.lists-container {
  margin-top: 30px;
  padding-inline: 2px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.games-arrows {
  display: flex;
  gap: 5px;

  > div:nth-of-type(3) {
    > img {
      transform: rotate(180deg);
    }
  }

  > div {
    color: white;
    height: 35px;
    padding-inline: 10px;

    background: #22224a;

    display: grid;
    place-content: center;
    cursor: pointer;

    &.cant {
      opacity: 0.5;
      pointer-events: none;
    }

    &:nth-of-type(1) {
      border-radius: 5px;
    }

    &:nth-of-type(2) {
      border-radius: 5px 0 0 5px;
    }

    &:nth-of-type(3) {
      border-radius: 0px 5px 5px 0px;
    }
  }
}

.category-games {
  display: flex;
  overflow: scroll;
  scroll-behavior: smooth;
  gap: 15px;
  margin-bottom: 20px;
  padding: 5px 0;

  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
}

.provider {
  cursor: pointer;
  width: 175px;
  height: 65px;
  padding: 10px 25px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);

  font-style: normal;
  font-weight: 400;
  display: grid;
  place-content: center;

  &.selected {
    background: rgba(255, 255, 255, 0.07);
  }

  &:hover {
    transform: translateY(-10px);
    transition: 500ms transform ease-in-out;
  }
}

.category {
  display: flex;
  font-size: 1.143rem;
  font-weight: 600;
  justify-content: space-between;
  margin-bottom: 15px;
  align-items: center;

  .name {
    color: white;
    font-weight: 600;
    font-size: 1.4rem;
    max-width: 45%;
    @media (max-width: 991px) {
      font-size: 1.429rem;
    }
  }
}
</style>
