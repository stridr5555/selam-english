const pronunciationByWord: Record<string, string> = {
  a: "አ", address: "አድረስ", after: "አፍተር", again: "አጌን", am: "አም", an: "አን", are: "አር",
  and: "አንድ", answer: "አንሰር", at: "አት", because: "ቢኮዝ", bus: "ባስ", can: "ካን",
  cold: "ኮልድ", coffee: "ኮፊ", conversation: "ኮንቨርሴሽን", cook: "ኩክ", correct: "ከሬክት",
  could: "ኩድ", crowded: "ክራውድድ", cup: "ካፕ", dinner: "ዲነር",
  do: "ዱ", drink: "ድሪንክ", each: "ኢች", early: "ኧርሊ", english: "ኢንግሊሽ", every: "ኤቭሪ",
  excuse: "ኤክስኪውዝ", family: "ፋሚሊ", find: "ፋይንድ", food: "ፉድ", glass: "ግላስ", go: "ጎ",
  fair: "ፌር", gets: "ጌትስ", good: "ጉድ", great: "ግሬይት", groceries: "ግሮሰሪዝ",
  have: "ሃቭ", help: "ሄልፕ", here: "ሂር", home: "ሆም", how: "ሃው",
  i: "አይ", is: "ኢዝ", it: "ኢት", like: "ላይክ", listen: "ሊስን", lives: "ሊቭዝ", may: "ሜይ",
  in: "ኢን", learning: "ለርኒንግ", me: "ሚ", more: "ሞር", morning: "ሞርኒንግ", my: "ማይ",
  nearby: "ኒርባይ", need: "ኒድ", no: "ኖ", now: "ናው", one: "ዋን",
  of: "ኦቭ", often: "ኦፍን", or: "ኦር", other: "አዘር", please: "ፕሊዝ", practice: "ፕራክቲስ",
  price: "ፕራይስ", ready: "ሬዲ", repeat: "ሪፒት", restaurant: "ሬስቶራንት", say: "ሴይ", see: "ሲ",
  serves: "ሰርቭዝ", so: "ሶ", sparkling: "ስፓርክሊንግ", still: "ስቲል", take: "ቴይክ",
  slowly: "ስሎውሊ", thank: "ታንክ", thanks: "ታንክስ", the: "ዘ", this: "ዚስ", time: "ታይም",
  to: "ቱ", try: "ትራይ", use: "ዩዝ", usually: "ዩዥዋሊ", very: "ቬሪ", want: "ዋንት",
  warm: "ዎርም", water: "ዋተር", we: "ዊ", weather: "ዌዘር",
  welcome: "ዌልከም", what: "ዋት", when: "ዌን", with: "ዊዝ", work: "ወርክ", would: "ዉድ",
  word: "ወርድ", yes: "የስ", you: "ዩ", your: "ዮር"
};

const fallbackPatterns: Array<[RegExp, string]> = [
  [/tion/g, "ሽን"], [/sh/g, "ሽ"], [/ch/g, "ች"], [/th/g, "ዝ"], [/ph/g, "ፍ"],
  [/ee/g, "ኢ"], [/oo/g, "ኡ"], [/ou|ow/g, "አው"], [/ai|ay/g, "ኤይ"]
];

const fallbackLetters: Record<string, string> = {
  a: "አ", b: "ብ", c: "ክ", d: "ድ", e: "ኤ", f: "ፍ", g: "ግ", h: "ህ", i: "ኢ",
  j: "ጅ", k: "ክ", l: "ል", m: "ም", n: "ን", o: "ኦ", p: "ፕ", q: "ክ", r: "ር",
  s: "ስ", t: "ት", u: "ኡ", v: "ቭ", w: "ው", x: "ክስ", y: "ይ", z: "ዝ"
};

export function englishToAmharicPronunciation(text: string) {
  const englishWords = text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) ?? [];
  return englishWords.map(pronounceWord).join(" ");
}

function pronounceWord(word: string) {
  const normalized = word.toLowerCase().replace(/[’']/g, "");
  const known = pronunciationByWord[normalized];
  if (known) return known;

  let remaining = normalized;
  for (const [pattern, replacement] of fallbackPatterns) {
    remaining = remaining.replace(pattern, ` ${replacement} `);
  }
  return remaining
    .split("")
    .map((letter) => fallbackLetters[letter] ?? letter)
    .join("")
    .replace(/\s+/g, "") || word;
}
