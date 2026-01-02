<template>
  <div
    class="leaderboard-podium-element"
    :class="{
      first: position === '#1',
      second: position === '#2',
      third: position === '#3',
    }"
  >
    <img v-if="position === '#2'" class="badge" :src="Diamond" />
    <img v-if="position === '#1'" class="badge" :src="Gold" />
    <img v-if="position === '#3'" class="badge" :src="Bronze" />

    <div class="top">
      <div class="user-avatar">
        <AvatarImage :avatarNumber="winner?.user?.avatar || 0"></AvatarImage>
      </div>

      <div class="name">
        <span> {{ leaderboardGetUsername }} </span>
        <img
          v-if="getUserLevel(winner).level"
          :src="`/img/badges/small/level_${getUserLevel(winner).level}.png`"
        />
      </div>
      <div class="wagered">
        {{
          Math.round(+winner?.points || "0").toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        }}
        Points
      </div>
    </div>

    <div class="bottom">
      {{ Math.round(+winner?.prize || "0") }}<img :src="TokenIcon" />
    </div>
  </div>
</template>

<script>
import TokenIcon from "@/assets/images/mmo_coin.png";
import Diamond from "@/assets/images/diamond.svg";
import Bronze from "@/assets/images/bronze.svg";
import Gold from "@/assets/images/gold.svg";

import AvatarImage from "@/components/AvatarImage.vue";
import { getUserLevel } from "@/utils";
//import { mapGetters, mapActions } from "vuex";

export default {
  name: "LeaderboardPodiumElement",
  components: { AvatarImage },
  data() {
    return {
      TokenIcon,
      Diamond,
      Gold,
      Bronze,
    };
  },
  props: ["position", "winner"],
  methods: {
    //    ...mapActions(["modalsSetShow", "modalsSetData", "generalSetUserInfoData"]),
    getUserLevel(user) {
      return getUserLevel(user?.user);
    },
    // openUserModal(user) {
    //   this.generalSetUserInfoData(user);
    //   this.modalsSetShow("ChatUser");
    // }
  },
  computed: {
    leaderboardGetUsername() {
      let username = "Empty";

      if (
        this.winner !== null &&
        this.winner?.user !== undefined &&
        this.winner?.user !== null
      ) {
        username = this.winner.user.username;
      } else if (this.winner !== null && this.winner?.user === null) {
        username = "Hidden";
      }

      return username;
    },
  },
};
</script>

<style scoped>
.leaderboard-podium-element {
  position: relative;
  overflow: hidden;

  margin: 0 auto;
  width: 350px;
  height: 200px;
  background: #282746;
  border: 3px solid #5c788d;
  border-radius: 10px;
  display: flex;
  flex-direction: column;

  &.first {
    border: 3px solid #d7a95f;
    .bottom {
      background: #d7a95f;
    }
  }
  &.third {
    border: 3px solid #7b5f51;
    .bottom {
      background: #7b5f51;
    }
  }

  .badge {
    position: absolute;
    top: 20px;
    right: 20px;
    height: 50px;
    width: 50px;
  }

  .user-avatar {
    /*    width: 60px;
    height: 60px;
    border: 4px solid #1f1e3e;
    border-radius: 50%;
    margin-bottom: 7px;*/
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

    margin-bottom: 7px;

    /* Pfp */

    width: 50px;
    height: 50px;

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

  .name {
    font-weight: 900;
    font-size: 1.143rem;
    color: #eeeeee;

    img {
      height: 18px;
      width: auto;
    }
  }

  .wagered {
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 700;
    font-size: 1rem;

    color: #eeeeee;
  }

  .top {
    padding: 20px 20px 5px 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .bottom {
    margin-top: auto;

    height: 54px;

    background: #5c788d;

    width: 100%;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.143rem;
    color: var(--dark-blue-2);
    display: flex;
    gap: 5px;
  }
}
</style>
