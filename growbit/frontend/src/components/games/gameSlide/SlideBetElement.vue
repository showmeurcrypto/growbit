<template>
  <div class="slide-bet-element">
    <div class="element-user">
      <AvatarImage :avatarNumber="bet.user.avatar" />
      <div v-html="bet.user.username" class="user-username"></div>
    </div>
    <div class="amount-value">
      {{ this.getDisplayCurrencyAmountFormatted(bet.amount) }}
    </div>
  </div>
</template>

<script>
// import mixins from '@/mixins';
import AvatarImage from "@/components/AvatarImage.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "SlideBetElement",
  components: {
    AvatarImage,
  },
  mixins: [currencyExchangeRatesMixin],
  props: ["bet"],
  methods: {},
};
</script>

<style scoped>
.slide-bet-element {
  width: 100%;
  height: 42px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  border-radius: 6px;
}

.slide-bet-element:first-child {
  margin-top: 0;
}

.slide-bet-element:nth-child(odd) {
  border-radius: 8px;
}

.slide-bet-element .element-user {
  display: flex;
  align-items: center;
}

.slide-bet-element .element-user .avatar-image {
  width: 25px;
  height: 25px;
  margin-right: 6px;
  border-radius: 50%;
}

.slide-bet-element .user-username {
  width: 100px;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slide-bet-element .amount-value {
  transition: color 0.3s ease;
  font-style: normal;
  font-weight: 400;
  font-size: 1rem;
  color: #eeeeee;
}

.bets-section.section-lose .slide-bet-element .amount-value {
  color: #fd3b31;
}

.bets-section.section-won .slide-bet-element .amount-value {
  color: #00c74d;
}
</style>
