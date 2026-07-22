<p align="center">
  <img src="flutter_app/assets/asembi-logo.png" alt="Asembi logo" width="180" />
</p>

<h1 align="center">Asembi</h1>

<p align="center">
  <strong>A private second hearing for hard life decisions.</strong>
</p>

<p align="center">
  <a href="https://asembi.vercel.app/">Try the live app</a>
  ·
  <a href="https://youtu.be/yUob9fEebEE">Watch the demo</a>
  ·
  <a href="#how-it-works">How it works</a>
</p>

Asembi helps a person slow down a difficult choice before making it permanent. Instead of giving one fast answer, it brings together four independent GPT-5.6 perspectives, lets the user correct the assumptions behind them, runs a challenge round, and produces a clear Decision Brief.

It does not decide a life for anyone. It helps make trade-offs, unknowns, evidence, and the next safest move easier to see.

## Watch the demo

<p align="center">
  <a href="https://youtu.be/yUob9fEebEE">
    <img src="https://img.youtube.com/vi/yUob9fEebEE/hqdefault.jpg" alt="Watch the Asembi demo on YouTube" width="720" />
  </a>
</p>

<p align="center">
  <strong>▶ <a href="https://youtu.be/yUob9fEebEE">Watch Asembi in action on YouTube</a></strong>
</p>

## Why Asembi

- **Independent views, not one generic reply.** Countercase, Opportunity, Risk, and Human Factor each have a distinct job.
- **Assumptions are visible and editable.** The user can correct the record before the agents challenge one another.
- **The output is practical.** The final brief includes a recommendation, what could change it, a small evidence action, a guardrail, and a decision rule.
- **No key required to explore.** Example Mode is a complete, local walkthrough that judges can try immediately.

## How it works

1. **Frame the decision.** Choose an Open, Founder, Career, or Move template and describe the choice.
2. **Add only useful context.** Leave context off, add details manually, or use editable Auto-fill in Live mode.
3. **Read the first hearing.** Four perspectives stream their independent views one at a time.
4. **Correct the assumptions.** Keep, edit, or remove the assumptions that matter before continuing.
5. **Run the challenge round.** Each perspective responds to what the others missed.
6. **Act on the Decision Brief.** Copy or download the complete record, then use the evidence action and guardrail to guide the next move.

## Built with Codex and GPT-5.6

### Where Codex accelerated the workflow

Codex was the main build partner for turning the early prototype into the shipped app. It accelerated:

- **Product design:** narrowing a broad “multi-agent chat” into a clear second-hearing flow: independent views → assumption correction → challenge round → Decision Brief.
- **Engineering:** moving the app into Flutter web, implementing streamed Server-Sent Events, and making one agent finish before the next begins.
- **Trust design:** replacing browser API-key entry with a Vercel relay, keeping the key server-side, and making Example Mode work without any key.
- **Decision quality:** adding the editable assumption checkpoint so users can correct the council before the final recommendation.
- **Polish and delivery:** refining the centered interface, transcript export, brand system, Vercel deployment, README, and demo materials.

### Key decisions behind Asembi

| Decision | Why it matters |
| --- | --- |
| Use four fixed roles instead of one generic assistant | Each role has a clear job: challenge the case, find opportunity, map risk, or surface human pressure. |
| Put the user between the two rounds | The user can correct assumptions before the agents respond to one another. |
| Give a conditional brief instead of a confidence score | The result names what could change the recommendation, the next evidence action, and a guardrail. |
| Use a server-side relay | Visitors never enter an API key in the browser; the relay also keeps the live model fixed to GPT-5.6. |

### How GPT-5.6 is used

GPT-5.6 is the live reasoning engine, not a decorative feature. It is used to:

1. Generate the independent first-hearing response for each council role.
2. Generate each role’s challenge-round response after it receives the other views and corrected assumptions.
3. Create the structured Mediator Decision Brief.
4. Optionally extract an editable context draft from facts explicitly provided by the user.

Every live request is pinned to `gpt-5.6` and streamed through the Vercel relay with Server-Sent Events, so the interface shows the council thinking in real time.

| OpenAI Build Week 2026 | Details |
| --- | --- |
| Track | Apps for Your Life |
| Demo video | [Watch on YouTube](https://youtu.be/yUob9fEebEE) |
| Primary Codex Session ID | `019f5c8a-25ec-7940-9cdf-b37d3ea4f83b` |

## Architecture

~~~mermaid
flowchart LR
  U["Decision and optional context"] --> F["Flutter web app"]
  F --> H["Four streamed first-hearing turns"]
  H --> A["Editable assumption check"]
  A --> X["Cross-examination"]
  X --> M["Structured Mediator brief"]
  M --> E["Copy or transcript export"]
  F --> R["Vercel relay: /api/deliberate"]
  R --> O["OpenAI Chat Completions: GPT-5.6"]
  O --> R
  R --> F
~~~

The browser UI is built with Flutter. In Live mode, it sends a bounded request to `/api/deliberate`; the Vercel function keeps `OPENAI_API_KEY` on the server, forces streaming, and forwards the response to the app. Example Mode is scripted and makes no network request.

## Try it

### Example Mode — no API key needed

1. Open [asembi.vercel.app](https://asembi.vercel.app/).
2. Enter a decision, then select **Use example**.
3. Follow the first hearing, assumption check, challenge round, and final brief.

### Live GPT-5.6 Mode

Select **Use Live GPT-5.6** when starting a review. The app never asks a visitor to paste an API key into the browser.

## Run locally

### Prerequisites

- Flutter with Dart 3.12 or newer
- A Vercel project and `OPENAI_API_KEY` only if you want Live mode

### Run the built Example Mode

~~~bash
python3 -m http.server 4173 --directory public
~~~

Open `http://localhost:4173` and choose **Use example**.

### Develop the Flutter app

~~~bash
cd flutter_app
flutter pub get
flutter run -d chrome
~~~

Build the deployable bundle after a change:

~~~bash
cd flutter_app
flutter build web --release --output ../public
~~~

### Enable Live mode on Vercel

1. Import this repository into Vercel.
2. Add `OPENAI_API_KEY` to the Vercel project environment variables.
3. Redeploy the project.

## Data and safety

- Example Mode is a fixed local walkthrough; it does not send a request.
- Live Mode sends the decision and optional context to the Vercel relay and OpenAI. Do not enter account details, personal identifiers, confidential customer information, or secrets.
- Asembi is a planning aid, not medical, legal, financial, tax, investment, emergency, crisis, or professional relationship advice.
- The council does not verify salary, offer, visa, housing, market, funding, customer, employer, or school claims. Verify important facts independently.

## Repository map

| Path | Purpose |
| --- | --- |
| [`flutter_app/lib/main.dart`](flutter_app/lib/main.dart) | Flutter web interface and decision-flow state |
| [`api/deliberate.js`](api/deliberate.js) | Server-side GPT-5.6 streaming relay |
| [`public`](public) | Generated production bundle deployed by Vercel |
| [`flutter_app/assets/asembi-logo.png`](flutter_app/assets/asembi-logo.png) | Official Asembi mark |

## License

The source code is available under the [MIT License](LICENSE). The Asembi name, logo, and visual identity are not licensed for third-party branding use; see [Asembi brand use](TRADEMARKS.md).
