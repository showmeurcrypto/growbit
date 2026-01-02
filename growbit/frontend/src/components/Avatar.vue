<template>
  <div class="avatar" v-html="AvatarImage"></div>
</template>

<script>
import { toSvg } from "jdenticon";
const AvatarImage = toSvg("value", 50);
export default {
  name: "AppMaintenance",
  data() {
    return {
      AvatarImage,
    };
  },
};
</script>

<style scoped>
.avatar {
  display: grid;
  place-content: center;
  height: 50px;
  width: 50px;
  overflow: hidden;
}
</style>
