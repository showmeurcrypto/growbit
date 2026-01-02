<template>
  <div class="modal-fair-seed">
    <div class="top_menu">
      <FairnessIcon></FairnessIcon>

      <span>Fairness</span>
      <div class="close" @click="modalCloseButton()">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>
    <div class="switch">
      <button :class="{ active: mode === 'SEEDS' }" @click="mode = 'SEEDS'">
        Seeds
      </button>
      <button :class="{ active: mode === 'VERIFY' }" @click="mode = 'VERIFY'">
        Verify
      </button>
    </div>
    <div v-if="mode === 'SEEDS'" class="content">
      <div class="seed-element">
        <div class="element-title">Active Client Seed</div>
        <div class="element-content">
          <span v-if="userSeedData.data !== null">{{
            userSeedData.data.seed.seedClient
          }}</span>
          <button
            v-on:click="modalCopyButton(userSeedData.data.seed.seedClient)"
            class="button-copy"
          >
            <CopyIcon></CopyIcon>
          </button>
        </div>
      </div>
      <div class="seed-element">
        <div class="element-title">Active Server Seed (Hashed)</div>
        <div class="element-content">
          <span v-if="userSeedData.data !== null">{{
            userSeedData.data.seed.hash
          }}</span>
          <button
            v-on:click="modalCopyButton(userSeedData.data.seed.hash)"
            class="button-copy"
          >
            <CopyIcon></CopyIcon>
          </button>
        </div>
      </div>
      <div class="seed-element element-input">
        <div class="element-title">Next Client Seed</div>
        <div class="element-content next-seed">
          <input v-model="modalClientSeed" type="text" />
          <AppButton :click="() => changeSeed()">Change</AppButton>
        </div>
      </div>
      <div class="seed-element">
        <div class="element-title">Next Server Seed (Hashed)</div>
        <div class="element-content">
          <span v-if="userSeedData.data !== null">{{
            userSeedData.data.seedNext?.hash
          }}</span>
          <button
            v-on:click="modalCopyButton(userSeedData.data.seedNext?.hash)"
            class="button-copy"
          >
            <CopyIcon></CopyIcon>
          </button>
        </div>
      </div>
    </div>
    <div class="verify" v-else>
      <div class="out">
        <img
          class="slide-res"
          v-if="this.game === 'slide'"
          :src="slideColor(this.output)"
          alt=""
        />
        <img
          class="slide-res"
          v-else-if="this.game === 'coinflip'"
          :src="coinflipSide(this.output)"
          alt=""
        />
        <img
          class="slide-res"
          v-else-if="this.game === 'cases'"
          :src="'/img/cases/items/' + this.output"
          alt=""
        />
        <mines-result
          v-else-if="this.game === 'mines'"
          :game="this.output"
        ></mines-result>
        <towers-result
          v-else-if="this.game === 'towers'"
          :game="this.output"
        ></towers-result>
        <span v-else>
          {{ this.output }}
        </span>
      </div>
      <span class="title">Game</span>
      <AppDropdown :items="games" :selected-input="game"></AppDropdown>
      <span v-if="this.game === 'cases'" class="title">Case</span>
      <AppDropdown
        v-if="this.game === 'cases'"
        :items="boxes"
        :selected-input="data.box"
      ></AppDropdown>
      <span v-if="shouldShow('seedClient')" class="title">Client Seed</span>
      <input v-if="shouldShow('seedClient')" v-model="seedClient" />
      <span v-if="shouldShow('seedPublic')" class="title">Public Seed</span>
      <input v-if="shouldShow('seedPublic')" v-model="seedPublic" />
      <span class="title">Server Seed</span>
      <input v-model="seedServer" />
      <span v-if="shouldShow('nonce')" class="title">Nonce</span>
      <input v-if="shouldShow('nonce')" v-model="nonce" />
      <span v-if="shouldShow('plinko')" class="title">Rows</span>
      <input
        min="8"
        max="16"
        v-if="shouldShow('plinko')"
        v-model="plinkoRows"
      />
      <span v-if="shouldShow('plinko')" class="title">Risk</span>
      <input type="text" v-if="shouldShow('plinko')" v-model="plinkoRisk" />
      <span v-if="shouldShow('mines')" class="title">Mines</span>
      <input
        type="number"
        min="1"
        max="24"
        v-if="shouldShow('mines')"
        v-model="mines"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppButton from "@/components/AppButton.vue";
import CloseIcon from "@/assets/images/close.svg";
import FairnessIcon from "@/assets/images/verify.svg?inline";
import Red from "@/assets/images/slide/red_new.png";
import Purple from "@/assets/images/slide/purple_new.png";
import Yellow from "@/assets/images/slide/yellow_new.png";
import Head from "@/assets/images/coinflip/head.png";
import Tail from "@/assets/images/coinflip/tail.png";
import CopyIcon from "@/assets/images/copy.svg?inline";
import AppDropdown from "@/components/AppDropdown.vue";
import ChanceJs from "chance";
import {
  buildRandomBools,
  buildRandomFloats,
  generateShuffledGroup,
  getSHA256Hash,
} from "@/utils/provability_fair";
import {
  getPlinkoPayoutForEdge,
  getWinningColour,
  difficultyMapper,
} from "@/utils";
import MinesResult from "@/components/modals/game_view/MinesResult.vue";
import TowersResult from "@/components/modals/game_view/TowersResult.vue";
import axios from "axios";

export default {
  name: "ModalProvabilityFair",
  data() {
    return {
      modalClientSeed: null,
      CloseIcon,

      mode: "VERIFY",
      game: "crash",
      data: {},
      seedClient: "",
      seedServer: "",
      seedPublic: "",
      mines: 1,
      gridSize: 25,
      plinkoRows: 8,
      plinkoRisk: "medium",
      towersRisk: "med",
      nonce: "",
      games: [
        { name: "Crash", onSelect: () => (this.game = "crash") },
        { name: "Slide", onSelect: () => (this.game = "slide") },
        { name: "Mines", onSelect: () => (this.game = "mines") },
        { name: "Plinko", onSelect: () => (this.game = "plinko") },
        { name: "Dice", onSelect: () => (this.game = "dice") },
        { name: "Keno", onSelect: () => (this.game = "keno") },
        { name: "Coinflip", onSelect: () => (this.game = "coinflip") },
        { name: "Cases", onSelect: () => (this.game = "cases") },
        { name: "Reme", onSelect: () => (this.game = "reme") },
        { name: "Towers", onSelect: () => (this.game = "towers") },
      ],
      boxes: null,
    };
  },
  components: {
    MinesResult,
    TowersResult,
    AppDropdown,
    AppButton,
    FairnessIcon,
    CopyIcon,
    Red,
    Purple,
    Yellow,
    Head,
    Tail,
  },
  methods: {
    slideColor(outcome) {
      const colour = getWinningColour(outcome).winningColour;
      if (colour === "red") {
        return Red;
      } else if (colour === "purple") {
        return Purple;
      } else {
        return Yellow;
      }
    },
    coinflipSide(outcome) {
      if (outcome === "heads") {
        return Head;
      } else {
        return Tail;
      }
    },
    shouldShow(name) {
      if (name === "seedPublic") {
        //console.log("game is " + this.game);
        return (
          this.game === "slide" ||
          this.game === "crash" ||
          this.game === "coinflip"
        );
      }
      if (name === "seedClient") {
        return (
          this.game === "plinko" ||
          this.game === "mines" ||
          this.game === "keno" ||
          this.game === "dice" ||
          this.game === "cases" ||
          this.game === "reme" ||
          this.game === "towers"
        );
      } else if (name === "nonce") {
        return (
          this.game === "mines" ||
          this.game === "dice" ||
          this.game === "keno" ||
          this.game === "plinko" ||
          this.game === "cases" ||
          this.game === "reme" ||
          this.game === "towers"
        );
      } else if (name === "plinko") {
        return this.game === "plinko";
      } else if (name === "mines") {
        return this.game === "mines";
      }
      return true;
    },

    verifyCases() {
      const combined = `${this.seedServer}-${this.nonce}-${this.seedClient}`;
      const hash = getSHA256Hash(combined);
      const outcome = parseInt(hash.substr(0, 8), 16) % 100000;

      let boxes = JSON.parse(localStorage.getItem("boxes"));
      // console.log(this.data.box);
      const boxDatabase = boxes.find((b) => b._id === this.data.box);

      let pos = 0;
      for (const item of boxDatabase.items) {
        pos += item.frequency * 100000; // Convert frequency to range scale
        if (outcome < pos) {
          // Use '<' to properly fit within 0 - 100000 range
          return item.image;
          break;
        }
      }
    },

    verifyMines(minesCount, gridSize) {
      if (
        !+minesCount ||
        minesCount < Math.floor(Math.sqrt(gridSize)) - 4 ||
        minesCount > gridSize - 1
      ) {
        return "Invalid number of mines";
      }

      let deck = [];
      for (let i = 0; i < gridSize; i++) {
        if (i < minesCount) {
          deck.push("mine");
        } else {
          deck.push("coin");
        }
      }
      const combined = `${this.seedServer}-${this.nonce}-${this.seedClient}`;
      const hash = getSHA256Hash(combined);
      const chance = new ChanceJs(hash);
      const shuffled = chance.shuffle(deck);

      return {
        gridSize: gridSize,
        deck: shuffled,
        revealed: [],
      };
    },
    verifyTowers(risk) {
      if (!["easy", "med", "hard", "insane", "ultraInsane"].includes(risk)) {
        return "Invalid game mode!";
      }

      const config = difficultyMapper[risk];

      let deck = [];

      for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
        const tilesPerRow = config.cols;
        const losePerRow = config.bombs;

        deck[rowIndex] = [];
        for (let tileIndex = 0; tileIndex < tilesPerRow; tileIndex++) {
          if (tileIndex < losePerRow) {
            deck[rowIndex].push("lose");
          } else {
            deck[rowIndex].push("coin");
          }
        }
      }

      let shuffled = [];
      console.log(this.seedServer);
      console.log(this.nonce);
      console.log(this.seedClient);
      const combined = `${this.seedServer}-${this.nonce}-${this.seedClient}`;

      for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
        const hash = getSHA256Hash(`${combined}-${rowIndex}`);
        // const hash = crypto
        //   .createHash("sha256")
        //   .update(`${combined}-${rowIndex}`)
        //   .digest("hex");

        const chance = new ChanceJs(hash);
        const shuffledRow = chance.shuffle(deck[rowIndex]);
        shuffled.push(shuffledRow);
      }
      console.log("returning from towers");
      return {
        risk: risk,
        deck: shuffled,
        revealed: [],
      };
    },
    verifyPlinko(rows, risk) {
      if (!+rows || rows < 8 || rows > 16) {
        return "Invalid number of rows";
      }

      if (!Object.keys(this.plinkoMultipliers).includes(risk)) {
        return "Invalid Risk";
      }

      const combined = `${this.seedServer}-${this.nonce}-${this.seedClient}`;
      const hash = getSHA256Hash(combined);

      const shuffledGroup = buildRandomBools(rows, hash);

      let path = "";
      for (let i = 0; i < rows; i++) {
        const is_left = !!shuffledGroup[i];
        path += is_left ? "L " : " R ";
      }

      return path;
    },
    verifyDice() {
      const combined = `${this.seedServer}-${this.nonce}-${this.seedClient}`;
      const hash = getSHA256Hash(combined);
      return parseInt(hash.substr(0, 52 / 4), 16) % 100;
    },
    verifyReme() {
      const combined = `${this.seedServer}-${this.nonce}-${this.seedClient}`;
      const hash = getSHA256Hash(combined);
      let numbers = buildRandomFloats(2, hash).map((num) =>
        Math.floor(num * 37)
      );
      return numbers;
      // return ["", ""];
    },
    verifyKeno() {
      const combined = `${this.seedServer}-${this.nonce}-${this.seedClient}`;
      const hash = getSHA256Hash(combined);
      const numbers = generateShuffledGroup(40, hash).slice(0, 10);
      return numbers.map((n) => n + 1).join(" , ");
    },
    verifyCoinflip() {
      const seed = `${this.seedServer}${this.seedPublic}`;
      const hash = getSHA256Hash(seed);
      return parseInt(hash.substr(0, 8), 16) % 2 == 0 ? "heads" : "tails";
    },
    verifySlide() {
      const combined = `${this.seedServer}-${this.seedPublic}`;
      const hash = getSHA256Hash(combined);
      return Math.abs(parseInt(hash.substr(0, 8), 16)) % 15;
    },
    verifyCrash() {
      const divisible = (hash, mod) => {
        let val = 0;
        let o = hash.length % 4;
        for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
          val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
        }
        return val === 0;
      };
      // console.log(this.seedPublic);
      //  console.log(this.seedServer);
      const combined = `${this.seedPublic}-${this.seedServer}`;
      const hash = getSHA256Hash(combined);

      const mod = parseInt(100 / (0.05 * 100));
      if (divisible(hash, mod) === true) {
        return 1;
      }
      const h = parseInt(hash.slice(0, 52 / 4), 16);
      const e = Math.pow(2, 52);
      return Math.floor((100 * e - h) / (e - h)) / 100;
    },
    ...mapActions([
      "notificationShow",
      "userGetSeedSocket",
      "userSendClientSeedSocket",
      "modalsSetShow",
    ]),
    modalCopyButton(value) {
      const el = document.createElement("textarea");
      el.value = value;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);

      this.notificationShow({
        type: "success",
        message: "Copied to your clipboard.",
      });
    },
    modalCloseButton() {
      this.modalsSetShow(null);
    },
    changeSeed() {
      let seedClient = this.modalClientSeed?.trim();
      if (!seedClient) {
        this.notificationShow({
          type: "error",
          message: "Client seed is empty!",
        });
        return;
      }
      const data = { seedClient: seedClient };
      this.userSendClientSeedSocket(data);
    },
    async initBoxes() {
      let boxes = [];
      const response = await axios.get("public/boxes.json", {
        responseType: "json",
      });
      boxes.push(...response.data);
      return boxes;
    },
  },
  computed: {
    ...mapGetters([
      "socketSendLoading",
      "userSeedData",
      "gameConfig",
      "modalsData",
    ]),

    plinkoMultipliers() {
      return getPlinkoPayoutForEdge(this.gameConfig.plinkoEdge);
    },
    output() {
      if (this.game === "mines") {
        return this.verifyMines(this.mines, this.gridSize || 25);
      } else if (this.game === "slide") {
        return this.verifySlide();
      } else if (this.game === "coinflip") {
        return this.verifyCoinflip();
      } else if (this.game === "plinko") {
        return this.verifyPlinko(
          this.plinkoRows,
          this.plinkoRisk?.toLowerCase()
        );
      } else if (this.game === "crash") {
        return this.verifyCrash();
      } else if (this.game === "dice") {
        return this.verifyDice();
      } else if (this.game === "keno") {
        return this.verifyKeno();
      } else if (this.game === "cases") {
        return this.verifyCases();
      } else if (this.game === "reme") {
        return this.verifyReme();
      } else if (this.game === "towers") {
        return this.verifyTowers(this.towersRisk);
      }
      return "";
    },
  },
  watch: {
    userSeedData: {
      deep: true,
      handler() {},
    },
    game: {
      async handler() {
        if (!localStorage.getItem("boxes")) {
          let boxes = await this.initBoxes();

          localStorage.setItem("boxes", JSON.stringify(boxes));
        }
        if (this.game === "cases") {
          let boxes = JSON.parse(localStorage.getItem("boxes"));
          this.boxes = boxes.map((box) => ({
            name: box._id.charAt(0) + box._id.slice(1),
            onSelect: () => (this.data.box = box._id),
          }));
          if (!this.data?.box) {
            this.data.box = boxes[0]._id;
          }
        }
      },
    },
  },
  async created() {
    if (this.userSeedData.loading === false) {
      if (this.userSeedData.data === null) {
        const data = {};
        this.userGetSeedSocket(data);
      }
    }

    if (this.modalsData) {
      if (this.modalsData.game) {
        this.game = this.modalsData.game;
      }
      if (this.modalsData.seedServer) {
        this.seedServer = this.modalsData.seedServer;
      }
      if (this.modalsData.seedPublic) {
        this.seedPublic = this.modalsData.seedPublic;
      }
      if (this.modalsData.seedClient) {
        this.seedClient = this.modalsData.seedClient;
      }
      if (this.modalsData.nonce) {
        this.nonce = this.modalsData.nonce;
      }
      if (this.modalsData.mines) {
        this.mines = this.modalsData.mines;
      }
      if (this.modalsData.minesGrid) {
        this.gridSize = this.modalsData.minesGrid;
      }

      if (this.modalsData.plinkoRows) {
        this.plinkoRows = this.modalsData.plinkoRows;
      }

      if (this.modalsData.plinkoRisk) {
        this.plinkoRisk = this.modalsData.plinkoRisk;
      }
      if (this.modalsData.data) {
        this.data = this.modalsData.data;
      }
      if (this.modalsData.towersRisk) {
        this.towersRisk = this.modalsData.towersRisk;
      }
    }

    if (!localStorage.getItem("boxes")) {
      let boxes = await this.initBoxes();
      localStorage.setItem("boxes", JSON.stringify(boxes));
    }
    //this.boxes = JSON.parse(localStorage.getItem("boxes"));
    if (this.game === "cases") {
      let boxes = JSON.parse(localStorage.getItem("boxes"));
      this.boxes = boxes.map((box) => ({
        name: box._id.charAt(0) + box._id.slice(1),
        onSelect: () => (this.data.box = box._id),
      }));
      if (!this.data?.box) {
        this.data.box = boxes[0]._id;
      }
    }
  },
};
</script>

<style scoped lang="scss">
.verify {
  width: 100%;
  padding: 30px;

  @media screen and (max-width: 991px) {
    padding: 20px 15px;
  }
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;

  .out {
    padding: 15px;
    width: 100%;
    min-height: 150px;
    display: grid;
    place-content: center;
    overflow: scroll;
    background: #22224a;
    border-radius: 15px;

    .slide-res {
      height: 100px;
    }

    span {
      font-weight: 900;
      font-size: 22px;
    }
  }

  .title {
    font-style: normal;
    font-weight: 700;
    font-size: 1.29rem;
    color: #eeeeee;
    margin-top: 10px;
  }

  input {
    padding-left: 15px;
    width: 100%;
    height: 56px;
    border: 2px solid #22224a;
    border-radius: 10px;
  }
}

.next-seed {
  padding-right: 10px;
}

.switch {
  margin-inline: auto;
  width: fit-content;
  display: flex;
  margin-top: 30px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px;
  gap: 5px;
  height: 57px;
  background: #090c1d;
  box-shadow: inset 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 50px;
  @media (max-width: 991px) {
    background: var(--dark-blue);
  }

  button {
    padding: 12px 30px;
    width: 108px;
    height: 47px;
    border-radius: 50px;

    &.active {
      background: var(--dark-blue);
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

      @media (max-width: 991px) {
        background: #090c1d;
      }
    }
  }
}

.top_menu {
  padding: 20px;
  background: #090c1d;
  height: 80px;
  align-items: center;
  display: flex;
  width: 100%;
  flex-direction: row;
  gap: 10px;

  font-weight: 700;
  font-size: 1.714rem;
  color: #eeeeee;

  @media (max-width: 991px) {
    display: none;
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
}

.modal-fair-seed {
  background: var(--dark-blue);
  border-radius: 15px;
  width: 100vw;
  max-width: 500px;
  @media (max-width: 991px) {
    background: transparent;
    width: 100%;
  }

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content {
  padding: 35px 30px 30px 30px;
  @media (max-width: 991px) {
    padding: 25px 10px;
  }
}

.modal-fair-seed {
  border: 4px solid #090c1d;

  .seed-header {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .header-icon img {
    width: 48px;
    height: 48px;
  }

  .seed-element {
    width: 100%;
    margin-top: 25px;

    .element-title {
      font-style: normal;
      font-weight: 700;
      font-size: 1.29rem;

      color: #eeeeee;
    }

    &:first-of-type {
      margin-top: 0;
    }
  }

  .element-content {
    width: 100%;
    max-width: 440px;
    @media (max-width: 991px) {
      max-width: 90vw;
    }
    position: relative;
    display: flex;
    align-items: center;
    margin-top: 12px;
    height: 52px;
    padding-left: 15px;
    background: #22224a;
    border-radius: 10px;

    span {
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-style: normal;
      font-weight: 400;
      font-size: 1.143rem;
      color: var(--purple-2);
    }

    input {
      width: 100%;
      height: 100%;
      font-size: 1.143rem;
      font-weight: 600;
      color: #5e768e;
      background: transparent;
    }
  }

  button.button-cycle {
    width: 90px;
    height: 42px;
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translate(0, -50%);
    transition: all 0.2s;
  }

  button.button-copy {
    margin-inline: 10px;
    margin-left: auto;
  }
}
</style>
