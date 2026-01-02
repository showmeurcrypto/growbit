<template>
  <button
    v-if="!flat"
    :disabled="disabled"
    :class="{
      'app-btn': true,
      disabled: disabled,
      secondary: secondary,
      fullwidth: fullwidth,
      red: red,
    }"
    @click="click"
  >
    <span class="edge" :style="{ borderRadius: radius }"></span>
    <span
      :style="{
        fontSize: size,
        padding: padding,
        height: height,
        width: width,
        borderRadius: radius,
      }"
      class="front"
    >
      <slot />
    </span>
  </button>
  <button
    v-else
    :disabled="disabled"
    :class="`flat-btn ${secondary ? 'secondary' : ''} ${
      fullwidth ? 'fullwidth' : ''
    }`"
    :style="{ fontSize: size }"
    @click="click"
  >
    <slot />
  </button>
</template>

<script>
export default {
  data() {
    return {
      state: false,
    };
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: "1.43rem",
    },
    padding: {
      type: String,
      default: "0.2em 0.9em",
    },
    height: {
      type: String,
      default: "unset",
    },
    width: {
      type: String,
      default: "unset",
    },
    radius: {
      type: String,
      default: null,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    fullwidth: {
      type: Boolean,
      default: false,
    },
    secondary: {
      type: Boolean,
      default: false,
    },
    red: {
      type: Boolean,
      default: false,
    },
    click: {
      type: Function,
      default: null,
    },
  },
  methods: {
    toggle() {
      this.state = !this.state;

      if (this.onChange) this.onChange(this.state);
    },
  },
  created() {
    this.state = this.value;
  },
};
</script>

<style lang="scss" scoped>
.app-btn {
  position: relative;
  border: none;
  background: transparent;
  color: white;
  padding: 0;
  cursor: pointer;
  outline-offset: 4px;
  transition: filter 250ms;
  font-weight: bold;
  border-radius: 9px;
  font-family: "Excon", sans-serif;

  &.fullwidth {
    width: 100%;
  }

  .edge {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .front {
    display: grid;
    place-content: center;
    position: relative;
    font-family: "Excon", sans-serif;
    will-change: transform;
    transform: translateY(-4px);
    transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
  }

  &:hover {
    filter: brightness(110%);

    .front {
      transform: translateY(-6px);
      transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
    }
  }

  &:active {
    .front {
      transform: translateY(-2px);
      transition: transform 34ms;
    }
  }
}

button {
  * {
    flex-shrink: 1;
    flex-grow: 1;
  }

  .front {
    padding: 0.2em 0.3em;
    border-radius: 5px;
    flex-shrink: 0;
    background: var(--purple);
  }

  .edge {
    border-radius: 5px;
    background: rgba(91, 70, 188, 0.6);
  }

  &.secondary {
    background: var(--purple);

    .front {
      background: #22224a;
      color: white;
    }

    .edge {
      background: #1e1e33;
    }
  }

  &.red {
    background: #ae2445;

    .front {
      background: #ae2445;
      color: white;
    }

    .edge {
      background: #941936;
    }
  }

  &.disabled {
    cursor: not-allowed !important;
    .front {
      background: #22224a;
      color: white;
    }

    .edge {
      background: #1b1b3a;
    }
  }
}

button.flat-btn {
  position: relative;
  border: none;
  background: transparent;
  padding: 0;
  font-weight: bold;
  background: var(--purple);
  border-radius: 5px;
  padding: 0.2em 20px;
  @media only screen and (max-width: 650px) {
    padding: 0.2em 15px;
  }

  &.secondary {
    color: white;
    box-shadow: unset;

    background: #22224a;
  }

  &:disabled {
    background: #22224a;
  }
}
</style>
