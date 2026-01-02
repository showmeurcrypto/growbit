<template>
  <div class="profile-stats">
    <div class="top_row">Statistics</div>
    <div class="content-stats">
      <div class="stats-element element-affiliates">
        <div class="element-title">Joined</div>
        <span class="element-value">{{
          new Date(authUser?.user?.createdAt).toLocaleDateString()
        }}</span>
      </div>
      <div class="stats-element">
        <div class="element-title">Wagered</div>
        <div class="element-value">
          {{
            this.getDisplayCurrencyAmountFormatted(
              Math.round(authUser?.user?.stats?.bet || 0)
            )
          }}<Currency></Currency>
        </div>
      </div>
      <div class="stats-element">
        <div class="element-title">Played</div>
        <div class="element-value">
          {{ authUser?.user?.stats?.played || 0 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "ProfileStats",
  mixins: [currencyExchangeRatesMixin],
  components: { Currency },
  data() {
    return {};
  },
  methods: {},
  computed: {
    ...mapGetters(["authUser"]),
  },
};
</script>

<style scoped lang="scss">
.profile-stats {
  width: 800px;
  position: relative;
  display: flex;

  padding: 30px;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;

  @media only screen and (min-width: 991px) {
    background: var(--dark-blue);
    border: 4px solid #090c1d;
    border-radius: 10px;
  }

  @media only screen and (max-width: 991px) {
    width: unset;
    padding: 0;
  }

  .content-stats {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    @media only screen and (max-width: 991px) {
      grid-template-columns: 1fr;
    }
    gap: 25px;
    .stats-element {
      width: 100%;
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
        font-size: 1.143rem;
        color: var(--purple-2);

        img {
          height: 18px;
          width: 18px;
        }
      }
    }
  }

  .top_row {
    align-items: center;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 15px;

    font-weight: 700;
    font-size: 1.714rem;

    color: #eeeeee;
  }
}
</style>
