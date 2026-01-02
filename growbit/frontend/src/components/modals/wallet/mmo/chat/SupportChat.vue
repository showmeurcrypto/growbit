<template>
  <form class="chat_container" @submit.prevent="handleSend">
    <button class="close-btn" type="button" @click="onClose">
      Close Ticket
    </button>
    <div id="msg-list" class="messages" v-if="ticket?.messages">
      <chat-message
        v-for="(m, index) in ticket.messages.slice().reverse()"
        :key="'support-msg-' + index"
        :message="m"
      />
    </div>

    <div class="message_input">
      <input v-model="msgRef" placeholder="Start typing your message..." />
      <div @click="() => handleSend()">Send</div>
    </div>
  </form>
</template>

<script>
import { ref, watch } from "vue";
import ChatMessage from "@/components/modals/wallet/mmo/chat/ChatMessage.vue";

export default {
  props: {
    adminSide: {
      type: Boolean,
      default: false,
    },
    ticket: {
      type: Object,
      required: true,
    },
    onSend: {
      type: Function,
      required: true,
    },
    onClose: {
      type: Function,
      default: () => {},
    },
  },

  setup(props) {
    const msgRef = ref(null);
    function handleSend() {
      if (msgRef.value) {
        let msg = (msgRef.value || "").trim();
        if (msg) {
          props.onSend(msg);
          msgRef.value = "";
        }
      }
    }

    return {
      msgRef,
      handleSend,
    };
  },
  components: {
    ChatMessage,
  },
};
</script>

<style scoped>
.chat_container {
  position: relative;
  border-radius: 5px;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  @media (max-width: 991px) {
    width: 100%;
    flex-grow: 1;
  }

  .close-btn {
    color: white;
    background: var(--red);
    padding: 5px 10px;
  }

  .message_input {
    background: #161533;
    border: 2px solid #282746;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
    border-radius: 10px;

    margin: auto 20px 20px;

    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 23px 18px 23px;

    > div {
      cursor: pointer;

      > svg > path {
        fill: red;
      }
    }

    > input {
      width: 100%;
      background: transparent;
      border: 0;
      color: white;
    }
  }

  .messages {
    padding: 20px;
    display: flex;
    height: 100%;
    flex-grow: 1;
    max-height: 800px;
    flex-direction: column-reverse;
    align-items: flex-start;
    overflow-y: scroll;
    gap: 10px;
  }
}
</style>
