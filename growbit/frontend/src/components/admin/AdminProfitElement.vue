<template>
  <div class="admin-profit-element">
    <transition name="fade" mode="out-in">
      <div
        v-if="adminStatsData.data === null || adminStatsData.loading === true"
        class="element-loading"
        key="loading"
      >
        <div class="element-loading"></div>
      </div>
      <div v-else class="element-content" key="content">
        <div class="element-title">{{ adminGetTitle }}</div>
        <div class="element-date">{{ adminGetDate }}</div>
        <div class="stat-row">
          <span>Wager</span>

          <span> {{ Math.round(getDisplayCurrencyAmount(stats.wager)) }} </span>
          <Currency></Currency>
        </div>
        <div class="stat-row">
          <span>Won</span>
          <span> {{ Math.round(getDisplayCurrencyAmount(stats.won)) }} </span>
          <Currency></Currency>
        </div>
        <div
          class="stat-row coloured"
          :class="{ red: stats.won > stats.wager }"
        >
          <span>
            {{ Math.round(getDisplayCurrencyAmount(stats.wager - stats.won)) }}
          </span>
        </div>
        <div class="stat-row border">
          <span>Deposit</span>
          <span>
            {{ Math.round(getDisplayCurrencyAmount(stats.deposit)) }}
          </span>
          <Currency></Currency>
        </div>
        <div class="stat-row">
          <span>Withdraw</span>
          <span>
            {{ Math.round(getDisplayCurrencyAmount(stats.withdraw)) }}
          </span>
          <Currency></Currency>
        </div>
        <div
          class="stat-row coloured"
          :class="{ red: stats.deposit < stats.withdraw }"
        >
          <span>
            {{
              Math.round(
                getDisplayCurrencyAmount(stats.deposit - stats.withdraw)
              )
            }}
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Game</th>
              <th>Bet</th>
              <th>Won</th>
              <th>RTP (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(stats, game) in stats.games" :key="game">
              <td>{{ game }}</td>
              <td>{{ Math.round(getDisplayCurrencyAmount(stats.wager)) }}</td>
              <td>{{ Math.round(getDisplayCurrencyAmount(stats.won)) }}</td>
              <td>
                <span :class="{ red: stats.won > stats.wager }"
                  >{{ calculateRTP(stats.wager, stats.won) }}%</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import Currency from "@/components/Currency.vue";

export default {
  name: "AdminProfitElement",
  components: { Currency },
  props: ["type", "stats"],
  mixins: [currencyExchangeRatesMixin],
  methods: {
    calculateRTP(bet, won) {
      return bet > 0 ? ((won / bet) * 100).toFixed(2) : 0;
    },
  },
  computed: {
    ...mapGetters(["adminStatsData"]),

    adminGetTitle() {
      return this.type.toUpperCase();
    },
    adminGetDate() {
      if (this.type === "overall") {
        return "";
      }

      let range = new Date(this.stats.start).toLocaleDateString();

      if (this.type !== "day") {
        range =
          new Date(this.stats.start).toLocaleDateString() +
          " - " +
          new Date(new Date()).toLocaleDateString();
      }

      return range;
    },
  },
};
</script>

<style scoped>
.admin-profit-element {
  width: 100%;

  border-radius: 15px;
  background-color: #22224a;
  padding-inline: 20px;

  .border {
    padding-top: 10px;
    border-top: 1px solid var(--purple);
  }

  table {
    border-top: 1px solid var(--purple);
    padding-top: 10px;
    width: 100%;
    td,
    th {
      padding-inline: 5px;
      text-align: left;
      &:last-of-type {
        text-align: right;
      }
    }

    span.red {
      color: var(--red);
    }
  }
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 15px;
  gap: 10px;
  span:last-of-type {
    margin-left: auto;
  }
  &.coloured {
    span:last-of-type {
      margin-right: 30px;
      color: var(--green);
    }
  }

  &.red {
    span:last-of-type {
      margin-right: 30px;
      color: var(--red);
    }
  }
}

.admin-profit-element:nth-child(4n) {
  margin-right: 0;
}

.admin-profit-element .element-loading {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
}

.admin-profit-element .element-loading::after {
  width: 100%;
  height: 100%;
  position: absolute;
  content: "";
  top: 0;
  left: 0;
  animation-name: loading_animation;
  animation-duration: 1s;
  animation-timing-function: ease;
  animation-iteration-count: infinite;
  background: linear-gradient(
    to right,
    #ffffff00 0%,
    rgba(255, 255, 255, 0.1) 50%,
    #ffffff00 100%
  );
}

.admin-profit-element .element-loading.fade-leave-active {
  transition: opacity 0.5s;
}

.admin-profit-element .element-loading.fade-leave-to {
  opacity: 0;
}

.admin-profit-element .element-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 25px 0;
}

.admin-profit-element .element-content.fade-enter-active {
  transition: opacity 0.5s;
}

.admin-profit-element .element-content.fade-enter-from {
  opacity: 0;
}

.admin-profit-element .element-title {
  text-align: center;
  font-size: 1.143rem;
  margin-bottom: 5px;
  font-weight: 800;
  color: #ffffff;
}

.admin-profit-element .element-date {
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 10px;
}

@keyframes loading_animation {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
