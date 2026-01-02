<template>
  <div class="admin-settings">
    <div class="settings-section">
      <div class="section-title">General</div>
      <AdminSettingsToggle
        name="Maintenance"
        setting="general.maintenance.enabled"
      />
      <!--      <AdminSettingsToggle-->
      <!--        name="Leaderboard"-->
      <!--        setting="general.leaderboard.enabled"-->
      <!--      />-->
      <AdminSettingsToggle name="Tip" setting="general.tip.enabled" />
      <!--      <AdminSettingsToggle-->
      <!--        name="Affiliate Redeem"-->
      <!--        setting="general.affiliate.enabled"-->
      <!--      />-->
      <!--      <AdminSettingsSelect-->
      <!--        name="Reward Multiplier"-->
      <!--        setting="general.reward.multiplier"-->
      <!--      />-->
    </div>
    <div class="settings-section">
      <div class="section-title">Chat</div>
      <AdminSettingsToggle name="Enabled" setting="chat.enabled" />
    </div>
    <div class="settings-section">
      <div class="section-title">Games</div>
      <AdminSettingsToggle name="Crash" setting="games.crash.enabled" />
      <AdminSettingsToggle name="Dice" setting="games.dice.enabled" />
      <AdminSettingsToggle name="Mines" setting="games.mines.enabled" />
      <AdminSettingsToggle name="Plinko" setting="games.plinko.enabled" />
      <AdminSettingsToggle name="Keno" setting="games.keno.enabled" />
      <AdminSettingsToggle name="Slide" setting="games.slide.enabled" />
      <AdminSettingsToggle name="Coinflip" setting="games.coinflip.enabled" />
      <AdminSettingsToggle name="Cases" setting="games.cases.enabled" />
      <AdminSettingsToggle name="Reme" setting="games.reme.enabled" />
      <AdminSettingsToggle name="Towers" setting="games.towers.enabled" />
    </div>
    <div class="settings-section">
      <div class="section-title">Crypto</div>
      <AdminSettingsToggle name="Deposit" setting="crypto.deposit.enabled" />
      <AdminSettingsToggle name="Withdraw" setting="crypto.withdraw.enabled" />
    </div>
    <div class="settings-section">
      <div class="section-title">Growtopia</div>
      <AdminSettingsToggle
        name="Withdraw"
        setting="growtopia.withdraw.enabled"
      />
      <AdminSettingsToggle name="Deposit" setting="growtopia.deposit.enabled" />
    </div>
  </div>
</template>

<script>
import AdminSettingsToggle from "@/components/admin/AdminSettingsToggle";
import AdminSettingsSelect from "@/components/admin/AdminSettingsSelect";

export default {
  name: "AdminSettings",
  components: {
    AdminSettingsToggle,
    AdminSettingsSelect,
  },
};
</script>

<style scoped>
.admin-settings {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, auto);
  gap: 10px;
}

.admin-settings .settings-section {
  width: 100%;
  padding: 15px 10px;
  border-radius: 5px;
  background-color: #22224a;
}

.admin-settings .settings-section:nth-child(1) {
  grid-column: 1 / 1;
  grid-row: 1 / 3;
}

.admin-settings .settings-section:nth-child(2) {
  grid-column: 1 / 1;
  grid-row: 3 / 3;
}

.admin-settings .settings-section:nth-child(3) {
  grid-column: 2 / 2;
  grid-row: 1 / 4;
}

.admin-settings .section-title {
  padding-left: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #5f6779;
}

@media only screen and (max-width: 1100px) {
  .admin-settings {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media only screen and (max-width: 850px) {
  .admin-settings {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media only screen and (max-width: 500px) {
  .admin-settings {
    grid-template-columns: repeat(1, 1fr);
  }

  .admin-settings .settings-section:nth-child(3) {
    grid-column: 1 / 1;
    grid-row: 4 / 4;
  }
}
</style>
