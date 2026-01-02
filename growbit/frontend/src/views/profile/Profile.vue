<template>
  <div class="profile">
    <div class="sidebar">
      <div class="profile-info">
        <div class="logout-mobile" @click="logout">
          <img :src="LogoutIcon" />
        </div>

        <div class="avatar-container">
          <div class="avatar-wrapper">
            <AvatarImage :avatarNumber="authUser?.user?.avatar" />
          </div>

          <div class="right">
            <span>{{ authUser?.user?.username }}</span>

            <div class="level" v-if="levelInfo.level">
              <img :src="`/img/badges/level_${levelInfo.level}.png`" />
              <span>{{ levelInfo.name }}</span>
            </div>
          </div>
        </div>

        <div v-if="levelInfo" class="progress-data">
          {{ formatNumber(levelInfo.progress) }}/{{
            formatNumber(levelInfo.levelSize)
          }}
        </div>
        <div class="progress-bar" v-if="levelInfo">
          <div
            class="progress"
            style="height: 20px"
            :style="{
              width: (levelInfo.progress / levelInfo.levelSize) * 100 + '%',
            }"
          ></div>
        </div>
      </div>
      <div class="profile-nav">
        <ul>
          <li v-for="item in dropdown">
            <router-link :to="item.url" class="nav-link" aria-current="page">
              <img :src="item.iconCustom" />
              <span>{{ item.name }}</span>
            </router-link>
          </li>
          <li @click="logout">
            <a>
              <img class="logout-icon" :src="LogoutIcon" />
              <span>Log out</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="mobile-dropdown">
        <AppDropdown :on-select="() => {}" :items="dropdown"></AppDropdown>
      </div>
    </div>

    <div class="profile-content">
      <transition name="slide-fade" mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>

<script>
import ProfileIcon from "@/assets/images/profile_icon.svg";
import SettingsIcon from "@/assets/images/setting.svg";
import TransactionsIcon from "@/assets/images/transactions.svg";
import StatsIcon from "@/assets/images/stats_icon.svg";
import LogoutIcon from "@/assets/images/logout.svg";
import PrivacyIcon from "@/assets/images/privacy.svg";
import AffiliatesIcon from "@/assets/images/affiliates.svg";

import { mapActions, mapGetters } from "vuex";
import Avatar from "@/components/Avatar.vue";
import AppDropdown from "@/components/AppDropdown.vue";
import AvatarImage from "@/components/AvatarImage.vue";
import { getUserLevel } from "@/utils";

export default {
  name: "Profile",
  components: {
    AvatarImage,
    Avatar,
    AppDropdown,
  },
  metaInfo: {
    title: "Profile",
  },
  data() {
    return {
      LogoutIcon,
      dropdown: [
        {
          name: "Profile",
          url: "/profile",
          select: "info",
          iconCustom: ProfileIcon,
          public: true,
        },
        {
          name: "Stats",
          url: "/profile/stats",
          select: "transactions",
          iconCustom: StatsIcon,
        },
        {
          name: "Transactions",
          url: "/profile/transactions",
          select: "transactions",
          iconCustom: TransactionsIcon,
        },
        {
          name: "Affiliates",
          url: "/profile/affiliates",
          select: "affiliates",
          iconCustom: AffiliatesIcon,
        },
        {
          name: "Settings",
          url: "/profile/settings",
          select: "settings",
          iconCustom: SettingsIcon,
        },
        {
          name: "Privacy",
          url: "/profile/privacy",
          select: "privacy",
          iconCustom: PrivacyIcon,
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["authUser"]),
    levelInfo() {
      return getUserLevel(this.authUser?.user);
    },
  },
  methods: {
    ...mapActions(["authLogoutUser"]),
    logout() {
      this.authLogoutUser();
      this.$router.push("/");
    },
    formatNumber(num) {
      const rounded = Math.round(num);
      return rounded > 1000
        ? (rounded / 1000).toFixed(1).replace(".0", "") + "k"
        : rounded.toString();
    },
  },
};
</script>

<style lang="scss" scoped>
.profile {
  width: 100%;
  display: flex;
  padding: 40px 0;
  padding-inline: 10px;

  @media (min-width: 991px) {
    max-height: 800px;
  }

  .logout-icon {
    width: 24px;
    height: 24px;
  }

  .sidebar {
    display: flex;
    flex-direction: column;

    @media (min-width: 991px) {
      width: 100%;
      max-width: 285px;
    }

    .profile-info {
      position: relative;
      padding: 13px;
      background: var(--dark-blue);
      border: 4px solid #090c1d;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      height: fit-content;

      @media (min-width: 991px) {
        min-height: 165px;
      }

      @media (max-width: 991px) {
        align-items: flex-start;
      }

      .logout-mobile {
        position: absolute;
        right: 15px;
        top: 15px;
        display: grid;
        place-content: center;
        width: 40px;
        height: 40px;

        @media (min-width: 991px) {
          display: none;
        }
        background: #22224a;
        border: 4px solid #090c1d;
        border-radius: 8px;
      }

      .avatar-container {
        display: flex;
        gap: 15px;
        padding-left: 5px;

        .right {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          > span {
            font-style: normal;
            font-weight: 700;
            font-size: 24px;
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .level {
            display: flex;
            align-items: center;
            gap: 5px;
            justify-content: center;
            img {
              width: auto;
              height: 25px;
            }
            span {
              font-style: normal;
              font-weight: 500;
              font-size: 16px;
            }
          }
        }
        .avatar-wrapper {
          &::after {
            position: absolute;
            background: linear-gradient(to bottom, #191939, #32325a);
            content: "";
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            border-radius: 8px;

            z-index: -1;
            margin: -5px;
          }

          position: relative;
          background: #090c1d;

          /* Pfp */

          width: 65px;
          height: 65px;

          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          border-radius: 8px;

          /* Inside auto layout */
          flex: none;
          order: 0;
          flex-grow: 0;

          cursor: pointer;
          display: grid;
          place-content: center;

          filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));

          > div {
            border-radius: 6px;
          }
        }
      }

      span {
        margin-top: 5px;

        font-style: normal;
        font-weight: 700;
        font-size: 1.714rem;
        color: #eeeeee;
      }

      .progress-data {
        margin-top: 10px;
        margin-bottom: 5px;
        width: 100%;
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        text-align: right;

        color: #3a3a65;
      }

      .progress-bar {
        width: 100%;
        background: #22224a;
        border-radius: 5px;
        .progress {
          border-radius: 5px;
          background: #090c1d;
        }
      }
    }

    .mobile-dropdown {
      padding-top: 15px;
      @media (min-width: 991px) {
        display: none;
      }
    }

    .profile-nav {
      display: flex;
      flex-direction: column;
      height: 400px;

      background: var(--dark-blue);
      border: 4px solid #090c1d;

      margin-top: 15px;
      border-radius: 10px;
      padding: 10px 15px 10px 10px;

      @media (max-width: 991px) {
        display: none;
      }

      ul {
        list-style-type: none;
        padding: 0;
        margin: 5px;
        height: 100%;
        display: flex;
        flex-direction: column;

        li:last-of-type {
          margin-top: auto;
        }

        li a {
          padding: 10px;
          margin-bottom: 5px;
          font-size: 1.143rem;
          cursor: pointer;
          display: flex;
          gap: 10px;
          align-items: center;

          i {
            padding-right: 10px;
          }

          &.nav-link {
            transition: all 0.3s ease;

            &:first-of-type {
              margin-top: 0;
            }
            &:hover {
              color: #fff;
            }

            &.router-link-exact-active {
              img {
                filter: brightness(1) saturate(2.2) hue-rotate(10deg);
              }
            }
          }
        }
      }
    }
  }
}

.profile {
  max-width: 1100px;
  margin-inline: auto;
}

.profile .profile-content {
  width: 100%;
  > div {
    width: 100%;
  }
  flex-shrink: 0;
  @media only screen and (min-width: 991px) {
    max-width: 800px;
  }
  > div {
    height: 100%;
  }
  padding-left: 15px;
}

.profile .profile-content .slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.profile .profile-content .slide-fade-enter {
  opacity: 0;
}

@media only screen and (max-width: 991px) {
  .profile {
    flex-direction: column;
  }

  .profile .profile-content {
    margin-inline: auto;
    width: 100%;
    margin-top: 20px;
    padding-left: 0;
  }
}
</style>
