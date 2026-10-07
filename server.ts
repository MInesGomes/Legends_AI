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

function safeHttpsUrl(value: unknown): string {
  try {
    const u = new URL(String(value));
    return u.protocol === 'https:' ? u.toString() : '';
  } catch {
    return '';
  }
}

// Sets a nonce-based CSP and returns the nonce for the inline <style>/<script>
// tags in the ejs views. res.render sets the text/html content type itself.
function setHtmlHeaders(res: express.Response): string {
  const nonce = crypto.randomBytes(16).toString('base64');
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

  app.set('view engine', 'ejs');
  app.set('views', path.join(process.cwd(), 'views'));

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

      const nonce = setHtmlHeaders(res);
      return res.status(400).render('auth-failed', { nonce, errorCode, message: displayMessage });
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
      res.render('auth-success', { nonce, user: userPayload });
    } catch (err: any) {
      console.error('OAuth Callback exchange error:', err);
      const nonce = setHtmlHeaders(res);
      res.status(500).render('auth-exception', {
        nonce,
        message: String(err?.message || 'Unknown error during token exchange'),
      });
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
