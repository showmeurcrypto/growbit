<script>
export default {
  data() {
    return {
      formattedStr: "",
    };
  },
  created() {
    if (this.end) {
      this.formattedStr = this.formatRemainingTime();
      setInterval(() => {
        this.formattedStr = this.formatRemainingTime();
      }, 1000);
    }
  },
  methods: {
    formatRemainingTime() {
      let remainingMs = Math.max(new Date(this.end) - new Date().getTime(), 0);
      let days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      let hours = Math.floor(
        (remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      let minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
      return (
        (days > 0 ? `${days}d ` : "") +
        `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    },
  },
  props: ["end"],
};
</script>

<template>
  <span>
    {{ this.formattedStr }}
  </span>
</template>

<style scoped lang="scss"></style>
