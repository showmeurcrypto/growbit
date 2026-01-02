<template>
  <div class="lists-container">
    <template v-if="homeGamesLoading">
      <div class="loading-container">
        <LoadingAnimation></LoadingAnimation>
      </div>
    </template>
    <template v-if="!homeGamesLoading && originals" class="game-list">
      <div class="category">
        <div class="name">Growbit Originals</div>

        <div class="games-arrows">
          <router-link
            tag="div"
            to="/casino/originals"
            class="all"
            :class="cant('originals-carousel', 'all')"
            >View all
          </router-link>

          <div
            @click="scroll('originals-carousel', -1)"
            :class="cant('originals-carousel', 'left')"
          >
            <img :src="ArrowLeft" alt="" />
          </div>
          <div
            @click="scroll('originals-carousel', +1)"
            :class="cant('originals-carousel', 'right')"
          >
            <img :src="ArrowLeft" alt="" />
          </div>
        </div>
      </div>
      <div class="category-games originals-carousel">
        <game-list-entry
          v-for="game in originals"
          :key="game.id"
          :game="game"
        ></game-list-entry>
      </div>
    </template>
    <template v-if="!homeGamesLoading && pvp" class="game-list">
      <div class="category">
        <div class="name">PvP</div>
        <div class="games-arrows">
          <div class="all">View all</div>
          <div @click="scroll('pvp-carousel', -1)">
            <img :src="ArrowLeft" alt="" />
          </div>
          <div @click="scroll('pvp-carousel', +1)">
            <img :src="ArrowLeft" alt="" />
          </div>
        </div>
      </div>
      <div class="category-games pvp-carousel">
        <game-list-entry
          v-for="game in pvp"
          :key="game.id"
          :game="game"
        ></game-list-entry>
      </div>
    </template>
    <template
      v-if="!homeGamesLoading && growbitRecommends?.length"
      class="game-list"
    >
      <div class="category">
        <div class="name">Growbit Recommends</div>

        <div class="games-arrows">
          <router-link
            tag="div"
            to="/casino/slots?filter=recommended"
            class="all"
            :class="cant('recommends-carousel', 'all')"
            >View all
          </router-link>
          <div
            @click="scroll('recommends-carousel', -1)"
            :class="cant('recommends-carousel', 'left')"
          >
            <img :src="ArrowLeft" alt="" />
          </div>
          <div
            @click="scroll('recommends-carousel', +1)"
            :class="cant('recommends-carousel', 'right')"
          >
            <img :src="ArrowLeft" alt="" />
          </div>
        </div>
      </div>
      <div class="category-games recommends-carousel">
        <game-list-entry
          v-for="game in growbitRecommends"
          :key="game.id"
          :game="game"
        ></game-list-entry>
      </div>
    </template>
    <template
      v-if="!homeGamesLoading && popularSlots?.length"
      class="game-list"
    >
      <div class="category">
        <div class="name">Popular Games</div>

        <div class="games-arrows">
          <router-link
            tag="div"
            to="/casino/slots?filter=popular"
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

    <template v-if="!homeGamesLoading && liveSlots?.length" class="game-list">
      <div class="category">
        <div class="name">Live Games</div>

        <div class="games-arrows">
          <router-link
            tag="div"
            to="/casino/slots?filter=live"
            class="all"
            :class="cant('live-slots-carousel', 'all')"
            >View all
          </router-link>
          <div
            @click="scroll('live-slots-carousel', -1)"
            :class="cant('live-slots-carousel', 'left')"
          >
            <img :src="ArrowLeft" alt="" />
          </div>
          <div
            @click="scroll('live-slots-carousel', +1)"
            :class="cant('live-slots-carousel', 'right')"
          >
            <img :src="ArrowLeft" alt="" />
          </div>
        </div>
      </div>
      <div class="category-games live-slots-carousel">
        <game-list-entry
          v-for="game in liveSlots"
          :key="game.id"
          :game="game"
        ></game-list-entry>
      </div>
    </template>
  </div>
</template>

<script>
import GameListEntry from "./GameListEntry.vue";
import OriginalsIcon from "@/assets/images/originals_icon.svg";
import BattleIcon from "@/assets/images/battle_icon.svg";
import ArrowLeft from "@/assets/images/arrow_left.svg";
import { mapGetters } from "vuex";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { getSlotPopularity } from "@/utils";

export default {
  components: { LoadingAnimation, GameListEntry },
  data() {
    return {
      ArrowLeft,
      OriginalsIcon,
      BattleIcon,
      gamesPerView: 0,
      page: [],
      width: 0,
      providers: ["PgSoft"],
      selectedProvider: null,
      dropdownProvider: null,
      popularGames: null,
      scrollState: {
        "originals-carousel": {
          canGoLeft: false,
          canGoRight: true,
          all: true,
        },
        "slots-carousel": {
          canGoLeft: false,
          canGoRight: true,
          all: true,
        },
        "recommends-carousel": {
          canGoLeft: false,
          canGoRight: true,
          all: true,
        },
        "live-slots-carousel": {
          canGoLeft: false,
          canGoRight: true,
          all: true,
        },
      },
    };
  },
  watch: {},
  computed: {
    ...mapGetters(["homeGamesLoading", "homeGames"]),
    pvp() {
      return null;
    },
    originals() {
      return this.homeGames?.originals;
    },
    popularSlots() {
      return this.homeGames?.popular;
    },
    growbitRecommends() {
      return this.homeGames?.recommends;
    },
    liveSlots() {
      return this.homeGames?.live;
    },
  },
  mounted() {
    this.scroll("originals-carousel", 0); // Init canGoRight for originals
    this.listen("originals-carousel");
    this.listen("recommends-carousel");
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

<style lang="scss">
.loading-container {
  margin-inline: auto;
  padding: 20px 0 40px 0;
}

.all {
  flex-shrink: 0;
}

.lists-container {
  width: 100%;
  display: grid;
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
  gap: 13px;
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
  font-size: 1rem;
  font-weight: 600;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: center;

  .name {
    color: white;
    font-weight: 600;
    font-size: 1.4rem;
    max-width: 45%;
    @media (max-width: 991px) {
      font-size: 1.29rem;
    }
  }
}
</style>
