<script>
import SupportChat from "@/components/views/support/SupportChat.vue";

export default {
  name: "support-component",
  components: {
    SupportChat,
  },
};
</script>

<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";
import TicketComponent from "@/components/views/support/TicketComponent.vue";

const tickets = ref([]);
const loading = ref(false);
const currentTicket = ref(null);

const sendMessage = (message, id) => {
  axios
    .post("/admin/support-send", {
      message,
      id,
    })
    .then(() => {
      location.reload();
    })
    .catch((e) => {
      console.error(e);
    });
};

const ticketClick = (index) => {
  console.log(index);
  currentTicket.value = index;
};

const loadTickets = () => {
  axios
    .get("/admin/support-tickets")
    .then(({ data }) => {
      tickets.value = data;
      if (data.length) {
        currentTicket.value = 0;
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

onMounted(loadTickets);
</script>

<template>
  <div class="container">
    <span v-if="loading">Loading...</span>

    <span v-if="!loading && !tickets?.length" class="no_tickets">
      No tickets yet !
    </span>

    <div class="box">
      <div class="tickets">
        <ol>
          <TicketComponent
            v-for="(t, index) of tickets"
            :ticket="t"
            :setTicket="() => ticketClick(index)"
            :key="t.id"
          />
        </ol>
      </div>

      <SupportChat
        v-if="tickets && currentTicket != null"
        :onClose="loadTickets"
        :ticket="tickets[currentTicket]"
        :onSend="
          (msg) => {
            sendMessage(msg, tickets[currentTicket]?._id);
          }
        "
      ></SupportChat>
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
    gap: 10px;

    @media (max-width: 800px) {
      flex-direction: column;
    }
  }

  .icon {
    path {
      stroke: white;
    }
  }

  .tickets {
    position: relative;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-width: 400px;
    min-height: 300px;
    background: var(--op_5_bg);
    border-radius: 5px;
    padding: 15px;

    gap: 20px;

    @media (max-width: 800px) {
      width: 100%;
    }

    ol {
      max-height: 500px;
      padding: 2px;
      @media (max-width: 800px) {
        max-height: 200px;
      }

      overflow: scroll;
    }
  }
}
</style>
