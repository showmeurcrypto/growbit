<template>
  <div class="profile-overview">
    <form @submit.prevent="updatePassword" class="left">
      <div class="title main-title">General</div>

      <div class="input-profile-group">
        <div class="label">Email</div>
        <div class="email">
          <input disabled :value="authUser?.user?.local?.email" type="email" />
          <button
            v-if="!authUser?.user?.local?.emailVerified"
            class="button-save"
            @click="verify()"
          >
            Verify
          </button>
        </div>
      </div>

      <div class="title">Change Password</div>

      <div class="input-profile-group">
        <div class="label">New Password</div>
        <input
          placeholder="New Password"
          v-model="new_password"
          type="password"
          autocomplete="off"
        />
      </div>

      <div class="input-profile-group" style="margin-bottom: 20px">
        <div class="label">Confirm New Password</div>
        <input
          placeholder="Confirm password"
          v-model="confirm_password"
          type="password"
          autocomplete="off"
        />
      </div>
      <app-button :fullwidth="true" :click="() => {}"
        >Change Password</app-button
      >
    </form>

    <ProfileNotifications></ProfileNotifications>
  </div>
</template>

<script>
import AvatarImage from "@/components/AvatarImage";
import AppButton from "@/components/AppButton.vue";
import ProfileNotifications from "@/views/profile/ProfileNotifications.vue";
import { mapGetters, mapActions } from "vuex";
import axios from "axios";

export default {
  name: "ProfileOverview",
  components: {
    ProfileNotifications,
    AppButton,
    AvatarImage,
  },
  data() {
    return {
      new_password: null,
      confirm_password: "",
    };
  },
  metaInfo: {
    title: "Profile",
  },
  methods: {
    ...mapActions(["notificationShow", "modalsSetData", "modalsSetShow"]),
    verify() {
      this.modalsSetData({
        typeCaptcha: "credentialsRequest",
        data: { type: "verify", email: this.authUser?.user?.local?.email },
      });
      this.modalsSetShow("Captcha");
    },
    updatePassword() {
      if (this.new_password !== this.confirm_password) {
        toast.error("Passwords don't match!");
      }

      axios
        .post("/auth/credentials/change", {
          password: this.new_password,
        })
        .then(() => {
          this.notificationShow({
            type: "success",
            message: "Password updated successfully!",
          });
        })
        .catch((err) => {
          console.error(err);
          this.notificationShow(err);
        });
    },
  },
  computed: {
    ...mapGetters(["authUser"]),
  },
};
</script>

<style scoped>
.profile-overview {
  padding: 30px;
  display: flex;

  @media only screen and (min-width: 991px) {
    max-height: 580px;
  }

  @media only screen and (max-width: 991px) {
    flex-direction: column;
    padding: 0;
    .main-title {
      display: none;
    }
  }
  gap: 30px;
  width: 100%;
  height: fit-content;

  @media only screen and (min-width: 991px) {
    background: var(--dark-blue);
    border: 4px solid #090c1d;
    border-radius: 10px;
  }

  .left {
    width: 100%;
    @media only screen and (min-width: 991px) {
      max-width: 600px;
    }
    .title {
      margin-bottom: 20px;
      font-weight: 700;
      font-size: 1.429rem;
      color: #eeeeee;
    }

    .main-title {
      font-weight: 700;
      font-size: 1.714rem;

      color: #eeeeee;
    }

    .label {
      font-style: normal;
      font-weight: 500;
      font-size: 1.29rem;
      color: #eeeeee;
      margin-bottom: 10px;
    }

    input {
      width: 100%;
      padding: 13px 15px;
      height: 49px;
      border: 2px solid #22224a;
      border-radius: 10px;
      margin-bottom: 15px;

      &::placeholder {
        color: #616498;
      }
    }

    .email {
      border-radius: 10px;
      margin-bottom: 20px;
      padding-left: 10px;

      input {
        padding: 0;
        margin: 0;
        color: #616498;
      }

      button.button-save {
        padding: 8px 12px;
        border-radius: 5px;
        font-size: 1rem;
        font-weight: 700;
        color: #fff;
        background: var(--purple);
        margin-right: 5px;
      }

      align-items: center;
      display: flex;
      border: 0;
      background: #22224a;
      color: #616498;
    }
  }
}
</style>
