<template>
  <div class="unbox-controls">
    <div class="controls-count">
      <button
        v-on:click="unboxSetCount(1)"
        v-bind:class="{ 'button-active': unboxCount === 1 }"
        v-bind:disabled="socketSendLoading !== null || unboxRunning === true"
      >
        <div class="button-inner">1</div>
      </button>
      <button
        v-on:click="unboxSetCount(2)"
        v-bind:class="{ 'button-active': unboxCount === 2 }"
        v-bind:disabled="socketSendLoading !== null || unboxRunning === true"
      >
        <div class="button-inner">2</div>
      </button>
      <button
        v-on:click="unboxSetCount(3)"
        v-bind:class="{ 'button-active': unboxCount === 3 }"
        v-bind:disabled="socketSendLoading !== null || unboxRunning === true"
      >
        <div class="button-inner">3</div>
      </button>
      <button
        v-on:click="unboxSetCount(4)"
        v-bind:class="{ 'button-active': unboxCount === 4 }"
        v-bind:disabled="socketSendLoading !== null || unboxRunning === true"
      >
        <div class="button-inner">4</div>
      </button>
    </div>

    <div class="controls-bet">
      <button
        v-on:click="unboxBetButton()"
        class="button-bet"
        v-bind:disabled="socketSendLoading !== null || unboxRunning === true"
      >
        <p>OPEN FOR</p>
        <img
          :src="`/img/currencies/${selectedCurrency}.${
            selectedCurrency === 'DLS' ? 'png' : 'svg'
          }`"
          alt=""
        />
        {{
          getBalanceInSelectedCurrency(unboxBoxData.box.casePrice * unboxCount)
        }}
      </button>
      <button
        v-on:click="unboxDemoButton()"
        class="button-demo"
        v-bind:disabled="socketSendLoading !== null || unboxRunning === true"
      >
        DEMO SPIN
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "UnboxControls",
  mixins: [currencyExchangeRatesMixin],
  components: { Currency },

  methods: {
    ...mapActions([
      "notificationShow",
      "unboxSetCount",
      "unboxSetRunnning",
      "unboxSetGames",
      "unboxSendBetSocket",
    ]),
    getBalanceInSelectedCurrency(balance) {
      return (
        this.fiatRates.data[this.selectedCurrency] * balance
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    unboxFormatValue(value) {
      return parseFloat(Math.floor(value / 10) / 100)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    unboxBetButton() {
      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        return;
      }

      const data = {
        boxId: this.unboxBoxData.box._id,
        unboxCount: this.unboxCount,
        quick: this.unboxQuick,
      };
      this.unboxSendBetSocket(data);
    },
    isMobile() {
      const regex =
        /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return regex.test(navigator.userAgent);
    },
    unboxDemoButton() {
      let games = [];

      for (let i = 0; i < this.unboxCount; i++) {
        games.push({
          demo: true,
          data: { outcome: Math.floor(Math.random() * (100000 - 1 + 1)) + 1 },
          updatedAt: new Date(),
        });
      }

      this.unboxSetRunnning(true);
      this.unboxSetGames(games);
    },
  },
  computed: {
    ...mapGetters([
      "fiatRates",
      "socketSendLoading",
      "authUser",
      "unboxCount",
      "unboxQuick",
      "unboxRunning",
      "unboxBoxData",
      "selectedCurrency",
    ]),
  },
};
</script>

<style scoped lang="scss">
.price {
  display: flex;
  gap: 10px;
  align-items: center;
}
.unbox-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  gap: 10px;
}

.unbox-controls .controls-count,
.unbox-controls .controls-bet {
  display: flex;
  align-items: center;
}

.unbox-controls .controls-bet {
  flex-direction: column;
}

.unbox-controls .controls-count {
  width: 100%;
}

.unbox-controls .controls-count button {
  width: 100%;
  height: 44px;
  position: relative;
  z-index: 1;
}

.unbox-controls .controls-count button:last-child {
  margin-right: 0;
}

.unbox-controls .controls-count button .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  background: #22224a;
  border: 2px solid #161533;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
  &.active {
    background: var(--purple);
  }
}

.unbox-contrdols .controls-count {
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  width: 100%;
  gap: 3px;

  button {
    &.active {
      background: var(--purple);
    }
    padding: 5px 0;
    max-width: 25%;
    width: 100%;
    border-radius: 4px;
    background: #22224a;
    border: 2px solid #161533;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
    img {
      margin-top: 5px;
    }
  }
}

.unbox-controls .controls-count button.button-active .button-inner {
  background: var(--purple);
  @media (max-width: 991px) {
    height: 40px;
  }
}

.unbox-controls .controls-bet {
  width: 100%;
}

.unbox-controls .controls-bet button.button-bet {
  width: 240px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 10px;
  position: relative;
  background: var(--purple);
  transition: all 0.2s;
  width: 100%;
  @media (max-width: 991px) {
    height: 40px;
  }
}

.unbox-controls .controls-bet button.button-demo {
  width: 240px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 800;
  border-radius: 10px;
  background: #22224a;
  border: 2px solid #161533;
  transition: all 0.2s;
  width: 100%;
  @media (max-width: 991px) {
    height: 40px;
  }
}
.unbox-controls .controls-bet button.button-demo:hover {
  transition-duration: 0.2s;
  opacity: 0.8;
}
.unbox-controls .controls-bet button.button-demo:active {
  transition-duration: 0.2s;
  scale: 0.9;
}

.unbox-controls .controls-bet button.button-demo .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  color: #bbbfd0;
  transition: color 0.3s ease;
}

@media only screen and (max-width: 650px) {
  .unbox-controls {
    flex-direction: column;
  }

  .unbox-controls .controls-bet {
    @media (max-width: 991px) {
      margin-top: 0px;
    }
    margin-top: 15px;
  }
}
</style>
