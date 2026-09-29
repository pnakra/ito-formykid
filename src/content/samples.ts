// Fixed sample results. First drafts came from one run of the live check
// (safety pre-check included) on 2026-09-29. Edit freely; nothing here calls the AI.
import type { ReportV2Data } from "@/components/ReportV2";
import type { SafetyCategory } from "@/content/safetyCopy";

export interface Sample {
  id: string;
  scenario: string;
  result: ReportV2Data & { result_type: "report_v2"; safety_category: SafetyCategory | null };
}

export const SAMPLES: Sample[] = [
  {
    "id": "joke",
    "scenario": "My 14-year-old repeated a demeaning joke about girls and said everyone says it.",
    "result": {
      "result_type": "report_v2",
      "input_type": "description",
      "in_scope": "core",
      "escalation_category": "none",
      "recognized": "described_event",
      "short_answer": "A demeaning joke about girls is worth addressing calmly, even if it is common among friends. Your child may be repeating it to fit in or without thinking about its effect, rather than expressing a settled belief. “Everyone says it” does not make it harmless, but this is an opportunity to talk, not a reason to label your child.",
      "how_sure": "fairly sure",
      "how_sure_reason": "The description supports addressing the put-down, though the exact joke, audience, and whether this is a pattern are unknown.",
      "does_not_tell_us": "One repeated joke does not tell us what your child believes about girls or how they treat people in relationships. It also does not tell us whether anyone was directly targeted.",
      "lenses": [
        {
          "key": "harming_others",
          "why": "Could repeating the joke put down girls who hear it or encourage others to join in?"
        },
        {
          "key": "harming_self",
          "why": "Could repeated group approval make disrespect seem normal or make it harder for your child to question it?"
        }
      ],
      "would_change_picture": {
        "more_concerning": [
          "A specific girl was targeted or publicly embarrassed",
          "Repeating it after someone asked them to stop",
          "A wider pattern of contempt toward girls"
        ],
        "less_concerning": [
          "A one-off repetition without considering its meaning",
          "Willingness to listen and stop repeating it",
          "Recognizing its effect and making amends if needed"
        ]
      },
      "next_step": {
        "action": "Have a brief, private conversation about what the joke meant and who it could affect, then set a clear limit on demeaning jokes.",
        "why": "This lets you understand the social context while making clear that popularity does not excuse putting people down."
      },
      "conversation": {
        "opener": "“I heard that joke about girls. I want to understand what seemed funny about it, and talk about why it puts people down.”",
        "questions": [
          "What do you think the joke is saying about girls?",
          "What happens in your group when someone doesn't laugh or disagrees?",
          "How might it land with someone who hears it?"
        ],
        "boundary_statement": "“You can joke around, but putting girls down isn't okay, even when other people do it.”",
        "repair_step": "If someone was targeted or hurt, help your child stop repeating or sharing it and offer a brief apology without saying “it was just a joke” or expecting forgiveness."
      },
      "why_it_matters": "Learning to question group approval and respond to disrespect helps young people practice respectful relationships and safer bystander choices.",
      "source_ids": [
        "cdc_stop_sv"
      ],
      "safety_category": null
    }
  },
  {
    "id": "screenshot",
    "scenario": "My 15-year-old forwarded a humiliating screenshot of a classmate and said everyone else did too.",
    "result": {
          "result_type": "report_v2",
          "input_type": "description",
          "in_scope": "core",
          "escalation_category": "none",
          "recognized": "described_event",
          "short_answer": "Forwarding a humiliating screenshot can widen the harm, even when lots of other people are doing it. Your child may have been joining in without thinking through the impact, but that does not remove their responsibility. This calls for a calm conversation about stopping the spread and making things right, rather than labeling your child.",
          "how_sure": "fairly sure",
          "how_sure_reason": "The forwarding is clear, but the screenshot's content, context, and impact are not.",
          "does_not_tell_us": "This one action does not tell us your child's intent or usual treatment of others. Saying everyone else did it could reflect peer pressure, an attempt to minimize responsibility, or both.",
          "lenses": [
                {
                      "key": "harming_others",
                      "why": "Could your child's forwarding have exposed the classmate to more ridicule, even if your child did not create the screenshot?"
                }
          ],
          "would_change_picture": {
                "more_concerning": [
                      "Repeated sharing or coordinated targeting",
                      "Threats or pressure to join in",
                      "Nude, sexual, or intimate content"
                ],
                "less_concerning": [
                      "Stopping sharing and asking others not to pass it on",
                      "Recognizing the impact without blaming the classmate",
                      "Willingness to make a private, respectful repair"
                ]
          },
          "next_step": {
                "action": "Have a private conversation today to agree on stopping further sharing, removing the forwarded post where possible, and asking recipients not to pass it on.",
                "why": "This limits further exposure while giving your child a concrete way to take responsibility."
          },
          "conversation": {
                "opener": "I want to understand what happened, not label you. Forwarding something humiliating can hurt someone even when other people are doing it too.",
                "questions": [
                      "What was happening in the chat when you decided to forward it?",
                      "How do you think the classmate might experience people passing it around?",
                      "What could you do now to stop it spreading and make things right without drawing more attention to them?"
                ],
                "boundary_statement": "We do not pass along someone else's humiliation. Other people doing it does not make it okay.",
                "repair_step": "Consider a brief private apology that owns the forwarding without excuses or asking for forgiveness. Avoid a public apology that repeats the content or puts the classmate on the spot, and respect their wish for no contact.",
                "disclosure_response": "Thank you for telling me. If someone pressured or threatened you to share it, I take that seriously, and we can work on that while also stopping the harm."
          },
          "why_it_matters": "Every additional share can extend the audience and make it harder for the classmate to move on. Taking responsibility means limiting the spread, not just explaining why it happened.",
          "source_ids": [],
          "safety_category": null
    }
  },
  {
    "id": "image",
    "scenario": "My 16-year-old says someone online wants a private picture and told them to keep it secret.",
    "result": {
      "result_type": "report_v2",
      "input_type": "description",
      "in_scope": "core",
      "escalation_category": "none",
      "recognized": "described_event",
      "short_answer": "Asking for a private picture and insisting on secrecy is a warning sign of pressure, especially if the picture is intimate. We do not yet know what kind of picture they mean or who is asking. Thank your teen for telling you and help them pause contact without sending anything further.",
      "how_sure": "fairly sure",
      "how_sure_reason": "The secrecy request is a concrete concern, although the picture's content and the other person's identity are unknown.",
      "does_not_tell_us": "This does not tell us whether your teen has sent a picture, whether the person is an adult, or whether threats are involved. It does not mean your teen has done anything wrong.",
      "lenses": [
        {
          "key": "being_harmed",
          "why": "Someone may be using secrecy to put pressure on your teen and limit their access to support."
        }
      ],
      "would_change_picture": {
        "more_concerning": [
          "Requests for nude or sexual pictures",
          "Threats to share pictures or demands for money",
          "An adult requester or pressure to meet",
          "Repeated requests after a refusal"
        ],
        "less_concerning": [
          "A clearly non-intimate picture with an ordinary explanation",
          "No threats or repeated pressure",
          "The person accepts a refusal and does not insist on secrecy"
        ]
      },
      "next_step": {
        "action": "Have a calm conversation now to clarify what picture was requested, whether anything was sent, and whether there are threats, while agreeing to pause contact and send nothing further.",
        "why": "This helps you choose the right protection without blame or assuming facts you do not yet know."
      },
      "conversation": {
        "opener": "I'm glad you told me. You're not in trouble, and we can figure this out together.",
        "questions": [
          "What kind of picture are they asking for, and what have they said about keeping it secret?",
          "What do you know about this person and how you first connected?",
          "What has happened so far, including anything sent or anything they said would happen if you refused?"
        ],
        "boundary_statement": "You do not owe anyone a picture, even if you like them or have sent one before. Let's not send anything more while we work this out.",
        "disclosure_response": "Thank you for telling me. I believe you. Even if you already sent something, pressure or threats are not your fault, and I will help you."
      },
      "why_it_matters": "Recognizing pressure and practicing boundaries can help young people protect their privacy and make choices freely in relationships.",
      "source_ids": [
        "cdc_stop_sv"
      ],
      "safety_category": "sextortion_image"
    }
  }
] as unknown as Sample[];

export function getSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id);
}
