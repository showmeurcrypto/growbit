import axios from "axios";
import { getOriginalsConfigAndStoreThem } from "@/utils";

const GAME_CACHE_TTL = 30 * 60 * 1000;

const state = {
  gameList: [],
  homeGames: [],
  config: {
    minesMaxBet: 500,
    crashMaxBet: 500,
    slideMaxBet: 500,
    kenoMaxBet: 1000,
    maxWin: 10000,
    diceEdge: 4,
    plinkoEdge: 4,
    minesEdge: 4,
    kenoEdge: 4,
    towersEdge: 4,
  },
  gameListLoading: false,
  homeGamesLoading: false,
};

const getters = {
  gameList: (state) => state.gameList,
  homeGames: (state) => state.homeGames,
  homeGamesLoading: (state) => state.homeGamesLoading,

  gameListLoading: (state) => state.gameListLoading,
  gameConfig: (state) => state.config,
};

const mutations = {
  set_config(state, config) {
    state.config = config;
  },
  set_games(state, games) {
    state.gameList = games;
  },
  set_home_games(state, games) {
    state.homeGames = games;
  },
  set_games_loading(state, value) {
    state.gameListLoading = value;
  },
  set_home_games_loading(state, value) {
    state.homeGamesLoading = value;
  },
};

const actions = {
  getHomeGames({ getters, commit, dispatch }, data) {
    commit("set_home_games_loading", true);

    const cache = localStorage.getItem("HOME_GAMES_CACHE");
    if (cache) {
      const parsedCache = JSON.parse(cache);
      if (+parsedCache.expiresAt > Date.now()) {
        commit("set_home_games", parsedCache.games);
        commit(
          "set_config",
          getOriginalsConfigAndStoreThem(parsedCache.games.originals)
        );
        commit("set_home_games_loading", false);
        return;
      }
    }

    axios
      .get("/games/home")
      .then(({ data }) => {
        if (data.games) {
          commit("set_home_games", data.games);
          commit(
            "set_config",
            getOriginalsConfigAndStoreThem(data.games.originals)
          );

          localStorage.setItem(
            "HOME_GAMES_CACHE",
            JSON.stringify({
              games: data.games,
              expiresAt: Date.now() + GAME_CACHE_TTL,
            })
          );
        }

        commit("set_home_games_loading", false);
      })
      .catch((err) => {
        console.error(err);
        //dispatch("notificationShow", err.response?.data?.error);
        commit("set_home_games_loading", false);
      });
  },
  getGames({ getters, commit, dispatch }, data) {
    commit("set_games_loading", true);
    const cache = localStorage.getItem("GAMES_CACHE");
    if (cache) {
      const parsedCache = JSON.parse(cache);
      commit("set_games_loading", false);
      commit("set_games", parsedCache.games);
      if (+parsedCache.expiresAt > new Date().getTime()) {
        return;
      }
    }

    axios
      .get("/games")
      .then(({ data }) => {
        commit("set_games", data.games);
        if (data.games?.length > 10) {
          localStorage.setItem(
            "GAMES_CACHE",
            JSON.stringify({
              games: data.games,
              expiresAt: new Date().getTime() + GAME_CACHE_TTL,
            })
          );
        }
        commit("set_games_loading", false);
      })
      .catch((err) => {
        console.error(err);
        //dispatch("notificationShow", err.response?.data?.error);
        commit("set_games_loading", false);
      });
  },
};

const games = {
  state,
  mutations,
  actions,
  getters,
};

export default games;
