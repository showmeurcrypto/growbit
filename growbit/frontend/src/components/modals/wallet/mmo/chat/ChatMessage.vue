<template>
  <div class="message_row">
    <div class="message_container">
      <div :class="['sender', staff ? 'staff' : '']">{{ message.sender }}:</div>
      <div class="message_content">{{ message.message }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  computed: {
    staff() {
      return this.message.sender === "admin";
    },
  },
};
</script>

<style scoped>
.message_row {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  align-content: flex-start;

  gap: 16px;

  .message_container {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    align-content: flex-start;
    gap: 8px;

    .sender {
      font-style: normal;
      font-weight: 500;
      font-size: 1.143rem;
      color: #ffffff;
      margin-right: 4px;

      &.staff {
        color: #fec14c;
      }
    }

    .message_content {
      display: flex;
      flex-direction: row;
      width: 100%;
      flex-wrap: wrap;
      align-items: center;
      align-content: flex-start;
      gap: 8px;
      text-align: left;
      padding: 20px;
      border: 2px dashed #212535;
      border-radius: 5px;
      font-style: normal;
      font-weight: 500;
      font-size: 1.143rem;
      color: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>
