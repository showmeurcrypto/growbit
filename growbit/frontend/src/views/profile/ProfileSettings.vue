<template>
  <div class="profile-settings">
    <div class="title">Settings</div>
    <div class="settings-element element-toggle">
      <div class="element-title">Hide My Bets</div>
      <div class="element-input">
        <button
          @click="userToggleAnonymous()"
          class="button-toggle"
          :class="{
            'button-active': authUser.user.anonymous === true,
          }"
          v-bind:disabled="socketSendLoading !== null"
        ></button>
      </div>
    </div>
    <div class="settings-element element-range">
      <div class="element-title">Audio Volume</div>
      <div class="element-input">
        <input
          v-model="userVolume"
          v-on:input="this.soundSetVolume(userVolume)"
          type="range"
          v-bind:min="0.01"
          v-bind:max="1"
          step="0.01"
          v-bind:style="{
            'background-image':
              '-webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(' +
              userVolume +
              ', #616498), color-stop(' +
              userVolume +
              ', #3a3a65))',
          }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ButtonLoading from "@/components/ButtonLoading";

export default {
  name: "ProfileSettings",
  components: {
    ButtonLoading,
  },
  data() {
    return {
      modalCookie: null,
      userVolume: 1,
    };
  },
  metaInfo: {
    title: "Profile",
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "soundSetVolume",
      "modalsSetShow",
      "userSendUserAnonymousSocket",
    ]),
    userToggleAnonymous() {
      const data = { anonymous: !this.authUser.user.anonymous };
      this.userSendUserAnonymousSocket(data);
    },
  },
  computed: {
    ...mapGetters([
      "authSendLoginLoading",
      "socketSendLoading",
      "authUser",
      "soundVolume",
    ]),
  },
  created() {
    this.userVolume = this.soundVolume;
  },
};
</script>

<style scoped lang="scss">
.profile-settings {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;

  @media only screen and (min-width: 991px) {
    background: var(--dark-blue);
    border: 4px solid #090c1d;
    border-radius: 10px;
  }

  @media only screen and (max-width: 991px) {
    padding: 0;
  }

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
}

.profile-settings .settings-element {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  display: flex;
  flex-direction: row;
  background: #22224a;
  border-radius: 9px;
}

.profile-settings .settings-element.element-button,
.profile-settings .settings-element.element-range,
.profile-settings .settings-element.element-toggle {
  height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-settings .element-title {
  padding: 1px 4px;
  font-style: normal;
  font-weight: 500;
  font-size: 1.143rem;
  line-height: 23px;
  /* identical to box height */

  color: var(--purple-2);

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

.profile-settings .element-info {
  padding: 0 4px;
  text-transform: uppercase;
  font-size: 0.857rem;
  font-weight: 500;
}

.profile-settings .element-info a {
  color: #fd3b31;
}

.profile-settings .element-input {
  display: flex;
  align-items: center;
}

.profile-settings .settings-element.element-text .element-input {
  width: 100%;
  position: relative;
  margin-top: 6px;
}

.profile-settings .element-input input[type="text"] {
  width: 100%;
  height: 54px;
  padding: 0 148px 0 17px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: #22224a;
}

.profile-settings .element-input input[type="text"]::-moz-placeholder {
  font-size: 13px;
  font-weight: 700;
  color: #616498;
}

.profile-settings .element-input input[type="text"]::placeholder {
  font-size: 13px;
  font-weight: 700;
  color: #616498;
}

.profile-settings button.button-set {
  width: 136px;
  height: 41px;
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  border-radius: 5px;
  text-transform: uppercase;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: #fd3b31;
  border-bottom: 2px solid #97302b;
}

.profile-settings button.button-set .button-loading {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-settings button.button-set .button-loading.fade-leave-active {
  transition: opacity 0.5s;
}

.profile-settings button.button-set .button-loading.fade-leave-to {
  opacity: 0;
}

.profile-settings button.button-set .button-content.fade-enter-active {
  transition: opacity 0.5s;
}

.profile-settings button.button-set .button-content.fade-enter-from {
  opacity: 0;
}

.profile-settings button.button-toggle {
  width: 56px;
  height: 30px;
  position: relative;

  &:before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 34px;
    background: #3a3a65;
  }

  &:after {
    content: "";
    width: 22px;
    height: 22px;
    position: absolute;
    left: 4px;
    top: 4px;
    border-radius: 50%;
    background: #22224a;
    transition: transform 0.3s ease;
  }

  &.button-active:before {
    background: #616498;
  }

  &.button-active:after {
    transform: translateX(26px);
    background: #22224a;
  }
}

.profile-settings .element-input input[type="range"] {
  width: 250px;
  @media only screen and (max-width: 991px) {
    width: unset;
  }
  height: 6px;
  border-radius: 3px;
  -webkit-appearance: none;
  -moz-apperance: none;
  background: #22224a;
}

.profile-settings .element-input input[type="range"]::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 100%;
  background: var(--purple-2);
  cursor: pointer;
}

.profile-settings .element-input input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 100%;
  background: var(--purple-2);
  cursor: pointer;
}

.profile-settings button.button-discord {
  width: 160px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: #5865f2;
  border-bottom: 2px solid #454fc4;
}

.profile-settings button.button-discord svg {
  width: 24px;
  margin-right: 8px;
  fill: #fff;
}
</style>
