<template>
  <div v-if="show" class="admin">
    <div class="admin-container">
      <div class="container-header">
        <router-link to="/admin" class="header-title">Admin Panel</router-link>
        <AdminFilterNavbar />
      </div>
      <div class="container-content">
        <transition name="slide-fade" mode="out-in">
          <router-view />
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import AdminFilterNavbar from "@/components/admin/AdminFilterNavbar";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Admin",
  metaInfo: {
    title: "Admin ",
  },
  methods: {
    ...mapActions(["adminGetSupportChats"]),
  },
  components: {
    AdminFilterNavbar,
  },
  created() {
    this.adminGetSupportChats();
  },
  computed: {
    show() {
      return sessionStorage.getItem("admin");
    },
  },
};
</script>

<style scoped>
.admin {
  width: 100%;
  padding: 0 0 45px 0;
}

.admin .admin-container {
  width: 100%;

  padding: 15px;

  @media (min-width: 991px) {
    padding: 30px;
    background: var(--dark-blue-2);
  }
}

.admin .container-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin .container-header a.header-title {
  font-size: 2.286rem;
  font-weight: 800;
  color: #fff;
}

.admin .container-content {
  width: 100%;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--purple-2);
}

.admin .container-content .slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.admin .container-content .slide-fade-enter {
  opacity: 0;
}

@media only screen and (max-width: 991px) {
  .admin {
    padding: 20px 0 45px 0;
  }

  .admin .admin-container {
    padding: 15px;
  }
}

@media only screen and (max-width: 650px) {
  .admin .container-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin .container-content {
    margin-top: 10px;
  }
}
</style>
