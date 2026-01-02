<template>
  <div
    class="challenge-container"
    :class="`${challenge.colour} ${isClaimed ? 'claimed' : ''}`"
  >
    <div class="top-part">
      <div class="slot" :class="{ claimed: isClaimed }">
        <img
          @click="$router.push(`/${challenge.game}`)"
          v-if="isOriginal"
          :src="`/img/game/${challenge.game}.png`"
          alt=""
        />
        <GameListEntry
          v-else-if="gameObject"
          :challenge="true"
          :game="gameObject"
        ></GameListEntry>
      </div>
      <div class="right-part">
        <p :class="`${challenge.colour}`">{{ challenge.name }}</p>
        <p>{{ challenge.description }}</p>
        <div class="actions" v-if="!hideButtons">
          <router-link
            :to="(!this.isOriginal ? '/external/' : '/') + challenge.game"
            tag="button"
            >Play Game</router-link
          >
          <router-link to="/challenges" tag="button"
            >All Challenges</router-link
          >
        </div>
      </div>
    </div>
    <div class="reward">
      <div v-if="!isClaimed">
        <span class="purple">Claims left:</span>
        <span>{{ challenge.remainingClaims }}</span>
      </div>
      <div class="cl" v-else>CLAIMED</div>
      <div>
        <span class="purple">Reward:</span>
        {{ challenge.reward }}
        <img src="@/assets/images/mmo_coin.png" alt="icon" />
      </div>
    </div>
  </div>
</template>

<script>
import { isGameOriginal } from "@/utils";
import GameListEntry from "@/components/GameListEntry.vue";
import { mapGetters } from "vuex";
import RaceTimer from "@/components/RaceTimer.vue";
import TimerIcon from "@/assets/images/timer.svg?inline";

export default {
  components: { RaceTimer, GameListEntry, TimerIcon },
  props: ["challenge", "hideButtons"],
  computed: {
    ...mapGetters(["gameList", "authUser"]),
    isOriginal() {
      const name = this.challenge.game;
      return isGameOriginal(name);
    },
    isClaimed() {
      return (
        this.challenge.remainingClaims === 0 ||
        this.challenge.claimedBy.some(
          (u) => u.toString() === this?.authUser?.user?._id
        )
      );
    },
    gameObject() {
      if (this.isOriginal) {
        return null;
      }

      return this.gameList?.filter((g) => g.id === this.challenge.game)[0];
    },
  },
  created() {},
  data() {
    return {};
  },
  methods: {
    midnight() {
      const now = new Date();

      return new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0,
          0
        )
      ).toUTCString();
    },
  },
};
</script>

<style lang="scss" scoped>
.challenge-container {
  max-width: 540px;
  width: 100%;

  &.claimed {
    opacity: 0.6;
  }

  @media (max-width: 991px) {
    max-width: 100%;
  }

  background: var(--dark-blue-2);
  border-radius: 10px;

  padding: 15px 15px 0 15px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  height: 247px;

  .top-part {
    gap: 15px;
    @media screen and (min-width: 991px) {
      max-height: 175px;
    }
    padding-bottom: 15px;

    img,
    .slot {
      border-radius: 8px;
      max-height: 157px;
      width: 113px;
      flex-shrink: 0;
    }

    .slot > img {
      cursor: pointer;
    }

    .claimed {
      //filter: blur(1px);
      position: relative;
      //&:before {
      //  z-index: 1;
      //  border-radius: 8px;
      //  background: #19183e;
      //  opacity: 0.5;
      //  left: 0;
      //  top: 0;
      //  right: 0;
      //  bottom: 0;
      //  width: 100%;
      //  height: 100%;
      //  display: grid;
      //  place-content: center;
      //  position: absolute;
      //  content: "";
      //}
      &:after {
        pointer-events: none;
        z-index: 2;
        border-radius: 8px;
        font-weight: 900;
        font-size: 24px;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        transform: rotate(45deg);
        height: 100%;
        display: grid;
        place-content: center;
        position: absolute;
        content: "CLAIMED";
        color: white;
      }
    }
    display: flex;

    .right-part {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-height: 156px;

      p {
        font-style: normal;
        &:first-of-type {
          flex-shrink: 0;
          text-transform: uppercase;
          font-weight: 900;
          font-size: 1.29rem;
          text-wrap: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          color: #8b4cda;
          &.green {
            color: #71da4c;
          }

          &.blue {
            color: #4c8dda;
          }

          &.yellow {
            color: #daaa4c;
          }
        }

        &:nth-of-type(2) {
          font-weight: 400;
          font-size: 1rem;
          color: #ffffff;
          overflow: hidden;
          margin-bottom: 10px;
          max-height: 80px;

          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
      .actions {
        margin-top: auto;
        display: flex;
        gap: 10px;

        button {
          padding: 13px 15px;
          height: 46px;
          background: #5b46bc;
          border-radius: 8px;
          text-wrap: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          font-weight: 700;
          font-size: 1rem;

          &:first-of-type {
            @media screen and (max-width: 991px) {
              display: none;
            }
          }

          &:last-of-type {
            background: #22224a;
          }
        }
      }
    }
  }

  .reward {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 11px 0;
    width: 100%;
    height: 55px;
    border-top: 3px solid #22224a;

    font-style: normal;
    font-weight: 700;
    font-size: 1rem;
    color: #ffffff;

    > div {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cl {
      font-weight: 700;
      font-size: 14px;

      color: #b3b1f9;
    }

    .purple {
      font-weight: 500;
      font-size: 1rem;
      color: #616498;
    }
  }
}
</style>
