<template>
  <nav
    :class="
      'sidebar ' +
      (!collapsed || mobileToggle ? 'visible' : 'hidden') +
      ' ' +
      (mobileToggle ? 'mobileToggle' : '') +
      (collapsed ? ' collapsed' : '')
    "
    @click="mobileToggle = false"
  >
    <div class="sidebar-header" :class="{ collapsed: collapsed }">
      <div class="toggle" @click="collapsed = !collapsed">
        <img src="@/assets/images/menu.svg" />
      </div>
    </div>

    <ol class="navigation" :class="{ collapsed: collapsed }">
      <div class="mode-switch" :class="{ collapsed: collapsed }">
        <button
          class="casino active"
          :key="'casino'"
          style="text-decoration: none"
        >
          <div
            :style="{
              backgroundImage: collapsed ? `url(/img/casino.svg)` : 'none',
            }"
          >
            <span>Casino</span>
          </div>
        </button>

        <button
          class="sports"
          disabled="true"
          :key="'sports'"
          style="text-decoration: none"
        >
          <div
            :style="{
              backgroundImage: collapsed ? `url(${SportBtnIcon})` : 'none',
            }"
          >
            <span>Sports</span>
          </div>
        </button>
      </div>
      <SidebarItem
        :item="tab"
        :collapsed="collapsed"
        v-for="tab in tabs"
        :key="tab.name"
      />
    </ol>
  </nav>
</template>

<script>
import { mapGetters } from "vuex";

import StarIcon from "@/assets/images/star.svg?inline";
import AdminIcon from "@/assets/images/setting.svg?inline";
import OriginalsIcon from "@/assets/images/originals_icon.svg?inline";
import EventsIcon from "@/assets/images/star.svg?inline";
import FairnessIcon from "@/assets/images/fairness.svg?inline";
import SlotsIcon from "@/assets/images/slots.svg?inline";
import CasinoIcon from "@/assets/images/casino.svg?inline";
import ArrowIcon from "@/assets/images/arrow.svg";
import HeartIcon from "@/assets/images/heart_full.svg?inline";

import PopularIcon from "@/assets/images/popular.svg?inline";
import NewIcon from "@/assets/images/new.svg?inline";
import LiveIcon from "@/assets/images/live.svg?inline";
import RewardsIcon from "@/assets/images/gift_bold.svg?inline";

import DailyChallengesIcon from "@/assets/images/daily_challenge.svg?inline";
import WeeklyRaceIcon from "@/assets/images/weekly_race.svg?inline";

import HelpCenterIcon from "@/assets/images/help_center.svg?inline";
import SidebarItem from "@/components/sidebar/SidebarItem.vue";
import Dice from "@/views/games/Dice.vue";

import SportBtnIcon from "@/assets/images/basketball.svg";
import CasinoBtnIcon from "@/assets/images/casino_btn.svg";

export default {
  components: {
    Dice,
    SidebarItem,
    StarIcon,
    HeartIcon,
    AdminIcon,
    OriginalsIcon,
    EventsIcon,
    FairnessIcon,
    SlotsIcon,
    DailyChallengesIcon,
    WeeklyRaceIcon,
    CasinoIcon,
    HelpCenterIcon,
    RewardsIcon,
  },
  data() {
    return {
      SportBtnIcon,
      CasinoBtnIcon,
      ArrowIcon,
      mode: "casino",
      language: null,
      mobileToggle: false,
      tempBlock: false,
      collapsed: false,
      originals: [
        {
          icon: "/img/game/icon-mines.svg",
          url: "/mines",
        },
        {
          icon: "/img/game/icon-crash.svg",
          url: "/crash",
        },
        {
          icon: "/img/game/icon-dice.svg",
          url: "/dice",
        },
        {
          icon: "/img/game/icon-plinko.svg",
          url: "/plinko",
        },
        {
          icon: "/img/game/icon-keno.svg",
          url: "/keno",
        },
      ],
    };
  },
  //TODO: check which games are enabled
  created() {
    console.log();
    this.language = this.locale;
  },
  computed: {
    ...mapGetters(["authUser", "challengesData"]),
    // showOriginals() {
    //   return this.$route.path.startsWith("/casino/originals");
    // },
    tabs() {
      return [
        {
          name: "Casino",
          url: "",
          items: [
            {
              name: "Growbit Games",
              icon: OriginalsIcon,
              url: "/casino/originals",
            },
            {
              name: "Favorites",
              icon: HeartIcon,
              url: "/casino/slots?filter=favourite",
              items: null,
            },
            {
              name: "Slots",
              icon: SlotsIcon,
              url: "/casino/slots",
              items: null,
            },
            {
              name: "Popular",
              icon: PopularIcon,
              url: "/casino/slots?filter=popular",
              items: null,
            },
            {
              name: "New Games",
              icon: NewIcon,
              url: "/casino/slots?filter=new",
              items: null,
            },
            {
              name: "Live Games",
              icon: LiveIcon,
              url: "/casino/slots?filter=live",
              items: null,
            },
          ],
        },
        {
          name: "Earn More",
          url: "",
          items: [
            {
              name: "Races",
              icon: WeeklyRaceIcon,
              url: "/leaderboard",
            },
            {
              name: "Challenges",
              icon: DailyChallengesIcon,
              url: "/challenges",
              items: null,
              count: this.challengesData.active?.length,
            },
            {
              name: "Rewards",
              icon: RewardsIcon,
              url: "/rewards",
              items: null,
            },
          ],
        },
      ];
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
@import "@/assets/sass/variables";

.sidebar {
  width: 240px;
  &.collapsed {
    width: 65px;
  }
  .mode-switch {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;

    .casino,
    .sports {
      width: 100%;

      & > div {
        min-height: 40px;
        width: 100%;
        flex-grow: 1;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #161533;

        background-position: center;
        background-repeat: no-repeat;
        border-radius: 5px;

        span {
          font-weight: 800;
          font-size: 14px;

          text-align: center;
          text-transform: uppercase;

          color: #ffffff;

          text-shadow: 0px 3px 3px rgba(0, 0, 0, 0.5);
        }
      }
    }

    .sports > div {
    }

    .casino.active > div {
      background-color: #5b46bc;
    }
  }

  .mode-switch.collapsed {
    flex-direction: column;
    width: 100%;
    gap: 12px;
    flex-direction: column;
    height: fit-content;
    margin-left: 0;

    button {
      height: 45px;
    }

    div span {
      display: none;
    }
  }

  flex-shrink: 0;
  z-index: 99;
  transition: width ease 0.4s;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
  background: #0c0b1c;
  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }

  .hidden {
    display: none;
  }

  &.mobileToggle {
    display: block !important;
    width: 250px;
    opacity: 1;

    .fixed {
      padding: 18px 0;
      padding-bottom: 120px;
    }
  }

  .sidebar-header {
    height: $header-height;
    display: flex;
    align-items: center;
    align-self: flex-start;
    justify-content: flex-start;
    margin-right: auto;
    background: #111026;
    width: 100%;

    @media (max-width: 991px) {
      display: none !important;
    }

    .toggle {
      display: grid;
      place-content: center;
      margin-left: 10px;

      cursor: pointer;
      height: 40px;
      width: 40px;

      > img {
        height: 24px;
        width: 24px;
      }
    }

    &.collapsed {
      width: 100%;

      justify-content: center;

      .toggle {
        display: grid;
        margin-left: 0;
        place-content: center;
      }
    }
  }

  &.visible .fixed .sidebar-header {
    .logo {
      display: unset;
    }
  }
}

@media (max-width: 991px) {
  .sidebar {
    display: none;
  }
}

ol.navigation {
  border-right: 2px solid #121129;
  font-weight: 700;
  font-size: 1rem;
  padding: 0 15px 0 15px;

  &.collapsed {
    padding: 0 10px 0 10px;
  }
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  color: white;
  z-index: 10;
  margin-right: auto;
  gap: 12px;
  background: #0c0b1c;

  min-height: calc(100% - 75px);
  margin-left: 0;

  > div > a {
    width: 100%;
  }

  &.collapsed {
    width: fit-content;

    > div {
      width: fit-content;
    }
  }
}
</style>
