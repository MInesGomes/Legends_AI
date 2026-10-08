type AnyPlayer = any;

const LANG_ALIASES: Record<string, string[]> = {
  en: ['english', 'inglés', 'inglês', 'inglese', 'engels'],
  es: ['spanish', 'español', 'espanhol', 'spagnolo', 'spaans'],
  it: ['italian', 'italiano', 'italiaans'],
  pt: ['portuguese', 'português', 'portugues', 'portoghese', 'portugees'],
  nl: ['dutch', 'nederlands', 'olandese', 'holandés', 'holandês'],
};

function collectStrings(value: any, out: string[] = [], depth = 0): string[] {
  if (value == null || depth > 4) return out;
  try {
    if (typeof value === 'string') out.push(value.toLowerCase());
    else if (typeof value === 'object') {
      for (const k of Object.keys(value)) collectStrings(value[k], out, depth + 1);
    }
  } catch {}
  return out;
}

export function trackMatchesLang(track: any, langCode: string): boolean {
  const c = langCode.toLowerCase().split(/[-_]/)[0];
  const re = new RegExp(`(^|[=:\\s])${c}([-_.]|$)`);
  const aliases = LANG_ALIASES[c] || [];
  return collectStrings(track).some((s) => re.test(s) || aliases.some((a) => s.includes(a)));
}

const state = new WeakMap<object, { lang: string; promise: Promise<boolean> }>();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Calls the native player.setAudioTrack(trackObject) on the given player.
 * Polls until YouTube exposes the track list (only available after playback starts).
 */
export function applyAudioTrack(
  player: AnyPlayer,
  langCode: string,
  opts: { force?: boolean; timeoutMs?: number; intervalMs?: number } = {}
): Promise<boolean> {
  if (!player) return Promise.resolve(false);
  const { force = false, timeoutMs = 12000, intervalMs = 400 } = opts;

  const existing = state.get(player);
  if (!force && existing && existing.lang === langCode) return existing.promise;

  const promise = (async () => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (state.get(player)?.lang !== langCode) return false; // superseded by a newer request
      try {
        const tracks =
          typeof player.getAvailableAudioTracks === 'function'
            ? player.getAvailableAudioTracks()
            : null;
        if (Array.isArray(tracks) && tracks.length > 0) {
          const match = tracks.find((t) => trackMatchesLang(t, langCode));
          if (!match) {
            console.warn('[audio] no track matches', langCode, tracks);
            return false;
          }
          player.setAudioTrack(match); // must be the track OBJECT
          return true;
        }
      } catch (e) {
        console.warn('[audio] setAudioTrack failed', e);
      }
      await sleep(intervalMs);
    }
    console.warn('[audio] timed out: video exposes no audio tracks');
    return false;
  })();

  state.set(player, { lang: langCode, promise });
  promise.then((ok) => {
    if (!ok && state.get(player)?.promise === promise) state.delete(player);
  });
  return promise;
}
