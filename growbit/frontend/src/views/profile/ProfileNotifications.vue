<template>
  <div class="notifications-profile">
    <div v-for="notification in profileNotifications" class="notification">
      <div class="header">
        <div>
          <RaceIcon v-if="notification.type === 'race'"></RaceIcon>
          <ChallengeIcon
            v-else-if="notification.type === 'challenge'"
          ></ChallengeIcon>
          <WalletIcon v-else></WalletIcon>
          <h2>
            {{ notification.type }}
          </h2>
        </div>
        <div class="close" @click="sendNotificationRemove(notification)">
          <IconClose></IconClose>
        </div>
      </div>
      <p class="content">
        {{ notification.message }}
      </p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import IconClose from "@/assets/images/close.svg?inline";
import WalletIcon from "@/assets/images/wallet.svg?inline";
import RaceIcon from "@/assets/images/race_placement.svg?inline";
import ChallengeIcon from "@/assets/images/challenge_won.svg?inline";

export default {
  name: "ProfileNotifications",
  components: {
    IconClose,
    WalletIcon,
    RaceIcon,
    ChallengeIcon,
  },
  data() {
    return {};
  },
  methods: {
    ...mapActions(["profileNotificationRemove"]),
    sendNotificationRemove(notification) {
      this.profileNotificationRemove(notification);
    },
  },
  computed: {
    ...mapGetters(["profileNotifications"]),
  },
};
</script>

<style scoped lang="scss">
svg {
  fill: #616498;
}

.notifications-profile {
  border-radius: 8px;
  display: flex;
  overflow: scroll;
  flex-direction: column;
  width: 100%;
  min-height: 100%;

  @media (min-width: 991px) {
    border: 2px solid #282746;
    padding: 20px;
    min-height: 100%;
  }

  .notification {
    margin-bottom: 20px;
    padding: 10px 15px;
    background: #22224a;
    border-radius: 10px;

    &:last-child {
      margin-bottom: 0;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;

      div {
        display: flex;
        align-items: center;

        h2 {
          text-transform: capitalize;
          font-size: 1.15rem;
          padding: 0;
          margin: 0 0 0 10px;
        }
      }

      .close {
        cursor: pointer;
        opacity: 0.7;

        transition: opacity 0.2s ease-in-out;

        &:hover {
          opacity: 1;
        }
      }
    }

    .content {
      font-size: 0.9rem;
      padding-top: 10px;
      margin: 0;
      color: #616498;
    }
  }
}
</style>
