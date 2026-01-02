<template>
  <div class="terms">
    <div class="terms-header">GrowBit TOS</div>

    <div class="terms-content">
      <LoadingAnimation v-if="loadingTos"></LoadingAnimation>
      {{ tos }}
    </div>
  </div>
</template>

<script>
import axios from "axios";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

export default {
  name: "Terms",
  metaInfo: {
    title: "Terms ",
  },
  components: { LoadingAnimation },

  created() {
    this.loadingTos = true;

    axios
      .get("tos.txt", { baseURL: null })
      .then(({ data }) => {
        this.tos = data;
        this.loadingTos = false;
      })
      .catch((e) => {
        console.error(e);
        this.loadingTos = false;
        this.tos = "Error";
      });
  },
  data() {
    return {
      loadingTos: false,
      tos: "",
    };
  },
};
</script>

<style scoped>
.terms {
  padding: 10px;

  margin-inline: auto;
  max-width: 1100px;
  .terms-header {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 12px;

    font-style: normal;
    font-weight: 900;
    font-size: 40px;

    @media screen and (max-width: 991px) {
      font-size: 1.714rem;
    }
    color: #eeeeee;
  }
  .terms-content {
    overflow: scroll;

    font-weight: 500;
    font-size: 1.143rem;
    white-space: pre-wrap; /* Preserves spaces and line breaks */
    color: #616498;
  }
}
</style>
