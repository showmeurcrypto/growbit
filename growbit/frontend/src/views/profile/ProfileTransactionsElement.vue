<template>
  <div class="profile-transactions-element">
    <div class="element-section section-type">
      <!--      <div class="section-title">Type</div>-->
      <div class="section-content">{{ this.transaction.method }}</div>
    </div>

    <div class="element-section section-date">
      <!--      <div class="section-title">Date</div>-->
      <div class="section-content">
        {{
          new Date(transaction.createdAt).toLocaleString("en-US", {
            hour12: true,
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        }}
      </div>
    </div>
    <div class="element-section section-amount">
      <!--      <div class="section-title">Amount</div>-->
      <div class="section-content money">
        <div
          class="amount-value"
          v-bind:class="{ 'value-positive': profileGetAmount > 0 }"
        >
          {{ this.getDisplayCurrencyAmountFormatted(profileGetAmount) }}
        </div>
        <Currency></Currency>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "ProfileTransactionsElement",
  components: { Currency },
  props: ["transaction"],
  mixins: [currencyExchangeRatesMixin],
  methods: {},
  computed: {
    ...mapGetters(["authUser"]),
    profileGetAmount() {
      let amount = this.transaction.amount || this.transaction.tokenAmount;

      if (
        this.transaction.method === "tip" &&
        this.authUser.user._id === this.transaction.sender.user
      ) {
        amount = -this.transaction.amount;
      } else if (this.transaction.type === "withdraw") {
        amount = -this.transaction.amount;
      }
      return amount;
    },
  },
};
</script>

<style scoped lang="scss">
.profile-transactions-element {
  width: 100%;
  height: 46px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  margin-bottom: 8px;
  background: #22224a;
  border-radius: 10px;

  .element-section.section-type {
    .section-content {
      text-transform: capitalize;
    }
  }
}

.profile-element-element .element-section {
  display: flex;
  flex-direction: column;
}

.profile-transactions-element .element-section.section-date,
.profile-transactions-element .element-section.section-type {
  width: 25%;
}

.profile-transactions-element .element-section.section-transaction {
  width: 35%;
}

.profile-transactions-element .section-title {
  display: none;
  font-size: 0.857rem;
  font-weight: 700;
}

.profile-transactions-element .section-content {
  display: flex;
  align-items: center;
}

.profile-transactions-element .element-section.section-date .section-content,
.profile-transactions-element .element-section.section-type .section-content {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.profile-transactions-element .element-section.section-date .section-content {
  font-weight: 500;
  font-size: 1.143rem;
  color: var(--purple-2);
}

.money {
  @media only screen and (min-width: 991px) {
    justify-content: flex-end;
  }
  gap: 10px;
  img {
    width: 18px;
    height: 18px;

    @media only screen and (min-width: 991px) {
      margin-left: auto;
    }
  }
}

.profile-transactions-element .amount-value {
  font-weight: 500;
  font-size: 1.143rem;
  color: #eeeeee;
}

.profile-transactions-element .amount-value span {
  font-size: 15px;
  font-weight: 700;
}

.profile-transactions-element .content-steam {
  display: flex;
  align-items: center;
}

.profile-transactions-element .content-steam img {
  width: 30px;
  margin-right: 5px;
}

.profile-transactions-element .content-steam img:last-of-type {
  margin-right: 0;
}

.profile-transactions-element .content-steam span {
  margin-left: 5px;
  font-size: 0.857rem;
  font-weight: 700;
  color: #bbb;
}

@media only screen and (max-width: 991px) {
  .profile-transactions-element {
    height: auto;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 20px;
  }

  .profile-transactions-element .element-section {
    width: 100% !important;
    margin-top: 10px;
  }

  .profile-transactions-element .element-section.section-type {
    margin-top: 0;
  }

  .profile-transactions-element .element-section.section-actions {
    align-items: flex-start;
  }

  /*
  .profile-transactions-element .section-title {
   display: block;
  }
  */

  .profile-transactions-element .section-content {
    margin-top: 5px;
  }
}
</style>
