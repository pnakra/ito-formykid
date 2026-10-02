// Weekly dinner-table questions. First drafts for review.
// The current question is picked by ISO week number.

export type AgeBand = "10-12" | "13-15" | "16-18";
export type DinnerPrompt = { question: string; why: string; if_they_open_up: string };

export const AGE_BANDS: AgeBand[] = ["10-12", "13-15", "16-18"];

export const DINNER_PROMPTS: Record<AgeBand, DinnerPrompt[]> = {
  "10-12": [
    { question: "What did someone do this week that was kind?", why: "Small acts make kindness easy to spot.", if_they_open_up: "How did it make that person feel?" },
    { question: "What makes a friend fun to play with?", why: "It helps them name what a good friendship feels like.", if_they_open_up: "What do you do when you disagree?" },
    { question: "What's your favorite thing to do in a game right now?", why: "Showing interest makes it easier to talk about games together.", if_they_open_up: "Could you show me sometime?" },
    { question: "If a group chat starts being mean to someone, what could you do?", why: "It gives them a simple plan for unkind moments.", if_they_open_up: "Who could help you if it feels hard to speak up?" },
    { question: "Which app makes you laugh the most?", why: "A light question opens a door into their online world.", if_they_open_up: "What do you like seeing there?" },
    { question: "How can you tell when a friend wants some space?", why: "It builds care for other people's boundaries.", if_they_open_up: "How would you want a friend to tell you?" },
    { question: "If someone online asked you to keep a secret from me, what would you do?", why: "It makes asking a trusted adult feel normal.", if_they_open_up: "Who else could you tell if I wasn't nearby?" },
    { question: "What's something you can say when you don't want a hug or a touch?", why: "It reminds them they can set limits for their body.", if_they_open_up: "What could I do to help if someone didn't listen?" },
    { question: "Has someone ever helped you feel included in a game?", why: "It makes room to talk about belonging and fairness.", if_they_open_up: "What did they do?" },
    { question: "If you saw something online that felt weird, who could you tell?", why: "It helps them think of trusted people before they need one.", if_they_open_up: "Would you feel okay telling me, even if you clicked it by mistake?" },
    { question: "What can you do if a friend shares a picture you don't want shared?", why: "It opens a simple talk about privacy and asking first.", if_they_open_up: "What would you want your friend to do next?" },
    { question: "Who can you go to if someone won't stop bothering you at school or online?", why: "It helps them name the adults who will listen.", if_they_open_up: "What would make telling them easier?" },
  ],
  "13-15": [
    { question: "Who at school do you think treats people really well?", why: "It starts with respect without making it about them.", if_they_open_up: "What do they do that makes people feel that way?" },
    { question: "What's something a friend could ask you to do that you'd say no to?", why: "Saying it out loud makes a no easier later.", if_they_open_up: "How would you say no and still stay friends?" },
    { question: "Is there anything everyone seems to be doing lately that you don't really get?", why: "It opens the door to pressure without naming any.", if_they_open_up: "Do you ever feel like you have to go along with it?" },
    { question: "What's the funniest thing that happened in a group chat this week?", why: "Starting light makes harder chats feel normal.", if_they_open_up: "Does that chat ever get mean, or is it mostly fun?" },
    { question: "Which app would you keep if you could only have one?", why: "It shows you care about their online life, not just the risks.", if_they_open_up: "What do you like most about being on it?" },
    { question: "What makes someone a good friend to have when things get hard?", why: "It helps them name what support looks like.", if_they_open_up: "Do you have someone like that right now?" },
    { question: "If someone made you uncomfortable online, who would you tell?", why: "Knowing their plan matters more than giving a rule.", if_they_open_up: "What would make it easier to tell me?" },
    { question: "Have you seen anyone get left out on purpose lately?", why: "Kids often notice unkindness before adults do.", if_they_open_up: "What do you think would have helped?" },
    { question: "What's something you wish adults understood about being your age?", why: "It tells them their view matters to you.", if_they_open_up: "What would you want me to do differently?" },
    { question: "Is there a video or creator everyone's talking about right now?", why: "Their world gets easier to talk about when you ask first.", if_they_open_up: "What do you think of what they say?" },
    { question: "What's a way someone could show they like you that would feel okay?", why: "It builds a picture of healthy interest early.", if_they_open_up: "And what would feel like too much?" },
    { question: "If a friend told you a secret that worried you, what would you do?", why: "It gives them room to think before it happens.", if_they_open_up: "Would you want to talk it through with me first?" },
  ],
  "16-18": [
    { question: "Who do you know that's really good at disagreeing without being a jerk?", why: "Respect is easier to talk about through someone they admire.", if_they_open_up: "What do you think makes them good at it?" },
    { question: "How do you usually tell someone you're not into something?", why: "It treats them as someone who already has boundaries.", if_they_open_up: "Has that ever been hard to do?" },
    { question: "What's something people your age feel pushed to do that they don't talk about?", why: "Talking about others feels safer than talking about yourself.", if_they_open_up: "Have you ever felt that push yourself?" },
    { question: "Which of your group chats would you actually miss?", why: "It shows interest in their friendships, not their phone.", if_they_open_up: "What makes that one different from the others?" },
    { question: "What's something online that changed how you think about something?", why: "It invites them to reflect instead of defend.", if_they_open_up: "Did you agree with it, or did it bug you?" },
    { question: "How can you tell when a friend is having a rough time?", why: "It builds care for others and a plan to help.", if_they_open_up: "What do you usually do when you notice?" },
    { question: "What does a good relationship look like to you?", why: "Their own words tell you more than any lecture.", if_they_open_up: "Have you seen one up close that you liked?" },
    { question: "Is there anything you've seen online lately that felt off to you?", why: "It shows you trust their instincts.", if_they_open_up: "What made it feel that way?" },
    { question: "If someone crossed a line with you, what would you want from me?", why: "Asking now makes it easier for them to come to you later.", if_they_open_up: "Is there anything I could do that would make it worse?" },
    { question: "Who do you trust most for advice, online or off?", why: "It shows you who is shaping their thinking.", if_they_open_up: "What's the best advice they've given you?" },
    { question: "What do you think people get wrong about your generation?", why: "It lets them push back and be heard.", if_they_open_up: "What would you want them to know instead?" },
    { question: "If a friend was in a situation that scared you, how would you help?", why: "It gives them a plan without making it about them.", if_they_open_up: "Would you feel okay bringing an adult in?" },
  ],
};

/** ISO 8601 week number and week-year for a date. */
export function isoWeek(date = new Date()): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export function weekKey(date = new Date()): string {
  const { year, week } = isoWeek(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function promptForWeek(band: AgeBand, date = new Date()): DinnerPrompt {
  const list = DINNER_PROMPTS[band];
  return list[isoWeek(date).week % list.length];
}
