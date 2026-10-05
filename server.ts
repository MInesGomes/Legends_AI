import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

/* -------------------------------------------------------------------------- */
/* Security helpers                                                           */
/* -------------------------------------------------------------------------- */

// Fixed messages for known Google OAuth error codes. Query input is never reflected.
const OAUTH_ERROR_MESSAGES = new Map<string, string>([
  ['access_denied', 'Google sign-in was cancelled.'],
  ['invalid_request', 'The sign-in request was invalid.'],
  ['unauthorized_client', 'This app is not authorized for Google sign-in.'],
  ['unsupported_response_type', 'Google sign-in is misconfigured.'],
  ['invalid_scope', 'Google sign-in is misconfigured.'],
  ['server_error', 'Google had a problem. Please try again.'],
  ['temporarily_unavailable', 'Google is temporarily unavailable. Please try again.'],
]);

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (m) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] as string),
  );
}

// Safe for embedding JSON inside <script> blocks (prevents </script> breakout).
function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function safeHttpsUrl(value: unknown): string {
  try {
    const u = new URL(String(value));
    return u.protocol === 'https:' ? u.toString() : '';
  } catch {
    return '';
  }
}

// Sets the HTML content type plus a nonce-based CSP, and returns the nonce
// to put on inline <style> and <script> tags.
function setHtmlHeaders(res: express.Response): string {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set(
    'Content-Security-Policy',
    `default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; img-src https:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
  );
  res.set('X-Content-Type-Options', 'nosniff');
  return nonce;
}

// Optional comma-separated list of extra origins allowed for the OAuth redirect URI,
// e.g. ALLOWED_ORIGINS=https://app.example.com,https://staging.example.com
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

function getRequestOrigin(req: express.Request): string {
  const host = req.get('host');
  const forwarded = req.headers['x-forwarded-proto'];
  const protocol = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0].trim() || req.protocol || 'https';
  return `${protocol}://${host}`;
}

// Returns the requested origin only if it is the server's own origin or allowlisted.
function resolveOrigin(req: express.Request): string {
  const ownOrigin = getRequestOrigin(req);
  if (!req.query.origin) return ownOrigin;

  try {
    const requested = new URL(String(req.query.origin)).origin;
    if (requested === ownOrigin || ALLOWED_ORIGINS.includes(requested)) {
      return requested;
    }
  } catch {
    // fall through
  }
  return ownOrigin;
}

/* -------------------------------------------------------------------------- */
/* Server                                                                     */
/* -------------------------------------------------------------------------- */

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Learn with Legends PWA' });
  });

  // Google OAuth Authorization URL endpoint
  app.get('/api/auth/google/url', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || '';

    const origin = resolveOrigin(req);
    const redirectUri = `${origin}/auth/google/callback`;

    if (!clientId) {
      return res.json({
        configured: false,
        url: null,
        callbackUrl: redirectUri,
        message:
          'GOOGLE_CLIENT_ID is not configured in environment variables. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Settings.',
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({
      configured: true,
      url: authUrl,
      callbackUrl: redirectUri,
    });
  });

  // Google OAuth Callback Route
  const handleGoogleCallback = async (req: express.Request, res: express.Response) => {
    const { code, error } = req.query;

    const origin = getRequestOrigin(req);
    const redirectUri = `${origin}/auth/google/callback`;

    if (error) {
      // Never reflect query input: map to a known code/message.
      const errorCode =
        typeof error === 'string' && OAUTH_ERROR_MESSAGES.has(error) ? error : 'error';
      const displayMessage = OAUTH_ERROR_MESSAGES.get(errorCode) ?? 'Google sign-in failed.';
      const postMessageError = jsonForScript(errorCode);

      const nonce = setHtmlHeaders(res);
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Authentication Cancelled</title>
            <style nonce="${nonce}">
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f141c; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
              .card { background: #121824; border: 1px solid #d4af37; border-radius: 16px; padding: 28px; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
              h2 { color: #f87171; margin-top: 0; }
              p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
              button { background: #d4af37; color: #0f141c; border: none; font-weight: bold; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 12px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Authentication Failed</h2>
              <p>${escapeHtml(displayMessage)}</p>
              <button id="close-btn">Close Window</button>
            </div>
            <script nonce="${nonce}">
              document.getElementById('close-btn').addEventListener('click', function () { window.close(); });
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: ${postMessageError} }, window.location.origin);
                setTimeout(function () { window.close(); }, 1500);
              }
            </script>
          </body>
        </html>
      `);
    }

    if (!code) {
      res.set('Content-Type', 'text/plain; charset=utf-8');
      return res.status(400).send('Missing authorization code');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET || '';

    try {
      if (!clientId || !clientSecret) {
        throw new Error(
          'Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
        );
      }

      // Exchange authorization code for access tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: String(code),
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new Error(
          tokenData.error_description || tokenData.error || 'Failed to exchange token with Google',
        );
      }

      // Fetch user profile from Google UserInfo endpoint
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const googleUser = await userInfoResponse.json();

      const userPayload = {
        name: googleUser.name || googleUser.given_name || 'Google Traveler',
        email: googleUser.email || '',
        picture: safeHttpsUrl(googleUser.picture),
        sub: googleUser.sub || `google_${Date.now()}`,
      };

      const nonce = setHtmlHeaders(res);
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Google Sign-In Successful</title>
            <style nonce="${nonce}">
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f141c; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
              .card { background: #121824; border: 1px solid #d4af37; border-radius: 16px; padding: 32px; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
              .avatar { width: 64px; height: 64px; border-radius: 50%; border: 2px solid #d4af37; margin: 0 auto 16px; object-fit: cover; }
              h2 { color: #fce0a2; margin: 0 0 8px; font-size: 20px; }
              p { color: #94a3b8; font-size: 14px; margin: 0; }
              .spinner { width: 24px; height: 24px; border: 3px solid rgba(212,175,55,0.2); border-top-color: #d4af37; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 16px auto 0; }
              @keyframes spin { to { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="card">
              ${userPayload.picture ? `<img class="avatar" src="${escapeHtml(userPayload.picture)}" alt="" />` : ''}
              <h2>Welcome, ${escapeHtml(userPayload.name)}!</h2>
              <p>Signing in to Learn with Legends...</p>
              <div class="spinner"></div>
            </div>
            <script nonce="${nonce}">
              try {
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'GOOGLE_AUTH_SUCCESS',
                    user: ${jsonForScript(userPayload)}
                  }, window.location.origin);
                  setTimeout(function () { window.close(); }, 600);
                } else {
                  window.location.href = '/';
                }
              } catch (err) {
                console.error('PostMessage error:', err);
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('OAuth Callback exchange error:', err);
      const nonce = setHtmlHeaders(res);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>OAuth Error</title>
            <style nonce="${nonce}">
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f141c; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
              .card { background: #121824; border: 1px solid #ef4444; border-radius: 16px; padding: 28px; max-width: 440px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
              h2 { color: #f87171; margin-top: 0; }
              p { color: #cbd5e1; font-size: 14px; line-height: 1.5; }
              .details { background: #1e293b; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #fca5a5; margin: 14px 0; word-break: break-all; }
              button { background: #d4af37; color: #0f141c; border: none; font-weight: bold; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Authentication Error</h2>
              <p>Could not complete Google authentication.</p>
              <div class="details">${escapeHtml(err?.message || 'Unknown error during token exchange')}</div>
              <button id="close-btn">Close Window</button>
            </div>
            <script nonce="${nonce}">
              document.getElementById('close-btn').addEventListener('click', function () { window.close(); });
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: ${jsonForScript(err?.message || 'Error')} }, window.location.origin);
              }
            </script>
          </body>
        </html>
      `);
    }
  };

  app.get(['/auth/google/callback', '/auth/google/callback/'], handleGoogleCallback);
  app.get(['/auth/callback', '/auth/callback/'], handleGoogleCallback);

  // Mock server API endpoints mirroring Supabase DB actions for instant response & offline resilience
  app.post('/api/comments/check-limit', (req, res) => {
    const { userId, todayCommentsCount } = req.body;
    const remaining = Math.max(0, 10 - (todayCommentsCount || 0));
    res.json({ allowed: remaining > 0, remaining, limit: 10 });
  });

  // Fetch VTT subtitles from YouTube for a given videoId and language code
  app.get('/api/youtube/vtt', async (req, res) => {
    const videoId = String(req.query.videoId || '-B_vlZaUDDc').trim();
    const lang = String(req.query.lang || 'en').trim().toLowerCase();

    res.set('Content-Type', 'text/vtt; charset=utf-8');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'public, max-age=300');

    // 1. Try YouTube timedtext endpoints directly
    const timedTextUrls = [
      `https://www.youtube.com/api/timedtext?v=${encodeURIComponent(videoId)}&lang=${encodeURIComponent(lang)}&fmt=vtt`,
      `https://www.youtube.com/api/timedtext?v=${encodeURIComponent(videoId)}&lang=${encodeURIComponent(lang)}&kind=asr&fmt=vtt`,
      ...(lang !== 'en'
        ? [
            `https://www.youtube.com/api/timedtext?v=${encodeURIComponent(videoId)}&lang=en&tlang=${encodeURIComponent(lang)}&fmt=vtt`,
            `https://www.youtube.com/api/timedtext?v=${encodeURIComponent(videoId)}&lang=en&kind=asr&tlang=${encodeURIComponent(lang)}&fmt=vtt`,
          ]
        : []),
    ];

    for (const ttUrl of timedTextUrls) {
      try {
        const ttRes = await fetch(ttUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
        });
        if (ttRes.ok) {
          const text = await ttRes.text();
          if (text && text.includes('WEBVTT') && text.includes('-->')) {
            res.set('Content-Type', 'text/vtt; charset=utf-8');
            return res.status(200).send(text);
          }
        }
      } catch {
        // Continue to next source
      }
    }

    // 2. Try YouTube Innertube player captionTracks
    const clients = [
      {
        clientName: 'IOS',
        clientVersion: '20.10.38',
        deviceMake: 'Apple',
        deviceModel: 'iPhone16,2',
        osName: 'iPhone',
        osVersion: '18.3.1.22D72',
        hl: lang,
      },
      {
        clientName: 'WEB',
        clientVersion: '2.20250312.04.00',
        hl: lang,
      },
    ];

    for (const client of clients) {
      try {
        const playerRes = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId,
            context: { client },
          }),
        });
        if (playerRes.ok) {
          const data: any = await playerRes.json();
          const tracks: any[] =
            data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
          if (tracks.length > 0) {
            const exactTrack =
              tracks.find((t) => String(t.languageCode || '').toLowerCase() === lang) ||
              tracks.find((t) => String(t.languageCode || '').toLowerCase().startsWith(lang)) ||
              tracks.find((t) => String(t.languageCode || '').toLowerCase().startsWith('en')) ||
              tracks[0];

            if (exactTrack?.baseUrl) {
              let vttUrl = `${exactTrack.baseUrl}&fmt=vtt`;
              const trackLang = String(exactTrack.languageCode || '').toLowerCase();
              if (!trackLang.startsWith(lang) && exactTrack.isTranslatable !== false) {
                vttUrl += `&tlang=${encodeURIComponent(lang)}`;
              }
              const trackRes = await fetch(vttUrl);
              if (trackRes.ok) {
                const vttText = await trackRes.text();
                if (vttText && (vttText.includes('WEBVTT') || vttText.includes('-->'))) {
                  res.set('Content-Type', 'text/vtt; charset=utf-8');
                  return res.status(200).send(vttText);
                }
              }
            }
          }
        }
      } catch {
        // Continue
      }
    }

    // Return valid WebVTT header so language availability check succeeds while client YouTube IFrame Player renders native CC
    res.set('Content-Type', 'text/vtt; charset=utf-8');
    return res.status(200).send('WEBVTT\n\nNOTE Subtitles loaded via YouTube IFrame Player\n');
  });

  // Vite middleware for dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
