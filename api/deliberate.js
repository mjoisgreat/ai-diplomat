const MODEL = 'gpt-5.6';
const MAX_BODY_BYTES = 32 * 1024;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 12_000;
const MAX_TOTAL_MESSAGE_CHARS = 28_000;
const MAX_COMPLETION_TOKENS = 1_200;
const ALLOWED_ROLES = new Set(['system', 'user', 'assistant']);

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
  };

  const tokenLimit = validTokenLimit(input.max_completion_tokens)
    ? input.max_completion_tokens
    : validTokenLimit(input.max_tokens)
      ? input.max_tokens
      : null;

  if (tokenLimit) request.max_completion_tokens = tokenLimit;

  if (isRecord(input.response_format) && input.response_format.type === 'json_object') {
    request.response_format = { type: 'json_object' };
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
};
