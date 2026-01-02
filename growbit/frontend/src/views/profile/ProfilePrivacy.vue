<template>
  <div class="profile-stats">
    <div class="top_row">Blocked Users</div>
    <div class="user-list">
      <div class="user" v-for="u in ignoredUsers">
        <div class="avatar">
          <AvatarImage :avatar-number="u.avatar"></AvatarImage>
        </div>

        <span>{{ u.username }}</span>

        <button @click="unignore(u._id)">
          <img :src="CloseIcon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import CloseIcon from "@/assets/images/close.svg";
import AvatarImage from "@/components/AvatarImage.vue";
export default {
  name: "ProfilePrivacy",
  mixins: [currencyExchangeRatesMixin],
  components: { AvatarImage, Currency },
  data() {
    return { CloseIcon };
  },
  methods: {
    ...mapActions(["chatIgnoreUserSocket"]),
    unignore(userId) {
      this.chatIgnoreUserSocket({ userId });
    },
  },
  computed: {
    ...mapGetters(["authUser"]),
    ignoredUsers() {
      return this.authUser.user?.ignoreList || [];
    },
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

  .user-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow: scroll;

    .user {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 10px 10px 10px 15px;
      width: 100%;
      height: 60px;
      background: #22224a;
      border-radius: 10px;

      span {
        font-style: normal;
        font-weight: 500;
        font-size: 15px;

        color: #eeeeee;
        margin-left: 10px;
        margin-right: auto;
      }

      .avatar {
        width: 40px;
        height: 40px;
        overflow: hidden;

        border-radius: 50px;
      }

      button {
        width: 40px;
        height: 40px;

        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
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
