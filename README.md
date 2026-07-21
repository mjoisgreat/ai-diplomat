# Asembi

**A private second hearing for consequential decisions.**

Asembi is a Flutter web app that turns a hard choice into a short, visible decision process: four distinct perspectives examine the case, the user corrects the council’s assumptions, the agents challenge one another, and a Mediator produces one conditional decision brief.

It is not a prediction engine or an authority on personal choices. It is a way to make unknowns, evidence, trade-offs, and a reversible next move easier to see.

## The experience

1. **Start with one centered question.** Choose an Open, Founder, Career, or Move template from a model-style picker. Open is the default.
2. **Choose your context level.** Leave it Off, use editable Auto-fill that extracts only facts from the user’s text, or add details manually.
3. **Watch the council convene.** Countercase, Opportunity, Risk, and Human factor stream their independent first hearing one at a time.
4. **Correct the record.** The user can keep, edit, or remove the assumptions that matter before the challenge round.
5. **Receive a Decision Brief.** The Mediator synthesizes the debate into a recommendation, evidence action, guardrail, and if/then decision rule.
6. **Keep the decision loop.** Copy the brief or download the complete council transcript with both rounds and a timestamp.

## Why this is not just a multi-agent chat

- **Visible reasoning roles:** every perspective has a different job, not a different color or personality.
- **User correction before synthesis:** assumptions are editable before cross-examination, not buried in a final answer.
- **Generative UI with a purpose:** streamed turns produce Claim, Assumption, and Evidence-needed signals that become the correction gate.
- **Conditional rather than falsely certain:** the brief gives the evidence that would change its recommendation and a measurable decision rule instead of a made-up confidence percentage.
- **Private by default:** Example mode is a fully local scripted walkthrough. Live mode uses a server relay, so no API key is entered, stored, or sent from the browser.

## Architecture

~~~mermaid
flowchart LR
  U[User decision + optional context] --> F[Flutter web experience]
  F --> A[Four streamed council hearings]
  A --> C[Editable assumption check]
  C --> X[Cross-examination]
  X --> M[Structured Mediator brief]
  M --> E[Copy or full transcript export]
  F --> R[/api/deliberate]
  R --> O[OpenAI Chat Completions — gpt-5.6 SSE]
  O --> R --> F
~~~

The Flutter source lives in [flutter_app](flutter_app). The generated production bundle in [public](public) is served by Vercel, while [api/deliberate.js](api/deliberate.js) is the server-side streaming relay.

The relay pins every live request to `gpt-5.6`, forces SSE streaming, caps request and completion sizes, uses strict server-owned JSON schemas for the Auto-fill and Mediator UI payloads, and includes a best-effort per-instance abuse guard. For public-scale use, add authentication, durable distributed rate limits, budget alerts, monitoring, and a reviewed privacy policy.

## Run locally

### Example mode

The built app can be served as static files:

~~~bash
python3 -m http.server 4173 --directory public
~~~

Open `http://localhost:4173` and select **Use example**. It requires no key and never claims to analyze a user’s facts.

### Develop the Flutter app

~~~bash
cd flutter_app
flutter pub get
flutter run -d chrome
~~~

Create the Vercel-ready bundle after a change:

~~~bash
cd flutter_app
flutter build web --release --output ../public
~~~

### Live GPT-5.6 mode

1. Import this repository into Vercel.
2. Set `OPENAI_API_KEY` in the Vercel project environment variables.
3. Redeploy.
4. Choose **Use Live GPT-5.6** from the app’s response-mode control.

The key stays only in Vercel’s server environment. Avoid entering personal identifiers, confidential customer data, or account information into a live hearing.

## Trust boundaries

- Asembi is a planning aid, not medical, legal, financial, tax, investment, emergency, crisis, or professional relationship advice.
- It does not verify salary, offer, tax, visa, housing, funding, market, customer, school, or employer claims. Treat material details as user-provided until independently verified.
- Some high-stakes topics are redirected to qualified support rather than sent into the council flow.
- Example mode is illustrative only. Live mode sends the decision record to the app relay and OpenAI to produce the streamed hearing.

## Before a submission or public launch

The strongest evidence for this project will be real, measured use:

- Run 3–5 usability sessions with people making a live decision.
- Compare the same cases with a single-model answer and publish the honest results.
- Record a 60–90 second demo showing a decision become a bounded evidence test.
- Add durable authentication, distributed rate limits, budget controls, monitoring, and a privacy policy before broad access.
