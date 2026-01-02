<template>
  <div class="coinflip">
    <CoinflipControls />
    <CoinflipGames />
    <div class="footer">
      <GameFooter :name="'coinflip'" :maxBet="1000"></GameFooter>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import CoinflipControls from "@/components/games/coinflip/CoinflipControls";
import CoinflipGames from "@/components/games/coinflip/CoinflipGames";
import GameFooter from "@/components/GameFooter.vue";

export default {
  name: "CoinflipPvp",
  metaInfo: {
    title: "Coinflip PVP",
  },
  components: {
    CoinflipControls,
    CoinflipGames,
    GameFooter,
  },
  methods: {
    ...mapActions([
      "socketConnectCoinflip",
      "socketDisconnectCoinflip",
      "modalsSetShow",
    ]),
  },
  computed: {
    ...mapGetters(["socketCoinflip"]),
  },
  watch: {},
  created() {
    this.socketConnectCoinflip();
  },
  beforeRouteUpdate(to, from) {},
  beforeRouteLeave(to, from, next) {
    this.socketDisconnectCoinflip();
    next();
  },
};
</script>

<style scoped lang="scss">
.coinflip {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 45px 10px;

  .footer {
    max-width: 1100px;
    margin-inline: auto;
  }
}

@media only screen and (max-width: 1150px) {
  .coinflip {
    padding: 25px 10px 45px 10px;
  }
}
</style>
