# Evaluation and usability study

This is a protocol, not a results report. Do not fill in conclusions, scores, or participant quotes until the study has actually been run. The purpose is to compare the quality of a structured council brief with a strong single-model answer—not to claim that either system can predict an outcome.

## Scope: Founder Runway first

The controlled protocol below evaluates **Founder Runway**, the app’s fully guided hero track. It is intentionally not presented as evidence that Career Move, Relocation, or Open Decision support is equally effective. Those tracks need their own cases, participant recruitment, and criteria before any cross-domain claim is made.

## Research question

When given the same founder decision packet, does an Asembi Founder Decision Brief make cash constraints, customer evidence, uncertainty, and a reversible next step more explicit than one careful GPT-5.6 answer?

The outcome is **decision-support quality**, not business success, factual accuracy beyond the supplied packet, or clinical/financial advice quality.

## Controlled single-model baseline

Use GPT-5.6 for both conditions. Do not enable web search, file search, external tools, or hidden research in either condition.

### Baseline prompt

Use a fresh chat completion for each run with this system prompt:

> You are an experienced founder decision coach. Work only from the decision packet below. Do not invent market, legal, tax, investment, or visa facts. Separate known facts, assumptions, and unknowns; give a concise recommendation; name the smallest reversible customer-proof step; and state a measurable cash or time stop-loss. Avoid heroic all-or-nothing framing.

Use this user message format:

```text
Founder decision packet

Decision: [decision]
Personal cash runway: [value]
Monthly personal burn: [value]
Committed monthly revenue: [value]
Expected days to a paid pilot: [value]
Financial responsibilities: [value]
Customer evidence today: [value]
30-day proof-of-demand target: [value]
Decision check-in: [value]
Clarification supplied after first reflection: [value]
```

For the Asembi condition, enter the same values in the app and include the same clarification during its assumption-correction checkpoint. This avoids giving the council information that the single-model condition never receives.

### Run settings and recordkeeping

- Record the exact model name, date, API parameters, app commit SHA, and whether the response completed without retry.
- Use the same maximum output budget for the baseline across all cases. Record the actual token use and latency if available; do not infer them from wall-clock time.
- Run each of the five cases three times in each condition using fresh requests: 30 outputs total.
- Randomize the order of case and condition. Save raw output separately from scoring sheets and replace names with neutral IDs such as `C2-AI-03` and `C2-BL-03`.
- Do not use Demo Mode for the comparison. Its fixed copy is useful for demos, not evaluation.

## Five fictional test cases

These cases are synthetic. They are not investment, employment, or legal advice and should not be described as founder outcomes.

| ID | Decision packet | Clarification for both conditions |
| --- | --- | --- |
| C1: Unsigned lead | A B2B founder has $36,000 in personal cash, $5,000 monthly burn, and a $9,000/month job. One operations leader says they would "probably try" the product, but there is no budget owner, timeline, contract, or payment. The founder asks whether to quit now. Their 30-day target is one paid pilot. | The prospect will take a discovery call next week, but has not agreed to a pilot price or introduced procurement. |
| C2: Nights and weekends | A founder has $48,000 in personal cash, $4,800 monthly burn, a stable job, 15 user interviews, a clickable prototype, and no revenue. They believe quitting would make them ship in six weeks. They ask whether speed justifies resigning. | The prototype users have not committed to paying, and the employer permits outside projects that do not compete. |
| C3: Signed customer, thin buffer | A founder has $14,000 in personal cash, $3,200 monthly burn, and one signed $1,000/month customer. They believe the customer will expand quickly and ask whether the signed revenue is enough to quit. Their paid-pilot sales cycle is 45 days. | The customer can cancel with 30 days’ notice and no second buyer has agreed to a meeting. |
| C4: Pilot before product | A founder has $42,000 in personal cash, $4,000 monthly burn, and three prospects who like the concept. The product is not built. They ask whether they should quit to build a polished self-serve version for 12 weeks or keep income while selling a scoped paid pilot within 30 days. | Two prospects will join a paid-pilot call; the third has no budget until next quarter. |
| C5: Pilot timing exceeds runway | A founder has $9,000 in personal cash, $3,800 monthly burn, debt payments, and an interested enterprise buyer whose stated procurement cycle is 120 days. They ask whether to quit now because the opportunity feels time-sensitive. | The buyer will not sign a letter of intent or introduce a budget owner before a discovery workshop. |

## Blind scoring rubric

Have two reviewers who did not generate the outputs score them independently. Hide condition labels and randomize the presentation order. Each criterion receives 0, 1, or 2 points; maximum score is 12.

| Criterion | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Cash and personal downside | Ignores runway, burn, or personal responsibilities | Mentions them without connecting them to the recommendation | Uses them to bound a specific recommendation or stop-loss |
| Customer evidence | Treats interest and revenue as interchangeable | Notes uncertainty but leaves evidence vague | Clearly distinguishes confirmed evidence, assumptions, and missing proof |
| Options and trade-offs | Gives a single, overconfident answer | Names alternatives with limited comparison | Compares credible paths and explains the material trade-off of each |
| Testable next step | Gives generic advice such as "validate" | Suggests an action but without a measurable result | Defines a bounded customer-proof experiment with success signal, owner, and deadline |
| Stop-loss and check-in | Has no boundary for reversing course | Includes a vague date or risk warning | States a measurable cash/time boundary and a review point |
| Uncertainty and safety | Invents facts or presents certainty as truth | Includes a generic caveat | States what cannot be known from the packet and avoids unsupported professional advice |

Use a short notes field to record failure modes, such as invented facts, hidden assumptions, contradictory advice, or unusably vague language. Do not change scores after reviewers compare notes; instead, record agreement and resolve differences through a pre-specified adjudication pass.

### Empty scoring sheet

| Output ID | Case | Condition | Reviewer 1 / 12 | Reviewer 2 / 12 | Adjudicated / 12 | Key failure mode or strength |
| --- | --- | --- | ---: | ---: | ---: | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

## Reporting rules

Report the mean and median score by condition, the per-case paired difference, the range of reviewer disagreement, and a short failure-mode table. With five synthetic cases, describe the result as exploratory; do not claim statistical proof or general superiority.

State these limitations beside any results:

- Both conditions use the same base model, so the test evaluates interaction and structure, not model intelligence.
- The council condition uses more calls, time, and tokens than the baseline.
- Synthetic cases cannot establish that advice improves real founder outcomes.
- Neither condition verifies external facts; outputs should not be treated as financial, legal, tax, investment, medical, emergency, or crisis advice.

## Founder usability study: 3–5 sessions

### Recruitment and consent

Recruit three to five adult founders who have recently faced, or expect to face, a runway, validation, paid-pilot, or keep-the-job decision. Aim for varied stages rather than a statistically representative sample. Do not recruit someone in an immediate financial, mental-health, or safety crisis.

Before starting, say:

> This is a prototype usability study, not professional advice. Please use a fictionalized or sanitized decision; do not enter personal identifiers, customer-confidential information, API keys, or sensitive financial account details. You may stop at any time. We will record only the notes and recordings you explicitly agree to.

Choose and document a retention period before collecting notes. Do not promise anonymity if you cannot actually maintain it.

### 30-minute session script

1. **Welcome and context — 3 minutes.** Confirm consent, ask about their founder stage, and ask them to choose a sanitized current or recent decision.
2. **Intake without help — 6 minutes.** Ask the participant to complete the decision and founder-context fields while thinking aloud. Do not explain what each answer "should" be.
3. **Council and correction checkpoint — 8 minutes.** Let them read the first round. Ask them to correct any incorrect assumption in their own words, then continue to the final brief.
4. **Interpretation — 7 minutes.** Ask them to point to the next customer proof, stop-loss, and what would change the recommendation. Observe whether they can explain each without prompting.
5. **Debrief — 6 minutes.** Ask the questions below and collect ratings privately, after the facilitator stops helping.

### Questions and measures

Ask these questions verbatim where practical:

- "What did you expect this tool to do before you started?"
- "Where, if anywhere, did you hesitate or feel unsure what to enter?"
- "Which council statement felt grounded, and which felt speculative? Why?"
- "What evidence would you collect next as a result of this brief?"
- "What would make you distrust this recommendation?"
- "Would you use this before making a real founder decision? Why or why not?"
- "What information should the product never ask you to share?"

Collect these lightweight ratings:

| Measure | Scale | Prompt |
| --- | --- | --- |
| Intake clarity | 1–7 | "It was clear what information I needed to provide." |
| Evidence clarity | 1–7 | "I can tell what is known, assumed, and still unproven." |
| Actionability | 1–7 | "I know the next test I would run." |
| Appropriate trust | 1–7 | "The brief showed uncertainty rather than pretending to know my future." |
| Would use again | Yes / No / Maybe | "Would you use this for a future founder decision?" |

### Observation template

```text
Participant ID:
Date and app commit:
Decision type and founder stage (sanitized):
Consent for notes / recording:

Intake friction or skipped fields:
Misunderstood words or UI elements:
Assumptions the participant corrected:
Moment they lost trust or became more confident:
Could they restate the next customer proof?  Yes / No / Partly
Could they restate the stop-loss?             Yes / No / Partly
Ratings (clarity, evidence, actionability, trust):
Most important quote (only with consent):
Requested change:
Facilitator interpretation, clearly marked as interpretation:
```

## Honest synthesis template

After all sessions, summarize patterns without cherry-picking quotes:

```text
Participants: [number], founder stages represented: [description]
Tasks completed without facilitator rescue: [count]/[number]
Repeated friction: [theme and count]
Repeated trust concern: [theme and count]
Evidence that the next step was understood: [observation]
What changed because of the study: [specific product change]
What remains unproven: [specific question]
```

Do not substitute polished demo reactions for user research. A participant saying the design is attractive is not evidence that they understand, trust appropriately, or act on the decision loop.
