<template>
  <tr class="leaderboard-user-element">
    <td class="inner-pos">{{ winner.prize ? position : "" }}</td>
    <td class="inner-user">
      <span>
        {{ leaderboardGetUsername }}
      </span>
      <img
        v-if="getUserLevel(winner).level"
        :src="`/img/badges/small/level_${getUserLevel(winner).level}.png`"
      />
    </td>
    <td class="inner-wagered">
      <div class="wagered-content">
        <div class="content-value" v-if="winner !== null">
          <span>{{
            Math.round(+winner.points).toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          }}</span>
        </div>
      </div>
    </td>
    <td class="inner-prize">
      <div class="prize-content">
        <div class="content-value" v-if="winner !== null">
          {{ Math.round(+winner.prize) }}
        </div>
        <img src="@/assets/images/mmo_coin.png" alt="icon" />
      </div>
    </td>
  </tr>
</template>

<script>
import AvatarImage from "@/components/AvatarImage";
import { getUserLevel } from "@/utils";

export default {
  name: "LeaderboardUserElement",
  components: {
    AvatarImage,
  },
  props: ["position", "winner"],
  methods: {
    getUserLevel(user) {
      return getUserLevel(user?.user);
    },
  },
  computed: {
    leaderboardGetUsername() {
      let username = "Empty";

      if (this.winner?.user?.username) {
        username = this.winner.user.username;
      } else if (this.winner !== null && this.winner.user === null) {
        username = "Hidden";
      }

      return username;
    },
  },
};
</script>

<style scoped>
td {
  text-align: center;
  &:first-of-type {
    text-align: left;
    padding-left: 20px;
  }
}
.leaderboard-user-element {
  height: 50px;
  margin-top: 10px;
  color: #eeeeee;

  > * {
    font-weight: 700;
    font-size: 1.143rem;

    color: #eeeeee;
  }

  &:nth-of-type(odd) {
    td {
      background: #22224a;

      &:first-of-type {
        border-bottom-left-radius: 8px;
        border-top-left-radius: 8px;
      }

      /*      @media screen and (max-width: 991px) {
        &:nth-of-type(2) {
          border-bottom-left-radius: 8px;
          border-top-left-radius: 8px;
        }
      }*/

      &:last-of-type {
        border-bottom-right-radius: 8px;
        border-top-right-radius: 8px;
      }
    }
  }
}

.leaderboard-user-element .inner-user {
  span {
    padding-inline: 2px;
    /*    display: block;*/
    overflow: hidden;
    text-overflow: ellipsis;

    font-weight: 700;
    font-size: 1.143rem;

    color: #616498;
  }
  img {
    height: 18px;
    width: auto;
  }
}

.wagered-content,
.prize-content {
  justify-content: center;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
}

.prize-content {
  justify-content: flex-end;
  padding-right: 15px;
}
</style>
