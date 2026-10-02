// Deterministic safety pre-check. Runs before any model call and can never be
// cleared by a model. Patterns are case-insensitive and include common
// misspellings and teen slang. Order of SAFETY_PRIORITY = priority.

export const SAFETY_PRIORITY = [
  "immediate_danger",
  "suicide_self_harm",
  "sextortion_image",
  "adult_contact",
  "abuse_disclosure",
  "harmful_sexual_behavior",
  "eating_disorder",
] as const;

export type SafetyCategory = (typeof SAFETY_PRIORITY)[number];

const PIC = "(?:pics?|pix|photos?|fotos?|pictures?|images?|imgs?|nudes?|videos?|vids?|selfies?)";
const KID = "(?:my|our) (?:kid|child|son|daughter|teen|boy|girl|\\d{1,2}[- ]?(?:year|yr)[- ]?old)";
const THEY = "(?:him|her|them|my (?:kid|child|son|daughter|teen))";
// Sexual propositions sent to a kid (sex, hook up, threesome, "two man", sexting, "do stuff").
const PROPOSITION = "(?:have sex|having sex|sex with|hook ?up|hooking up|(?:a )?threesome|(?:a )?3 ?some|(?:a )?two[- ]?man|(?:a )?2[- ]?man|do stuff|sexting|sext)";
// Verbs that mean someone is directing a proposition AT the kid. Plain
// "wants" is excluded: "she wants to hook up with her boyfriend" is the
// kid's own wish, not someone propositioning her.
const ASK = "(?:ask(?:ed|ing|s)?|text(?:ed|s|ing)?|messag\\w*|dm'?(?:e?d|s)?|snap(?:ped|chatted)?|invit\\w*|beg\\w*|pressur\\w*|sen[dt]s?)";
// An adult or clearly older person named in the text. Bare "man"/"woman" are
// excluded: "a man and a woman have sex" in a show is not adult contact.
const ADULT = "(?:adult|grown (?:man|woman|up)|older (?:man|woman|guy|dude|person|boy|girl)|(?:1[89]|[2-9]\\d) ?[- ]?(?:year[- ]?old|yo|y\\/o|yrs? old))";

export const SAFETY_PATTERNS: Record<SafetyCategory, RegExp[]> = {
  immediate_danger: [
    /\b(?:someone|somebody|a (?:man|woman|guy|stranger)|he|she|they)(?:'s| is| are)? (?:outside|at|in front of) (?:our|the|my) (?:house|home|door|window|school)\b(?:.{0,20}\b(?:now|right now|tonight))?/i,
    /\boutside (?:the|our|my) (?:house|home|door) (?:right )?now\b/i,
    /\b(?:meet|meeting|meetup|meet up|hook ?up|see)\b.{0,40}\b(?:adult|older|grown|man|woman|guy|stranger|someone (?:from|they met) online)\b.{0,40}\b(?:tonight|today|right now|this (?:evening|afternoon))\b/i,
    /\b(?:tonight|today)\b.{0,40}\b(?:meet|meeting|meet up)\b.{0,40}\b(?:adult|older|grown|man|woman|guy|stranger|online)\b/i,
    /\b(?:threat(?:en(?:ed|ing|s)?)?|going to|gonna|wants? to|will)\b.{0,30}\b(?:hurt|kill|shoot|stab|beat up)\b.{0,30}\b(?:someone|somebody|people|him|her|them|classmates?|kids?|teachers?|school)\b/i,
    /\b(?:shoot up|bring a (?:gun|knife|weapon)) (?:the |to )?school\b/i,
    /\b(?:going to|gonna|will|wants to) (?:hurt|kill) (?:himself|herself|themselves|themself)\b.{0,20}\b(?:tonight|today|now)\b/i,
    /\b(?:kidnap(?:ped|ping)?|abduct(?:ed|ion)?|taken by (?:a )?(?:stranger|someone))\b/i,
    /\b(?:missing child|child is missing|kid is missing|(?:son|daughter|kid|child|teen) (?:is|has gone|went) missing|ran away (?:tonight|today)|can'?t find (?:my|our) (?:kid|child|son|daughter))\b/i,
  ],
  suicide_self_harm: [
    /\b(?:wants? to die|want(?:s|ed)? to be dead|wish(?:es|ed)? (?:they|he|she|i) (?:was|were) dead|better off dead)\b/i,
    /\bkill (?:my ?self|him ?self|her ?self|them ?selves|them ?self)\b/i,
    /\bsu+i+c+i+d+e?\w*|\bsuicd\w*|\bsucide\w*|\bsuiside\w*/i,
    /\bkms\b|\bk\.m\.s\b/i,
    /\bun-?aliv(?:e|ing|ed)\b/i,
    /\bcutting (?:him|her|them)?sel(?:f|ves)\b|\bcuts? (?:on|up) (?:his|her|their) (?:arms?|legs?|wrists?|thighs?)\b|\bbeen cutting\b|\bstarted cutting\b|\bis cutting\b/i,
    /\bself[- ]?harm\w*|\bself[- ]?injur\w*|\bsh scars?\b/i,
    /\bover ?dos(?:e|ed|ing)\b|\bod'?d\b|\btook (?:a bunch of|too many|all (?:the|her|his|their)) pills\b/i,
    /\bsuicide note\b|\bgoodbye (?:note|letter|message)\b/i,
    /\b(?:do(?:n'?t|nt)|does(?:n'?t|nt)) want to (?:be here|live|exist|wake up) any ?more\b/i,
    /\bno reason to live\b|\bend (?:it all|(?:his|her|their|my) life)\b/i,
    /\bgiving away (?:his|her|their) (?:things|stuff|belongings)\b/i,
  ],
  sextortion_image: [
    /\bnudes?\b|\bnoods?\b|\bn00ds?\b/i,
    /\bsend (?:me )?(?:pics?|pix|photos?|nudes?|a pic|a photo|something)\b/i,
    new RegExp(`\\b(?:private|intimate|naked|nude|explicit|sexy|spicy|dirty|inappropriate) ${PIC}`, "i"),
    new RegExp(`\\bthreat(?:en(?:ed|ing|s)?)? to (?:post|share|leak|send|release|expose)\\b|\\b(?:post|share|leak|send|expose)\\b.{0,30}\\b${PIC}\\b.{0,30}\\bunless\\b`, "i"),
    /\b(?:pay|send money|gift cards?|venmo|cash ?app)\b.{0,40}\b(?:or (?:i'?ll|they'?ll|he'?ll|she'?ll|we'?ll)|unless)\b.{0,40}\b(?:share|post|leak|send|expose|release)\b/i,
    /\bsext(?:ortion|orted|orting)\b|\bsextort\w*/i,
    // Sexual propositions or requests sent to the kid.
    new RegExp(`\\b${ASK}\\b.{0,60}\\b${PROPOSITION}\\b`, "i"),
    /\b(?:threesome|3some)\b/i,
    /\b(?:do you|wanna|want to) (?:do stuff|hook ?up|have sex)\b/i,
    /\bsexual (?:messages?|texts?|dms?|comments?|questions?|snaps?)\b|\bsext(?:s|ed|ing)?\b/i,
    /\bask\w*\b.{0,40}\b(?:about )?(?:her|his|their|your) (?:body|breasts?|boobs|bra|underwear|private parts|privates)\b|\bif (?:she|he|they) (?:was|were|is|are) (?:a )?virgin\b/i,
    new RegExp(`\\b${PIC}\\b.{0,40}\\b(?:already |got |was |were |been )(?:shared|posted|leaked|sent around|spread|forwarded)\\b`, "i"),
    new RegExp(`\\b(?:keep (?:it|this) (?:a )?secret|don'?t tell (?:anyone|your parents|ur parents))\\b.{0,80}\\b${PIC}\\b|\\b${PIC}\\b.{0,80}\\b(?:keep (?:it|this) (?:a )?secret|don'?t tell (?:anyone|your parents|ur parents))\\b`, "i"),
  ],
  adult_contact: [
    new RegExp(`\\b(?:an? )?(?:adult|grown (?:man|woman|up)|older (?:man|woman|guy|dude|person)|man|woman)\\b.{0,30}\\b(?:messag|text|dm|snap|chat|talk)\\w*\\b.{0,20}\\b${THEY}\\b`, "i"),
    /\bolder (?:guy|dude|man|woman|person|boy|girl|friend|gamer)\b.{0,40}\bonline\b|\bonline\b.{0,40}\bolder (?:guy|dude|man|woman|person|boy|girl|friend|gamer)\b/i,
    /\bgift ?cards?\b.{0,60}\b(?:online|gamer|game|someone|stranger|friend|discord|roblox)\b|\b(?:online|gamer|stranger|someone)\b.{0,60}\bgift ?cards?\b/i,
    /\b(?:move|switch|go|talk) (?:to|on|over to) (?:another|a different|a private|a new) (?:app|platform|chat)\b|\b(?:move|switch) (?:to|over to) (?:snap(?:chat)?|telegram|whatsapp|discord|kik|signal)\b/i,
    /\bsecret (?:online )?friend\b.{0,40}\bolder\b|\bolder\b.{0,40}\bsecret (?:online )?friend\b/i,
    /\b(?:1[89]|[2-9]\d)[- ]?(?:year[- ]?old|yo|y\/o|yrs? old)\b.{0,60}\b(?:messag|text|dm|talk|chat|friend|gamer|sends?|snap)\w*/i,
    /\b(?:messag|text|dm|talk|chat|snap)\w*\b.{0,60}\b(?:1[89]|[2-9]\d)[- ]?(?:year[- ]?old|yo|y\/o|yrs? old)\b/i,
    /\b(?:an? )?adult\b.{0,40}\b(?:privately|in private|in dms?|secret(?:ly)?)\b/i,
    // An adult (18+) the teen met online, e.g. "a 25 y/o she met online".
    /\b(?:1[89]|[2-9]\d) ?[- ]?(?:year[- ]?old|yo|y\/o|yrs? old)\b.{0,40}\bmet (?:online|on (?:discord|snap(?:chat)?|insta(?:gram)?|tiktok|roblox|an app|a game))\b/i,
    // Travelling out of state with an older person.
    /\b(?:another|a different|out of) state\b.{0,60}\b(?:adult|older|grown|(?:1[89]|[2-9]\d) ?[- ]?(?:year[- ]?old|yo|y\/o))|\b(?:adult|older|grown|(?:1[89]|[2-9]\d) ?[- ]?(?:year[- ]?old|yo|y\/o))\b.{0,60}\b(?:another|a different|out of) state\b/i,
    // A relationship with a teacher, coach, or other trusted adult.
    /\b(?:relationship|dating|romantic|hooking up|sexual|inappropriate|secret(?:ly)?|crush)\b.{0,50}\b(?:teacher|coach|tutor|youth pastor|counsell?or|instructor)\b|\b(?:teacher|coach|tutor|youth pastor|counsell?or|instructor)\b.{0,50}\b(?:relationship|dating|romantic|hooking up|sexual)\b/i,
    // Asked to download or move to a hidden, secret, or private chat app.
    /\b(?:download|get|install|use|move|switch|go)\b.{0,40}\b(?:hidden|secret|private|vault|disappearing)\b.{0,15}\b(?:chat(?:ting)?|messag\w*|texting)? ?apps?\b/i,
    // Moving the conversation to another app.
    /\b(?:move|take|switch|continue)\b.{0,20}\b(?:conversations?|chats?|talking)\b.{0,20}\b(?:to|on|over to) (?:another|a different|a private|a new|a hidden|a secret|snap(?:chat)?|telegram|whatsapp|discord|kik|signal)\b/i,
    // Someone online or in a game asking for an address, personal info, or a photo of the kid.
    /\b(?:online|game|gaming|roblox|minecraft|fortnite|discord|snapchat|instagram)\b.{0,80}\b(?:ask|want|pressur|push)\w*\b.{0,40}\b(?:home address|(?:their|his|her|your|my) address|personal (?:info\w*|details|address)|phone number|(?:photo|pic|picture)s? of (?:them|him|her)sel\w*)/i,
    // A much older person gaming, friending, or chatting with the kid.
    /\b(?:much|way|a lot) older\b.{0,60}\b(?:gam\w*|play\w*|friend\w*|messag\w*|chat\w*|talk\w*|facebook|snap\w*|insta\w*|roblox|minecraft|discord)|\b(?:gam\w*|play\w*|friend\w*|facebook|roblox|minecraft|discord)\b.{0,60}\b(?:much|way|a lot) older\b/i,
    // An adult proposing sex or sexual contact to the kid.
    new RegExp(`\\b${ADULT}\\b.{0,60}\\b${PROPOSITION}\\b`, "i"),
    // An adult or older person asking the kid to lie, keep secrets, or sneak out.
    new RegExp(`\\b${ADULT}\\b.{0,60}\\b(?:ask|tell|told|want|pressur|beg|get|got)\\w*\\b.{0,40}\\b(?:lie|lying|keep (?:it|this|things|them|that)? ?(?:a )?secrets?|keep (?:it|this) (?:between|quiet)|sneak (?:out|away|off)|not (?:to )?tell|don'?t tell)\\b`, "i"),
    // Friend requests from adults.
    /\b(?:adult|grown (?:man|woman)|older (?:man|woman|guy))\b.{0,40}\bfriend request|\bfriend request\b.{0,40}\b(?:adult|grown (?:man|woman)|older (?:man|woman|guy))\b/i,
  ],
  abuse_disclosure: [
    new RegExp(`\\b(?:touched|touching|touches) ${THEY}\\b`, "i"),
    /\b(?:touched|touching) (?:his|her|their) (?:private|privates|body|chest|butt|genitals)\b/i,
    /\bmolest\w*|\bmolst\w*/i,
    /\brap(?:ed|ing|e)\b/i,
    /\bsexual(?:ly)? (?:assault\w*|abus\w*)\b|\bassault(?:ed)? (?:him|her|them)\b/i,
    /\b(?:being|been|was|were|is) abused\b|\babus(?:ing|ed) (?:him|her|them)\b/i,
    /\bdid something to (?:him|her|them|my (?:kid|child|son|daughter))\b/i,
    /\binappropriate(?:ly)? touch\w*|\bbad touch\b/i,
  ],
  harmful_sexual_behavior: [
    new RegExp(`\\b${KID}\\b.{0,40}\\b(?:touch|grop|record|film|video|photograph)\\w*\\b.{0,40}\\b(?:someone|somebody|a (?:girl|boy|classmate|kid|student|friend)|another|her|him|them)\\b`, "i"),
    // Pressure, force, or coercion counts only with a sexual term nearby.
    new RegExp(`\\b${KID}\\b.{0,40}\\b(?:pressur|forc|coerc)\\w*\\b.{0,40}\\b(?:someone|somebody|a (?:girl|boy|classmate|kid|student|friend)|another|her|him|them)\\b(?=.{0,60}\\b(?:sex\\w*|nudes?|touch\\w*|kiss\\w*|hook ?up|body|pics?|photos?)\\b)`, "i"),
    /\b(?:my |our )?(?:son|daughter|kid|child|teen)\b.{0,30}\b(?:recorded|filmed|videoed|took (?:a )?(?:video|pic|photo)s? of)\b.{0,40}\b(?:a (?:girl|boy|classmate|kid)|someone|her|him)\b/i,
    new RegExp(`\\b(?:shar|sen|forward|post|spread|leak)\\w*\\b.{0,30}\\b(?:someone(?:'s)?|a (?:girl|boy|classmate)(?:'s)?|her|his|their|another (?:kid|student)(?:'s)?)\\b.{0,20}\\bnudes?\\b`, "i"),
    /\bup-?skirt\w*/i,
    /\blocker ?room\b.{0,30}\b(?:video|pic|photo|record|film)\w*|\b(?:video|record|film)\w*\b.{0,40}\blocker ?room\b/i,
  ],
  eating_disorder: [
    /\b(?:stopped|stop|not|isn'?t|hasn'?t been|barely|refus(?:es|ing|ed) to) eat(?:ing)?\b/i,
    /\bpurg(?:e|ing|ed)\b|\bthrow(?:ing|s)? up after (?:meals?|eating|dinner|lunch|food)\b|\bmaking (?:him|her|them)sel(?:f|ves) (?:throw up|sick|puke)\b/i,
    /\bpro-?ana\b|\bpro-?mia\b|\bthinspo\w*|\bmeanspo\b|\bbonespo\b|\bskinnytok\b/i,
    /\b(?:under|below|less than|only) \d{2,4} ?(?:cal(?:orie)?s?|kcal)\b|\b\d{2,4} (?:calories|cals) a day\b/i,
    /\b(?:dangerous|extreme|rapid|scary|drastic) weight ?loss\b|\blost \d{2,3} ?(?:lbs?|pounds|kg)\b/i,
    /\blaxatives?\b|\bdiet pills?\b|\bstarv(?:e|ing|ed) (?:him|her|them)sel(?:f|ves)\b/i,
  ],
};

// A child discussing a public account of harm is not, by itself, a disclosure
// that the harm happened to that child. Keep this exception narrow: a named
// news/court case or anonymous person's story being discussed, and no signal
// that the child or someone close to them was harmed or contacted.
function isPublicThirdPartyDiscussion(text: string): boolean {
  const discussing = /\b(?:my|our) (?:kid|child|son|daughter|teen)\b.{0,100}\b(?:talk(?:s|ed|ing)?|ask(?:s|ed|ing)?|read(?:s|ing)?|watch(?:es|ed|ing)?|heard|saw|discuss(?:es|ed|ing)?|mention(?:s|ed|ing)?)\b|\b(?:talk(?:s|ed|ing)?|ask(?:s|ed|ing)?|read(?:s|ing)?|watch(?:es|ed|ing)?|heard|saw|discuss(?:es|ed|ing)?)\b.{0,100}\b(?:my|our) (?:kid|child|son|daughter|teen)\b/i.test(text);
  const publicAccount = /\b(?:news|article|documentary|podcast|headline|court case|trial|public case|cornell case|jane doe|anonymous (?:person|woman|girl|victim|student)|someone else'?s (?:story|case|assault))\b/i.test(text);
  const personalDisclosure = /\b(?:my|our) (?:kid|child|son|daughter|teen)\b.{0,75}\b(?:was|is|has been|got|said|told me|disclosed|experienced)\b.{0,45}\b(?:raped|assaulted|abused|molested|touched|victim)|\b(?:raped|assaulted|abused|molested|touched)\b.{0,45}\b(?:my|our) (?:kid|child|son|daughter|teen)\b|\b(?:their|his|her) (?:friend|classmate)\b.{0,45}\b(?:was|is|got)\b.{0,20}\b(?:raped|assaulted|abused|molested)|\b(?:this happened to|happened to|did this to|same thing happened to)\b.{0,30}\b(?:my|our) (?:kid|child|son|daughter|teen)|\b(?:same thing|this|it|that) happened to (?:him|her|them|my (?:kid|child|son|daughter|teen))\b|\b(?:told me|said|disclosed)\b.{0,50}\b(?:happened to (?:him|her|them)|same thing happened)\b/i.test(text);
  const laterDisclosure = /\b(?:then|but|and)\b.{0,40}\b(?:told me|said|shared|disclosed)\b.{0,30}\b(?:the )?(?:same thing|it|this|that) happened to (?:her|him|them)\b/i.test(text);
  return discussing && publicAccount && !personalDisclosure && !laterDisclosure;
}

export function preCheck(text: string, dangerNow?: unknown): SafetyCategory | null {
  const hits: SafetyCategory[] = [];
  if (typeof dangerNow === "string" && dangerNow.toLowerCase() === "yes") hits.push("immediate_danger");
  if (/\b(?:anonymous|jane doe|news|court case|article)\b/i.test(text) && /\b(?:then|but|and)\b.{0,40}\b(?:told me|said|shared|disclosed)\b.{0,30}\b(?:the )?(?:same thing|it|this|that) happened to (?:her|him|them)\b/i.test(text)) hits.push("abuse_disclosure");
  for (const cat of SAFETY_PRIORITY) {
    if (cat === "abuse_disclosure" && isPublicThirdPartyDiscussion(text)) continue;
    if (SAFETY_PATTERNS[cat].some((p) => p.test(text))) hits.push(cat);
  }
  return highest(hits);
}

export function highest(cats: (string | null | undefined)[]): SafetyCategory | null {
  for (const cat of SAFETY_PRIORITY) if (cats.includes(cat)) return cat;
  return null;
}
