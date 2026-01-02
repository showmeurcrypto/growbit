<template>
  <div class="rakeback">
    <ol v-if="rakebackData.rakeback">
      <li v-for="r of rakebackData.rakeback">
        <img :src="`/img/rakeback/${r.type}.png`" alt="" />
        <div class="rackeback-info">
          <h2>{{ r.type }} reward</h2>
        </div>

        <app-button
          :height="'37px'"
          :disabled="(r.available ? r.available : 0.0) < 0.001"
          v-if="getNextClaim(r) <= new Date()"
          :click="() => claimRakeback(r.type, r.available)"
        >
          <div class="claim">
            <Currency></Currency>
            <span>{{
              getDisplayCurrencyAmountFormatted(r.available ? r.available : 0.0)
            }}</span>
          </div></app-button
        >

        <button class="timer-container" v-else disabled="true">
          <RaceTimer :end="getNextClaim(r).toUTCString()"></RaceTimer>
        </button>
      </li>
    </ol>
  </div>
</template>

<script>
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import { mapActions, mapGetters } from "vuex";
import RaceTimer from "@/components/RaceTimer.vue";
import AppButton from "@/components/AppButton.vue";
import TimerIcon from "@/assets/images/timer.svg";
export default {
  mixins: [currencyExchangeRatesMixin],
  components: { Currency, RaceTimer, AppButton },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["authUser", "rakebackData"]),
    levelInfo() {
      return getUserLevel(this.authUser?.user);
    },
  },
  methods: {
    ...mapActions(["rakebackSendClaimSocket", "notificationShow"]),
    getNextClaim(rakeback) {
      if (!rakeback.lastClaimed) return new Date(0);

      const today = new Date();
      const claimIntervals = {
        daily: this.getNextDayInMiliseconds(),
        weekly: this.getNextWeekInMiliseconds(),
        monthly: this.getNextMonthInMiliseconds(),
      };

      if (rakeback.type === "daily") {
        if (!this.isSameDay(new Date(rakeback.lastClaimed), today)) {
          return new Date(0);
        } else return new Date(claimIntervals["daily"]);
      }

      if (rakeback.type === "weekly") {
        if (!this.isSameWeek(new Date(rakeback.lastClaimed), today)) {
          return new Date(0);
        } else return new Date(claimIntervals["weekly"]);
      }

      if (rakeback.type === "monthly") {
        if (!this.isSameMonth(new Date(rakeback.lastClaimed), today)) {
          return new Date(0);
        } else return new Date(claimIntervals["monthly"]);
      }
    },
    claimRakeback(type, amount) {
      if (amount < 0.001) {
        this.notificationShow({
          type: "error",
          message: "You can't claim less than 0.001 DLS.",
        });
        return;
      }

      this.rakebackSendClaimSocket({ rakebackType: type });
    },

    getNextDayInMiliseconds() {
      const now = new Date();

      const nextDay = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0,
          0
        )
      );

      return nextDay.getTime();
    },

    getNextWeekInMiliseconds() {
      const now = new Date();
      const currentUTCDay = now.getUTCDay();

      //const daysToAdd = (7 - currentDayUTC + 1) % 7;
      const normalizedDay = currentUTCDay === 0 ? 7 : currentUTCDay;
      const daysUntilNextMonday = 8 - normalizedDay;

      const nextMonday = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + daysUntilNextMonday,
          0,
          0,
          0,
          0
        )
      );

      return nextMonday.getTime();
    },

    getNextMonthInMiliseconds() {
      const now = new Date();
      const nextMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)
      );

      return nextMonth;
    },

    isSameDay(date1, date2) {
      return (
        date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth() &&
        date1.getUTCDate() === date2.getUTCDate()
      );
    },

    isSameWeek(date1, date2) {
      return (
        date1.getUTCFullYear() === date2.getUTCFullYear() &&
        this.getWeekNumber(date1) === this.getWeekNumber(date2)
      );
    },

    isSameMonth(date1, date2) {
      return (
        date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth()
      );
    },

    // getWeekNumber(date) {
    //   const janFirst = new Date(date.getFullYear(), 0, 1);
    //   // Source: https://stackoverflow.com/a/27125580/3307678
    //   return Math.ceil(
    //     ((date.getTime() - janFirst.getTime()) / 86400000 +
    //       janFirst.getDay() +
    //       1) /
    //       7
    //   );
    // },
    getWeekNumber(date) {
      const d = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      );

      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);

      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

      const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

      return weekNo;
    },
  },
};
</script>

<style scoped lang="scss">
.rakeback {
  height: 100%;
  width: 100%;
  ol {
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
  }
}
</style>
