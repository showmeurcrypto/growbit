<template>
  <div class="container">
    <div class="top_bar">
      <div class="title">Exchange Rates</div>
    </div>

    <div class="rates_input">
      <label for="dollarToCurrency">Dollar to DLS:</label>
      <input
        type="number"
        id="dollarToCurrency"
        v-model="dollarToCurrency"
        placeholder="Enter rate"
      />

      <!--       <label for="currencyToDollar">Currency to Dollar:</label>
      <input
        type="number"
        id="currencyToDollar"
        v-model="currencyToDollar"
        placeholder="Enter rate"
      />-->
    </div>

    <AppButton v-if="!loading && dollarToCurrency" :click="() => setRates()"
      >Save</AppButton
    >
    <LoadingAnimation v-if="loading"></LoadingAnimation>
    <div v-if="error" class="error">{{ error.message }}</div>
  </div>
</template>

<script>
import AppButton from "@/components/AppButton.vue";
import { mapActions } from "vuex";
import axios from "axios";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

export default {
  name: "admin-challenges",

  components: {
    LoadingAnimation,
    AppButton,
  },
  data() {
    return {
      dollarToCurrency: null,
      //currencyToDollar: null,
      loading: false,
      error: null,
    };
  },
  computed: {},
  created() {
    this.loading = true;
    axios
      .get("/growtopia/rates")
      .then(({ data }) => {
        const rate = data.rate;
        console.log(rate);
        if (rate) {
          this.loading = false;
          this.dollarToCurrency = rate.dollarToCurrency;
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
    ...mapActions(["modalsSetShow", "modalsSetData", "notificationShow"]),
    setRates() {
      axios
        .post("/growtopia/rates", {
          dollarToCurrency: +this.dollarToCurrency,
          //currencyToDollar: +this.currencyToDollar,
        })
        .then(({ data }) => {
          this.notificationShow({
            type: "success",
            message: "Exchange rates updated successfully!",
          });
        })
        .catch((err) => {
          this.error = err;
          this.notificationShow(err);
          this.loading = false;
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  text-align: left;
  background-color: var(--op_5_bg);
  border-radius: 20px;

  .error {
    color: red;
  }

  .rates_input {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;

    input {
      height: 50px;
      padding-left: 10px;

      background: #22224a;
      border-radius: 9px;
    }
  }

  .top_bar {
    .title {
      font-size: 1.714rem;
      font-weight: 700;
    }
    display: flex;
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
    > * {
      min-width: fit-content;
      max-width: 20%;
    }

    button:first-of-type {
      margin-left: auto;
      margin-right: 10px;
    }

    @media only screen and (max-width: 991px) {
      flex-direction: column;
      gap: 10px;
      button:first-of-type {
        margin-left: 0;
      }
    }
  }

  .challenges {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;

    td,
    th {
      padding: 10px;
    }

    tbody tr:nth-of-type(odd) td {
      @media screen and (min-width: 991px) {
        background: #22224a;
      }
    }

    button {
      background: #891606;
      border-radius: 8px;
      padding: 5px 15px;
    }

    @media screen and (max-width: 991px) {
      thead {
        display: none; /* Hide table headers */
      }

      tr {
        display: block;
        margin-bottom: 10px;
      }

      td {
        display: block;
        text-align: right;
        border: none;
        position: relative;
        padding-left: 50%;
        &:last-of-type {
          border-bottom: 1px solid var(--purple-2);
        }
      }

      td::before {
        content: attr(data-label); /* Add label before each cell */
        position: absolute;
        left: 10px;
        font-weight: bold;
        text-align: left;
      }
    }
  }
}

.challenge {
  position: relative;
  background: var(--dark-blue);
  border: 2px solid rgba(139, 76, 218, 0.5);
  border-radius: 10px;

  &.green {
    border: 2px solid green;
  }

  &.blue {
    border: 2px solid darkblue;
  }

  &.yellow {
    border: 2px solid yellow;
  }

  @media only screen and (max-width: 991px) {
    width: 100%;
    img {
      display: none;
    }
  }
  height: 253px;
  background: var(--op_5_bg);
  border-radius: 15px;
  display: flex;
  padding: 30px 25px;
  cursor: pointer;
  gap: 20px;

  > .right {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
    > p:first-child {
    }

    > div {
      gap: 10px;
      > span:last-of-type {
        color: var(--success);
      }
      width: 100%;
      display: flex;
    }
  }
}
</style>
