<template>
  <div class="container">
    <div class="top_bar">
      <div class="title">Upcoming & Active Challenges</div>

      <AppButton :click="() => showCreateModal()">Create Challenge</AppButton>
    </div>

    <table class="challenges">
      <thead>
        <tr>
          <th>Challenge</th>
          <th>Game</th>
          <th>Min. Bet</th>
          <th>Multiplier</th>
          <th>Reward</th>
          <th>Colour</th>
          <th>Date</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="challenge in filteredChallenges"
          :key="challenge.id"
          :class="challenge.colour"
        >
          <td data-label="Name">{{ challenge.name }}</td>
          <td data-label="Game">{{ challenge.game }}</td>
          <td data-label="MinBet">{{ challenge.minBet }}</td>
          <td data-label="Multiplier">{{ challenge.multiplier }}</td>
          <td data-label="Rewards">{{ challenge.reward }}</td>
          <td data-label="Colour">{{ challenge.colour }}</td>
          <td data-label="Date">{{ formatDate(challenge.startTime) }}</td>
          <td>
            <button @click="deleteChallenge(challenge._id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import AppButton from "@/components/AppButton.vue";
import { mapActions } from "vuex";
import axios from "axios";

export default {
  name: "admin-challenges",

  components: {
    AppButton,
  },
  data() {
    return {
      challenges: [],
      loading: false,
      error: null,
      search: "",
    };
  },
  computed: {
    filteredChallenges() {
      return this.challenges.filter(
        (challenge) =>
          !this.search ||
          challenge.name.toLowerCase().includes(this.search.toLowerCase()) ||
          challenge.game.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },
  methods: {
    ...mapActions(["modalsSetShow", "modalsSetData", "notificationShow"]),
    formatDate(date) {
      const today = new Date().toISOString().split("T")[0];
      if (date.split("T")[0] === today) {
        return "Active";
      }
      return date.split("T")[0];
    },
    showCreateModal() {
      this.modalsSetData({ callback: () => this.fetchChallenges() });
      this.modalsSetShow("CreateChallenge");
    },
    fetchChallenges() {
      this.loading = true;
      axios
        .get("/challenges/upcoming")
        .then(({ data }) => {
          this.loading = false;
          this.challenges = data.challenges;
        })
        .catch((e) => {
          const msg = e?.response?.data?.error?.message || {
            type: "error",
            message: "Error",
          };
          this.notificationShow(msg);
          this.error = msg;
          this.loading = false;
        });
    },
    deleteChallenge(id) {
      axios
        .delete("/challenges/" + id)
        .then(({ data }) => {
          this.notificationShow({
            type: "success",
            message: "Challenge has been deleted!",
          });
          this.challenges = this.challenges.filter((c) => c._id !== id);
        })
        .catch((e) => {
          const msg = e?.response?.data?.error?.message || {
            type: "error",
            message: "Error",
          };
          this.notificationShow(msg);
        });
    },
    handleSearch(value) {
      this.search = value.trim();
    },
    closeCreateModal() {
      this.showCreateModal = false;
    },
  },
  mounted() {
    this.fetchChallenges();
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
