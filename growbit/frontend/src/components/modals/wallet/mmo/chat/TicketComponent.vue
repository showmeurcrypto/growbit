<template>
  <li class="ticket" @click="() => setTicket()">
    <span
      class="circle"
      :style="{ backgroundColor: ticket.status === 0 ? 'yellow' : '#32374B' }"
    ></span>
    <div class="name">{{ ticket.currency + " - " + ticket.name }}</div>
    <div class="date">
      {{ new Date(ticket.createdAt).toLocaleDateString() }}
    </div>
  </li>
</template>

<script>
export default {
  props: {
    ticket: {
      type: Object,
      required: true,
    },
    setTicket: {
      type: Function,
      required: true,
    },
  },
  computed: {},
};
</script>

<style scoped>
li {
  position: relative;
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  gap: 10px;

  background: #22224a;
  border-radius: 5px;

  > div:last-of-type {
    margin-left: auto;
    text-transform: capitalize;
    font-style: normal;
    font-weight: 700;
    font-size: 1rem;
    line-height: 19px;
  }
  .circle {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #fec14c;
    margin-right: 5px;
    flex-shrink: 0;
  }

  .date {
    font-style: normal;
    font-weight: 300;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .name {
    margin-left: 10px;
    font-style: normal;
    font-weight: 700;
    font-size: 1.143rem;
    color: #ffffff;
    max-width: 100px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
