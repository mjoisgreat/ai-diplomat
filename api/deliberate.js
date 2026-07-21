const MODEL = 'gpt-5.6';
const MAX_BODY_BYTES = 32 * 1024;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 12_000;
const MAX_TOTAL_MESSAGE_CHARS = 28_000;
const MAX_COMPLETION_TOKENS = 1_200;
const DEFAULT_MAX_COMPLETION_TOKENS = 240;
const ALLOWED_ROLES = new Set(['system', 'user', 'assistant']);
const REASONING_EFFORT = 'none';
const RATE_WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 14;
const MAX_CONCURRENT_REQUESTS = 1;
const clientWindows = new Map();

const textField = { type: 'string' };
const contextSchema = (properties) => ({
  type: 'object',
  additionalProperties: false,
  properties,
  required: Object.keys(properties),
});

const STRUCTURED_OUTPUTS = Object.freeze({
  decision_brief: {
    name: 'decision_brief',
    strict: true,
    schema: contextSchema({
      summary: textField,
      recommendation: textField,
      points: {
        type: 'array',
        items: textField,
        minItems: 3,
        maxItems: 3,
      },
      conditions: textField,
      experiment: textField,
      stopLoss: textField,
      decisionRule: textField,
      alignment: textField,
    }),
  },
  decision_context: {
    name: 'decision_context',
    strict: true,
    schema: contextSchema({
      options: textField,
      values: textField,
      constraints: textField,
      evidence: textField,
      assumption: textField,
      nextStep: textField,
    }),
  },
  founder_context: {
    name: 'founder_context',
    strict: true,
    schema: contextSchema({
      cash: textField,
      monthlyBurn: textField,
      customerEvidence: textField,
      constraints: textField,
      assumption: textField,
      nextStep: textField,
    }),
  },
});

function sendJson(res, statusCode, message) {
  if (res.writableEnded || res.destroyed) return;
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ error: { message } }));
}

function hasValidContentLength(req) {
  const header = req.headers['content-length'];
  const value = Array.isArray(header) ? header[0] : header;

  if (!value) return true;
  if (!/^\d+$/.test(value)) return false;
  return Number(value) <= MAX_BODY_BYTES;
}

function parseBody(req) {
  const body = req.body;

  if (typeof body === 'string') return JSON.parse(body);
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString('utf8'));
  return body;
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validTokenLimit(value) {
  return Number.isInteger(value) && value > 0 && value <= MAX_COMPLETION_TOKENS;
}

function sanitizeResponseFormat(input) {
  if (!isRecord(input)) return null;

  if (input.type === 'json_object') {
    return { type: 'json_object' };
  }

  if (!isRecord(input.json_schema) || input.type !== 'json_schema') {
    return null;
  }

  const schemaName = input.json_schema.name;
  if (typeof schemaName !== 'string' || !STRUCTURED_OUTPUTS[schemaName]) {
    return null;
  }

  return {
    type: 'json_schema',
    json_schema: STRUCTURED_OUTPUTS[schemaName],
  };
}

function sanitizeRequest(input) {
  if (!isRecord(input) || input.model !== MODEL || !Array.isArray(input.messages)) {
    return null;
  }

  if (input.messages.length === 0 || input.messages.length > MAX_MESSAGES) {
    return null;
  }

  let totalChars = 0;
  const messages = [];

  for (const message of input.messages) {
    if (!isRecord(message) || !ALLOWED_ROLES.has(message.role) || typeof message.content !== 'string') {
      return null;
    }

    if (message.content.length === 0 || message.content.length > MAX_MESSAGE_CHARS) {
      return null;
    }

    totalChars += message.content.length;
    if (totalChars > MAX_TOTAL_MESSAGE_CHARS) return null;

    messages.push({ role: message.role, content: message.content });
  }

  const request = {
    model: MODEL,
    messages,
    stream: true,
    n: 1,
    store: false,
    // This app favors concise, visible deliberation over hidden reasoning.
    // Pinning the effort also prevents clients from raising token usage.
    reasoning_effort: REASONING_EFFORT,
  };

  const tokenLimit = validTokenLimit(input.max_completion_tokens)
    ? input.max_completion_tokens
    : validTokenLimit(input.max_tokens)
      ? input.max_tokens
      : null;

  request.max_completion_tokens = tokenLimit ?? DEFAULT_MAX_COMPLETION_TOKENS;

  if (input.response_format !== undefined) {
    const responseFormat = sanitizeResponseFormat(input.response_format);
    if (!responseFormat) return null;
    request.response_format = responseFormat;
  }

  return request;
}

function waitForDrainOrClose(res) {
  return new Promise((resolve) => {
    const done = () => {
      res.off('drain', done);
      res.off('close', done);
      resolve();
    };

    res.once('drain', done);
    res.once('close', done);
  });
}

function clientKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const firstForwarded = typeof value === 'string' ? value.split(',')[0].trim() : '';
  return firstForwarded || req.socket?.remoteAddress || 'anonymous';
}

function acquireRateSlot(req) {
  const now = Date.now();
  if (clientWindows.size > 300) {
    for (const [key, entry] of clientWindows) {
      if (entry.windowStartedAt + RATE_WINDOW_MS <= now && entry.active === 0) {
        clientWindows.delete(key);
      }
    }
  }

  const key = clientKey(req);
  let entry = clientWindows.get(key);
  if (!entry || entry.windowStartedAt + RATE_WINDOW_MS <= now) {
    entry = { windowStartedAt: now, requests: 0, active: 0 };
    clientWindows.set(key, entry);
  }

  if (entry.requests >= MAX_REQUESTS_PER_WINDOW || entry.active >= MAX_CONCURRENT_REQUESTS) {
    return null;
  }

  entry.requests += 1;
  entry.active += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    entry.active = Math.max(0, entry.active - 1);
  };
}

module.exports = async function deliberate(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, 'Method not allowed.');
    return;
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json') || !hasValidContentLength(req)) {
    sendJson(res, 400, 'Invalid request body.');
    return;
  }

  let body;
  try {
    body = parseBody(req);
    if (!isRecord(body) || Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) {
      sendJson(res, 413, 'Request body is too large.');
      return;
    }
  } catch {
    sendJson(res, 400, 'Invalid request body.');
    return;
  }

  const request = sanitizeRequest(body);
  if (!request) {
    sendJson(res, 400, 'Invalid deliberation request.');
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    sendJson(res, 503, 'Live mode is not configured.');
    return;
  }

  const releaseRateSlot = acquireRateSlot(req);
  if (!releaseRateSlot) {
    res.setHeader('Retry-After', '300');
    sendJson(res, 429, 'This device has reached the live hearing limit. Please use Example mode or retry in a few minutes.');
    return;
  }

  try {
    const controller = new AbortController();
    const abortUpstream = () => controller.abort();
    req.once('aborted', abortUpstream);
    res.once('close', abortUpstream);

    let upstream;
    try {
      upstream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
    } catch {
      req.off('aborted', abortUpstream);
      res.off('close', abortUpstream);
      if (!res.writableEnded) sendJson(res, 502, 'The live service is unavailable. Please retry.');
      return;
    }

    if (!upstream.ok || !upstream.body) {
      req.off('aborted', abortUpstream);
      res.off('close', abortUpstream);
      try {
        await upstream.body?.cancel();
      } catch {
        // The generic response below deliberately does not expose upstream details.
      }
      sendJson(res, upstream.status || 502, 'The live service is unavailable. Please retry.');
      return;
    }

    res.statusCode = upstream.status;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const reader = upstream.body.getReader();
    try {
      while (!res.destroyed) {
        const { done, value } = await reader.read();
        if (done) break;

        if (!res.write(Buffer.from(value))) {
          await waitForDrainOrClose(res);
        }
      }
    } catch {
      // The client receives a closed SSE stream rather than an upstream error payload.
    } finally {
      req.off('aborted', abortUpstream);
      res.off('close', abortUpstream);
      reader.releaseLock();
      if (!res.writableEnded) res.end();
    }
  } finally {
    releaseRateSlot();
  }
};
