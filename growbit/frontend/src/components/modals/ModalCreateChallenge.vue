<template>
  <div class="modal-create-challenge">
    <div class="top">
      <span>Create Challenge</span>
      <div class="close" @click="modalCloseButton()">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>
    <div class="content">
      <form @submit.prevent="createChallenge" class="form-grid">
        <div>
          <label>Name</label>
          <input
            v-model="formData.name"
            required
            name="name"
            placeholder="Enter name"
          />
        </div>
        <div>
          <label>Description</label>
          <input
            v-model="formData.description"
            required
            name="description"
            placeholder="Enter description"
          />
        </div>
        <div>
          <label>Claims</label>
          <input
            v-model="formData.claims"
            required
            name="claims"
            placeholder="Claims"
          />
        </div>
        <div>
          <label>Repeat</label>
          <input
            v-model="formData.repeat"
            type="number"
            min="1"
            max="10"
            name="repeat"
            placeholder="Repeat"
          />
        </div>
        <div>
          <label>Date</label>
          <input
            v-model="formData.date"
            required
            name="date"
            type="date"
            placeholder="00/00"
          />
        </div>
        <div>
          <label>Game</label>
          <AppDropdown :items="games" />
          <label v-if="slot">SlotId</label>
          <input v-model="formData.game" v-if="slot" />
        </div>
        <div>
          <label>Colour</label>
          <AppDropdown
            :items="
              CHALLENGE_COLOURS.map((c) => ({
                name: c,
                onSelect: () => (this.formData.colour = c),
              }))
            "
          ></AppDropdown>
        </div>
        <div>
          <label>Min Bet</label>
          <input
            v-model="formData.minBet"
            required
            name="minBet"
            placeholder="Enter min bet"
          />
        </div>
        <div>
          <label>Multiplier</label>
          <input
            v-model="formData.multiplier"
            required
            name="multiplier"
            placeholder="Enter multiplier"
          />
        </div>
        <div>
          <label>Reward</label>
          <input
            v-model="formData.reward"
            required
            name="reward"
            placeholder="Enter reward"
          />
        </div>
        <div class="form-actions">
          <AppButton :click="() => {}">Create</AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AppButton from "@/components/AppButton.vue";
import AppDropdown from "@/components/AppDropdown.vue";
import CloseIcon from "@/assets/images/close.svg";
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

export default {
  name: "ModalCreateChallenge",
  created() {},
  components: {
    AppDropdown,
    AppButton,
  },
  data() {
    return {
      CHALLENGE_COLOURS: ["purple", "green", "blue", "yellow"],
      CloseIcon,
      slot: false,
      formData: {
        name: "",
        description: "",
        claims: "",
        repeat: 1,
        date: "",
        game: "crash",
        colour: "green",
        minBet: "",
        multiplier: "",
        reward: "",
      },
      games: [
        { name: "Crash", onSelect: () => this.setGame("crash") },
        { name: "Slide", onSelect: () => this.setGame("slide") },
        { name: "Mines", onSelect: () => this.setGame("mines") },
        { name: "Dice", onSelect: () => this.setGame("dice") },
        { name: "Keno", onSelect: () => this.setGame("keno") },
        { name: "Plinko", onSelect: () => this.setGame("plinko") },
        { name: "Slots", onSelect: () => (this.slot = true) },
      ],
    };
  },
  computed: {
    ...mapGetters(["modalsData"]),
  },
  methods: {
    setGame(game) {
      this.formData.game = game;
      this.slot = false;
    },
    modalCloseButton() {
      this.modalsSetShow(null);
    },
    onClose() {
      this.modalsSetShow(null);
    },
    async createChallenge() {
      try {
        let {
          name,
          description,
          claims,
          date,
          game,
          minBet,
          multiplier,
          repeat,
          colour,
          reward,
        } = this.formData;

        game = game.trim();

        if (!game) {
          this.notificationShow({
            type: "error",
            message: "Invalid game",
          });
          return;
        }

        await axios.post("challenges/create", {
          name,
          description,
          claims: +claims,
          repeat: +repeat,
          date,
          game,
          colour,
          minBet: +minBet,
          multiplier: +multiplier,
          reward: +reward,
        });
        if (this.modalsData?.callback) {
          this.modalsData?.callback();
        }
        this.onClose();
      } catch (err) {
        console.log(err);
        this.notificationShow(err);
      }
    },
    ...mapActions(["modalsSetShow", "notificationShow"]),
  },
};
</script>

<style scoped lang="scss">
.modal-create-challenge {
  background: var(--dark-blue);
  width: 100%;
  border-radius: 15px;

  @media screen and (max-width: 991px) {
    background: transparent;
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
      color: #f7be2c;
      text-shadow: 0px 0px 5px rgba(246, 190, 44, 0.33);
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
    @media screen and (max-width: 991px) {
      padding: 20px 10px 10px 10px;
    }
    width: 100%;

    > form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 15px;

      input {
        width: 100%;
        height: 50px;
        padding-left: 10px;

        background: var(--dark-blue-2);
        border: 2px solid #282746;
        border-radius: 10px;

        margin-bottom: 15px;
      }
    }
  }
}
</style>
