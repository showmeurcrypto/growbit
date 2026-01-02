<template>
  <div class="input-container">
    <img :src="SearchIcon" />
    <input
      type="text"
      :value="value"
      @input="handleSearch($event.target.value)"
      placeholder="Search..."
    />
    <img
      class="remove"
      v-if="value"
      :src="CloseIcon"
      @click="handleSearch('')"
    />
  </div>
</template>

<style scoped>
.input-container {
  background: #22224a;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.07);

  &:focus-within {
    border: 2px solid var(--purple-2);
  }

  border-radius: 8px;
  display: flex;
  align-items: center;
  flex-direction: row;

  padding: 12px 15px;
  height: 48px;

  input {
    margin-left: 8px;
    border: 0;
    width: 100%;

    font-weight: 500;
    font-size: 1.143rem;

    color: var(--purple-2);
  }

  img {
    height: 24px;
    width: 24px;
  }

  img.remove {
    cursor: pointer;
    width: 18px;
    height: 18px;
  }
}
</style>

<script>
import SearchIcon from "@/assets/images/search.png";
import CloseIcon from "@/assets/images/close.svg";

export default {
  created() {
    // this.handleSearch = _.debounce(function (newValue) {
    //   const trimmed = newValue.trim();
    //   this.value = trimmed;
    //   this.onSearch(trimmed);
    // }, 1000);
  },
  data() {
    return {
      value: "",
      SearchIcon,
      CloseIcon,
    };
  },
  mounted() {},
  beforeDestroy() {
    this.value = "";
  },
  methods: {
    handleSearch(newValue) {
      const trimmed = newValue.trim();
      this.value = trimmed;
      this.onSearch(trimmed);
    },
  },
  props: ["onSearch"],
};
</script>
