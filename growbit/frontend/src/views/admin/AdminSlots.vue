<template>
  <div class="container">
    <div class="all-providers">
      All providers : <br />{{ allProviders.join(" , ") }}
    </div>
    <div class="title">Disabled Providers :</div>

    <div class="chip-container">
      <div
        class="chip"
        v-for="(provider, i) of disabledProviders"
        :key="provider"
      >
        {{ provider }}

        <CloseIcon @click="enable(provider)"></CloseIcon>
      </div>
      <input
        v-model="currentInput"
        @keypress.enter="disable"
        placeholder="..."
      />
    </div>
    <button @click="notify">Notify users about change</button>
    <LoadingAnimation v-if="loading"></LoadingAnimation>
    <div v-if="error" class="error">{{ error.message }}</div>
  </div>
</template>

<script>
import AppButton from "@/components/AppButton.vue";
import { mapActions } from "vuex";
import axios from "axios";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

import CloseIcon from "@/assets/images/close.svg?inline";

export default {
  name: "admin-challenges",

  components: {
    LoadingAnimation,
    AppButton,
    CloseIcon,
  },
  data() {
    return {
      disabledProviders: [],
      allProviders: [],
      //currencyToDollar: null,
      provider: null,
      currentInput: "",
      loading: false,
      error: null,
    };
  },
  computed: {},
  created() {
    this.loading = true;
    axios
      .get("/slots/disabled-providers")
      .then(({ data }) => {
        const disabledProviders = data.disabledProviders;
        const allProviders = data.allProviders;
        if (allProviders) {
          this.allProviders = allProviders;
        }
        if (disabledProviders) {
          this.loading = false;
          this.disabledProviders = disabledProviders;
          //this.currencyToDollar = rate.currencyToDollar;
        } else {
          this.loading = false;
        }
      })
      .catch((err) => {
        this.error = err;
        this.notificationShow(err);
        this.loading = false;
      });
  },
  methods: {
    ...mapActions(["notificationShow"]),

    disable() {
      const provider = this.currentInput.trim();

      if (provider) {
        this.toggle(provider);
      }
    },
    enable(provider) {
      this.toggle(provider);
    },
    toggle(provider) {
      axios
        .post("/slots/toggle-provider", {
          provider: provider,
        })
        .then(({ data }) => {
          this.disabledProviders = data.disabledProviders;
          this.notificationShow({
            type: "success",
            message: "Provider toggled successfully!",
          });
        })
        .catch((err) => {
          this.error = err;
          this.notificationShow(err);
          this.loading = false;
        });
    },
    notify() {
      axios
        .post("/slots/notify", {})
        .then(({ data }) => {
          this.notificationShow({
            type: "success",
            message: "Users notified!",
          });
        })
        .catch((err) => {
          this.error = err;
          this.notificationShow(err);
        });
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: fit-content;
  max-width: 1500px;
  gap: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  text-align: left;
  background-color: var(--op_5_bg);
  border-radius: 20px;

  .all-providers {
    margin-bottom: 20px;
  }

  .error {
    color: red;
  }

  .chip-container {
    width: fit-content;
    border: 1px solid #ccc;
    min-height: 34px;
    display: flex;
    flex-wrap: wrap;
    align-content: space-between;
    .chip {
      margin: 4px;
      background: #22224a;
      padding: 5px 10px;
      border: 1px solid black;
      border-radius: 3px;
      display: flex;
      align-items: center;
      svg {
        cursor: pointer;
        margin-left: 8px;
      }
    }
    input {
      flex: 1 1 auto;
      width: 200px;
      border: none;
      outline: none;
      padding: 4px;
    }
  }

  button {
    border-radius: 10px;
    margin-top: 20px;
    padding: 1rem 2rem;
    background: var(--purple);
  }
}
</style>
