<template>
  <div class="admin-settings-toggle">
    <div class="toggle-name">{{ name }}</div>
    <button
      v-on:click="adminSettingsToggle(!adminGetValue)"
      v-bind:class="{ 'button-active': adminGetValue === true }"
      v-bind:disabled="socketSendLoading !== null"
    ></button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "AdminSettingsToggle",
  props: ["name", "setting"],
  methods: {
    ...mapActions(["adminSendSettingValueSocket"]),
    adminSettingsToggle(value) {
      const data = { setting: this.setting, value: value };
      this.adminSendSettingValueSocket(data);
    },
  },
  computed: {
    ...mapGetters(["socketSendLoading", "generalSettings"]),
    adminGetValue() {
      let value = this.generalSettings;

      for (let key of this.setting.split(".")) {
        value = value[key];
      }

      return value;
    },
  },
};
</script>

<style scoped>
.admin-settings-toggle {
  width: 100%;
  height: 47px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 0 10px;
  border-radius: 5px;
}

.admin-settings-toggle .toggle-name {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 700;
  color: #7c808d;
}

.admin-settings-toggle button {
  width: 45px;
  height: 22px;
  position: relative;
  filter: drop-shadow(0px 4px 25px rgba(15, 41, 63, 0.35));
}

.admin-settings-toggle button:disabled {
  cursor: not-allowed;
}

.admin-settings-toggle button::before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 34px;
  background: rgba(253, 59, 49, 0.4);
}
.admin-settings-toggle button.button-active::before {
  background: rgba(0, 199, 77, 0.4);
}

.admin-settings-toggle button::after {
  content: "";
  width: 19px;
  height: 19px;
  position: absolute;
  top: 1px;
  left: 2px;
  border-radius: 50%;
  background: #fd3b31;
  transition: transform 0.3s ease;
}

.admin-settings-toggle button.button-active::after {
  transform: translateX(26px);
  background: var(--green);
}
</style>
