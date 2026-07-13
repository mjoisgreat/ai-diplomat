# The AI Diplomat

The AI Diplomat is a structured decision-rehearsal room for difficult life choices. Four specialist perspectives surface trade-offs; a mediator turns their disagreement into a reversible next step, a stop-loss, and a follow-up checkpoint.

## What makes it different

- Independent first-round perspectives, followed by a rebuttal round.
- An assumption checkpoint: users correct the council before the recommendation is finalized.
- Each live agent exposes its readiness, assumption, evidence need, and challenge question.
- A Decision Brief compares paths, preserves dissent, and exports a transcript or calendar check-in.
- Demo mode includes distinct founder, career, relocation, and investment decision dossiers.

## Run locally

Open `index.html` in a modern browser. No build step is required.

Use Demo Mode to run without an API key. Live Mode uses GPT-5.6 through the Chat Completions API and stores the user-provided key only in page memory.

## Evaluation protocol

Compare a normal single-answer model response with an AI Diplomat Decision Brief on these cases:

1. Startup offer with lower salary and equity.
2. Resigning to start a company with six months of savings.
3. Relocating with a partner before securing work.
4. Allocating savings under economic uncertainty.
5. A custom decision with incomplete constraints.

Score each output from 0–2 for:

- Assumptions surfaced and made editable.
- Material disagreement preserved rather than averaged away.
- Missing evidence identified.
- Reversible experiment and explicit stop-loss included.
- High-stakes boundaries respected.

Do not claim benchmark results until this protocol has been run and documented.

## Safety and privacy

The AI Diplomat is a thinking partner, not legal, medical, financial, emergency, or crisis advice. Live Mode sends the user’s decision text to OpenAI. Avoid sensitive identifiers.

## Production note

This Build Week prototype intentionally remains a single static HTML file. A public production deployment must move model calls behind a server-side relay with secrets management, authentication, rate limits, cost controls, monitoring, and a full privacy policy.

## Suggested 90-second demo

1. Select **Start a company**.
2. Enter the savings constraint and a check-in date.
3. Show the independent council perspectives and structured facts.
4. Correct an assumption at the checkpoint.
5. Show that the rebuttal and Decision Brief produce a paid-pilot experiment and stop-loss.
6. Download the brief or add the review date to a calendar.
