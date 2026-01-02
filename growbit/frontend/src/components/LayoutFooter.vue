<template>
  <footer>
    <div class="footer-row">
      <div>
        <div>Casino</div>
        <router-link to="/casino/originals">GrowBit Originals</router-link>
        <router-link to="/casino/slots">Slots</router-link>
      </div>
      <div>
        <div>Policies</div>
        <router-link to="/terms">Terms Of Service </router-link>
        <router-link to="/privacy">Privacy Policy</router-link>
      </div>
      <div>
        <div>Promotions</div>
        <router-link to="/leaderboard">Weekly Race</router-link>
        <router-link to="/challenges">Challenges</router-link>
      </div>

      <div>
        <div>Support</div>
        <router-link to="/faq">FAQ</router-link>
      </div>

      <div>
        <div>Community</div>
        <div class="socials">
          <YoutubeIcon />
          <InstagramIcon />
          <a href="https://discord.gg/growbit"><Discord /></a>
          <a href="https://t.me/Growbitnet"><TelegramIcon /></a>
          <TwitterIcon />
        </div>
      </div>
    </div>
    <div class="title">Accepted Currencies</div>
    <div class="small-title">Crypto</div>
    <div class="currencies">
      <div v-for="c of currencies">
        <img :src="`/img/cashier/${c.toLowerCase()}.png`" />
        {{ c }}
      </div>
    </div>
    <div class="small-title">In-Game</div>
    <div class="currencies">
      <div>
        <img src="/img/growtopia/world_lock.png" />
        WL
      </div>
      <div>
        <img src="/img/growtopia/diamond_lock.png" />
        DL
      </div>
      <div>
        <img src="/img/growtopia/blue_gem_lock.png" />
        BGL
      </div>
    </div>
    <p :style="{ display: 'none' }">license number: ALSI-202409024-FI2</p>
  </footer>
</template>

<script>
import YoutubeIcon from "@/assets/images/footer/yt.svg?inline";
import InstagramIcon from "@/assets/images/footer/instagram.svg?inline";
import Discord from "@/assets/images/footer/discord.svg?inline";
import TelegramIcon from "@/assets/images/footer/telegram.svg?inline";
import TwitterIcon from "@/assets/images/footer/twitter.svg?inline";

export default {
  data() {
    return {
      currencies: ["BTC", "ETH", "TRX", "LTC", "SOL"],
    };
  },
  components: {
    YoutubeIcon,
    InstagramIcon,
    Discord,
    TelegramIcon,
    TwitterIcon,
  },
};
</script>

<style lang="scss">
footer {
  margin-inline: auto;
  margin-top: 10px;
  border-top: 2px solid rgba(97, 100, 152, 0.15);
  max-width: 1100px;

  padding: 50px 20px;
  @media screen and (max-width: 991px) {
    padding: 20px 20px 50px 20px;
  }

  .title {
    font-style: normal;
    font-weight: 700;
    font-size: 1.29rem;
    line-height: 26px;
    color: #ffffff;
  }

  .small-title {
    margin-top: 15px;
    font-style: normal;
    font-weight: 500;
    font-size: 1.143rem;
    line-height: 23px;
    color: #ffffff;
  }
  .currencies {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    margin-top: 15px;
    > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px 15px;
      height: 44px;
      background: #22224a;
      border-radius: 8px;
      gap: 10px;
      img {
        height: 24px;
        width: 24px;
      }
    }
  }
  .footer-row {
    margin-inline: auto;
    display: flex;
    justify-content: space-between;
    font-style: normal;
    font-weight: 700;
    font-size: 1.143rem;
    margin-bottom: 30px;

    @media screen and (max-width: 991px) {
      justify-content: flex-start;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    > div {
      display: flex;
      flex-direction: column;
      gap: 10px;
      > div:first-of-type {
        font-weight: 700;
        font-size: 1.143rem;
        color: #ffffff;
      }

      > a {
        font-weight: 400;
        font-size: 1.143rem;

        color: var(--purple-2);
      }
    }

    .socials {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
    }

    color: #ffffff;
  }
}
</style>
