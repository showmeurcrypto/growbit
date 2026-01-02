<template>
  <div class="games-report">
    <div class="top">
      <span>Games Report</span>
      <div class="close" @click="modalsSetShow(null)">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>
    <div class="content">
      <table>
        <thead>
          <tr>
            <th>Game</th>
            <th>Bet</th>
            <th>Won</th>
            <th>RTP (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(stats, game) in this.modalsData.games" :key="game">
            <td>{{ game }}</td>
            <td>{{ stats.bet }}</td>
            <td>{{ stats.won }}</td>
            <td>{{ calculateRTP(stats.bet, stats.won) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import "jquery-ui/ui/widget.js";
import "jquery-ui/ui/widgets/mouse";
import "jquery-ui/ui/widgets/slider";

import { mapActions, mapGetters } from "vuex";
import CloseIcon from "@/assets/images/close.svg";

export default {
  name: "GamesReportModal",
  mounted() {},
  components: {},
  data() {
    return {
      CloseIcon,
    };
  },
  computed: {
    ...mapGetters(["modalsData"]),
  },
  methods: {
    ...mapActions(["modalsSetShow"]),
    calculateRTP(bet, won) {
      return bet > 0 ? ((won / bet) * 100).toFixed(2) : 0;
    },
  },
};
</script>

<style lang="scss">
@import "../../../node_modules/jquery-ui/themes/base/slider.css";

.games-report {
  border-radius: 18px;
  border: 4px solid #090c1d;
  background: var(--dark-blue);
  width: 600px;

  @media screen and (max-width: 991px) {
    background: transparent;
    width: 100%;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }
  th {
  }

  .top {
    padding: 30px;
    background: #090c1d;
    display: flex;
    flex-direction: row;
    gap: 15px;
    border-radius: 15px 15px 0 0;

    span {
      font-weight: 900;
      font-size: 1.714rem;
    }

    .close {
      width: 40px;
      height: 40px;
      background: #22224a;
      border-radius: 8px;
      display: grid;
      cursor: pointer;
      place-content: center;
      margin-left: auto;
    }

    @media screen and (max-width: 991px) {
      display: none;
    }
  }

  .content {
    padding: 20px;
  }
}
</style>
