<template>
  <Search
    :on-search="
      (unboxSearch) => {
        unboxSetFilterSearch(unboxSearch);
      }
    "
  ></Search>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Search from "@/components/Search.vue";

export default {
  name: "UnboxFilterSearch",
  data() {
    return {
      unboxSearch: "",
    };
  },
  components: {
    Search,
  },
  methods: {
    ...mapActions(["unboxSetFilterSearch"]),
  },
  computed: {
    ...mapGetters(["unboxFilterSearch"]),
  },
  created() {
    //this.unboxSearch = this.unboxFilterSearch;
  },
  beforeDestroy() {
    this.unboxSearch = "";
    this.unboxSetFilterSearch("");
  },
};
</script>

<style scoped>
.unbox-filter-search {
  width: 100%;
  height: 47px;
  position: relative;
  margin-right: 15px;
  padding: 1px;
  z-index: 1;
  border: 1px solid gray;
  border-radius: 4px;
}

.unbox-filter-search::before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}

.unbox-filter-search::after {
  content: "";
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  position: absolute;
  top: 1px;
  left: 1px;
  z-index: -1;
}

.unbox-filter-search svg {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translate(0, -50%);
  fill: #395b77;
}

.unbox-filter-search input {
  width: 100%;
  height: 100%;
  padding: 0 20px 0 40px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.unbox-filter-search input::placeholder {
}

@media only screen and (max-width: 550px) {
  .unbox-filter-search {
    width: 100%;
  }
}
</style>
