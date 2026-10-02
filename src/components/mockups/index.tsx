function Frame({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-[390px] overflow-hidden rounded-3xl border border-border/80 bg-background p-4 text-left font-body text-foreground">
    <p className="label-text mb-4 text-hint">Example. Not live yet.</p>{children}
  </div>;
}
function Heading({ children }: { children: React.ReactNode }) { return <h3 className="font-display text-[21px] font-medium leading-snug text-foreground">{children}</h3>; }
function Box({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl border border-border/80 bg-card p-4">{children}</div>; }
function Label({ children }: { children: React.ReactNode }) { return <p className="label-text text-primary">{children}</p>; }

export function DigestMockup() {
  const items = [
    { title: "A joke in the group chat", why: "A joke can leave someone out.", say: "How did the others take it?" },
    { title: "A friend feels left out", why: "Being left out can hurt.", say: "What could a friend do?" },
    { title: "Pressure to reply fast", why: "Kids need room to pause.", say: "Do you feel rushed to reply?" },
  ];
  return <Frame><div className="space-y-4"><Label>MONTHLY EMAIL · EXAMPLE</Label><Heading>This month for parents of 13 to 14 year olds</Heading>
    {items.map((item) => <Box key={item.title}><p className="font-display text-[18px] font-medium">{item.title}</p><div className="mt-3 space-y-2 text-[15px] leading-snug"><p><span className="text-hint">What it is · </span>{item.title.toLowerCase()}.</p><p><span className="text-hint">Why it matters · </span>{item.why}</p><p><span className="text-hint">What to say · </span>“{item.say}”</p></div></Box>)}
  </div></Frame>;
}
export function DinnerPromptMockup() {
  return <Frame><div className="space-y-5"><Label>WEEKLY PROMPT · EXAMPLE</Label><Box><p className="text-[14px] text-hint">is this ok for my kid? · now</p><p className="mt-2 text-[16px]">A question for tonight: What does respect look like in a group chat?</p></Box>
    <Box><Label>THIS WEEK'S QUESTION</Label><Heading>What does respect look like in a group chat?</Heading><div className="mt-5 border-t border-border/80 pt-4"><p className="text-[16px] font-medium">How did it go?</p><div className="mt-3 flex flex-wrap gap-2">{["We talked", "Not yet", "Try another time"].map(x => <span key={x} className="rounded-full border border-border px-3 py-1.5 text-[13px]">{x}</span>)}</div></div></Box>
  </div></Frame>;
}
export function MomentCalendarMockup() {
  return <Frame><div className="space-y-5"><Label>COMING UP · EXAMPLE</Label><Box><Heading>Your kid turns 16 next month</Heading><p className="mt-3 text-[15px] text-muted-foreground">As they get more freedom, talk about:</p><ul className="mt-4 space-y-3 text-[16px]">{["How they want to be treated in a relationship", "What to do if someone shares a private photo", "Who they can call, any time, no questions asked"].map((x, i) => <li key={x} className="flex gap-3"><span className="text-primary">0{i + 1}</span>{x}</li>)}</ul><span className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-[14px] font-medium text-primary-foreground">Remind me</span></Box>
  </div></Frame>;
}
export function GroupChatMockup() {
  const lines = [
    ["Sam", "Are we still meeting after school?"], ["Riley", "Yep, by the gate."],
    ["Ari", "Did you hear what happened in class?"], ["Noah", "Milo's answer was so bad. He should teach the class how to fail."],
    ["Milo", "..."],
  ];
  return <Frame><div className="space-y-4"><Label>GROUP CHAT · EXAMPLE</Label><Heading>Friends</Heading><Box><div className="space-y-3">{lines.map(([who, line]) => <div key={who} className="text-[15px] leading-snug"><span className="font-medium text-primary">{who} </span><span>{line}</span></div>)}</div></Box><p className="text-[16px] font-medium">What would you want your kid to do next?</p><div className="space-y-2">{["Join in", "Say it's not funny", "Check in with Milo"].map(x => <div key={x} className="rounded-full border border-border bg-card px-4 py-2 text-[14px]">{x}</div>)}</div></div></Frame>;
}

export const MOCKUPS = [
  { id: "digest", label: "Monthly digest", Component: DigestMockup },
  { id: "dinner_prompt", label: "Dinner-table prompt", Component: DinnerPromptMockup },
  { id: "moment_calendar", label: "Moment calendar", Component: MomentCalendarMockup },
  { id: "group_chat", label: "Group-chat practice", Component: GroupChatMockup },
] as const;