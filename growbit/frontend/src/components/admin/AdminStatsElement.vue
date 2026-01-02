<template>
  <div class="admin-stats-element" @click="openModal()">
    <div class="element-section section-date">
      <div class="section-title">DATE</div>
      <div class="section-content">
        {{ new Date(stat.createdAt).toLocaleDateString("en-US") }}
      </div>
    </div>
    <div class="element-section section-npc">
      <div class="section-title">User</div>
      <div class="section-content">
        {{ stat.stats.total.user }}
      </div>
    </div>
    <div class="element-section section-npc">
      <div class="section-title">New Depositors</div>
      <div class="section-content">
        {{ stat.stats.total.newDepositors || 0 }}
      </div>
    </div>
    <div
      class="element-section section-crypto"
      v-bind:class="{
        'section-positive':
          stat.stats.crypto.deposit - stat.stats.crypto.withdraw >= 0,
      }"
    >
      <div class="section-title">Crypto</div>
      <div class="section-content">
        <Currency />
        {{
          formatMoney(stat.stats.crypto.deposit - stat.stats.crypto.withdraw)
        }}
      </div>
    </div>
    <div
      class="element-section section-crypto"
      v-bind:class="{
        'section-positive':
          stat.stats.growtopia.deposit - stat.stats.growtopia.withdraw >= 0,
      }"
    >
      <div class="section-title">Growtopia</div>
      <div class="section-content">
        <Currency />
        {{
          formatMoney(
            stat.stats.growtopia.deposit - stat.stats.growtopia.withdraw
          )
        }}
      </div>
    </div>
    <div
      class="element-section section-profit"
      v-bind:class="{
        'section-positive':
          stat.stats.total.deposit - stat.stats.total.withdraw >= 0,
      }"
    >
      <div class="section-title">NET PROFIT</div>
      <div class="section-content">
        <Currency />
        {{ formatMoney(stat.stats.total.deposit - stat.stats.total.withdraw) }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import Currency from "@/components/Currency.vue";

export default {
  name: "AdminStatsElement",
  components: { Currency },
  props: ["stat"],
  mixins: [currencyExchangeRatesMixin],

  methods: {
    ...mapActions(["modalsSetData", "modalsSetShow"]),
    openModal() {
      console.log(this.stat.stats.games);
      this.modalsSetData({ games: this.stat.stats.games });
      this.modalsSetShow("GamesReport");
    },
    formatMoney(value) {
      return this.getDisplayCurrencyAmountFormatted(value);
    },
  },
};
</script>

<style scoped>
.admin-stats-element {
  cursor: pointer;
  width: 100%;
  height: 47px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-radius: 5px;
  background: #22224a;
  margin-top: 10px;
}

.admin-stats-element .element-section {
  display: flex;
  flex-direction: column;
}

.admin-stats-element .element-section.section-date,
.admin-stats-element .element-section.section-npc,
.admin-stats-element .element-section.section-steam,
.admin-stats-element .element-section.section-gift,
.admin-stats-element .element-section.section-crypto,
.admin-stats-element .element-section.section-cc,
.admin-stats-element .element-section.section-profit {
  width: 10%;
}

.admin-stats-element .section-title {
  display: none;
  font-size: 13px;
  font-weight: 600;
  color: #8bacc8;
}

.admin-stats-element .section-content {
  display: flex;
  align-items: center;
  gap: 5px;
}

.admin-stats-element .element-section.section-date .section-content,
.admin-stats-element .element-section.section-npc .section-content {
  font-size: 1rem;
  font-weight: 400;
  color: #bbbfd0;
}

.admin-stats-element .element-section.section-steam .section-content,
.admin-stats-element .element-section.section-gift .section-content,
.admin-stats-element .element-section.section-crypto .section-content,
.admin-stats-element .element-section.section-cc .section-content,
.admin-stats-element .element-section.section-profit .section-content {
  font-size: 1rem;
  font-weight: 800;
  color: #f55046;
}

.admin-stats-element .element-section.section-profit .section-content {
  justify-content: flex-end;
}

.admin-stats-element .element-section.section-limiteds .section-content img {
  width: 18px;
  height: 18px;
  margin-right: 10px;
}

.admin-stats-element .element-section.section-limiteds .content-value {
  font-size: 10px;
  font-weight: 600;
  color: #bbbfd0;
}

.admin-stats-element .element-section.section-limiteds .content-value span {
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
}

.admin-stats-element
  .element-section.section-steam.section-positive
  .section-content,
.admin-stats-element
  .element-section.section-gift.section-positive
  .section-content,
.admin-stats-element
  .element-section.section-crypto.section-positive
  .section-content,
.admin-stats-element
  .element-section.section-cc.section-positive
  .section-content,
.admin-stats-element
  .element-section.section-profit.section-positive
  .section-content {
  color: #00c74d;
}

@media only screen and (max-width: 1250px) {
  .admin-stats-element {
    height: auto;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 20px;
  }

  .admin-stats-element .element-section {
    width: 100% !important;
    margin-top: 10px;
  }

  .admin-stats-element .element-section.section-date {
    margin-top: 0;
  }

  .admin-stats-element .element-section.section-profit {
    align-items: flex-start;
  }

  .admin-stats-element .section-title {
    display: block;
  }

  .admin-stats-element .section-content {
    margin-top: 5px;
  }
}
</style>
