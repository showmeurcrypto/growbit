<template>
  <div class="rewards-page">
    <div class="top-row">
      <div class="column middle">
        <div
          class="level"
          v-if="levelInfo"
          :class="{ unranked: !levelInfo.level }"
        >
          <img :src="`/img/badges/level_${levelInfo.level || 1}.png`" />
          <!-- <span>{{ levelInfo.name }}</span> -->
        </div>

        <span class="username">{{ authUser?.user?.username }}</span>

        <div class="progress-container">
          <div v-if="levelInfo" class="progress-data">
            <span>Your Progress</span>
            <span
              >{{
                ((levelInfo.progress / levelInfo.levelSize) * 100).toFixed(2)
              }}%</span
            >
          </div>
          <div class="progress-bar" v-if="levelInfo">
            <div
              class="progress"
              :style="{
                width: (levelInfo.progress / levelInfo.levelSize) * 100 + '%',
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="top-row">
      <div class="column left">
        <div class="rakeback-container">
          <span>Claim Rakeback</span>

          <div class="rakeback-wrapper">
            <Rakeback />
          </div>
        </div>
      </div>

      <div class="column right">
        <div class="rakeback-container">
          <span>Claim Keys</span>
          <div class="rakeback-wrapper">
            <Keys />
          </div>
        </div>
      </div>
    </div>

    <div class="mid-row">
      <div class="daily-case">
        <div v-if="!linkDiscordToken" class="title">Daily case</div>

        <div v-if="!linkDiscordToken" class="subtitle">
          Open your free Daily Case and get a surprise reward every day!
        </div>

        <div
          v-if="!linkDiscordToken"
          :style="{ marginTop: '10px' }"
          class="line"
        ></div>

        <div class="case">
          <img :src="`/img/cases/cases/dailycase.png`" alt="" />
          <div class="rackeback-info">
            <h2>Daily case</h2>
          </div>

          <app-button
            :height="'37px'"
            v-if="canOpenDaily"
            :disabled="!!linkDiscordToken"
            :click="() => openDaily()"
          >
            <div class="claim">Open</div></app-button
          >

          <button class="timer-container" v-else disabled="true">
            <RaceTimer :end="midnight"></RaceTimer>
          </button>
        </div>

        <div v-if="linkDiscordToken" class="line"></div>

        <div v-if="linkDiscordToken" class="subtitle code-info">
          Generate code and verify it in our
          <a href="https://discord.gg/growbit">discord</a>
        </div>

        <div v-if="linkDiscordToken" class="code">
          {{ linkDiscordToken }}

          <button v-on:click="copyToken(linkDiscordToken)" class="button-copy">
            <CopyIcon></CopyIcon>
          </button>
        </div>
      </div>

      <div class="promo">
        <div class="title">Claim promocode</div>
        <div class="subtitle">Got a pomocode? Enter it here!</div>

        <div class="line"></div>
        <div class="subtitle code">Code</div>

        <div class="input-wrapper">
          <input placeholder="Enter Promocode..." v-model="promocode" />
          <app-button :click="enterPromocode"> Claim </app-button>
        </div>
      </div>
    </div>

    <div class="claimed-rewards">
      <h3>Claimed Rewards</h3>
      <div class="reward-grid">
        <div class="stat">
          <div>Daily</div>
          <div class="total-wager">
            <span>{{
              getDisplayCurrencyAmountFormatted(
                authUser.user.rakeback.daily.earned
              )
            }}</span>
            <Currency></Currency>
          </div>
        </div>
        <div class="stat">
          <div>Monthly</div>
          <div class="total-wager">
            <span>{{
              getDisplayCurrencyAmountFormatted(
                authUser.user.rakeback.monthly.earned
              )
            }}</span>
            <Currency></Currency>
          </div>
        </div>
        <div class="stat">
          <div>Weekly</div>
          <div class="total-wager">
            <span>{{
              getDisplayCurrencyAmountFormatted(
                authUser.user.rakeback.weekly.earned
              )
            }}</span>
            <Currency></Currency>
          </div>
        </div>
        <div class="stat">
          <div>Total</div>
          <div class="total-wager">
            <span>{{
              getDisplayCurrencyAmountFormatted(
                authUser.user.rakeback.daily.earned +
                  authUser.user.rakeback.weekly.earned +
                  authUser.user.rakeback.monthly.earned
              )
            }}</span>
            <Currency></Currency>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import { getUserLevel, getLevels } from "@/utils";
import { mapActions, mapGetters } from "vuex";
import Rakeback from "@/components/Rakeback.vue";
import Keys from "@/components/Keys.vue";
import CopyIcon from "@/assets/images/copy.svg?inline";
import RaceTimer from "@/components/RaceTimer.vue";

import AppButton from "@/components/AppButton.vue";
export default {
  mixins: [currencyExchangeRatesMixin],
  components: { Currency, AppButton, Rakeback, Keys, CopyIcon, RaceTimer },
  data() {
    return {
      vipRanks: getLevels(),
      promocode: null,
    };
  },
  computed: {
    ...mapGetters(["authUser", "rakebackData"]),
    levelInfo() {
      const info = getUserLevel(this.authUser?.user);

      info.level = 0;
      return info;
    },
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

    canOpenDaily() {
      const lastClaim = this.authUser.user.rewards?.dailyCaseLastClaimed;

      if (lastClaim) {
        const now = new Date();
        const nowGMT = new Date(now.toISOString().split("T")[0]);
        const lastClaimDate = new Date(
          new Date(lastClaim).toISOString().split("T")[0]
        );

        if (lastClaim && lastClaimDate.getTime() === nowGMT.getTime()) {
          return false;
        }
      }

      return true;
    },
    linkDiscordToken() {
      return this.authUser?.user?.discordToken;
    },
  },
  methods: {
    ...mapActions([
      "rakebackSendClaimSocket",
      "notificationShow",
      "modalsSetShow",
      "modalsSetData",
    ]),
    copyToken() {
      const el = document.createElement("textarea");
      el.value = this.linkDiscordToken;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);

      this.notificationShow({
        type: "success",
        message: "Copied to your clipboard.",
      });
    },
    enterPromocode() {
      if (this.promocode === null || this.promocode.trim() === "") {
        this.notificationShow({
          type: "error",
          message: "Your entered code is invalid.",
        });
        return;
      }
      this.modalsSetData({
        typeCaptcha: "promoClaim",
        data: { code: this.promocode },
      });
      this.modalsSetShow("Captcha");
    },
    openDaily() {
      this.$router.push("/cases/daily");
    },
    getLevelClass(name) {
      return {
        "bg-bronze": name === "Bronze",
        "bg-silver": name === "Silver",
        "bg-gold": name === "Gold",
        "bg-sapphire": name === "Sapphire",
        "bg-emerald": name === "Emerald",
        "bg-ruby": name === "Ruby",
        "bg-diamond": name === "Diamond",
        "bg-onyx": name === "Onyx",
        "bg-opal": name === "Opal",
      };
    },
  },
};
</script>

<style scoped lang="scss">
img.currency {
  height: 20px;
  width: 20px;
}
.rewards-page {
  margin-top: 40px;
  padding-bottom: 30px;

  margin-inline: auto;
  max-width: 1120px;
  padding-inline: 10px;
  @media screen and (max-width: 991px) {
    margin-top: 20px;
    padding-inline: 8px;
  }
  display: flex;
  flex-direction: column;

  .promo {
    padding: 15px;
    display: flex;
    flex-direction: column;

    width: 100%;
    height: 200px;

    background: #161533;
    border-radius: 5px;
    margin-bottom: 15px;

    .title {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;

      color: #ffffff;
      margin-bottom: 10px;
    }

    .subtitle {
      font-family: "Excon";
      font-style: normal;
      font-weight: 700;
      font-size: 14px;

      color: #93959f;
    }

    .line {
      width: 100%;
      height: 0px;
      margin-top: 17px;

      border: 2px solid #292950;
    }

    .code {
      margin-top: auto;
      margin-bottom: 5px;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-style: normal;
      font-weight: 800;
      font-size: 14px;
      padding: 8px 10px 4px 10px;
      display: flex;
      align-items: center;

      width: 100%;

      background: #201f43;
      border: 2px solid #292950;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.15);
      border-radius: 5px;
    }
  }

  .daily-case {
    padding: 15px;
    display: flex;
    flex-direction: column;

    width: 100%;
    height: 200px;

    background: #161533;
    border-radius: 5px;
    margin-bottom: 10px;

    .title {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;

      color: #ffffff;
      margin-bottom: 10px;
    }

    .subtitle {
      font-family: "Excon";
      font-style: normal;
      font-weight: 700;
      font-size: 14px;

      color: #93959f;
    }

    .line {
      width: 100%;
      height: 0px;
      margin-top: 5px;

      border: 2px solid #292950;
    }

    .code-info {
      margin-top: 10px;
      margin-bottom: 5px;
    }

    .case {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;
      justify-content: flex-start;
      margin-bottom: 15px;

      .claim {
        text-wrap: nowrap;
        padding-inline: 5px;
      }

      &:last-of-type {
        margin-bottom: 0;
      }

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

      .rackeback-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        h2 {
          text-wrap: nowrap;
          text-align: center;
          text-transform: capitalize;
          font-style: normal;
          font-weight: 700;
          font-size: 1rem;
          color: #eeeeee;
          text-wrap: wrap;
        }
      }

      button {
        margin-left: auto;
        width: 100%;
        width: fit-content;
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

      button.timer-container {
        height: 45px;

        background: red;
        border-radius: 8px;
        padding-inline: 10px;

        background: #191939;
        overflow: hidden;
        text-overflow: hidden;

        span {
          text-wrap: nowrap;
          font-weight: 600;
          font-size: 1.143rem;
          color: #eeeeee;
          text-overflow: ellipsis;
          display: block;
          overflow: hidden;

          @media screen and (max-width: 991px) {
            font-size: 1rem;
          }
        }
      }
    }

    .code {
      margin-top: 5px;
      font-style: normal;
      font-weight: 800;
      font-size: 14px;
      padding-inline: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #24ae59;

      width: 100%;

      height: 45px;

      background: #201f43;
      border: 2px solid #292950;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.15);
      border-radius: 5px;

      .button-copy {
        margin-top: 5px;
        background: transparent;
      }
    }
  }

  .rakeback-container {
    display: flex;
    flex-direction: column;
    padding: 10px;

    background: #292950;
    border-radius: 8px;

    span {
      font-weight: 800;
      font-size: 1.3rem;

      color: #eeeeee;
      margin-bottom: 10px;
    }

    .rakeback-wrapper {
      height: 100%;
      padding: 10px;
      display: flex;
      place-content: center;
      background: #0e0d1f;
      border-radius: 8px;
    }
  }

  .mid-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    @media screen and (max-width: 991px) {
      grid-template-columns: 1fr;
    }
  }

  .top-row {
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 15px;

    @media screen and (max-width: 991px) {
      padding: 5px;
    }

    gap: 10px;
    background: #161533;
    flex-wrap: wrap;
  }

  h3.ranks-title {
    font-size: 1.7rem;
    font-weight: 700;
    color: #eeeeee;

    text-align: center;
    margin: 35px 0 15px 0;
  }

  .rank-progress-wrapper {
    overflow: scroll;

    .rank-progress {
      min-width: 1000px;
      width: 100%;
      gap: 5px;
      display: flex;
      align-items: center;
      margin-bottom: 25px;

      .progress-bar {
        width: 100%;
        background: #242630;

        border-radius: 5px;
        height: 10px;

        .progress {
          border-radius: 5px;
          background: #625498;
        }
      }

      .rank {
        flex-shrink: 0;
        display: grid;
        place-content: center;
        width: 50px;
        height: 50px;

        background: #161533;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 50px;

        img {
          height: 25px;
          width: 25px;
        }
      }
    }
  }
}

.column {
  flex: 1;
}

.middle {
  background: #0e0d1f;
  border: 2px solid #292950;
  border-radius: 8px;
  padding: 25px 15px 15px 15px;

  @media (max-width: 991px) {
    padding: 25px 8px 8px 8px;
  }

  justify-content: space-between;
  display: flex;
  align-items: center;
  flex-direction: column;
  .level {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 5px;
    justify-content: center;

    &.unranked {
      opacity: 0.2;
      filter: grayscale(100%);
    }
    img {
      width: auto;
      height: 170px;

      @media (max-width: 991px) {
        height: 100px;
      }
    }
    span {
      font-weight: 700;
      font-size: 1.1rem;

      color: #b4a6e2;
    }
  }

  .username {
    margin-top: 20px;
    font-size: 1.7rem;
    font-weight: 900;
    margin-bottom: 25px;
  }

  .progress-container {
    width: 100%;
    background: #292950;
    border-radius: 8px;
    padding: 12px 17px;

    .progress-data {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      span {
        &::first-of-type {
          font-weight: 700;
          font-size: 1rem;
          color: white;
        }
        &::last-of-type {
          font-weight: 600;
          font-size: 1rem;

          color: #93959f;
        }
      }
    }

    .progress-bar {
      width: 100%;
      background: #242630;

      border-radius: 5px;
      height: 10px;

      .progress {
        border-radius: 5px;
        background: #625498;
      }
    }
  }
}
.left,
.middle,
.right {
  display: flex;
  flex-direction: column;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
}

.progress-bar div {
  height: 100%;
  background-color: #007bff;
}

.claimed-rewards {
  h3 {
    font-size: 1.7rem;
    font-weight: 700;
    color: #eeeeee;
    margin-bottom: 15px;
  }
}

.reward-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 991px) {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    padding: 10px 12px;

    background: #22224a;
    border-radius: 5px;

    .total-wager {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      flex-wrap: nowrap;
      span {
        font-size: 1.7rem;
        font-weight: 700;
        color: #eeeeee;
      }
    }
    div:first-child {
      font-weight: 700;
      font-size: 0.9rem;
      color: #564f80;
    }
  }
}

.vip-ranks {
  margin-bottom: 50px;

  .levels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  .level-box {
    padding: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;

    background: #161533;
    border-radius: 10px;

    .range {
      font-weight: 800;
      font-size: 1.5rem;
      text-wrap: nowrap;
      flex-wrap: nowrap;
      gap: 5px;
      display: flex;
      align-items: center;

      color: #ffffff;
    }

    .info {
      display: flex;
      flex-direction: row;

      .level {
        margin-left: 10px;
        margin-top: 5px;
      }

      .level > img {
        height: 30px;
        width: 30px;
      }

      .name {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 6px 10px;

        background: #625498;
        border-radius: 3px;

        font-size: 18px;
        margin-bottom: 10px;

        &.bronze {
          background-color: #916051;
        }
        &.silver {
          background-color: #566d98;
        }
        &.gold {
          background-color: #da8924;
        }
        &.sapphire {
          background-color: #1069d2;
        }
        &.emerald {
          background-color: #007651;
        }
        &.ruby {
          background-color: #e0115f;
        }
        &.diamond {
          background-color: #b9f2ff;
          color: #000;
        }
        &.onyx {
          background-color: #353839;
        }
        &.opal {
          background-color: #332f57;
        }
      }
    }
  }
}
</style>
