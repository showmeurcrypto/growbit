<template>
  <g ref="ballRef">
    <circle cx="8" cy="8" r="8" fill="white" />
  </g>
</template>

<script>
import gsap from "gsap";
import { mapActions } from "vuex";
import {
  ballBounceAnim,
  ballStartAnim,
} from "@/components/games/gamePlinko/game/ball/animation";

export default {
  props: {
    game: {
      type: Object,
      required: true,
    },
    svgRef: {
      type: SVGSVGElement,
      required: true,
    },
  },
  data() {
    return {
      ballRef: null,
      progress: 0,
      tl: null,
    };
  },
  computed: {},
  methods: {
    ...mapActions(["plinkoRemoveGame", "playSoundPlinko"]),

    startAnimation() {
      if (!this.ballRef || !this.svgRef) return;

      const q = gsap.utils.selector(this.svgRef);
      this.tl = gsap.timeline();
      let j = 1;

      this.tl.add(ballStartAnim(this.ballRef));
      const path = this.game.data.path;
      let prev = 0;
      for (let cell of path) {
        const left = cell.column == prev;
        prev = cell.column;
        this.tl.add(
          ballBounceAnim(this.svgRef, this.ballRef, cell.row - 1, j, left)
        );
        j += left ? 0 : 1;
      }

      this.tl
        .addLabel("shake_multiplier")
        .fromTo(
          q(`.multiplier_${j - 1}_active`),
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            onStart: () => {},
          }
        )
        .to(
          q(`.multiplier_${j - 1}_active`),
          {
            opacity: 0,
            duration: 0.4,
            onStart: () => {
              this.playSoundPlinko();
            },
          },
          ">+=0.2"
        );

      this.tl.call(() => {
        this.plinkoRemoveGame(this.game);
      });

      const duration = this.tl.duration();
      this.tl.duration(duration * (1 / 2)).progress(this.progress);
    },
  },
  mounted() {
    this.ballRef = this.$refs.ballRef;

    this.startAnimation();
  },
  beforeDestroy() {
    if (this.tl) {
      this.progress = this.tl.progress();
      this.tl.kill();
    }
  },
};
</script>
