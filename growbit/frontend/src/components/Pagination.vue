<template>
  <div class="pagination">
    <button v-on:click="changePage(1)" v-bind:disabled="page === 1">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <path
          d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
        ></path>
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <path
          d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
        ></path>
      </svg>
    </button>
    <button v-on:click="changePage(page - 1)" v-bind:disabled="page <= 1">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <path
          d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
        ></path>
      </svg>
    </button>
    <button>{{ page }}</button>
    <button
      v-on:click="changePage(page + 1)"
      v-bind:disabled="page >= Math.ceil(count / countPage)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <path
          d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
        ></path>
      </svg>
    </button>
    <button
      v-on:click="changePage(Math.floor(count / countPage + 1))"
      v-bind:disabled="count <= countPage"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <path
          d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
        ></path>
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <path
          d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
        ></path>
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: "Pagination",
  components: {},
  props: ["page", "count", "countPage"],
  computed: {
    totalPages() {
      return Math.ceil(this.count / this.countPage);
    },
  },
  methods: {
    changePage(newPage) {
      if (this.page === newPage) {
        return;
      }
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.$emit("setPage", newPage);
      }
    },
  },
};
</script>

<style scoped>
.pagination {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 18px;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

.pagination button {
  height: 37px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  padding: 0 16px;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 700;
  color: white;
  background: #22224a;
}

.pagination button:not([disabled]):hover {
  color: #fff;
}

.pagination button:last-of-type {
  margin-right: 0;
}

.pagination button svg {
  width: 8px;
  fill: white;
  transition: fill 0.3s ease;
}

.pagination button:not([disabled]):hover svg {
  fill: #fff;
}
</style>
