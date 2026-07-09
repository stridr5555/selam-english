import type { ReadingLesson, SpeakingLesson, VisualKey } from "../types/learning";

export const visualImages: Record<VisualKey, string> = {
  coffee: "/images/coffee.webp",
  water: "/images/water.webp",
  work: "/images/work.webp",
  home: "/images/home.webp",
  bus: "/images/bus.webp",
  food: "/images/food.webp",
  family: "/images/family.webp",
  market: "/images/market.webp",
  classroom: "/images/classroom.webp",
  health: "/images/health.webp",
  phone: "/images/phone.webp",
  city: "/images/city.webp"
};

export const speakingLessons: SpeakingLesson[] = [
  {
    id: "coffee",
    rank: 1,
    word: "coffee",
    ipa: "/ˈkɔː.fi/",
    amharic: "ቡና",
    transliteration: "buna",
    visual: "coffee",
    phrase: "a cup of coffee",
    shortSentence: "I drink coffee.",
    longSentence: "I drink a cup of coffee every morning.",
    meaningAmharic: "Coffee ማለት ቡና ነው። በቤት፣ በካፌ ወይም በሥራ ቦታ ስለ መጠጥ ስናወራ እንጠቀምበታለን።",
    grammarAmharic: "I drink coffee የሚለው በየቀኑ የሚደጋገም ድርጊትን ያሳያል። I ከሚለው በኋላ drink በመሠረታዊ ቅርጹ ይመጣል።",
    pronunciationTipAmharic: "መጀመሪያውን cof በጥቂት ኃይል ይናገሩ። መጨረሻው fee ረዘም ብሎ ይሰማል።",
    conversationPrompt: "Ask what the learner drinks in the morning. Use coffee, tea, and water. Correct one point at a time.",
    topic: "Morning routine"
  },
  {
    id: "water",
    rank: 2,
    word: "water",
    ipa: "/ˈwɔː.tɚ/",
    amharic: "ውሃ",
    transliteration: "wuha",
    visual: "water",
    phrase: "a glass of water",
    shortSentence: "I need water.",
    longSentence: "Could I have a glass of water, please?",
    meaningAmharic: "Water ማለት ውሃ ነው። ስንጠይቅ a glass of water ማለት እንችላለን።",
    grammarAmharic: "Could I have ... please? በትሕትና ለመጠየቅ የሚጠቅም አገላለጽ ነው።",
    pronunciationTipAmharic: "W ሲባል ከንፈሮቹን ወደ ፊት ያቅርቡ። በአሜሪካ አነጋገር t እንደ ለስላሳ d ሊሰማ ይችላል።",
    conversationPrompt: "Practice asking for water politely in a cafe. Offer cold, warm, or sparkling water.",
    topic: "Polite requests"
  },
  {
    id: "work",
    rank: 3,
    word: "work",
    ipa: "/wɝːk/",
    amharic: "ሥራ",
    transliteration: "sira",
    visual: "work",
    phrase: "go to work",
    shortSentence: "I go to work.",
    longSentence: "I go to work early because the bus gets crowded.",
    meaningAmharic: "Work እንደ ስም ሥራ ማለት ነው፤ እንደ ግስ ደግሞ መሥራት ማለት ነው።",
    grammarAmharic: "Because ምክንያትን ለማስረዳት ይጠቅማል። ሁለት ሐሳቦችን በአንድ ዓረፍተ ነገር ያገናኛል።",
    pronunciationTipAmharic: "Work እና walk እንዳይቀላቀሉ። work ሲባል r ከመጨረሻው k በፊት ይሰማል።",
    conversationPrompt: "Ask about the learner's work or study schedule and help them answer with times and transport.",
    topic: "Work and schedules"
  },
  {
    id: "home",
    rank: 4,
    word: "home",
    ipa: "/hoʊm/",
    amharic: "ቤት",
    transliteration: "bet",
    visual: "home",
    phrase: "go home",
    shortSentence: "I am at home.",
    longSentence: "I usually go home after work and cook dinner.",
    meaningAmharic: "Home የምንኖርበትን ቤት ወይም የቤትነት ስሜትን ይገልጻል።",
    grammarAmharic: "Go home ስንል to አንጨምርም። I go home ይባላል፤ I go to home አይባልም።",
    pronunciationTipAmharic: "o ድምፁን ከኦ ወደ ው ቀስ ብለው ያንሸራትቱ፤ ho-um።",
    conversationPrompt: "Talk about what the learner does after arriving home. Reuse work, water, and coffee.",
    topic: "Home life"
  },
  {
    id: "bus",
    rank: 5,
    word: "bus",
    ipa: "/bʌs/",
    amharic: "አውቶቡስ",
    transliteration: "awtobus",
    visual: "bus",
    phrase: "take the bus",
    shortSentence: "I take the bus.",
    longSentence: "I take the bus to work when the weather is cold.",
    meaningAmharic: "Bus ማለት አውቶቡስ ነው። Take the bus ማለት በአውቶቡስ መሄድ ማለት ነው።",
    grammarAmharic: "በመጓጓዣ ስንሄድ take እንጠቀማለን፤ take the bus, take a taxi።",
    pronunciationTipAmharic: "u ድምፁ አጭር ነው። አፍን ትንሽ ከፍተው በፍጥነት bus ይበሉ።",
    conversationPrompt: "Role-play asking which bus goes downtown and where to get off.",
    topic: "Transport"
  },
  {
    id: "food",
    rank: 6,
    word: "food",
    ipa: "/fuːd/",
    amharic: "ምግብ",
    transliteration: "migib",
    visual: "food",
    phrase: "good food",
    shortSentence: "The food is good.",
    longSentence: "This restaurant serves good food at a fair price.",
    meaningAmharic: "Food ማለት ምግብ ነው። ስለ ጣዕም፣ ዋጋ እና ምርጫ ስናወራ ይጠቅማል።",
    grammarAmharic: "This በአቅራቢያችን ያለን ነጠላ ነገር ያመለክታል። This restaurant, this food።",
    pronunciationTipAmharic: "oo ረዥም የኡ ድምፅ ነው። መጨረሻው d ግልጽ ሆኖ ይሰማ።",
    conversationPrompt: "Practice ordering a meal and describing whether the food is spicy, hot, or good.",
    topic: "Eating out"
  },
  {
    id: "help",
    rank: 7,
    word: "help",
    ipa: "/help/",
    amharic: "እርዳታ",
    transliteration: "erdata",
    visual: "health",
    phrase: "need help",
    shortSentence: "I need help.",
    longSentence: "Excuse me, could you help me find this address?",
    meaningAmharic: "Help ማለት መርዳት ወይም እርዳታ ማለት ነው።",
    grammarAmharic: "Could you help me ...? በትሕትና እርዳታ ለመጠየቅ የሚያገለግል ነው።",
    pronunciationTipAmharic: "h ሲጀምር ትንፋሽ ይውጣ። l እና p ድምፆችን ሳይጥሉ ይጨርሱ።",
    conversationPrompt: "Practice asking for directions and help in a store or clinic.",
    topic: "Getting help"
  },
  {
    id: "family",
    rank: 8,
    word: "family",
    ipa: "/ˈfæm.əl.i/",
    amharic: "ቤተሰብ",
    transliteration: "beteseb",
    visual: "family",
    phrase: "my family",
    shortSentence: "My family is here.",
    longSentence: "My family lives nearby, so we see each other often.",
    meaningAmharic: "Family ማለት ቤተሰብ ነው። ስለ ወላጆች፣ ልጆች እና ዘመዶች ስናወራ እንጠቀምበታለን።",
    grammarAmharic: "My ባለቤትነትን ያሳያል። My family, my home, my work ማለት እንችላለን።",
    pronunciationTipAmharic: "ዋናው ኃይል fam ላይ ነው። መካከለኛው i በፈጣን ንግግር ሊጠፋ ይችላል።",
    conversationPrompt: "Ask simple questions about the learner's family and where relatives live.",
    topic: "People and family"
  }
];

export const readingLessons: ReadingLesson[] = [
  {
    id: "market-morning",
    title: "A Morning at the Market",
    titleAmharic: "ጠዋት በገበያ",
    level: "beginner",
    minutes: 6,
    visual: "market",
    passage: "Mekdes goes to the market on Saturday morning. She buys bread, tomatoes, and coffee. The seller smiles and says, ‘Good morning.’ Mekdes asks, ‘How much is the bread?’ The seller tells her the price, and she pays with cash.",
    amharicSupport: "ይህ ንባብ መቅደስ ቅዳሜ ጠዋት ወደ ገበያ ስለሄደችበት ይናገራል። goes, buys, asks በመደበኛነት የሚፈጸሙ ድርጊቶችን ያሳያሉ።",
    targetWords: [
      { english: "market", amharic: "ገበያ" },
      { english: "seller", amharic: "ሻጭ" },
      { english: "price", amharic: "ዋጋ" },
      { english: "cash", amharic: "ጥሬ ገንዘብ" }
    ],
    questions: [
      { id: "market-when", prompt: "When does Mekdes go to the market?", promptAmharic: "መቅደስ ወደ ገበያ የምትሄደው መቼ ነው?", choices: ["Saturday morning", "Monday evening", "Sunday night"], answer: "Saturday morning", explanationAmharic: "በመጀመሪያው ዓረፍተ ነገር Saturday morning ይላል።" },
      { id: "market-buy", prompt: "What does she buy?", promptAmharic: "ምን ትገዛለች?", choices: ["Bread, tomatoes, and coffee", "Shoes and a phone", "Rice and milk"], answer: "Bread, tomatoes, and coffee", explanationAmharic: "ሁለተኛው ዓረፍተ ነገር የገዛቻቸውን ሦስት ነገሮች ይዘረዝራል።" },
      { id: "market-pay", prompt: "How does she pay?", promptAmharic: "እንዴት ትከፍላለች?", choices: ["With cash", "With a card", "She does not pay"], answer: "With cash", explanationAmharic: "የመጨረሻው ዓረፍተ ነገር pays with cash ይላል።" }
    ]
  },
  {
    id: "bus-to-class",
    title: "The Bus to English Class",
    titleAmharic: "ወደ እንግሊዝኛ ክፍል የሚሄደው አውቶቡስ",
    level: "beginner",
    minutes: 7,
    visual: "bus",
    passage: "Abel takes the bus to English class every evening. The bus is often full, so he stands near the door. During the ride, he listens to new words and repeats them quietly. By the time he arrives, he has reviewed ten words.",
    amharicSupport: "Often ማለት ብዙ ጊዜ ማለት ነው። so የአንድን ምክንያት ውጤት ያሳያል፤ አውቶቡሱ ስለሞላ አቤል ቆሞ ይሄዳል።",
    targetWords: [
      { english: "often", amharic: "ብዙ ጊዜ" },
      { english: "full", amharic: "የሞላ" },
      { english: "quietly", amharic: "በቀስታ" },
      { english: "arrives", amharic: "ይደርሳል" }
    ],
    questions: [
      { id: "bus-when", prompt: "When does Abel go to class?", promptAmharic: "አቤል ወደ ክፍል የሚሄደው መቼ ነው?", choices: ["Every evening", "Every morning", "Only on Sunday"], answer: "Every evening", explanationAmharic: "መጀመሪያው ዓረፍተ ነገር every evening ይላል።" },
      { id: "bus-stand", prompt: "Why does Abel stand?", promptAmharic: "አቤል ለምን ቆሞ ይሄዳል?", choices: ["The bus is full", "He is leaving soon", "He likes the door"], answer: "The bus is full", explanationAmharic: "The bus is often full, so he stands የሚለው ምክንያቱን ያሳያል።" },
      { id: "bus-review", prompt: "How many words does he review?", promptAmharic: "ስንት ቃላትን ይከልሳል?", choices: ["Ten", "Five", "Twenty"], answer: "Ten", explanationAmharic: "የመጨረሻው ዓረፍተ ነገር ten words ይላል።" }
    ]
  },
  {
    id: "clinic-visit",
    title: "A Visit to the Clinic",
    titleAmharic: "ወደ ክሊኒክ ጉብኝት",
    level: "intermediate",
    minutes: 8,
    visual: "health",
    passage: "Sara has felt tired for three days, so she calls a nearby clinic. The receptionist gives her an appointment for two o’clock. Sara arrives early, explains her symptoms, and answers the nurse’s questions. The doctor asks her to rest and drink more water.",
    amharicSupport: "Has felt ቀድሞ የጀመረ እና እስካሁን የቀጠለ ስሜትን ያሳያል። Appointment ከሐኪም ጋር የተያዘ ቀጠሮ ነው።",
    targetWords: [
      { english: "appointment", amharic: "ቀጠሮ" },
      { english: "symptoms", amharic: "ምልክቶች" },
      { english: "nurse", amharic: "ነርስ" },
      { english: "rest", amharic: "ማረፍ" }
    ],
    questions: [
      { id: "clinic-time", prompt: "What time is Sara’s appointment?", promptAmharic: "የሳራ ቀጠሮ ስንት ሰዓት ነው?", choices: ["Two o’clock", "Ten o’clock", "Four o’clock"], answer: "Two o’clock", explanationAmharic: "The receptionist gives her an appointment for two o’clock ይላል።" },
      { id: "clinic-advice", prompt: "What does the doctor ask Sara to do?", promptAmharic: "ሐኪሙ ሳራን ምን እንድታደርግ ጠየቃት?", choices: ["Rest and drink water", "Go to work", "Take the bus"], answer: "Rest and drink water", explanationAmharic: "በመጨረሻው ዓረፍተ ነገር rest and drink more water ይላል።" }
    ]
  },
  {
    id: "new-city",
    title: "Finding a Place in a New City",
    titleAmharic: "በአዲስ ከተማ ቦታ መፈለግ",
    level: "advanced",
    minutes: 9,
    visual: "city",
    passage: "When Dawit moved to a new city, he wrote down the address of his apartment and the nearest bus stop. One afternoon, his phone battery died while he was walking home. He asked a shopkeeper for directions, repeated the instructions to confirm them, and reached his building without getting lost.",
    amharicSupport: "While ሁለት ነገሮች በተመሳሳይ ጊዜ እንደተከሰቱ ያሳያል። Without getting lost ማለት ሳይጠፋ ማለት ነው።",
    targetWords: [
      { english: "nearest", amharic: "በጣም ቅርብ" },
      { english: "directions", amharic: "የመንገድ መመሪያ" },
      { english: "confirm", amharic: "ማረጋገጥ" },
      { english: "reached", amharic: "ደረሰ" }
    ],
    questions: [
      { id: "city-phone", prompt: "Why couldn’t Dawit use his phone?", promptAmharic: "ዳዊት ስልኩን መጠቀም ያልቻለው ለምንድን ነው?", choices: ["The battery died", "He left it at work", "It was raining"], answer: "The battery died", explanationAmharic: "His phone battery died የሚለው መልሱን ይሰጣል።" },
      { id: "city-confirm", prompt: "How did he confirm the directions?", promptAmharic: "የመንገድ መመሪያውን እንዴት አረጋገጠ?", choices: ["He repeated the instructions", "He drew a map", "He called a friend"], answer: "He repeated the instructions", explanationAmharic: "Repeated the instructions to confirm them ብሎ በግልጽ ይናገራል።" }
    ]
  }
];

export function createFallbackLesson(word: string, rank: number): SpeakingLesson {
  return {
    id: `generated-${word}`,
    rank,
    word,
    ipa: "",
    amharic: "ትርጉም በመዘጋጀት ላይ",
    transliteration: "",
    visual: "classroom",
    phrase: word,
    shortSentence: `I use the word ${word}.`,
    longSentence: `I am learning how to use the word ${word} in a conversation.`,
    meaningAmharic: "ይህ ትምህርት ከGemini ጋር ሲገናኝ ሙሉ የአማርኛ ማብራሪያ ያሳያል።",
    grammarAmharic: "ቃሉን በአጭር ዓረፍተ ነገር ውስጥ በመጠቀም ይለማመዱ።",
    pronunciationTipAmharic: "ቃሉን ያዳምጡ፣ በቀስታ ይድገሙት፣ ከዚያም በመደበኛ ፍጥነት ይናገሩ።",
    conversationPrompt: `Practice the word ${word} in a useful everyday conversation.`,
    topic: "Everyday English"
  };
}
