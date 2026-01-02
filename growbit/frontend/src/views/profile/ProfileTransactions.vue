<template>
  <div class="profile-transactions">
    <div class="title">Transactions</div>
    <div class="transactions-content">
      <div class="content-list">
        <transition name="fade" mode="out-in">
          <div
            v-if="
              userTransactionsData.transactions === null ||
              userTransactionsData.loading === true
            "
            class="content-loading"
            key="loading"
          >
            <LoadingAnimation />
          </div>
          <div
            v-else-if="userTransactionsData.transactions.length > 0"
            class="list-data"
            key="data"
          >
            <ProfileTransactionsElement
              v-for="transaction in userTransactionsData.transactions"
              v-bind:key="transaction._id"
              v-bind:transaction="transaction"
            />
          </div>
          <div v-else class="list-empty" key="empty">
            You don't have any transactions yet
          </div>
        </transition>
      </div>
    </div>
    <div class="pagination">
      <Pagination
        v-on:setPage="profileSetPage"
        v-bind:page="userTransactionsData.page"
        v-bind:count="userTransactionsData.count"
        countPage="8"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import LoadingAnimation from "@/components/LoadingAnimation";
import Pagination from "@/components/Pagination";
import ProfileTransactionsElement from "@/views/profile/ProfileTransactionsElement.vue";

export default {
  name: "ProfileTransactions",
  components: {
    LoadingAnimation,
    Pagination,
    ProfileTransactionsElement,
  },
  methods: {
    ...mapActions(["userSetTransactionsDataPage", "userGetTransactionsSocket"]),
    profileSetPage(page) {
      this.userSetTransactionsDataPage(page);

      const data = { page: this.userTransactionsData.page };
      this.userGetTransactionsSocket(data);
    },
  },
  computed: {
    ...mapGetters(["userTransactionsData"]),
  },
  created() {
    if (this.userTransactionsData.loading === false) {
      const data = { page: this.userTransactionsData.page };
      this.userGetTransactionsSocket(data);
    }
  },
};
</script>

<style scoped lang="scss">
.title {
  font-weight: 700;
  font-size: 1.714rem;
  text-align: left;
  width: 100%;
  margin-bottom: 10px;
  @media only screen and (max-width: 991px) {
    display: none;
  }
}

.profile-transactions {
  width: 100%;
  display: flex;
  flex-direction: column;

  @media only screen and (min-width: 991px) {
    padding: 23px 30px;

    background: var(--dark-blue);
    border: 4px solid #090c1d;
    border-radius: 10px;
  }

  .pagination {
    margin-top: auto;
  }
}

.profile-transactions .transactions-content {
  width: 100%;
  padding-bottom: 10px;
  border-radius: 8px;
}

.profile-transactions .content-list {
  width: 100%;
}

.profile-transactions .content-loading {
  width: 100%;
  height: 192px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-transactions .list-data {
  width: 100%;
}

.profile-transactions .list-empty {
  width: 100%;
  height: 192px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.857rem;
  font-weight: 700;
}

@media only screen and (max-width: 991px) {
  .profile-transactions .transactions-content {
    padding: 0px;
  }

  .profile-transactions .content-list {
    width: 100%;
    margin-top: 0;
  }
}
</style>
