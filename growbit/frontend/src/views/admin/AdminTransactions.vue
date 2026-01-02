<template>
  <div class="admin-stats">
    <div class="stats-list">
      <div class="list-header">
        <div class="header-date">Date</div>
        <div class="header-npc">Method</div>
        <div class="header-crypto">User</div>
        <div class="header-crypto">Type</div>
        <div class="header-crypto">Amount</div>
      </div>
      <div class="list-content">
        <transition name="fade" mode="out-in">
          <div
            v-if="
              adminTransactionList.data === null ||
              adminTransactionList.loading === true
            "
            class="content-loading"
            key="loading"
          >
            <LoadingAnimation />
          </div>
          <div
            v-else-if="adminTransactionList.data.length > 0"
            class="content-list"
            key="data"
          >
            <AdminTransactionsElement
              v-for="transaction in adminTransactionList.data"
              v-bind:key="transaction._id"
              v-bind:transaction="transaction"
            />
          </div>
          <div v-else class="content-empty" key="empty">
            No transactions found.
          </div>
        </transition>
      </div>
      <div class="list-pagination">
        <button
          v-on:click="adminSetPage(adminTransactionList.page - 1)"
          class="button-prev"
          v-bind:disabled="adminTransactionList.page <= 1"
        >
          <div class="button-inner">
            <img src="@/assets/images/arrow_left.svg" />
          </div>
        </button>
        <div class="pagination-info">
          PAGE
          <span class="text-green-gradient">{{
            adminTransactionList.page
          }}</span>
          /
          {{
            Math.ceil(adminTransactionList.count / 12) <= 0
              ? "1"
              : Math.ceil(adminTransactionList.count / 12)
          }}
        </div>
        <button
          v-on:click="adminSetPage(adminTransactionList.page + 1)"
          class="button-next"
          v-bind:disabled="
            adminTransactionList.page >=
            Math.ceil(adminTransactionList.count / 12)
          "
        >
          <div class="button-inner">
            <img
              style="transform: rotate(180deg)"
              src="@/assets/images/arrow_left.svg"
            />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import LoadingAnimation from "@/components/LoadingAnimation";
import AdminTransactionsElement from "@/components/admin/user/AdminTransactionsElement.vue";

export default {
  name: "AdminTransactions",
  components: {
    AdminTransactionsElement,
    LoadingAnimation,
  },
  methods: {
    ...mapActions([
      "adminGetTransactionListSocket",
      "adminSetTransactionListPage",
    ]),
    adminSetPage(page) {
      if (this.adminTransactionList.page === page) {
        return;
      }
      if (page < 1 || page > Math.ceil(this.adminTransactionList.count / 12)) {
        return;
      }

      this.adminSetTransactionListPage(page);

      const data = {
        page: this.adminTransactionList.page,
      };
      this.adminGetTransactionListSocket(data);
    },
  },
  computed: {
    ...mapGetters(["adminTransactionList"]),
  },
  created() {
    if (this.adminTransactionList.loading === false) {
      const data = { page: this.adminTransactionList.page };
      this.adminGetTransactionListSocket(data);
    }
  },
};
</script>

<style scoped>
.admin-stats {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.admin-stats .stats-list {
  width: 100%;
  padding-top: 15px;
}

.admin-stats .list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-size: 1rem;
  font-weight: 700;
  color: #5f6779;
}

.admin-stats .header-date,
.admin-stats .header-npc,
.admin-stats .header-crypto {
  width: 10%;
}

.admin-stats .list-content {
  width: 100%;
  margin-top: 20px;
  padding: 20px 0;
}

.admin-stats .content-loading {
  width: 100%;
  height: 330px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.admin-stats .content-loading.fade-leave-active {
  transition: opacity 0.5s;
}

.admin-stats .content-loading.fade-leave-to {
  opacity: 0;
}

.admin-stats .content-list {
  width: 100%;
}

.admin-stats .content-empty {
  width: 100%;
  height: 192px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: 0.857rem;
  font-weight: 600;
  color: #aaa;
}

.admin-stats .content-list.fade-enter-active,
.admin-stats .content-empty.fade-enter-active {
  transition: opacity 0.5s;
}

.admin-stats .content-list.fade-enter-from,
.admin-stats .content-empty.fade-enter-from {
  opacity: 0;
}

.admin-stats .list-pagination {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
}

.admin-stats .list-pagination button {
  width: 52px;
  height: 37px;
  position: relative;
  padding: 1px;
  z-index: 1;
}

.admin-stats .list-pagination button:disabled {
  cursor: not-allowed;
}

.admin-stats .list-pagination button .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(3, 20, 34, 0.27);
}

.admin-stats .list-pagination button:disabled .button-inner {
  background: rgba(3, 20, 34, 0.27);
  box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.35);
}

.admin-stats .list-pagination button .button-inner svg {
  fill: #00ffc2;
}

.admin-stats .list-pagination button:disabled .button-inner svg {
  fill: #5f6779;
}

.admin-stats .pagination-info {
  font-size: 0.857rem;
  font-weight: 800;
  color: #5f6779;
}

@media only screen and (max-width: 1250px) {
  .admin-stats .stats-list {
    width: 100%;
    padding-top: 0;
    padding-right: 0;
  }

  .admin-stats .list-header {
    display: none;
  }

  .admin-stats .list-content {
    margin-top: 0;
    padding: 0 0 20px 0;
    border-top: none;
  }
}
</style>
