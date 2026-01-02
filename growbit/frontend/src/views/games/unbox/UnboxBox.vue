<template>
  <div class="case-layout">
    <div class="top-row">
      <div
        v-if="!this.isMobile"
        class="box-info"
        :class="{ keyUnlock: keyUnlock }"
      >
        <template v-if="unboxBoxData.box">
          <img :src="`/img/cases/cases/${unboxBoxData.box.image}`" />

          <span class="case-name">
            {{ unboxBoxData.box.caseName }}
          </span>

          <div v-if="!keyUnlock" class="box-price">
            <p>
              {{ getBalanceInSelectedCurrency(unboxBoxData.box.casePrice) }}
            </p>
            <img
              :src="`/img/currencies/${selectedCurrency}.${
                selectedCurrency === 'DLS' ? 'png' : 'svg'
              }`"
              alt=""
            />
          </div>
          <div class="volatility-wrapper">
            <div class="volatility-bar">
              <div
                class="bar bar-low"
                :class="{ active: unboxBoxData.box.volatility === 'low' }"
              >
                <div
                  v-if="unboxBoxData.box.volatility === 'low'"
                  class="volatility-exact"
                  :style="{
                    left: (unboxBoxData.box.volatilityNumber / 1) * 100 + '%',
                  }"
                ></div>
              </div>
              <div class="text">L</div>
            </div>
            <div class="volatility-bar">
              <div
                class="bar bar-mid"
                :class="{ active: unboxBoxData.box.volatility === 'mid' }"
              >
                <div
                  v-if="unboxBoxData.box.volatility === 'mid'"
                  class="volatility-exact"
                  :style="{
                    left: (unboxBoxData.box.volatilityNumber / 5) * 100 + '%',
                  }"
                ></div>
              </div>
              <div class="text">M</div>
            </div>
            <div class="volatility-bar">
              <div
                class="bar bar-high"
                :class="{ active: unboxBoxData.box.volatility === 'high' }"
              >
                <div
                  v-if="unboxBoxData.box.volatility === 'high'"
                  class="volatility-exact"
                  :style="{
                    left:
                      Math.min(1, unboxBoxData.box.volatilityNumber / 50) *
                        100 +
                      '%',
                  }"
                ></div>
              </div>
              <div class="text">H</div>
            </div>
          </div>
          <UnboxControls v-if="!keyUnlock" />
          <button
            v-else-if="!daily"
            class="unlock"
            :disabled="!canClaimKeyBtn"
            @click="unlock()"
          >
            Unlock the case
            <img
              :src="`/img/keys/${this.$route.path
                .split('/')
                .filter(Boolean)
                .pop()}.png`"
              alt="reward key"
            />
          </button>

          <button v-else class="unlock" @click="unlock()">
            Open Daily Case
          </button>
        </template>
        <template>
          <div class="case-loader" :class="{ hidden: unboxBoxData.box }">
            <LoadingAnimation></LoadingAnimation>
          </div>
        </template>
      </div>

      <div class="unbox-box">
        <transition name="fade" mode="out-in">
          <div
            v-if="
              socketUnbox.connected === false || unboxBoxData.loading === true
            "
            class="box-loading"
            key="loading"
          >
            <LoadingAnimation></LoadingAnimation>
          </div>
          <div v-else class="box-content" key="data">
            <UnboxSpinner />
          </div>
        </transition>
      </div>

      <div v-if="unboxBoxData.box !== null && this.isMobile" class="box-info">
        <span class="case-name">
          {{ unboxBoxData.box.caseName }}
        </span>
        <div v-if="!keyUnlock" class="box-price">
          <p>{{ getBalanceInSelectedCurrency(unboxBoxData.box.casePrice) }}</p>
          <img
            :src="`/img/currencies/${selectedCurrency}.${
              selectedCurrency === 'DLS' ? 'png' : 'svg'
            }`"
            alt=""
          />
        </div>
        <UnboxControls v-if="!keyUnlock" />
        <button
          v-else-if="!daily"
          class="unlock"
          :disabled="!canClaimKeyBtn"
          @click="unlock()"
        >
          Unlock the case <img :src="`/img/rewards/key.png`" alt="reward key" />
        </button>
        <button v-else class="unlock" @click="unlock()">Open Daily Case</button>
      </div>
    </div>
    <div class="box-items">
      <div class="items-header">Case Contains</div>
      <div class="items-content">
        <transition name="fade" mode="out-in">
          <div
            v-if="
              socketUnbox.connected === false || unboxBoxData.loading === true
            "
            class="content-list"
            key="loading"
          >
            <div class="loading-placeholder"></div>
            <div class="loading-placeholder"></div>
            <div class="loading-placeholder"></div>
            <div class="loading-placeholder"></div>
            <div class="loading-placeholder"></div>
            <div class="loading-placeholder"></div>
          </div>
          <div v-else class="content-list" key="data">
            <UnboxItemElement
              v-for="item of unboxGetBoxItems"
              v-bind:key="item._id"
              v-bind:item="item"
            />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import UnboxSpinner from "@/components/unbox/UnboxSpinner";
import UnboxControls from "@/components/unbox/UnboxControls";
import UnboxItemElement from "@/components/unbox/UnboxItemElement";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import { getUserLevel, canClaimKey } from "@/utils";

export default {
  name: "UnboxBox",
  mixins: [currencyExchangeRatesMixin],
  components: {
    UnboxSpinner,
    UnboxControls,
    UnboxItemElement,
    LoadingAnimation,
  },
  data() {
    return {
      isMobile: false,
    };
  },
  methods: {
    ...mapActions([
      "unboxSetCount",
      "unboxSetGames",
      "unboxGetBoxDataSocket",
      "unlockWithTheKey",
    ]),
    checkIfMobile() {
      const regex =
        /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      this.isMobile =
        regex.test(navigator.userAgent) || window.innerWidth < 991;
    },
    getBalanceInSelectedCurrency(balance) {
      return (
        this.fiatRates.data[this.selectedCurrency] * balance
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    unlock() {
      this.unlockWithTheKey({
        level: this.unboxBoxData.box.level,
        daily: this.daily,
      });
    },
  },
  computed: {
    ...mapGetters([
      "socketUnbox",
      "unboxBoxData",
      "selectedCurrency",
      "fiatRates",
      "authUser",
    ]),
    keyUnlock() {
      return this.unboxBoxData.box?.reward;
    },
    daily() {
      return this.unboxBoxData.box?.daily;
    },
    canClaimKeyBtn() {
      const boxLevel = this.unboxBoxData.box?.level;
      return canClaimKey(this.authUser?.user, boxLevel);
    },
    unboxGetBoxItems() {
      let items = [...this.unboxBoxData.box.items];
      items.sort((a, b) => b.itemPrice - a.itemPrice);
      return items;
    },
  },
  watch: {
    "socketUnbox.connected": {
      handler() {
        const boxId = this.$route.params.boxId;

        if (
          (this.unboxBoxData.box === null ||
            this.unboxBoxData.box._id !== boxId) &&
          this.unboxBoxData.loading === false
        ) {
          const data = { boxId: boxId };
          this.unboxGetBoxDataSocket(data);
        }
      },
    },
  },

  created() {
    const boxId = this.$route.params.boxId;

    if (
      this.socketUnbox.connected === true &&
      (this.unboxBoxData.box === null || this.unboxBoxData.box._id !== boxId) &&
      this.unboxBoxData.loading === false
    ) {
      const data = { boxId: this.$route.params.boxId };
      this.unboxGetBoxDataSocket(data);
    }
  },
  beforeDestroy() {
    this.unboxSetCount(1);
    this.unboxSetGames([]);
    window.removeEventListener("resize", this.checkIfMobile);
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener("resize", this.checkIfMobile);
  },
};
</script>

<style scoped lang="scss">
button.unlock {
  width: 240px;
  height: 45px;
  display: flex;
  margin-top: auto;
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

  img {
    height: 30px;
  }
}

.box-loading {
  height: 100%;
  display: grid;
  place-content: center;
}

.case-name {
  font-size: 1.3rem;
}
.loading-placeholder {
  width: 150px;

  @media only screen and (max-width: 991px) {
    width: 100%;
  }

  height: 175px;
  background: #191939;
  border-radius: 5px;
}
.box-content {
  height: 427px;

  @media (max-width: 991px) {
    height: 220px;
  }
}

.case-layout {
  overflow: clip;
}

.top-row {
  display: flex;
  gap: 10px;

  @media (max-width: 991px) {
    width: 100%;
    flex-direction: column;
  }

  .box-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 3px;
    padding: 20px;
    flex-direction: column;
    position: relative;

    &.keyUnlock {
      justify-content: center;

      padding-top: 60px;

      .volatility-wrapper {
        margin-top: 25px;
      }

      .case-name {
        margin-top: 15px;
      }
    }

    font-size: 18px;
    font-weight: 800;

    width: 30%;
    flex-shrink: 0;
    height: 427px;
    background: #191939;
    border-radius: 15px 10px;

    @media (max-width: 991px) {
      height: fit-content;
      padding: 15px 10px 10px 10px;
      gap: 10px;

      width: 100%;
      flex-direction: column;
    }

    .case-loader {
      position: absolute;
      top: 0;
      height: 100%;
      z-index: 3;
      display: grid;
      place-content: center;
      background: var(--dark-blue);
      width: 100%;
      border-radius: 4px;
      pointer-events: none;
      transition: 200ms opacity ease-in-out;

      &.hidden {
        opacity: 0;
      }
    }

    > img {
      width: 150px;
      height: auto;
      margin-bottom: 10px;
    }

    .box-price {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      font-size: 1.3rem;
      img {
        margin-left: 5px;
        width: 18px;
        height: 18px;
      }
      @media (max-width: 991px) {
      }
    }

    .volatility-wrapper {
      display: flex;
      flex-direction: row;
      width: 100%;
      margin-top: 4px;

      .volatility-bar {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 33%;

        .text {
          margin-top: 4px;
          font-size: 10px;
          font-weight: 100;
        }

        .bar {
          width: 100%;
          border-radius: 5px;
          height: 3px;
          background: #161533;
          .volatility-exact {
            position: relative;
            bottom: 2.8px;
            height: 8px;
            width: 2px;
            background: white;
            z-index: 5;
          }
        }

        .bar-high.active {
          background: #ff003d;
        }

        .bar-mid.active {
          background: #ffd900;
        }

        .bar-low.active {
          background: #00ff00;
        }
      }
    }
  }
}
.unbox-box {
  width: 69%;
  height: 427px;

  background: rgba(25, 25, 57, 0.5);
  border: 2px solid #22224a;
  border-radius: 10px;
  @media (max-width: 991px) {
    height: 220px;

    width: 100%;
    padding-top: 0px;
  }
}

.box-items {
  width: 100%;
  margin-top: 35px;
  @media only screen and (max-width: 991px) {
    margin-top: 15px;
  }

  .items-header {
    width: 100%;
    display: flex;
    align-items: center;
    padding-bottom: 15px;

    font-family: "Excon";
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 28px;

    color: #eeeeee;
  }

  .items-content {
    width: 100%;
  }

  .content-list {
    width: 100%;

    gap: 15px;

    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));

    @media only screen and (max-width: 991px) {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media only screen and (max-width: 700px) {
      grid-template-columns: repeat(3, minmax(0, 4fr));
    }

    @media only screen and (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
