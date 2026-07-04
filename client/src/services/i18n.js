import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",
        about: "About Us",
        donations: "Donations",
        pooja: "Pooja Booking",
        events: "Events",
        gallery: "Gallery",
        announcements: "Notices",
        volunteer: "Volunteer",
        membership: "Membership",
        contact: "Contact",
        dashboard: "Dashboard",
        login: "Login"
      },
      home: {
        welcome: "Welcome to BrahamBaba Temple Trust",
        subtitle: "Sustaining Vedic spirituality and community charity since 1978.",
        timings: "Daily Temple Timings",
        donateCTA: "Make a Divine Contribution",
        volunteerCTA: "Join Our Volunteer Community"
      }
    }
  },
  hi: {
    translation: {
      nav: {
        home: "मुख्य पृष्ठ",
        about: "हमारे बारे में",
        donations: "दान",
        pooja: "पूजा बुकिंग",
        events: "कार्यक्रम",
        gallery: "गैलरी",
        announcements: "सूचनाएं",
        volunteer: "स्वयंसेवक",
        membership: "सदस्यता",
        contact: "संपर्क",
        dashboard: "डैशबोर्ड",
        login: "लॉगिन"
      },
      home: {
        welcome: "ब्रह्मबाबा मंदिर ट्रस्ट में आपका स्वागत है",
        subtitle: "1978 से वैदिक आध्यात्मिकता और सामुदायिक सेवा का पोषण।",
        timings: "दैनिक मंदिर समय",
        donateCTA: "एक दिव्य योगदान दें",
        volunteerCTA: "स्वयंसेवक समुदाय से जुड़ें"
      }
    }
  },
  ta: {
    translation: {
      nav: {
        home: "முகப்பு",
        about: "எங்களைப் பற்றி",
        donations: "நன்கொடைகள்",
        pooja: "பூஜை முன்பதிவு",
        events: "நிகழ்வுகள்",
        gallery: "கேலரி",
        announcements: "அறிவிப்புகள்",
        volunteer: "தன்னார்வலர்",
        membership: "உறுப்பினர்",
        contact: "தொடர்பு",
        dashboard: "டாஷ்போர்டு",
        login: "உள்நுழை"
      },
      home: {
        welcome: "பிரம்மபாபா கோவில் அறக்கட்டளைக்கு வரவேற்கிறோம்",
        subtitle: "1978 முதல் ஆன்மீகம் மற்றும் சமூக சேவையை வளர்த்தல்.",
        timings: "தினசரி கோவில் நேரங்கள்",
        donateCTA: "தெய்வீக பங்களிப்பை வழங்குக",
        volunteerCTA: "தன்னார்வ சமூகத்தில் இணையுங்கள்"
      }
    }
  },
  te: {
    translation: {
      nav: {
        home: "హోమ్",
        about: "మా గురించి",
        donations: "విరాళాలు",
        pooja: "పూజ బుకింగ్",
        events: "ఈవెంట్స్",
        gallery: "గ్యాలరీ",
        announcements: "ప్రకటనలు",
        volunteer: "వాలంటీర్",
        membership: "సభ్యత్వం",
        contact: "సంప్రదించండి",
        dashboard: "డాష్‌బోర్డ్",
        login: "లాగిన్"
      },
      home: {
        welcome: "బ్రహ్మబాబా దేవాలయ ట్రస్ట్‌కు స్వాగతం",
        subtitle: "1978 నుండి వైదిక ఆధ్యాత్మికత మరియు సామాజిక సేవల పోషణ.",
        timings: "రోజువారీ ఆలయ వేళలు",
        donateCTA: "దైవిక విరాళం ఇవ్వండి",
        volunteerCTA: "వాలంటీర్ గ్రూపులో చేరండి"
      }
    }
  },
  bn: {
    translation: {
      nav: {
        home: "মূল পাতা",
        about: "আমাদের সম্পর্কে",
        donations: "দান",
        pooja: "পূজা বুকিং",
        events: "অনুষ্ঠানমালা",
        gallery: "গ্যালারি",
        announcements: "বিজ্ঞপ্তি",
        volunteer: "স্বেচ্ছাসেবক",
        membership: "সদস্যপদ",
        contact: "যোগাযোগ",
        dashboard: "ড্যাশবোর্ড",
        login: "লগইন"
      },
      home: {
        welcome: "ব্রহ্মবাবা মন্দির ট্রাস্টে আপনাকে স্বাগত",
        subtitle: "১৯৭৮ সাল থেকে বৈদিক আধ্যাত্মিকতা ও সমাজসেবার বিকাশ।",
        timings: "দৈনিক মন্দিরের সময়সূচী",
        donateCTA: "ঐশ্বরিক অনুদান প্রদান করুন",
        volunteerCTA: "স্বেচ্ছাসেবক হিসেবে যোগ দিন"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
