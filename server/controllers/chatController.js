import { logger } from '../config/db.js';

const KEYWORD_RESPONSES = [
  {
    keywords: ['hi', 'hello', 'hey', 'namaste'],
    response: "Namaste! I am the BrahamBaba Temple AI Assistant. How can I help you today? You can ask me about temple history, aarti timings, pooja slot bookings, or how to make a donation."
  },
  {
    keywords: ['timing', 'timings', 'time', 'open', 'close', 'aarti'],
    response: "BrahamBaba Temple opening hours:<br>• Morning: 05:30 AM to 12:15 PM<br>• Evening: 04:30 PM to 08:30 PM<br>• Mangala Aarti: 05:30 AM<br>• Sandhya Aarti: 06:30 PM. Please arrive 15 minutes before the Aarti begins."
  },
  {
    keywords: ['history', 'siginificance', 'shrine', 'architecture', 'founder'],
    response: "The BrahamBaba shrine is over 500 years old, established where sage Braham Baba meditated under a sacred Banyan tree. The temple architecture features beautiful pink sandstone hand-carved pillars and a 108-foot central spire."
  },
  {
    keywords: ['donate', 'donation', 'donations', 'money', 'payment'],
    response: "You can make secure online donations through our Portal. Categories include General Donation, Annadanam (Food Fund), Temple Development, and Gau Seva. We accept Credit Cards, Netbanking, UPI, and QR payments. All donations are 80G tax-exempt."
  },
  {
    keywords: ['book', 'booking', 'pooja', 'slots', 'archana', 'abhishekam'],
    response: "Pooja bookings can be reserved directly on our 'Pooja Booking' tab. Choose your preferred date, select a slot for Archana, Abhishekam, or Rudrabhishekam, fill in your Gotra and Nakshatra, and make payment to confirm. Slot capacity is limited."
  },
  {
    keywords: ['volunteer', 'volunteers', 'service', 'join'],
    response: "We always welcome volunteers to join our community seva (cooking food, event management, IT). Register in the 'Volunteer Registration' section, and our temple staff will review and approve your application."
  },
  {
    keywords: ['membership', 'lifetime', 'annual'],
    response: "Our temple offers Regular, Annual, and Lifetime membership tiers. Members receive regular updates, special invites to festival Pujas, and a digital Membership Card."
  },
  {
    keywords: ['contact', 'phone', 'email', 'map', 'location'],
    response: "You can contact the Temple Office at <strong>+91-9876543210</strong> or email <strong>info@brahambaba.org</strong>. Address: Highway 2, Spiritual Valley, Jaipur, Rajasthan."
  }
];

export const processChatQuery = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ status: 'fail', message: 'Message content is required.' });
    }

    const lowerMsg = message.toLowerCase();
    let responseText = "Thank you for reaching out. I'm still learning and couldn't find a precise match. Please feel free to ask about 'timings', 'history', 'pooja booking', or 'donations', or email us at info@brahambaba.org.";

    // Simple keyword matching algorithm
    for (const item of KEYWORD_RESPONSES) {
      const match = item.keywords.some(keyword => lowerMsg.includes(keyword));
      if (match) {
        responseText = item.response;
        break;
      }
    }

    // If Gemini key is present, optionally invoke Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an AI Temple Assistant for BrahamBaba Devotee Trust. Answer the following query gracefully in the context of Hinduism, temple, donations, and social charity: ${message}`
              }]
            }]
          })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          responseText = data.candidates[0].content.parts[0].text;
        }
      } catch (geminiError) {
        logger.error(`Gemini API connection error: ${geminiError.message}. Falling back to keywords.`);
      }
    }

    res.status(200).json({
      status: 'success',
      reply: responseText
    });
  } catch (error) {
    next(error);
  }
};
