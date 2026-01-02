<template>
  <div class="main-container">
    <div class="wrapper">
      <div class="actions">
        <router-link class="link-back" to="/">
          <ArrowLeft></ArrowLeft>
        </router-link>

        <div class="active-battles">
          {{ battlesGames.length }} Active Battles
        </div>

        <div class="logo">
          <img src="@/assets/images/growbit.png" />
        </div>

        <div class="heart">
          <button class="button-sound" @click="toggleMute()">
            <VolumeIcon v-if="!soundMuted"></VolumeIcon>
            <img :src="MutedIcon" v-else />
          </button>
        </div>
      </div>
    </div>
    <AppButton :click="() => createBattle()">Create Battle</AppButton>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import MutedIcon from "@/assets/images/volume_muted.png?inline";
import VolumeIcon from "@/assets/images/volume.svg?inline";
import ArrowLeft from "@/assets/images/arrow_left.svg?inline";
import AppButton from "@/components/AppButton.vue";

export default {
  name: "BattlesHeaderOverview",
  data() {
    return {
      MutedIcon,
    };
  },
  components: {
    VolumeIcon,
    ArrowLeft,
    AppButton,
  },
  methods: {
    ...mapActions(["toggleMute"]),

    createBattle() {
      this.$router.push("/battles/create");
    },
  },
  computed: {
    ...mapGetters(["battlesGames", "soundMuted"]),
  },
};
</script>

<style scoped lang="scss">
.main-container {
  padding-bottom: 10px;

  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  > div {
    max-width: 1100px;
  }
  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: var(--dark-blue);

    border-radius: 10px;
    @media screen and (max-width: 500px) {
    }

    .actions {
      height: 75px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding-inline: 20px;
      @media screen and (max-width: 991px) {
        padding-inline: 10px;
      }

      .active-battles {
        padding-left: 10px;
        font-weight: 800;
        font-size: 1.2rem;
      }

      .logo {
        max-width: 300px;
        padding-right: 100px;
        margin-inline: auto;
        svg {
          height: 50px;
          width: auto;
        }

        @media screen and (max-width: 991px) {
          img {
            height: 17px;
          }
          padding-left: 0px;
        }
      }

      > div:nth-last-of-type(1),
      > div:nth-last-of-type(4),
      .link-back {
        flex-shrink: 0;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        width: 40px;
        height: 40px;
        background: #22224a;
        border-radius: 8px;
      }

      .quick.active .button-sound svg {
        path {
          stroke: #f6be2c;
          fill: #f6be2c;
        }
      }
    }
  }
}
</style>
