<template>
  <div>
    <div class="online" v-if="adminStatsData.data?.onlineCount?.en">
      Users online : {{ adminStatsData.data?.onlineCount?.en }}
    </div>
    <div class="admin-dashboard">
      <LoadingAnimation v-if="this.adminStatsData.loading"></LoadingAnimation>
      <div v-else class="admin-profit">
        <AdminProfitElement
          type="day"
          v-bind:stats="adminStatsData.data?.stats?.daily"
        />
        <AdminProfitElement
          type="week"
          v-bind:stats="adminStatsData.data?.stats?.weekly"
        />
        <AdminProfitElement
          type="month"
          v-bind:stats="adminStatsData.data?.stats?.monthly"
        />
        <AdminProfitElement
          type="overall"
          v-bind:stats="adminStatsData.data?.stats?.total"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AdminProfitElement from "@/components/admin/AdminProfitElement";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

export default {
  name: "AdminDashboard",
  components: {
    LoadingAnimation,
    AdminProfitElement,
  },
  data() {
    return {
      adminMode: "daily",
    };
  },
  methods: {
    ...mapActions(["adminGetStatsDataSocket"]),
  },
  computed: {
    ...mapGetters(["adminStatsData"]),
  },
  created() {
    if (this.adminStatsData.loading === false) {
      const data = {};
      this.adminGetStatsDataSocket(data);
    }
  },
};
</script>

<style scoped>
.online {
  padding-top: 5px;
  padding-bottom: 20px;
  font-weight: 900;
  font-size: 16px;
  color: var(--green);
}
.admin-dashboard {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.admin-dashboard .admin-profit {
  width: 100%;
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr 1fr;
  @media screen and (max-width: 991px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

.admin-dashboard .admin-growth {
  width: 100%;
  margin-top: 30px;
}

.admin-dashboard .growth-header {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-dashboard .growth-header:before {
  content: "";
  height: 1px;
  position: absolute;
  top: 16px;
  left: 135px;
  right: 273px;
  background: #333;
}

.admin-dashboard .header-title {
  font-size: 1.714rem;
  font-weight: 800;
  color: #ffffff;
}

.admin-dashboard .header-actions {
  display: flex;
  align-items: center;
}

.admin-dashboard .header-actions button {
  margin-right: 22px;
  font-size: 1.143rem;
  font-weight: 700;
  color: #5f6779;
  transition: color 0.3s ease;
}

.admin-dashboard .header-actions button:last-of-type {
  margin-right: 0;
}

.admin-dashboard .header-actions button.button-active {
  color: #ffffff;
}

.admin-dashboard .growth-content {
  width: 100%;
  height: 250px;
  margin-top: 25px;
  border-radius: 15px;
  background: radial-gradient(
    180% 125% at 50% 15%,
    rgba(3, 43, 79, 0) 0%,
    #1d2433 100%
  );
  border: 1px solid #444;
  overflow: hidden;
}

.admin-dashboard .content-chart {
  width: 100%;
  height: 100%;
  position: relative;
  background: repeating-linear-gradient(#22224a 0 1px, transparent 1px 100%),
    repeating-linear-gradient(90deg, #22224a 0 1px, transparent 1px 100%);
  background-size: 7.69% 41.66px;
}

.admin-dashboard .chart-graph {
  position: absolute;
  top: 0;
  bottom: -6px;
  left: -6px;
  right: -6px;
}

@media only screen and (max-width: 550px) {
  .admin-dashboard .growth-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-dashboard .growth-header:before {
    right: 0;
  }

  .admin-dashboard .header-actions {
    margin-top: 17px;
  }
}
</style>
