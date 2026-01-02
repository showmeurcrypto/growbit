<template>
  <nav class="mobile-menu">
    <div
      class="control"
      :class="{ active: menuOpened === 'menu' }"
      @click="open('menu')"
    >
      <MenuIcon></MenuIcon>
    </div>
    <div
      class="control"
      :class="{ active: this.generalChatMobile }"
      @click="chatClick()"
    >
      <ChatIcon></ChatIcon>
    </div>
    <div
      class="control"
      :class="{ active: this.supportMobile }"
      @click="supportClick()"
    >
      <SupportIcon></SupportIcon>
    </div>

    <div
      class="control"
      :class="{ active: menuOpened === 'events' }"
      @click="open('events')"
    >
      <EventsIcon2></EventsIcon2>
    </div>
    <div
      class="control"
      :class="{ active: isActive('/profile') }"
      @click="handleMenuClick('/profile')"
    >
      <UserIcon></UserIcon>
    </div>
    <vue-bottom-sheet-vue2
      @closed="handleBottomSheetClose()"
      ref="myBottomSheet"
      :max-width="991"
      custom-class="my-modal"
      :z-index="-1"
    >
      <div class="mode-switch">
        <button
          class="casino active"
          :key="'casino'"
          style="text-decoration: none"
        >
          <div>
            <span>Casino</span>
          </div>
        </button>

        <button
          class="sports"
          disabled="true"
          :key="'sports'"
          style="text-decoration: none"
        >
          <div>
            <span>Sports</span>
          </div>
        </button>
      </div>
      <ol v-if="this.menuOpened === 'menu'" class="navigation">
        <div v-for="item in tabs" class="parent">
          <li class="item">
            <span>{{ item.name }}</span>
          </li>
          <ol v-if="item.items" v-for="it in item.items">
            <router-link
              tag="li"
              :to="it.url"
              class="item"
              @click.native="close()"
            >
              <img :src="it.icon" alt="" />
              <span>{{ it.name }}</span>
            </router-link>
          </ol>
        </div>
      </ol>
      <ol v-else class="navigation">
        <div v-for="item in events" class="parent">
          <ol v-if="item.items" v-for="it in item.items">
            <router-link
              tag="li"
              :to="it.url"
              class="item"
              @click.native="close()"
            >
              <img :src="it.icon" alt="" />
              <span>{{ it.name }}</span>
            </router-link>
          </ol>
        </div>
      </ol>
    </vue-bottom-sheet-vue2>
  </nav>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import VueBottomSheetVue2 from "@webzlodimir/vue-bottom-sheet-vue2";
import HeartIcon from "@/assets/images/heart_full.svg";

import OriginalsIcon from "@/assets/images/originals_icon.svg";
import EventsIcon from "@/assets/images/star.svg";
import SlotsIcon from "@/assets/images/slots.svg";
import CasinoIcon from "@/assets/images/casino.svg";
import DailyChallengesIcon from "@/assets/images/daily_challenge.svg";
import WeeklyRaceIcon from "@/assets/images/weekly_race.svg";
import SidebarItem from "@/components/sidebar/SidebarItem.vue";
import PopularIcon from "@/assets/images/popular.svg";
import NewIcon from "@/assets/images/new.svg";
import LiveIcon from "@/assets/images/live.svg";

import MenuIcon from "@/assets/images/menu.svg?inline";
import SupportIcon from "@/assets/images/phone.svg?inline";
import UserIcon from "@/assets/images/User_fill.svg?inline";
import ChatIcon from "@/assets/images/chat.svg?inline";
import EventsIcon2 from "@/assets/images/challenges.svg?inline";
import RewardsIcon from "@/assets/images/gift_bold.svg";

export default {
  components: {
    SidebarItem,
    VueBottomSheetVue2,
    SupportIcon,
    UserIcon,
    ChatIcon,
    EventsIcon2,
    MenuIcon,
    RewardsIcon,
  },
  data() {
    return {
      menuOpened: null,
      tabs: [
        {
          name: "Casino",
          url: "",
          icon: CasinoIcon,
          items: [
            {
              name: "Growbit Originals",
              icon: OriginalsIcon,
              url: "/casino/originals",
            },
            {
              name: "Slots",
              icon: SlotsIcon,
              url: "/casino/slots",
              items: null,
            },
            {
              name: "Favourite",
              icon: HeartIcon,
              url: "/casino/slots?filter=favourite",
              items: null,
            },
            {
              name: "Popular",
              icon: PopularIcon,
              url: "/casino/slots?filter=popular",
              items: null,
            },
            {
              name: "New",
              icon: NewIcon,
              url: "/casino/slots?filter=new",
              items: null,
            },
            {
              name: "Live",
              icon: LiveIcon,
              url: "/casino/slots?filter=live",
              items: null,
            },
          ],
        },
        {
          name: "Earn More",
          url: "",
          icon: EventsIcon,
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
            },
            {
              name: "Rewards",
              icon: RewardsIcon,
              url: "/rewards",
              items: null,
            },
          ],
        },
      ],
      events: [
        {
          name: "Earn More",
          url: "",
          icon: EventsIcon,
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
            },
          ],
        },
      ],
    };
  },

  created() {},
  methods: {
    ...mapActions([
      "generalSetChatMobile",
      "modalsSetShow",
      "generalSetSupportMobile",
    ]),
    chatClick() {
      this.modalsSetShow(null);
      this.close();
      this.generalSetChatMobile(!this.generalChatMobile);
    },
    supportClick() {
      this.modalsSetShow(null);
      this.close();
      if (!this.authUser?.user) {
        this.modalsSetShow("Login");
        return;
      }
      this.generalSetSupportMobile(!this.supportMobile);
    },
    isActive(path) {
      return this.$route.path.startsWith(path);
    },
    open(whatToOpen) {
      if (this.menuOpened === whatToOpen) {
        this.close();
      } else {
        this.menuOpened = whatToOpen;
        this.$refs.myBottomSheet.open();
      }
    },
    handleBottomSheetClose() {
      this.menuOpened = null;
    },
    close() {
      this.modalsSetShow(null);
      this.menuOpened = null;
      this.$refs.myBottomSheet.close();
    },
    handleMenuClick(url) {
      this.modalsSetShow(null);
      this.close();
      this.generalSetChatMobile(false);

      if (url === "/profile") {
        if (!this.authUser?.user) {
          this.modalsSetShow("Login");
          return;
        }
      }

      if (url !== this.$route.path) {
        this.$router.push(url);
      } else if (url === this.$route.path) {
        this.$router.push("/");
      }
    },
  },
  computed: {
    ...mapGetters(["authUser", "generalChatMobile", "supportMobile"]),
  },
};
</script>

<style lang="scss">
.mobile-menu {
  .mode-switch {
    padding-inline: 16px;
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

  .my-modal {
    ol.navigation {
      min-height: 600px;
      font-weight: bold;
      font-size: 1.143rem;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      color: white;
      z-index: 10;
      margin-right: auto;
      gap: 8px;

      margin-left: 0;

      > div > a {
        width: 100%;
      }

      .parent {
        width: 100%;

        background: #22224a;
        border-radius: 8px;
        padding-bottom: 5px;

        > li span {
          text-transform: uppercase;
        }

        .item {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 10px 15px;
          width: 100%;
          cursor: pointer;

          .right {
            margin-left: auto;
          }
          &:not(.router-link-exact-active) {
            > img {
              filter: invert(41%) sepia(9%) saturate(2266%) hue-rotate(199deg)
                brightness(93%) contrast(83%);
            }
          }

          &.router-link-exact-active {
            > img {
              filter: invert(65%) sepia(82%) saturate(2341%) hue-rotate(232deg)
                brightness(83%) contrast(98%);
            }
          }
        }

        > li {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 7px;

          height: 48px;

          background: #22224a;
          border-radius: 8px;
        }
      }
    }

    background: #090c1d !important;

    > main {
      background: #090c1d !important;
    }

    > header {
      border-bottom: 1px solid#1E1F44;
      box-shadow: none;
    }
  }

  display: flex;

  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  z-index: 39000;
  align-items: center;
  user-select: none;
  justify-content: space-between;
  height: 65px;
  background: #090c1d;
  border-radius: 15px 15px 0px 0px;

  .control {
    text-align: center;
    cursor: pointer;
    opacity: 1;
    transition: opacity 0.3s ease;
    padding: 18px;
    position: relative;
    min-width: 65px;
    display: grid;
    place-content: center;

    svg {
      path,
      circle,
      ellipse {
        fill: #616498;
        stroke: #616498;
      }
    }

    div {
      font-weight: 300;
    }

    &.active {
      svg {
        path,
        circle,
        ellipse {
          fill: #f6be2c;
          stroke: #f6be2c;
        }
      }
    }
  }

  @media screen and (min-width: 991px) {
    display: none;
  }
}
</style>
