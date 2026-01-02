<script>
import SupportChat from "@/components/modals/wallet/mmo/chat/SupportChat.vue";
import { mapActions, mapGetters } from "vuex";
import TicketComponent from "@/components/modals/wallet/mmo/chat/TicketComponent.vue";
import Chat from "@/components/chat/Chat.vue";

export default {
  name: "admin-support",
  components: {
    Chat,
    SupportChat,
    TicketComponent,
  },
  data() {
    return {
      selectedChatUserId: null,
    };
  },
  computed: {
    ...mapGetters(["adminSupportChats"]),
    currentChatObj() {
      if (this.selectedChatUserId) {
        return this.adminSupportChats.chats?.find(
          (chat) => chat.user === this.selectedChatUserId
        );
      }
      return null;
    },
  },
  methods: {
    ...mapActions([
      "adminSupportChatsSendMessageSocket",
      "adminSupportChatsDelete",
    ]),
    sendMessage(message, userId) {
      this.adminSupportChatsSendMessageSocket({
        message: message,
        userId: userId,
      });
    },
    deleteChat(userId) {
      this.adminSupportChatsDelete({
        userId: userId,
      });
    },
    chatClick(chat) {
      this.selectedChatUserId = chat.user;
    },
  },
};
</script>

<template>
  <div class="container">
    <span v-if="adminSupportChats.loading">Loading...</span>

    <span
      v-if="!adminSupportChats.loading && !adminSupportChats.chats?.length"
      class="no_tickets"
    >
      No Chats yet !
    </span>
    <div v-else class="box">
      <div class="chats">
        <ol>
          <div
            v-for="(chat, index) of adminSupportChats.chats"
            @click="chatClick(chat)"
            :class="{
              selected: selectedChatUserId?.toString() === chat.user.toString(),
            }"
            :key="chat.username"
          >
            <span class="user">{{ chat.username }}</span>
            <span class="time">{{
              new Date(chat.updatedAt).toLocaleTimeString()
            }}</span>
            <span class="last-msg">{{
              chat.messages[chat.messages.length - 1].message
            }}</span>
          </div>
        </ol>
      </div>

      <div class="right">
        <SupportChat
          v-if="currentChatObj"
          :onClose="
            () => {
              deleteChat(currentChatObj.user);
            }
          "
          :ticket="currentChatObj"
          :onSend="
            (msg) => {
              sendMessage(msg, currentChatObj?.user);
            }
          "
        ></SupportChat>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 100%;
  display: flex;
  max-width: 1500px;
  min-height: 700px;
  gap: 15px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  border-radius: 20px;

  .no_tickets {
    font-style: normal;
    font-weight: 700;
    font-size: 1.29rem;
    color: #eeeeee;
  }

  .box {
    display: flex;
    width: 100%;
    gap: 5px;
    max-width: 100%;
    overflow-x: scroll;
    height: 100%;
    flex-grow: 1;

    .right {
      border-radius: 5px;
      background: #22224a;
      width: 100%;
    }

    > div {
      &:nth-of-type(3) {
        flex-grow: 2;
      }
    }

    @media (max-width: 991px) {
      flex-direction: column-reverse;
    }

    @media (min-width: 991px) {
      .right {
        min-width: 400px;
      }
    }
  }

  .icon {
    path {
      stroke: white;
    }
  }

  .chats {
    position: relative;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-width: 300px;
    min-height: 300px;
    border-radius: 5px;
    padding: 15px;
    background-color: #090c1d;
    width: 100%;
    gap: 20px;

    @media (max-width: 991px) {
      max-width: unset;
      width: 100%;
    }

    ol {
      max-height: 500px;
      padding: 2px;
      @media (max-width: 991pxpx) {
        max-height: 200px;
      }

      overflow: scroll;

      > div {
        padding: 10px;
        border-radius: 5px;
        background: #22224a;
        margin-bottom: 10px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        overflow: hidden;

        .user {
          font-weight: 900;
          font-size: 16px;
        }
        .last-msg {
          font-size: 12px;
          color: gray;

          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .time {
          font-size: 12px;
          color: gray;
        }

        &.selected {
          border: 2px solid #f6be2c;
        }
      }
    }
  }
}
</style>
