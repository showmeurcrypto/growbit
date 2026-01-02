<template>
  <div class="parent" :class="{ collapsed: collapsed }">
    <li
      @click="handleClick"
      class="top"
      :style="{ backgroundImage: `url('${item.icon}')` }"
      :class="{ collapsed: collapsed, open: open }"
    >
      <span class="title" :class="{ collapsed: collapsed }">{{
        item.name
      }}</span>
      <div class="right" :class="{ collapsed: collapsed }">
        <img
          :src="DropdownIcon"
          :style="{
            transform: open ? 'none' : 'rotate(180deg)',
          }"
          alt=""
        />
      </div>
    </li>
    <ol
      class="sub-items"
      v-if="(item.items && open) || collapsed"
      v-for="it in item.items"
    >
      <router-link tag="li" :to="it.url" :class="{ collapsed: collapsed }">
        <div class="icon-wrapper">
          <component :is="it.icon"></component>
        </div>
        <div class="text" :class="{ collapsed: collapsed }">
          <span>{{ it.name }}</span>
          <span v-if="it.count" class="challenge-count">{{ it.count }}</span>
        </div>
      </router-link>
    </ol>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import DropdownIcon from "@/assets/images/arrow.svg?url";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    collapsed: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const open = ref(true);
    const isTablet = ref(window.innerWidth <= 1700);

    const handleClick = () => {
      open.value = !open.value;
    };

    const updateIsMobile = () => {
      isTablet.value = window.innerWidth <= 1700;
    };

    onMounted(() => {
      window.addEventListener("resize", updateIsMobile);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", updateIsMobile);
    });

    return {
      isTablet,
      open,
      handleClick,
      DropdownIcon,
    };
  },
};
</script>

<style lang="scss" scoped>
.icon-wrapper {
  display: grid;
  place-content: center;
  width: 25px;
  height: 25px;
}
.challenge-count {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: fit-content;
  padding: 2px 13px;

  margin-left: 10px;
  height: 24px;
  background: #3a3a65;
  border-radius: 5px;
}

.subitem {
  font-weight: 600;
  font-size: 1rem;
}

.parent {
  background: #161533;
  &.collapsed {
  }

  @media (max-width: 1700px) {
  }

  border-radius: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  > ol:nth-child(3) {
    > li > div > svg path {
      // fill: #616498;
      stroke: #616498;
    }
  }

  li.top {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 20px 15px 20px 15px;

    background-repeat: no-repeat;
    background-size: contain;

    width: 100%;
    cursor: pointer;

    &.open {
      border-radius: 8px 8px 0 0;
    }

    &:not(.open) {
      border-radius: 8px;
    }

    svg {
      flex-shrink: 0;
    }

    &.collapsed {
      display: none;
    }

    &.open {
      svg path {
        fill: #ffffff;
      }
    }

    > span {
      font-weight: bold;
      font-size: 1rem;
      text-transform: uppercase;
      color: #eeeeee;
    }

    height: 39px;

    .right {
      margin-left: auto;

      display: grid;
      place-content: center;
      width: 24px;
      height: 24px;
      border-radius: 8px;

      > img {
        width: 24px;
        height: 24px;
      }

      &.collapsed {
        display: none;
      }
    }

    .title {
      text-wrap: nowrap;
      opacity: 1;
      transition: opacity 2s;
    }

    .title.collapsed {
      opacity: 0;
    }
  }

  ol.sub-items {
    height: 44px;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;

    &:first-of-type {
      padding-top: 5px;
    }

    &:last-of-type {
      padding-bottom: 5px;
    }

    > li {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 10px;

      cursor: pointer;

      svg {
        flex-shrink: 0;
      }

      &.collapsed {
        gap: 0;
        justify-content: center;
      }

      &:not(.router-link-exact-active) {
        > div svg path {
          fill: #616498;
          // stroke: #616498;
        }
      }

      &.router-link-exact-active {
        //background: #22224a;
        //border-radius: 8px;
      }

      &:not(.collapsed) {
        width: 100%;
      }
    }

    > span {
      font-weight: 700;
      font-size: 1rem;
      color: #eeeeee;
    }

    .text {
      flex-wrap: nowrap;
      text-wrap: nowrap;
      display: flex;
      align-items: center;
      flex-grow: 1;
      justify-content: space-between;

      &.collapsed {
        display: none;
      }
    }
  }
}
</style>
