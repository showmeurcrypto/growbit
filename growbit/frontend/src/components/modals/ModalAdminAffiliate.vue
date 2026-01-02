<template>
  <div class="modal-admin-affiliate">
    <div class="modal-close">
      <button v-on:click="modalsSetShow(null)">
        <svg
          width="11"
          height="11"
          viewBox="0 0 11 11"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.0005 1.22222L9.77827 0L5.50019 4.27808L1.22222 0.000111474L0 1.22233L4.27797 5.5003L0.000501987 9.77776L1.22272 11L5.50019 6.72252L9.77776 11.0001L11 9.77788L6.72241 5.5003L11.0005 1.22222Z"
          ></path>
        </svg>
        CLOSE
      </button>
    </div>
    <div class="modal-content">
      <div class="affiliate-avatar">
        <AvatarImage :avatarNumber="modalsData.affiliate.avatar" />
      </div>
      <div class="affiliate-username">
        <span v-html="modalsData.affiliate.username"></span>
      </div>
      <div class="affiliate-date">Member since {{ modalGetDate }}</div>
      <!-- <div class="affiliate-id">{{ modalsData.affiliate._id }}</div> -->
      <div class="affiliate-settings">
        <!--        <div class="settings-element element-toggle">-->
        <!--          <div class="element-name">AFFILIATE LOCK</div>-->
        <!--          <button-->
        <!--            v-on:click="adminBlockToggle"-->
        <!--            v-bind:class="{-->
        <!--              'button-active':-->
        <!--                modalsData.affiliate.limits.blockAffiliate === true,-->
        <!--            }"-->
        <!--            v-bind:disabled="socketSendLoading !== null"-->
        <!--          ></button>-->
        <!--        </div>-->
        <!--         <div class="settings-element element-button">
          <div class="element-name">CLEAR AFFILIATES</div>
          <button v-on:click="adminClearButton">
            <div class="button-inner">CLEAR</div>
          </button>
        </div> -->
        <div class="settings-element element-text">
          <div class="element-name">Set Code</div>
          <div class="element-input">
            <input v-model="modalCode" type="text" />
            <button v-on:click="adminCodeButton">
              <div class="button-inner">Set</div>
            </button>
          </div>
        </div>
        <!--        <div class="settings-element element-number">-->
        <!--          <div class="element-name">Set (wagered * edge)</div>-->
        <!--          <div class="element-input">-->
        <!--            <img src="@/assets/images/mmo_coin.png" alt="icon" />-->
        <!--            <input v-model="modalAvailable" type="text" />-->
        <!--            <button v-on:click="adminAvailableToggle">-->
        <!--              <div class="button-inner">UPDATE</div>-->
        <!--            </button>-->
        <!--          </div>-->
        <!--        </div>-->
      </div>
      <div class="affiliate-stats">
        <div class="stats-element">
          <div class="element-inner">
            TOTAL REFERRED
            <div class="inner-amount">
              <div class="amount-value">
                <span>{{ modalsData.affiliate.affiliates.referred }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="stats-element element-profit">
          <div class="element-inner">
            Total Claimed
            <div class="inner-amount">
              <img src="@/assets/images/mmo_coin.png" alt="icon" />
              <div class="amount-value">
                {{
                  modalFormatValue(modalsData.affiliate.affiliates.totalClaimed)
                }}
              </div>
            </div>
          </div>
        </div>
        <div class="stats-element element-profit">
          <div class="element-inner">
            Wagered
            <div class="inner-amount">
              <img src="@/assets/images/mmo_coin.png" alt="icon" />
              <div class="amount-value">
                {{ modalFormatValue(modalsData.affiliate.affiliates.wager) }}
              </div>
            </div>
          </div>
        </div>
        <div class="stats-element element-profit">
          <div class="element-inner">
            Available (before tax)
            <div class="inner-amount">
              <img src="@/assets/images/mmo_coin.png" alt="icon" />
              <div class="amount-value">
                {{
                  modalFormatValue(modalsData.affiliate.affiliates.available)
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AvatarImage from "@/components/AvatarImage";

export default {
  name: "ModalAdminAffiliate",
  components: {
    AvatarImage,
  },
  data() {
    return {
      modalCode: null,
      modalAvailable: null,
    };
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "modalsSetShow",
      "adminSendAffiliateBlockSocket",
      "adminSendAffiliateClearSocket",
      "adminSetAffiliateCodeSocket",
      "adminSendAffiliateAvailableSocket",
    ]),
    modalFormatValue(value) {
      return parseFloat(value).toFixed(2).toString();
    },
    adminBlockToggle() {
      const data = {
        userId: this.modalsData.affiliate._id,
        block: !this.modalsData.affiliate.limits.affiliateBlock,
      };
      this.adminSendAffiliateBlockSocket(data);
    },
    adminClearButton() {
      const data = { userId: this.modalsData.affiliate._id };
      this.adminSendAffiliateClearSocket(data);
    },
    adminCodeButton() {
      if (
        this.modalCode !== null &&
        this.modalCode.trim() !== "" &&
        (this.modalCode.trim().length <= 3 || this.modalCode.trim().length > 20)
      ) {
        this.notificationShow({
          type: "error",
          message: "Your entered affiliate code is invalid.",
        });
        return;
      }

      this.modalCode = this.modalCode.trim() === "" ? null : this.modalCode;

      const data = {
        userId: this.modalsData.affiliate._id,
        code: this.modalCode,
      };
      this.adminSetAffiliateCodeSocket(data);
    },
    adminAvailableToggle() {
      const amount = this.modalAvailable;

      if (amount === null || isNaN(amount) === true || amount < 0) {
        this.notificationShow({
          type: "error",
          message: "Your entered available earnings amount is invalid.",
        });
        return;
      }

      const data = { userId: this.modalsData.affiliate._id, amount: amount };
      this.adminSendAffiliateAvailableSocket(data);
    },
  },
  computed: {
    ...mapGetters(["socketSendLoading", "modalsData"]),
    modalGetDate() {
      const date = new Date(this.modalsData.affiliate.createdAt);
      return (
        date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()
      );
    },
  },
  watch: {
    modalsData: {
      handler(data, oldData) {
        this.modalCode = this.modalsData.affiliate.affiliates.code;
        this.modalAvailable = parseFloat(
          this.modalsData.affiliate.affiliates.available
        ).toFixed(2);
      },
      deep: true,
    },
  },
  created() {
    this.modalCode = this.modalsData.affiliate.affiliates.code;
    this.modalAvailable = parseFloat(
      this.modalsData.affiliate.affiliates.available
    ).toFixed(2);
  },
};
</script>

<style scoped>
.modal-admin-affiliate {
  width: 770px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 20px 44px 20px;
  border-radius: 18px;
  background: #191939;
  border-top: 32px solid transparent;
  border-bottom: 32px solid transparent;

  @media screen and (max-width: 991px) {
    background: transparent;
  }
}

.modal-close {
  position: absolute;
  top: -14px;
  right: 12px;
}

.modal-close button {
  height: 27px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 5px;
  font-size: 0.857rem;
  font-weight: 700;

  background: #22224a;
}

.modal-close button:hover {
  color: #fff;
}

.modal-close button svg {
  margin-right: 8px;
  fill: #767c8b;
  transition: all 0.3s ease;
}

.modal-close button:hover svg {
  fill: #fff;
}

.modal-title {
  text-transform: uppercase;
  font-size: 26px;
  font-weight: 800;
  color: #eeeeee;
}

.modal-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-admin-affiliate .affiliate-avatar {
  width: 95px;
  height: 95px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-top: 20px;
  border-radius: 50%;
  border: 2px solid #9e9e9e;
  overflow: hidden;
}

.modal-admin-affiliate .affiliate-avatar.avatar-blue {
  border: 2px solid #559ee4;
}

.modal-admin-affiliate .affiliate-avatar.avatar-green {
  border: 2px solid #b8e92d;
}

.modal-admin-affiliate .affiliate-avatar.avatar-orange {
  border: 2px solid #fca311;
}

.modal-admin-affiliate .affiliate-avatar.avatar-red {
  border: 2px solid #ff4e4e;
}

.modal-admin-affiliate .affiliate-avatar.avatar-purple {
  border: 2px solid #6953f1;
}

.modal-admin-affiliate .affiliate-avatar.avatar-mod {
  border: 2px solid #ffb703;
}

.modal-admin-affiliate .affiliate-avatar.avatar-admin {
  border: 2px solid #00c74d;
}

.modal-admin-affiliate .affiliate-avatar .avatar-image {
  width: 100%;
  height: 100%;
}

.modal-admin-affiliate .affiliate-username {
  display: flex;
  align-items: center;
  margin-top: 18px;
  font-size: 1.571rem;
  font-weight: 700;
  color: #ffffff;
}

.modal-admin-affiliate .affiliate-date {
  margin-top: 3px;
  font-size: 1rem;
  font-weight: 400;
}

.modal-admin-affiliate .affiliate-id {
  margin-top: 5px;
  font-size: 1rem;
  font-weight: 400;
  color: #db7d48;
}

.modal-admin-affiliate .affiliate-settings {
  width: 100%;
  margin-top: 25px;
}

.modal-admin-affiliate .settings-element {
  width: 100%;
  height: 47px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 0 20px;
  border-radius: 5px;
  background-color: #22224a;
}

.modal-admin-affiliate .settings-element:first-of-type {
  margin-top: 0;
}

.modal-admin-affiliate .element-name {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 700;
  color: #bbbfd0;
}

.modal-admin-affiliate .settings-element.element-toggle button {
  width: 45px;
  height: 22px;
  position: relative;
  filter: drop-shadow(0px 4px 25px rgba(15, 41, 63, 0.35));
}

.modal-admin-affiliate .settings-element.element-toggle button:disabled {
  cursor: not-allowed;
}

.modal-admin-affiliate .settings-element.element-toggle button::before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 34px;
  background: rgba(253, 59, 49, 0.4);
}

.modal-admin-affiliate .settings-element.element-toggle button::after {
  content: "";
  width: 19px;
  height: 19px;
  position: absolute;
  top: 1px;
  left: 2px;
  border-radius: 50%;
  background: #fd3b31;
  transition: transform 0.3s ease;
}

.modal-admin-affiliate
  .settings-element.element-toggle
  button.button-active::before {
  background: rgba(0, 199, 77, 0.4);
}

.modal-admin-affiliate
  .settings-element.element-toggle
  button.button-active::after {
  transform: translateX(26px);
  background: var(--purple);
}

.modal-admin-affiliate .settings-element.element-text .element-input,
.modal-admin-affiliate .settings-element.element-number .element-input {
  position: relative;
  display: flex;
  align-items: center;
}

.modal-admin-affiliate .settings-element.element-number .element-input img {
  width: 15px;
  height: 15px;
  position: absolute;
  top: 9px;
  left: 15px;
}

.modal-admin-affiliate .settings-element.element-text .element-input input,
.modal-admin-affiliate .settings-element.element-number .element-input input {
  max-width: 220px;
  height: 33px;
  margin-right: 20px;
  padding: 0 15px;
  border-radius: 5px;
  font-size: 0.857rem;
  font-weight: 600;
  color: #db7d48;
  background: #22224a;
  @media screen and (max-width: 991px) {
    max-width: 100px;
  }
}

.modal-admin-affiliate .settings-element.element-number .element-input input {
  padding: 0 15px 0 37px;
  color: #ffffff;
}

.modal-admin-affiliate .settings-element.element-button button,
.modal-admin-affiliate .settings-element.element-text .element-input button,
.modal-admin-affiliate .settings-element.element-number .element-input button {
  width: 60px;
  height: 30px;
  filter: drop-shadow(0px 4px 25px rgba(1, 236, 174, 0.15))
    drop-shadow(0px 4px 25px rgba(15, 41, 63, 0.35));
}

.modal-admin-affiliate .settings-element.element-button button .button-inner,
.modal-admin-affiliate
  .settings-element.element-text
  .element-input
  button
  .button-inner,
.modal-admin-affiliate
  .settings-element.element-number
  .element-input
  button
  .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.857rem;
  font-weight: 800;
  color: #ffffff;
  border-radius: 5px;
  background: var(--purple);
}

.modal-admin-affiliate .affiliate-stats {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 35px;
  @media screen and (max-width: 991px) {
    grid-template-columns: 1fr;
  }
}

.modal-admin-affiliate .stats-element {
  width: 100%;
  height: 78px;
  padding: 1px;
}

.modal-admin-affiliate .stats-element:first-of-type {
  margin-right: 34px;
}

.modal-admin-affiliate .element-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  font-size: 0.857rem;
  font-weight: 600;

  background: #22224a;

  border-radius: 8px;
}
.modal-admin-affiliate .inner-amount {
  display: flex;
  align-items: center;
}

.modal-admin-affiliate .inner-amount img {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

.modal-admin-affiliate .amount-value {
  font-size: 1rem;
  font-weight: 600;
  color: #c1c1c1;
}

.modal-admin-affiliate .amount-value span {
  font-size: 1.29rem;
  font-weight: 700;
  color: #ffffff;
}

@media only screen and (max-width: 790px) {
  .modal-admin-affiliate {
    width: 100%;
    padding: 35px 10px 30px 10px;
  }
}
</style>
