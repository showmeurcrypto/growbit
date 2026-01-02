<template>
  <svg
    :viewBox="`-${width / 2} 0 ${width} ${height}`"
    width="100%"
    ref="svgRef"
  >
    <Ball
      v-for="game in plinkoActiveGames"
      :key="`plinko_ball_${game._id}`"
      :svgRef="svgRef"
      :game="game"
    />
    <g v-for="pin in pins" :key="pin.key">
      <circle
        :class="pin.classBounce"
        :cx="pin.x"
        :cy="pin.y"
        :r="pin.r"
        :fill="pin.fillBounce"
        :stroke="pin.stroke"
      />
      <circle
        :class="pin.class"
        :cx="pin.x"
        :cy="pin.y"
        :r="pin.r"
        :fill="pin.fill"
        :stroke="pin.stroke"
      />
    </g>
    <g
      v-for="(multiplier, index) in multipliers"
      :key="`multiplier_${index}`"
      :transform="`translate(${multiplier.x} ${multiplier.y})`"
    >
      <g :class="`multiplier_${index}`">
        <rect
          :width="config.multiWidth"
          :height="config.multiHeight"
          fill="#22224A"
          rx="3"
        />
        <text
          font-size="10px"
          font-weight="700"
          font-family="Excon"
          :x="config.multiWidth / 2"
          :y="config.multiHeight / 2 + 5"
          text-anchor="middle"
          fill="white"
        >
          {{ multiplier.value.toFixed(2) }} x
        </text>
      </g>
      <g :class="`multiplier_${index}_active`" opacity="0">
        <rect
          :width="config.multiWidth"
          :height="config.multiHeight"
          fill="#5B46BC"
          rx="3"
        />
        <text
          font-size="10px"
          font-weight="700"
          font-family="Excon"
          :x="config.multiWidth / 2"
          :y="config.multiHeight / 2 + 5"
          text-anchor="middle"
          fill="white"
        >
          {{ multiplier.value.toFixed(2) }} x
        </text>
      </g>
    </g>
    <defs>
      <radialGradient id="ball-gradient" cx="0" cy="0" r="1">
        <stop stopColor="#FEC14C" />
        <stop offset="1" stopColor="#895B02" />
      </radialGradient>
    </defs>
  </svg>
</template>

<script>
import { mapGetters } from "vuex";
import { config } from "./config";
import Ball from "@/components/games/gamePlinko/game/ball/Ball.vue";
import { getPlinkoPayoutForEdge } from "@/utils";

export default {
  name: "PlinkoGame",
  props: ["risk"],
  components: {
    Ball,
  },
  data() {
    return {
      config,
      svgRef: null,
      HOUSE_EDGE: 2,
      plinkoActiveGames: [],
    };
  },
  methods: {},
  watch: {
    plinkoGames: {
      handler(newData, oldData) {
        this.plinkoActiveGames = newData;
      },
      deep: true,
    },
  },
  computed: {
    ...mapGetters(["plinkoFilterRows", "plinkoGames", "gameConfig"]),
    plinkoMultipliers() {
      return getPlinkoPayoutForEdge(this.gameConfig.plinkoEdge);
    },

    width() {
      return this.config.pinGap * (4 + this.plinkoFilterRows);
    },
    height() {
      return (
        this.config.startTop +
        this.config.pinGap * (this.plinkoFilterRows - 1) +
        this.config.multiHeight * 1.75 +
        20
      );
    },
    pins() {
      const pins = [];
      for (let i = 0; i < this.plinkoFilterRows; i++) {
        const linePins = this.config.startPins + i;
        for (let j = 0; j < linePins; j++) {
          const y =
            8 +
            this.config.startTop +
            this.config.pinSize +
            i * this.config.pinGap;
          const x = -((linePins - 1) / 2 - j) * this.config.pinGap;

          pins.push({
            classBounce: `pins-${i}-${j}-bounce`,
            x,
            y,
            r: this.config.pinSize,
            fillBounce: "white",
            stroke: "none",
            key: `pin_${i}_${j}_bounce`,
            class: `pins-${i}-${j}`,
            fill: "#8F98C5",
          });
        }
      }
      return pins;
    },
    multipliers() {
      return this.plinkoMultipliers[this.risk][this.plinkoFilterRows].map(
        (multiplier, index) => {
          const x =
            -((this.plinkoFilterRows + 1) / 2 - index) * this.config.pinGap +
            (this.config.pinGap - this.config.multiWidth) / 2;
          const y = this.height - this.config.multiHeight - 10;
          return {
            x,
            y,
            value: multiplier,
          };
        }
      );
    },
  },
  mounted() {
    this.svgRef = this.$refs.svgRef;
  },
};
</script>
