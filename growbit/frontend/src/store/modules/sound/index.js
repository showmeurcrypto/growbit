const state = {
  soundVolume:
    localStorage.getItem("VOLUME") === null
      ? 1
      : Number(localStorage.getItem("VOLUME")),
  soundExplosion: new Audio(require("@/assets/sounds/boom.mp3")),
  soundCash: new Audio(require("@/assets/sounds/cash.mp3")),
  soundTick: new Audio(require("@/assets/sounds/tick.mp3")),
  soundRoll: new Audio(require("@/assets/sounds/roll.mp3")),
  soundRemeRoll: new Audio(require("@/assets/sounds/remeRoll.wav")),
  soundWin: new Audio(require("@/assets/sounds/win.mp3")),
  //soundDiceWin: new Audio(require("@/assets/sounds/dice_win.mp3")),
  soundOpen: new Audio(require("@/assets/sounds/open.mp3")),
  soundEmpty: new Audio(require("@/assets/sounds/empty.mp3")),
  soundLose: new Audio(require("@/assets/sounds/lose.mp3")),
  soundPlinko: new Audio(require("@/assets/sounds/pop.mp3")),
  soundMinesReveal: new Audio(require("@/assets/sounds/glass_hit.mp3")),
};

const getters = {
  soundVolume: (state) => state.soundVolume,
  soundExplosion: (state) => state.soundExplosion,
  soundCash: (state) => state.soundCash,
  soundTick: (state) => state.soundTick,
  soundRoll: (state) => state.soundRoll,
  soundRemeRoll: (state) => state.soundRemeRoll,
  soundWin: (state) => state.soundWin,
  //  soundDiceWin: (state) => state.soundDiceWin,
  soundOpen: (state) => state.soundOpen,
  soundEmpty: (state) => state.soundEmpty,
  soundLose: (state) => state.soundLose,
  soundPlinko: (state) => state.soundPlinko,
  soundMinesReveal: (state) => state.soundMinesReveal,
  soundMuted: (state) => state.soundVolume === 0,
};

const mutations = {
  sound_set_volume(state, value) {
    state.soundVolume = value;
  },
};

const actions = {
  soundSetVolume({ commit }, value) {
    localStorage.setItem("VOLUME", value);
    commit("sound_set_volume", value);
  },
  toggleMute({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) {
      localStorage.setItem("VOLUME", 1);
      commit("sound_set_volume", 1);
    } else {
      localStorage.setItem("VOLUME", 0);
      commit("sound_set_volume", 0);
    }
  },
  playExplosion({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) return;
    getters.soundExplosion.volume = getters.soundVolume;
    getters.soundExplosion.play().catch(() => {});
  },
  playMinesReveal({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) return;
    getters.soundMinesReveal.volume = getters.soundVolume;
    getters.soundMinesReveal.play().catch(() => {});
  },
  playSoundCash({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) return;
    getters.soundCash.volume = getters.soundVolume;
    getters.soundCash.play().catch(() => {});
  },
  playSoundPlinko({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) return;
    getters.soundPlinko.volume = getters.soundVolume;
    getters.soundPlinko.play().catch(() => {});
  },
  playSoundTick({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) return;
    getters.soundTick.volume = getters.soundVolume;
    getters.soundTick.play().catch(() => {});
  },
  playSoundRoll({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) return;
    getters.soundRoll.volume = getters.soundVolume;
    getters.soundRoll.play().catch(() => {});
  },
  playSoundRemeRoll({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) return;
    getters.soundRemeRoll.volume = getters.soundVolume;
    getters.soundRemeRoll.play().catch(() => {});
  },
  playSoundWin({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) return;
    getters.soundWin.volume = getters.soundVolume;
    getters.soundWin.play().catch(() => {});
  },
  // playSoundDiceWin({ getters, commit, dispatch }, data) {
  //   if (getters.soundVolume === 0) return;
  //   getters.soundDiceWin.volume = getters.soundVolume;
  //   getters.soundDiceWin.play().catch(() => {});
  // },
  playSoundLose({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) return;
    getters.soundLose.volume = getters.soundVolume;
    getters.soundLose.play().catch(() => {});
  },
  playSoundOpen({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) return;
    getters.soundOpen.volume = getters.soundVolume;
    getters.soundOpen.play().catch(() => {});
  },
  playSoundEmpty({ getters, commit, dispatch }, data) {
    if (getters.soundVolume === 0) return;
    getters.soundEmpty.volume = getters.soundVolume;
    getters.soundEmpty.play().catch(() => {});
  },
};

const sound = {
  state,
  mutations,
  actions,
  getters,
};

export default sound;
