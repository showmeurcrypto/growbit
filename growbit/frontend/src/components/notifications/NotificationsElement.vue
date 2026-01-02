<template>
  <div
    class="notifications-element"
    v-bind:class="'element-' + notification.type"
    @click="sendNotificationRemove()"
  >
    <CloseIcon class="close"></CloseIcon>

    <div class="element-content">
      <div class="content-icon">
        <SuccessIcon v-if="notification.type === 'success'"></SuccessIcon>
        <FailIcon v-if="notification.type === 'error'"></FailIcon>
      </div>
      <span>{{ notification.message }}</span>
    </div>
    <div class="element-timer">
      <div
        class="timer-progress"
        v-bind:style="{ width: timerHeight + '%' }"
      ></div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import CloseIcon from "@/assets/images/close.svg?inline";
import SuccessIcon from "@/assets/images/positive-notification.svg?inline";
import FailIcon from "@/assets/images/x-notification.svg?inline";

export default {
  name: "NotificationsElement",
  components: { CloseIcon, SuccessIcon, FailIcon },
  props: ["notification"],
  data() {
    return {
      timer: 5000,
      notificationInterval: null,
    };
  },
  methods: {
    ...mapActions(["notificationRemove"]),
    sendNotificationRemove() {
      this.notificationRemove(this.notification);
    },
  },
  computed: {
    getNotificationType() {
      return (
        this.notification.type.charAt(0).toUpperCase() +
        this.notification.type.slice(1)
      );
    },
    timerHeight() {
      return (100 / 5000) * this.timer;
    },
  },
  created() {
    let self = this;
    const target = Date.now() + self.timer;

    this.notificationInterval = setInterval(function () {
      self.timer = target - Date.now();

      if (self.timer <= 0) {
        clearInterval(self.notificationInterval);
        self.notificationRemove(self.notification);
      }
    }, 1);
  },
  beforeDestroy() {
    clearInterval(this.notificationInterval);
  },
};
</script>

<style scoped lang="scss">
.notifications-element {
  overflow: hidden;
  width: 305px;
  height: 70px;
  position: relative;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  background: #22224a;
  border-radius: 5px;
  cursor: pointer;

  .close {
    position: absolute;
    right: 10px;
    top: 10px;

    path {
      stroke: #3a3a65;
    }
  }

  .element-timer {
    width: 100%;
    display: flex;
    align-items: flex-end;
  }

  .timer-progress {
    height: 3px;
    width: 100%;
  }

  &.element-success {
    .content-icon svg path {
      fill: #00aa6d;
    }

    .element-timer .timer-progress {
      background-color: #00aa6d;
    }
  }

  &.element-error {
    .content-icon svg path {
      fill: #e94848;
    }

    .element-timer .timer-progress {
      background-color: #e94848;
    }
  }

  .element-content {
    width: calc(100%);
    height: calc(100% - 3px);
    display: flex;
    align-items: center;
    padding: 0 27px 0 15px;
    gap: 10px;
    font-style: normal;
    font-weight: 700;
    font-size: 0.857rem;
    color: #ffffff;

    span {
      width: calc(100% - 50px);
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
    }
  }

  .content-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background: rgba(9, 12, 29, 0.45);
    border-radius: 8px;
  }
}

.notifications-element:first-of-type {
  margin-top: 0px;
}
</style>
