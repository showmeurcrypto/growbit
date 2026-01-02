<template>
  <div class="modal-affiliates">
    <div class="top_row">
      <div class="content-title">Affiliates</div>

      <div class="a-level">
        <span>Affiliate level {{ affiliatesData.data?.level || "1" }}</span>
      </div>
    </div>

    <div class="top_row">
      <div class="code-inner">
        <input
          v-model="affiliatesCode"
          type="text"
          placeholder="Set Affiliate Code..."
        />
        <button
          v-on:click="affiliatesCodeButton"
          v-bind:disabled="socketSendLoading !== null"
          class="button-save"
        >
          <transition name="fade" mode="out-in">
            <ButtonLoading
              v-if="socketSendLoading === 'AffiliatesCode'"
              key="loading"
            />
            <div v-else class="button-content" key="content">Save code</div>
          </transition>
        </button>
      </div>
      <div class="link-inner-wrapper">
        <div class="link-inner">
          <span class="inner-value">
            https://growbit.net/r/{{
              affiliatesData.data !== null &&
              affiliatesData.data.code !== undefined
                ? affiliatesData.data.code
                : ""
            }}</span
          >
        </div>
        <button @click="affiliatesCopyButton" class="button-copy">
          <CopyIcon></CopyIcon>
        </button>
      </div>
    </div>

    <div class="claim-row">
      <div>
        <div class="stats-title">Earnings</div>
        <p class="limit">You may claim earnings every 24h</p>
      </div>
      <button
        @click="affiliatesClaimButton"
        :disabled="socketSendLoading === 'AffiliatesClaimEarnings'"
        class="button-claim"
      >
        Claim
        {{ getDisplayCurrencyAmountFormatted(affiliatesData.data?.canClaim) }}
        <Currency></Currency>
      </button>
    </div>

    <div class="total">
      <span>Total referred : </span
      ><span>{{ affiliatesData?.data?.referred }}</span>
    </div>

    <div class="affiliates-list">
      <table v-if="affiliatesData?.data?.affiliateList">
        <thead>
          <tr>
            <th>Player</th>
            <th>Joined</th>
            <th>Wager</th>
            <th>Generated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="affiliate in affiliatesData?.data?.affiliateList">
            <td>
              {{ affiliate.username }}
            </td>
            <td>
              {{ new Date(affiliate.joined).toLocaleDateString() }}
            </td>
            <td>
              <div>
                {{ getDisplayCurrencyAmountFormatted(affiliate.wager) }}
                <Currency></Currency>
              </div>
            </td>
            <td>
              <div>
                {{ getDisplayCurrencyAmountFormatted(affiliate.generated) }}
                <Currency></Currency>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ButtonLoading from "@/components/ButtonLoading";
import CopyIcon from "@/assets/images/copy.svg?inline";
import InfoIcon from "@/assets/images/info_icon.svg?inline";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "ModalAffiliate",
  mixins: [currencyExchangeRatesMixin],
  components: {
    Currency,
    CopyIcon,
    InfoIcon,
    ButtonLoading,
  },
  data() {
    return {
      affiliatesCode: "",
      host_url: process.env.VUE_APP_HOST_URL,
    };
  },
  methods: {
    ...mapActions([
      "modalsSetShow",
      "modalsSetData",
      "notificationShow",
      "affiliatesSetCodeSocket",
      "affiliatesSendClaimEarningsSocket",
      "affiliatesGetDataSocket",
    ]),
    affiliatesCopyButton() {
      const el = document.createElement("textarea");
      el.value =
        this.host_url +
        "/r/" +
        (this.affiliatesData.data !== null &&
        this.affiliatesData.data.code !== undefined
          ? this.affiliatesData.data.code
          : "");
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
    affiliatesCodeButton() {
      if (
        this.affiliatesCode === null ||
        this.affiliatesCode.trim() === "" ||
        this.affiliatesCode.trim().length < 2
      ) {
        this.notificationShow({
          type: "error",
          message: "Your entered affiliate code is invalid.",
        });
        return;
      }

      const data = { code: this.affiliatesCode };
      this.affiliatesSetCodeSocket(data);
    },
    affiliatesClaimButton() {
      if (this.socketSendLoading !== null) {
        return;
      }

      if (
        this.affiliatesData.data === null ||
        this.affiliatesData.data.canClaim < 0.1
      ) {
        this.notificationShow({
          type: "error",
          message: "You’ll need a minimum of 0.1 in earnings to claim.",
        });
        return;
      }

      const data = {};
      this.affiliatesSendClaimEarningsSocket(data);
    },
  },
  computed: {
    ...mapGetters(["socketSendLoading", "affiliatesData"]),
  },
  watch: {
    "affiliatesData.data": {
      handler(data, oldData) {
        if (this.affiliatesData.data) {
          this.affiliatesCode = this.affiliatesData.data?.code || "";
        }
      },
      deep: true,
    },
  },
  created() {
    if (this.affiliatesData.loading === false) {
      const data = {};
      this.affiliatesGetDataSocket(data);
    }
  },
};
</script>

<style scoped lang="scss">
.modal-affiliates {
  width: 800px;
  position: relative;
  display: flex;

  padding: 30px;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  @media only screen and (min-width: 991px) {
    background: var(--dark-blue);
    border: 4px solid #090c1d;
    border-radius: 10px;
  }

  @media only screen and (max-width: 991px) {
    width: unset;
    padding: 0;
  }

  .total {
    span {
      color: #eeeeee;

      &:first-of-type {
        font-weight: 900;
      }
    }
  }

  .a-level {
    padding: 12px 15px;
    height: 48px;
    background: #22224a;
    border-radius: 9px;

    font-style: normal;
    font-weight: 800;
    font-size: 1rem;
    color: #f7be2c;
    gap: 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .top_row {
    align-items: center;
    width: 100%;
    display: flex;
    //flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
    @media screen and (max-width: 991px) {
      flex-wrap: wrap;
    }
  }

  .claim-row {
    align-items: center;
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 20px;

    .stats-title {
      font-weight: 700;
      font-size: 1.429rem;
      color: #eeeeee;
      @media screen and (max-width: 991px) {
        text-align: center;
      }

      .limit {
        font-weight: 400;
        font-size: 1rem;
      }
    }

    @media screen and (max-width: 991px) {
      background: #22224a;
      border-radius: 10px;
      padding: 15px;
      align-items: center;
      flex-direction: column;
      justify-content: flex-start;
      gap: 20px;
    }

    .button-claim {
      margin-left: auto;
      gap: 5px;
      display: flex;
      align-items: center;

      @media screen and (max-width: 991px) {
        margin-left: unset;
      }

      border-radius: 5px;
      padding: 12px 36px;
      background: var(--purple);
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25),
        0px 0px 25px rgba(91, 70, 188, 0.25);
      font-weight: 700;
      font-size: 1.143rem;
      color: #eeeeee;
    }
  }
}

.modal-affiliates .content-title {
  width: fit-content;
  font-weight: 700;
  font-size: 1.714rem;
  color: #eeeeee;
  @media only screen and (max-width: 991px) {
    display: none;
  }
}

.modal-affiliates .content-code {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 18px;
  padding: 0 44px;
}

.modal-affiliates .code-inner {
  width: 370px;
  position: relative;
}

.modal-affiliates .inner-left-arrow {
  position: absolute;
  top: 50%;
  left: -174px;
  transform: translateY(-50%);
}

.modal-affiliates .inner-right-arrow {
  position: absolute;
  top: 50%;
  right: -174px;
  transform: translateY(-50%) rotate(180deg);
}

.modal-affiliates .code-inner input {
  width: 100%;
  height: 54px;
  padding: 0 126px 0 17px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;

  background: #22224a;
  border-radius: 10px;
}

.modal-affiliates .code-inner input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-affiliates .code-inner input::-moz-placeholder {
  font-size: 13px;
  font-weight: 700;
  color: #616498;
}

.modal-affiliates .code-inner input::placeholder {
  font-size: 13px;
  font-weight: 700;
  color: #616498;
}

.modal-affiliates button.button-save {
  width: 112px;
  height: 41px;
  position: absolute;
  top: 50%;
  right: 7px;
  transform: translateY(-50%);
  border-radius: 5px;
  text-transform: uppercase;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: var(--purple);
}

.modal-affiliates button.button-save .button-loading {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-affiliates button.button-save .button-loading svg {
  font-size: 1.143rem;
}

.modal-affiliates button.button-save .button-loading.fade-leave-active {
  transition: opacity 0.5s;
}

.modal-affiliates button.button-save .button-loading.fade-leave-to {
  opacity: 0;
}

.modal-affiliates button.button-save .button-content.fade-enter-active {
  transition: opacity 0.5s;
}

.modal-affiliates button.button-save .button-content.fade-enter-from {
  opacity: 0;
}

.modal-affiliates .link-inner {
  height: 54px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 18px;
  flex-grow: 1;
  @media screen and (min-width: 991px) {
    // max-width: 47%;
  }
}

.modal-affiliates .link-inner-wrapper {
  display: flex;
  gap: 5px;
  width: 50%;
  justify-content: space-between;
  align-items: center;
  background: #22224a;
  border-radius: 10px;
  padding-right: 10px;
}

.modal-affiliates .link-inner span.inner-value {
  width: 100%;

  text-decoration: underline;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.modal-affiliates button.button-copy {
  // display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  padding: 0;
  font-size: 1rem;
  font-weight: 700;
}

.modal-affiliates button.button-copy:hover {
  color: #fff;
}

.modal-affiliates button.button-copy svg {
  margin-right: 9px;
  fill: #767c8b;
  transition: all 0.3s ease;
}

.modal-affiliates button.button-copy:hover svg {
  fill: #fff;
}

.modal-affiliates .content-stats {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 24px 0 0 0;
}

.modal-affiliates {
  .stats-element {
    width: calc(50% - 16px);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 24px;
    padding: 15px 20px;
    border-radius: 8px;
    gap: 10px;

    background: #22224a;

    &:last-of-type {
      margin-right: 0;
    }

    .element-title {
      font-weight: 700;
      font-size: 1.29rem;
      color: #eeeeee;
    }

    .element-value {
      display: flex;
      gap: 5px;
      align-items: center;
      font-weight: 400;
      font-size: 1rem;
      color: var(--purple-2);
    }
  }
}

.modal-affiliates .value-loading {
  display: flex;
}

.modal-affiliates .value-content {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.modal-affiliates .value-content img {
  width: 17px;
  margin-right: 10px;
}

.modal-affiliates .stats-element.element-affiliates .value-content img {
  width: 15px;
}

.modal-affiliates .value-content .content-amount {
  font-size: 0.857rem;
  font-weight: 700;
  color: #bbb;
}

.modal-affiliates .value-content .content-amount span {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.modal-affiliates .claim-inner {
  width: 100%;
  height: 68px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 7px 7px 78px;
  border-radius: 8px;
  background: #22224a;
}

.modal-affiliates .inner-coin {
  height: 68px;
  position: absolute;
  top: 50%;
  left: 2px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.modal-affiliates .inner-coin img {
  width: 45px;
  height: 45px;
  margin-left: 13px;
  /* filter: drop-shadow(0 0 10px rgba(253, 59, 49, .5)) */
}

.modal-affiliates .inner-text {
  width: calc(100% - 257px);
  font-size: 0.857rem;
  font-weight: 700;
  color: #fff;
}

.modal-affiliates .inner-info {
  width: 250px;
  height: 100%;
  position: relative;
  padding: 0 91px 0 16px;
  border-radius: 8px;
  background: #1f2f33;
}

.modal-affiliates .info-loading {
  display: flex;
}

.modal-affiliates .info-content {
  height: 100%;
  display: flex;
  align-items: center;
}

.modal-affiliates .info-content img {
  width: 18px;
  margin-right: 10px;
}

.modal-affiliates .info-content .content-amount {
  font-size: 0.857rem;
  font-weight: 700;
  color: #00c74d;
}

.modal-affiliates .info-content .content-amount span {
  font-size: 15px;
  font-weight: 700;
}

.modal-affiliates
  .inner-info
  button.button-claim
  .button-loading.fade-leave-active {
  transition: opacity 0.5s;
}

.modal-affiliates
  .inner-info
  button.button-claim
  .button-loading.fade-leave-to {
  opacity: 0;
}

.modal-affiliates
  .inner-info
  button.button-claim
  .button-content.fade-enter-active {
  transition: opacity 0.5s;
}

.modal-affiliates
  .inner-info
  button.button-claim
  .button-content.fade-enter-from {
  opacity: 0;
}

@media only screen and (max-width: 991px) {
  .modal-affiliates {
    width: 100%;
  }

  .modal-affiliates .code-inner {
    width: 100%;
  }

  .modal-affiliates .inner-left-arrow,
  .modal-affiliates .inner-right-arrow {
    display: none;
  }

  .modal-affiliates .link-inner {
    // width: 100%;
    min-width: 90%;
  }

  .modal-affiliates .link-inner-wrapper {
    width: 100%;
  }

  .modal-affiliates .button-copy {
    max-width: 10%;
  }

  .modal-affiliates .content-stats {
    padding: 0;
    flex-wrap: wrap;
  }

  .modal-affiliates .stats-element {
    margin-top: 12px;
    margin-right: 0;
  }

  .modal-affiliates .stats-element {
    width: 100%;
  }

  .modal-affiliates .claim-inner {
    height: auto;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 7px 7px 7px;
  }

  .modal-affiliates .inner-coin {
    display: none;
  }

  .modal-affiliates .inner-text {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .modal-affiliates .inner-info {
    width: 100%;
    height: 54px;
    margin-top: 12px;
  }
}

.affiliates-list {
  background: #22224a;
  height: 250px;
  width: 100%;
  border-radius: 10px;
  padding-top: 7px;
  padding-bottom: 15px;
  overflow: hidden;

  table {
    display: flex;
    flex-flow: column;
    height: 100%;
    width: 100%;
    table-layout: auto;
    border-collapse: collapse;

    th {
      background: rgba(255, 255, 255, 0.05);
    }

    th,
    td {
      font-style: normal;
      font-weight: 400;
      font-size: 1.142rem;
      color: #eeeeee;
      width: 100%;

      overflow: hidden;
      text-overflow: ellipsis;
    }

    th {
      padding: 5px 0;
    }

    td {
      padding: 7px 0;

      &:first-of-type {
        max-width: 200px;
      }

      > div {
        width: 100%;
        justify-content: flex-end;

        display: flex;
        flex-grow: 1;
        gap: 5px;
        flex-wrap: nowrap;
      }
    }

    td,
    th {
      &:first-of-type {
        padding-left: 25px;

        @media screen and (max-width: 991px) {
          padding-left: 10px;
        }
        text-align: left;
        text-transform: capitalize;
      }
      &:nth-of-type(2) {
        @media screen and (max-width: 600px) {
          display: none;
        }
        text-align: center;
      }
      &:nth-of-type(3) {
        text-align: right;
      }
      &:last-of-type {
        text-align: right;
        padding-right: 20px;
        @media screen and (max-width: 991px) {
          padding-right: 10px;
        }
      }
    }
  }
  table thead {
    flex: 0 0 auto;
    width: 100%;
  }
  table tbody {
    flex: 1 1 auto;
    display: block;
    overflow-y: scroll;
    height: 250px;
  }
  table tbody tr {
    width: 100%;
  }
  table thead,
  table tbody tr {
    display: table;
    table-layout: fixed;
  }
}
</style>
