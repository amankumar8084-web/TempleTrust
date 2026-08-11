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
        gallery: "Gallery",
        announcements: "Notices",
        contact: "Contact",
        dashboard: "Dashboard",
        login: "Login"
      },
      home: {
        welcome: "Welcome to BrahamBaba Nirog Dham Foundation",
        subtitle: "BrahmBaba Temple is known for fulfilling wishes and offering peace. Devotees visit to pray, tie sacred threads, and find inner calm.",
        timings: "Daily Temple Timings",
        donateCTA: "Make a Divine Contribution",
        volunteerCTA: "Join Our Volunteer Community",
        bannerText: "JAY BRAHAMBABA",
        donateOnline: "Donate Online",
        aboutTitle: "About BrahamBaba Shrine",
        aboutFallback: "Seeded by Vedic history and maintained by spiritual gurus...",
        readFullHistory: "Read Full History",
        noticeBoardTitle: "Notice Board",
        noticeBoardSub: "Stay updated with latest announcements & alerts",
        viewAll: "View All",
        noActiveNotices: "No active announcements at the moment.",
        pinned: "Pinned",
        published: "Published:",
        stat1Value: "100%",
        stat1Text: "Transparency in Donations",
        stat2Value: "Daily",
        stat2Text: "Annadanam Food Seva",
        stat3Value: "80G",
        stat3Text: "Govt. Tax Exemption Receipt"
      }
    }
  },
  hi: {
    translation: {
      nav: {
        home: "मुख्य पृष्ठ",
        about: "हमारे बारे में",
        donations: "दान",
        gallery: "गैलरी",
        announcements: "सूचनाएं",
        contact: "संपर्क",
        dashboard: "डैशबोर्ड",
        login: "लॉगिन"
      },
      home: {
        welcome: "ब्रह्मबाबा निरोग धाम फाउंडेशन में आपका स्वागत है",
        subtitle: "ब्रह्मबाबा मंदिर मनोकामनाएं पूरी करने और शांति देने के लिए प्रसिद्ध है। भक्त प्रार्थना करने, धागे बाँधने और मन की शांति पाने आते हैं।",
        timings: "दैनिक मंदिर समय",
        donateCTA: "एक दिव्य योगदान दें",
        volunteerCTA: "स्वयंसेवक समुदाय से जुड़ें",
        bannerText: "जय ब्रह्मबाबा",
        donateOnline: "ऑनलाइन दान करें",
        aboutTitle: "ब्रह्मबाबा तीर्थ के बारे में",
        aboutFallback: "वैदिक इतिहास द्वारा बीजित और आध्यात्मिक गुरुओं द्वारा पोषित...",
        readFullHistory: "पूरा इतिहास पढ़ें",
        noticeBoardTitle: "सूचना पट्ट",
        noticeBoardSub: "नवीनतम घोषणाओं और अलर्ट के साथ अपडेट रहें",
        viewAll: "सभी देखें",
        noActiveNotices: "इस समय कोई सक्रिय घोषणा नहीं है।",
        pinned: "पिन किया गया",
        published: "प्रकाशित:",
        stat1Value: "100%",
        stat1Text: "दान में पारदर्शिता",
        stat2Value: "दैनिक",
        stat2Text: "अन्नदान भोजन सेवा",
        stat3Value: "80G",
        stat3Text: "सरकारी कर छूट रसीद"
      }
    }
  },
  ta: {
    translation: {
      nav: {
        home: "முகப்பு",
        about: "எங்களைப் பற்றி",
        donations: "நன்கொடைகள்",
        gallery: "கேலரி",
        announcements: "அறிவிப்புகள்",
        contact: "தொடர்பு",
        dashboard: "டாஷ்போர்டு",
        login: "உள்நுழை"
      },
      home: {
        welcome: "பிரம்மபாபா கோவில் அறக்கட்டளைக்கு வரவேற்கிறோம்",
        subtitle: "பிரம்மபாபா கோவில் விருப்பங்களை நிறைவேற்றவும் அமைதி தரவும் பிரபலமானது. பக்தர்கள் பிரார்த்தனை செய்யவும், நூல் கட்டவும், மன அமைதி பெறவும் வருகின்றனர்.",
        timings: "தினசரி கோவில் நேரங்கள்",
        donateCTA: "தெய்வீக பங்களிப்பை வழங்குக",
        volunteerCTA: "தன்னார்வ சமூகத்தில் இணையுங்கள்",
        bannerText: "ஜெய் பிரம்மபாபா",
        donateOnline: "ஆன்லைனில் நன்கொடை அளியுங்கள்",
        aboutTitle: "பிரம்மபாபா சன்னதி பற்றி",
        aboutFallback: "வேத வரலாற்றால் விதைக்கப்பட்டு ஆன்மீக குருக்களால் பராமரிக்கப்படுகிறது...",
        readFullHistory: "முழு வரலாற்றையும் படிக்க",
        noticeBoardTitle: "அறிவிப்பு பலகை",
        noticeBoardSub: "சமீபத்திய அறிவிப்புகள் மற்றும் எச்சரிக்கைகளுடன் புதுப்பித்த நிலையில் இருங்கள்",
        viewAll: "அனைத்தையும் காண்க",
        noActiveNotices: "தற்போது செயலில் இருப்பதில் அறிவிப்புகள் இல்லை.",
        pinned: "பின் செய்யப்பட்டது",
        published: "வெளியிடப்பட்டது:",
        stat1Value: "100%",
        stat1Text: "நன்கொடைகளில் வெளிப்படைத்தன்மை",
        stat2Value: "தினசரி",
        stat2Text: "அன்னதான உணவு சேவை",
        stat3Value: "80G",
        stat3Text: "அரசு வரி விலக்கு ரசீது"
      }
    }
  },
  te: {
    translation: {
      nav: {
        home: "హోమ్",
        about: "మా గురించి",
        donations: "విరాళాలు",
        gallery: "గ్యాలరీ",
        announcements: "ప్రకటనలు",
        contact: "సంప్రదించండి",
        dashboard: "డాష్‌బోర్డ్",
        login: "లాగిన్"
      },
      home: {
        welcome: "బ్రహ్మబాబా దేవాలయ ట్రస్ట్‌కు స్వాగతం",
        subtitle: "బ్రహ్మబాబా ఆలయం కోరికలు తీర్చడానికి మరియు శాంతి ఇవ్వడానికి ప్రసిద్ధి. భక్తులు ప్రార్థించడానికి, పవిత్ర దారాలు కట్టడానికి, మరియు మనశ్శాంతి పొందడానికి వస్తారు.",
        timings: "రోజువారీ ఆలయ వేళలు",
        donateCTA: "దైవిక విరాళం ఇవ్వండి",
        volunteerCTA: "వాలంటీర్ గ్రూపులో చేరండి",
        bannerText: "జై బ్రహ్మబాబా",
        donateOnline: "ఆన్‌లైన్‌లో విరాళం ఇవ్వండి",
        aboutTitle: "బ్రహ్మబాబా ఆలయం గురించి",
        aboutFallback: "వేద చరిత్ర ద్వారా నాటబడింది మరియు ఆధ్యాత్మిక గురువులచే నిర్వహించబడుతుంది...",
        readFullHistory: "పూర్తి చరిత్రను చదవండి",
        noticeBoardTitle: "నోటీసు బోర్డు",
        noticeBoardSub: "తాజా ప్రకటనలు మరియు హెచ్చరికలతో నవీకరించి ఉండండి",
        viewAll: "అన్నీ చూడండి",
        noActiveNotices: "ప్రస్తుతం చురుకైన ప్రకటనలు ఏమీ లేవు.",
        pinned: "పిన్ చేయబడింది",
        published: "ప్రచురించబడింది:",
        stat1Value: "100%",
        stat1Text: "విరాళాలలో పారదర్శకత",
        stat2Value: "రోజువారీ",
        stat2Text: "అన్నదానం ఆహార సేవ",
        stat3Value: "80G",
        stat3Text: "ప్రభుత్వ పన్ను మినహాయింపు రశీదు"
      }
    }
  },
  bn: {
    translation: {
      nav: {
        home: "মূল পাতা",
        about: "আমাদের সম্পর্কে",
        donations: "দান",
        gallery: "গ্যালারি",
        announcements: "বিজ্ঞপ্তি",
        contact: "যোগাযোগ",
        dashboard: "ড্যাশবোর্ড",
        login: "লগইন"
      },
      home: {
        welcome: "ব্রহ্মবাবা মন্দির ট্রাস্টে আপনাকে স্বাগত",
        subtitle: "ব্রহ্মবাবা মন্দির মনোকামনা পূরণ ও শান্তির জন্য পরিচিত। ভক্তরা প্রার্থনা করতে, পবিত্র সুতো বাঁধতে এবং মনের শান্তি খুঁজতে আসেন।",
        timings: "দৈনিক মন্দিরের সময়সূচী",
        donateCTA: "ঐশ্বরিক অনুদান প্রদান করুন",
        volunteerCTA: "স্বেচ্ছাসেবক হিসেবে যোগ দিন",
        bannerText: "জয় ব্রহ্মবাবা",
        donateOnline: "অনলাইনে দান করুন",
        aboutTitle: "ব্রহ্মবাবা তীর্থ সম্পর্কে",
        aboutFallback: "বৈদিক ইতিহাসের দ্বারা রোপিত এবং আধ্যাত্মিক গুরুদের দ্বারা পরিচালিত...",
        readFullHistory: "সম্পূর্ণ ইতিহাস পড়ুন",
        noticeBoardTitle: "নোটিশ বোর্ড",
        noticeBoardSub: "সাম্প্রতিক প্রকাশনা এবং সতর্কতার সাথে আপডেট থাকুন",
        viewAll: "সবগুলো দেখুন",
        noActiveNotices: "এই মুহূর্তে কোনো সক্রিয় ঘোষণা নেই।",
        pinned: "পিন করা",
        published: "প্রকাশিত:",
        stat1Value: "100%",
        stat1Text: "দানে স্বচ্ছতা",
        stat2Value: "দৈনিক",
        stat2Text: "অন্নদান খাদ্য সেবা",
        stat3Value: "80G",
        stat3Text: "সরকারি কর ছাড়ের রসিদ"
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
