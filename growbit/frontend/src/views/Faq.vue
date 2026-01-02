<template>
  <div class="faq">
    <div class="faq-header">GrowBit Frequently Asked Questions (FAQ)</div>
    <div class="faq-content">
      <section v-for="s of questions">
        <p>
          {{ s.sectionName }}
        </p>

        <div
          v-for="q of s.questions"
          class="faq-question"
          :class="{ 'question-open': q.open }"
        >
          <button class="button-toggle" @click="q.open = !q.open">
            <QuestionIcon></QuestionIcon>
            <span> {{ q.Q }} </span>
            <ChevronIcon></ChevronIcon>
          </button>
          <div class="question-content" :class="{ 'faq-opened-style': q.open }">
            <div class="content-inner">
              {{ q.A }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import ChevronIcon from "@/assets/images/arrow.svg?inline";
import QuestionIcon from "@/assets/images/Octagon_Help.svg?inline";

export default {
  name: "Faq",
  metaInfo: {
    title: "FAQ ",
  },
  components: {
    ChevronIcon,
    QuestionIcon,
  },
  data() {
    return {
      questions: [
        {
          sectionName: "General Information",
          questions: [
            {
              Q: "What is GrowBit.net?",
              A: " GrowBit.net is a sweepstakes and entertainment platform offering games and contests for users to enjoy. The platform is governed by a provably fair system to ensure transparency and fairness.",
              open: false,
            },
            {
              Q: "Who can use GrowBit.net?",
              A: "GrowBit.net is available to individuals aged 18 or older who reside in eligible jurisdictions. Users from Nevada and Washington, as well as other restricted areas, are prohibited from accessing the platform. Participants must comply with all local laws and regulations in their jurisdiction.",
              open: false,
            },
            {
              Q: "Is GrowBit free to use?",
              A: "Yes, GrowBit is a completely free-to-play platform. Users can participate in contests and games without any charges. Additional features such as credits and bonuses may also be available through promotions or optional purchases.",
              open: false,
            },
          ],
        },
        {
          sectionName: "Games and Features",
          questions: [
            {
              Q: "What are the rules for participating in contests?",
              A: "Each contest on GrowBit.net has its own set of rules, which are incorporated into the Terms of Service. Users must adhere to these rules and avoid prohibited activities such as collusion, use of automated tools, or multiple account registrations.",
              open: false,
            },
          ],
        },
        {
          sectionName: "Account and Registration",
          questions: [
            {
              Q: "Can I delete my account?",
              A: 'Yes, users can request to delete their accounts by contacting admin@growbit.net with the subject line "Delete Account." Please note that deleting your account is different from unsubscribing from email communications.',
              open: false,
            },
            {
              Q: "How do I unsubscribe from marketing emails",
              A: 'To unsubscribe from marketing emails, click the "unsubscribe" link in the email or send a request to admin@growbit.net with the subject line "Unsubscribe."',
              open: false,
            },
          ],
        },
        {
          sectionName: "Wallet and Transactions",
          questions: [
            {
              Q: "How do I add funds to my Wallet?",
              A: 'Users can add funds to their Wallet for purchasing credits displayed as "DLS" or other supported currencies. Wallet funds are for entertainment purposes only and do not hold real-world monetary value. For assistance with deposits, contact admin@growbit.net.',
              open: false,
            },
            {
              Q: "Can I withdraw funds from my Wallet?",
              A: "Withdrawals are limited to contest prizes and cannot include deposits. Users must utilize their Wallet credits in games before they become eligible for withdrawal. Cryptocurrency withdrawals may require identity verification (KYC) for security and compliance.",
              open: false,
            },
            {
              Q: "What happens if I encounter an issue with a transaction?",
              A: "If you experience any issues with deposits or withdrawals, please report the issue within 24 hours to admin@growbit.net. GrowBit will thoroughly investigate all claims.",
              open: false,
            },
          ],
        },

        {
          sectionName: "Fairness and Security",
          questions: [
            {
              Q: "How does GrowBit ensure fairness?",
              A: "GrowBit.net employs a provably fair system that governs all outcomes. This ensures complete transparency and fairness for all users. Any interface errors or glitches do not override the results generated by this system.",
              open: false,
            },
            {
              Q: "How does GrowBit protect my personal information?",
              A: "GrowBit prioritizes your privacy and employs industry-standard security measures to protect your Personal Information from unauthorized access. Sensitive data, such as payment details, is transmitted securely. For more details, refer to our Privacy Policy.",
              open: false,
            },
            {
              Q: "What should I do if I notice prohibited conduct or security issues?",
              A: "If you observe any violations of the Terms of Service, prohibited activities, or security vulnerabilities, please report them immediately to admin@growbit.net.",
              open: false,
            },
          ],
        },
        {
          sectionName: "Support and Disputes",
          questions: [
            {
              Q: "How does GrowBit handle disputes?",
              A: "Disputes are addressed through amicable resolution efforts. If unresolved, disputes are subject to binding arbitration as outlined in the Terms of Service. Class action waivers and limitations on liability apply.",
              open: false,
            },
            {
              Q: "Who do I contact for further assistance?",
              A: "For any additional questions or support, you can reach out to us via email at admin@growbit.net. Our team will be happy to assist you.",
              open: false,
            },
          ],
        },
      ],
    };
  },
  methods: {},
};
</script>

<style scoped>
.faq-question {
  width: 100%;
  margin-top: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: var(--dark-blue);
  border-radius: 15px;
}

.faq-question:first-child {
  margin-top: 0;
}

.faq-question button.button-toggle {
  width: 100%;
  min-height: 52px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  align-items: center;
  padding: 10px 16px;

  svg {
    flex-shrink: 0;
  }
}

.faq-question button.button-toggle span {
  font-weight: 700;
  font-size: 1.29rem;

  @media screen and (max-width: 991px) {
    font-size: 1rem;
  }
  color: #eeeeee;
  margin-right: auto;
}

.faq-question.question-open button.button-toggle span {
  color: #fff;
}

.faq-question.question-open button.button-toggle svg:last-of-type {
  transform: rotate(180deg);
}

.faq-question .question-content {
  width: 100%;
  padding: 0 16px;
  overflow: hidden;
  max-height: 0px;
  transition: all 0.4s ease;
}

.faq-opened-style {
  max-height: 300px !important;
  transition: all 0.4s ease;
}

.faq-question .content-inner {
  padding: 16px 0;
  font-weight: 700;
  font-size: 1.143rem;

  @media screen and (max-width: 991px) {
    font-size: 1rem;
  }
  color: var(--purple-2);
}

.faq-question .content-inner a {
  color: #fd3b31;
}

.faq {
  margin-inline: auto;
  max-width: 1100px;
  width: 100%;
  padding: 40px;
  @media screen and (max-width: 991px) {
    padding: 10px;
  }
}

.faq .faq-header {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-bottom: 12px;

  font-style: normal;
  font-weight: 900;
  font-size: 40px;

  @media screen and (max-width: 991px) {
    font-size: 1.714rem;
  }
  color: #eeeeee;
}

.faq .faq-content {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-top: 30px;
  @media screen and (max-width: 991px) {
    margin-top: 15px;
  }
  max-width: 1100px;

  > section {
    margin-bottom: 20px;

    > p {
      font-weight: 900;
      font-size: 28px;

      @media screen and (max-width: 991px) {
        font-size: 1.29rem;
      }
      color: #eeeeee;
    }
  }
}
</style>
