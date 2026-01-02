<template>
  <div class="avatar-image">
    <img :src="`/img/avatars/${+avatarNumber || 0}.png`" alt="" />
  </div>
</template>

<script>
import Avatar from "@/components/Avatar.vue";

export default {
  name: "AvatarImage",
  props: ["avatarNumber"],
  components: {
    Avatar,
  },
  data() {
    return {
      avatarImage: null,
      serverUrl: process.env.VUE_APP_BACKEND_URL,
    };
  },
  methods: {
    avatarImageError() {
      this.avatarImage = this.serverUrl + this.image;
    },
  },
  created() {},
};
</script>

<style scoped>
.avatar-image {
  overflow: hidden;
  width: 100%;
  height: 100%;
  /* padding: 3px; */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.avatar-image img {
  width: 100% !important;
  height: 100% !important;
}
</style>
