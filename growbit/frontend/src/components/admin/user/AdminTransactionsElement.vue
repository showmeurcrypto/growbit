<template>
  <div class="admin-user-transactions-element" @click="adminInfoButton()">
    <div class="element-section section-date">
      <div class="section-title">Date</div>
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
    <div class="element-section section-method">
      <div class="section-title">Method</div>
      <div class="section-content">
        {{ adminGetMethod }}
      </div>
    </div>
    <div class="element-section">
      <div class="section-title">User</div>
      <div class="section-content">
        {{ transaction.user?.username }}
      </div>
    </div>

    <div class="element-section section-type">
      <div class="section-title">Type</div>
      <div class="section-content">
        {{ adminGetType }}
        <span :class="['type-' + trState]">({{ trState }})</span>
      </div>
    </div>
    <div class="element-section section-amount">
      <div class="section-title">Amount</div>
      <div class="section-content">
        <img src="@/assets/images/mmo_coin.png" alt="icon" />
        <div
          class="content-value"
          v-bind:class="{ 'value-negative': adminGetAmount < 0 }"
        >
          {{ adminFormatValue(adminGetAmount) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "AdminUserTransactionsElement",
  props: ["transaction"],
  methods: {
    adminFormatValue(value) {
      return parseFloat(value)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    adminInfoButton() {
      alert(JSON.stringify(this.transaction, null, 2));
    },
  },
  computed: {
    ...mapGetters(["modalsData"]),
    trState() {
      if (this.transaction.method === "growtopia") {
        return "completed";
      }
      return this.transaction.state;
    },
    adminGetMethod() {
      return this.transaction.method;
    },
    adminGetType() {
      return this.transaction.type;
    },
    adminGetAmount() {
      let amount = this.transaction.amount || this.transaction.tokenAmount;
      if (this.transaction.type === "withdraw") {
        amount = -amount;
      }
      return amount;
    },
  },
};
</script>

<style scoped lang="scss">
.admin-user-transactions-element {
  cursor: pointer;
  width: 100%;
  height: 47px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-radius: 5px;
}

.admin-user-transactions-element:nth-child(odd) {
  background-color: #22224a;
}

.admin-user-transactions-element .element-section {
  display: flex;
  flex-direction: column;
}

.admin-user-transactions-element .element-section {
  width: 25%;
}

.admin-user-transactions-element .section-title {
  display: none;
  font-size: 13px;
  font-weight: 600;
  color: #8bacc8;
}

.admin-user-transactions-element .section-content {
  display: flex;
  align-items: center;
}

.admin-user-transactions-element .element-section.section-date .section-content,
.admin-user-transactions-element
  .element-section.section-method
  .section-content,
.admin-user-transactions-element
  .element-section.section-type
  .section-content {
  font-size: 1rem;
  font-weight: 400;
  color: white;
}

.admin-user-transactions-element
  .element-section.section-method
  button.button-info {
  margin-left: 6px;
}

.admin-user-transactions-element
  .element-section.section-method
  button.button-info
  svg {
  fill: #bbbfd0;
  transition: fill 0.3s ease;
}

.admin-user-transactions-element
  .element-section.section-method
  button.button-info:hover
  svg {
  fill: #ffffff;
}

.admin-user-transactions-element
  .element-section.section-type
  .section-content
  span {
  font-size: 9px;
}

.type-approved {
  color: yellow;
}

.type-canceled {
  color: var(--green);
}

.type-completed {
  color: var(--green);
}

.admin-user-transactions-element
  .element-section.section-amount
  .section-content {
  justify-content: flex-end;
}

.admin-user-transactions-element
  .element-section.section-amount
  .section-content
  img {
  width: 18px;
  height: 18px;
  margin-right: 10px;
}

.admin-user-transactions-element
  .element-section.section-amount
  .content-value {
  font-size: 1rem;
  font-weight: 800;

  &.value-negative {
    color: var(--red);
  }
}

@media only screen and (max-width: 725px) {
  .admin-user-transactions-element {
    height: auto;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 20px;
  }

  .admin-user-transactions-element .element-section {
    width: 100% !important;
    margin-top: 10px;
  }

  .admin-user-transactions-element .element-section.section-date {
    margin-top: 0;
  }

  .admin-user-transactions-element .element-section.section-amount {
    align-items: flex-start;
  }

  .admin-user-transactions-element .section-title {
    display: block;
  }

  .admin-user-transactions-element .section-content {
    margin-top: 5px;
  }
}
</style>
