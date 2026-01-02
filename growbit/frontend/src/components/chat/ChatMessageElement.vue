<template>
  <div class="chat-message-element" @contextmenu="rightClickHandler($event)">
    <div
      v-if="['system', 'cases', 'tip', 'challenge'].includes(message.type)"
      class="element-system"
    >
      <div class="system-header">
        <img src="@/assets/images/growbit.png" />

        <div class="type" v-if="message.type !== 'system'">
          <img
            v-if="getTypeImg(message.type)"
            :src="getTypeImg(message.type)"
          />
          <span>{{ message.type }}</span>
        </div>
      </div>
      <div
        @click="messageClick($event)"
        v-html="formatSystemMessage(message)"
        class="system-content"
      ></div>
    </div>
    <div v-else class="element-message">
      <div class="element-top">
        <img
          v-if="level && message.user.rank === 'user'"
          :src="`/img/badges/small/level_${level}.png`"
        />
        <img
          v-if="message.user.rank !== 'user'"
          :src="`/img/badges/${message.user.rank}.webp`"
        />
        <button v-on:click="openUserModal()" class="button-user">
          <div class="user-username" :class="`${message.user.rank}`">
            {{ message.user.username }}
          </div>
        </button>
      </div>
      <span
        @click="messageClick($event)"
        v-html="formatMessage(message)"
        class="element-text"
      ></span>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AvatarImage from "@/components/AvatarImage";
import { getUserLevel } from "@/utils";

export default {
  name: "ChatMessageElement",
  components: {
    AvatarImage,
  },
  props: ["message", "support"],
  methods: {
    ...mapActions(["modalsSetShow", "modalsSetData", "generalSetUserInfoData"]),
    rightClickHandler: function (e) {
      if (["admin", "mod"].includes(this.authUser?.user?.rank)) {
        e.preventDefault();
        this.chatRemoveButton();
      }
    },
    openUserModal() {
      if (this.authUser?.user && !this.support) {
        this.generalSetUserInfoData(this.message.user);
        this.modalsSetShow("ChatUser");
      }
    },
    messageClick(e) {
      let target = e.target || e.originalTarget;
      if (target instanceof HTMLSpanElement && target.className === "mention") {
        let username = target.innerText?.slice(0);

        console.log(username);
        console.log(this.message.mentioned);

        const mentioned = this.message.mentioned || [];

        let user = mentioned.find((u) => u.username === username);

        if (user) {
          this.generalSetUserInfoData(user);
          this.modalsSetShow("ChatUser");
        }

        e.stopPropagation();
      }
    },

    getTypeImg(type) {
      if (type === "cases") {
        return "/img/game/icon-cases.svg";
      }
      if (type === "tip") {
        return "/img/lock.svg";
      }

      return null;
    },

    formatSystemMessage(msg) {
      let txt = msg.message;
      const mentioned = msg.mentioned || [];
      for (let m of mentioned) {
        //  console.log(m);
        let username = m.username;
        const mentionRegex = new RegExp(`@${username}`, "i");
        txt = txt.replace(
          mentionRegex,
          `<span class="mention">${username}</span>`
        );
      }

      // const itemName = txt.match("/@([^@]+)@/");
      // console.log(itemName);
      // console.log(msg);
      const itemNameRegex = new RegExp("#[^#]+#", "gi");
      txt = txt.replace(itemNameRegex, (match) => {
        return `<span style= "color: ${msg.color};"> ${match.slice(
          1,
          -1
        )} </span>`;
      });

      txt = txt.replace(
        /DLS/g,
        '<img src="/img/growtopia/diamond_lock.png" alt="lock" width="16" height="16" class="chat-dls" >'
      );

      return txt;
    },
    formatMessage(msg) {
      let txt = msg.message;
      const mentioned = msg.mentioned || [];
      for (let m of mentioned) {
        let username = m.username;
        const mentionRegex = new RegExp(`@${username}`, "gi");
        txt = txt.replace(
          mentionRegex,
          `<span class="mention">@${username}</span>`
        );
      }
      return txt;
    },
    chatRemoveButton() {
      this.modalsSetData({ user: this.message.user, message: this.message });
      this.modalsSetShow("Remove");
    },
  },
  computed: {
    ...mapGetters(["authUser"]),
    level() {
      return getUserLevel(this.message.user).level;
    },
  },
};
</script>

<style scoped lang="scss">
.chat-message-element {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 7px;
  border-radius: 5px;

  background: #161533;
}

.chat-message-element .element-message {
  padding: 1rem;

  width: 100%;
}

.chat-message-element .element-top {
  width: fit-content;
  justify-content: flex-start;
  display: inline-flex;

  margin-right: 8px;

  gap: 5px;

  .rank {
    height: fit-content;
    font-size: 0.857rem;
    font-weight: bold;
    border-radius: 3px;
    color: var(--red);
    margin-left: 5px;
    margin-right: auto;
  }

  > img {
    width: auto;
    height: 18px;
    margin-right: 2px;
  }

  .mod {
    color: #f6be2c;
  }
  .streamer {
    color: var(--green);
  }
  .partner {
    color: var(--green);
  }
}

.chat-message-element .element-top .top-admin {
  margin-left: auto;
  display: flex;
  /* flex-direction: column; */
  justify-content: center;
  align-items: center;
  gap: 2px;
}

.chat-message-element .top-system,
.chat-message-element button.button-user {
  display: flex;
  align-items: center;
}

.chat-message-element .system-avatar,
.chat-message-element button.button-user .avatar-image {
  width: 30px;
  height: 30px;
  margin-right: 4px;
  border-radius: 100%;
  background-color: #191d26;
}

.chat-message-element .system-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.857rem;
  font-weight: 600;
  color: #fff;
  background: #67c4f8;
}

.chat-message-element .system-rank,
.chat-message-element .user-rank {
  height: 19px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 5px;
  padding: 0 5px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: #a1aeb5;
}

.chat-message-element .system-rank {
  background: #67c4f8;
}

.chat-message-element .user-rank svg {
  width: 11px;
  margin-right: 5px;
  margin-bottom: 1px;
  fill: #fff;
}

.chat-message-element .system-username,
.chat-message-element .user-username {
  max-width: 150px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "Excon";
  font-style: normal;
  font-weight: 700;
  font-size: 16px;

  color: white;
}

.chat-message-element button.button-user.user-mod .user-username {
  max-width: 112px;
}

.chat-message-element button.button-user.user-admin .user-username {
  max-width: 100px;
}

.chat-message-element {
  .element-text {
    width: fit-content;
    margin-top: 3px;
    border-radius: 8px;
    word-break: break-word;
    text-align: left;
    font-family: "Excon";
    font-style: normal;
    font-weight: 500;
    font-size: 1rem;
    color: #8482c5;
  }
}

.element-system {
  width: 100%;
  background: #161533;

  border: 1px solid #1f1d3f;
  overflow: hidden;
  border-radius: 7px;

  .system-content {
    padding: 15px;

    font-family: "Excon";
    font-style: normal;
    font-weight: 500;
    font-size: 1rem;

    color: #8482c5;
  }

  .system-header {
    display: flex;
    align-items: center;

    padding-inline: 13px;
    img {
      height: 13px;
    }

    .type {
      display: flex;
      align-items: center;
      gap: 5px;
      img {
        height: 18px;
        width: auto;
      }

      font-style: normal;
      font-weight: 800;
      text-transform: capitalize;
      font-size: 1rem;

      color: #ffffff;

      margin-left: auto;
    }
    height: 45px;
    background: #0b0e1f;
  }
}
</style>
