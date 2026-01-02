<template>
  <div class="keys-container">
    <ol>
      <li v-for="key in keys" :key="key.level" v-if="key.level <= 5">
        <!-- <img :src="`/img/rewards/key.png`" alt="reward key" /> -->
        <img :src="`/img/keys/${key.name.toLowerCase()}.png`" />
        <div class="key-info">
          <h2>{{ key.name }} Key</h2>
          <div class="progress-bar" v-if="authUser.user.stats.bet">
            <div
              class="progress"
              :style="{
                width: getLeveleProgress(key.level).percentage + '%',
              }"
            ></div>
          </div>
          <div class="prog-wager">
            {{ getLeveleProgress(key.level).progress }}
          </div>
        </div>

        <app-button
          :height="'37px'"
          :disabled="!canClaimKeyBtn(key.level)"
          :click="() => claimKey(key.name)"
        >
          <div class="claim">
            <span>Claim Key</span>
          </div>
        </app-button>
      </li>
    </ol>
  </div>
</template>

<script>
import Currency from "@/components/Currency.vue";
import RaceTimer from "@/components/RaceTimer.vue";
import AppButton from "@/components/AppButton.vue";
import { getUserLevel, getLevels, canClaimKey, levelProgress } from "@/utils";
import { mapActions, mapGetters } from "vuex";
export default {
  components: { Currency, RaceTimer, AppButton },
  data() {
    return {
      keys: [
        { level: 1, name: "Bronze" },
        { level: 2, name: "Silver" },
        { level: 3, name: "Gold" },
        { level: 4, name: "Sapphire" },
        { level: 5, name: "Emerald" },
        { level: 6, name: "Ruby" },
        { level: 7, name: "Diamond" },
        { level: 8, name: "Onyx" },
        { level: 9, name: "Opal" },
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
    getLeveleProgress(level) {
      return levelProgress(this.authUser?.user, level);
    },

    canClaimKeyBtn(level) {
      return canClaimKey(this.authUser?.user, level);
    },

    claimKey(level) {
      this.$router.push("/cases/" + level.toLowerCase());
    },
  },
};
</script>

<style scoped lang="scss">
.keys-container {
  height: 100%;
  width: 100%;
  ol {
    overflow: scroll;
    max-height: 307px;

    li {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      width: 100%;
      min-height: 80px;
      justify-content: flex-start;
      margin-bottom: 15px;

      &:last-of-type {
        margin-bottom: 0;
      }

      background: #111026;
      border: 1px solid #292950;
      border-radius: 8px;

      @media screen and (max-width: 991px) {
        padding: 5px 10px;
        overflow: scroll;
      }

      > img {
        height: 60px;
        width: auto;
        @media screen and (min-width: 400px) {
          margin-right: 10px;
        }

        @media screen and (max-width: 991px) {
          height: 50px;
        }
      }

      .key-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        max-width: 200px;
        gap: 3px;

        @media screen and (max-width: 991px) {
          max-width: 100px;
        }

        .progress-bar {
          width: 100%;
          background: #242630;
          height: 6px;

          border-radius: 5px;
          height: 10px;

          .progress {
            height: 100%;

            border-radius: 5px;
            background: #625498;
          }
        }

        h2 {
          text-wrap: nowrap;
          text-align: center;
          text-transform: capitalize;
          font-style: normal;
          font-weight: 800;
          font-size: 1.2rem;
          color: #eeeeee;
          text-wrap: wrap;
          margin-bottom: 5px;
        }

        .prog-wager {
          color: #564f80;
        }
      }

      button {
        margin-left: auto;
        width: 100%;
        width: 120px;
        flex-shrink: 0;

        @media screen and (max-width: 991px) {
          width: 115px;
        }

        .claim {
          display: flex;
          gap: 5px;
          align-items: center;

          span {
            text-wrap: nowrap;
            font-weight: 600;
            font-size: 1.29rem;
            color: #eeeeee;
            text-overflow: ellipsis;
            display: block;
            overflow: hidden;

            img {
              flex-shrink: 0;
            }

            @media screen and (max-width: 991px) {
              font-size: 1rem;
            }
          }
        }
      }
    }
  }
}
</style>
