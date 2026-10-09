import React, { Component, forwardRef, useEffect, useRef, useMemo } from 'react';
import YouTube, { type YouTubeProps, type YouTubeEvent, type YouTubePlayer } from 'react-youtube';
import { normalizeLangCode } from '../lib/assetRegistry';
import { applyAudioTrack } from '../lib/youtubeAudioTrack';

export interface YouTubeAdapter {
  play: () => Promise<any>;
  pause: () => void;
  currentTime: number;
  muted: boolean;
  volume: number;
  engine: YouTubePlayer | null;
  getIframe: () => HTMLIFrameElement | null;
  setAudioTrack: (langOrId: string) => void;
  getAvailableAudioTracks: () => any[];
}

interface BoundaryProps {
  resetKey: string;
  children: React.ReactNode;
}

interface BoundaryState {
  hasError: boolean;
  retryCount: number;
}

class YouTubeErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  declare props: Readonly<BoundaryProps>;
  state: BoundaryState = {
    hasError: false,
    retryCount: 0,
  };

  static getDerivedStateFromError(): Partial<BoundaryState> {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: BoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      (this as any).setState({ hasError: false });
    }
  }

  componentDidCatch() {
    if (this.state.retryCount < 2) {
      (this as any).setState((prev: BoundaryState) => ({
        hasError: false,
        retryCount: prev.retryCount + 1,
      }));
    }
  }

  render() {
    if (this.state.hasError) {
      return <div className="w-full h-full bg-black" />;
    }
    return <React.Fragment key={`${this.props.resetKey}-${this.state.retryCount}`}>{this.props.children}</React.Fragment>;
  }
}

export type SafeYouTubeVideoProps = {
  instanceKey?: string;
  videoId?: string;
  src?: string;
  mediaRef?: React.RefObject<YouTubeAdapter | null>;
  audioLang?: string;
  subtitleLang?: string;
  autoplay?: boolean;
  defaultMuted?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  className?: string;
  iframeClassName?: string;
  style?: React.CSSProperties;
  source?: any;
  onLoadedMetadata?: (e: { currentTarget: any }) => void;
  onPlay?: (e?: any) => void;
  onPlaying?: (e?: any) => void;
  onPause?: (e?: any) => void;
  onTimeUpdate?: (e: { currentTarget: { currentTime: number } }) => void;
  onEnded?: (e?: any) => void;
};

export const SafeYouTubeVideo = forwardRef<HTMLIFrameElement, SafeYouTubeVideoProps>(
  function SafeYouTubeVideo(
    {
      instanceKey,
      videoId: propVideoId,
      src,
      mediaRef,
      audioLang,
      subtitleLang,
      autoplay = true,
      defaultMuted = true,
      muted = false,
      className = 'w-full h-full border-0 pointer-events-none select-none',
      iframeClassName = 'w-full h-full border-0 pointer-events-none select-none',
      style,
      source,
      onLoadedMetadata,
      onPlay,
      onPlaying,
      onPause,
      onTimeUpdate,
      onEnded,
    },
    ref
  ) {

    const playerRef = useRef<YouTubePlayer | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const tickerRef = useRef<number | null>(null);
    const lastKnownTimeRef = useRef<number>(0);

    const engineParams = source?.engine?.youtube || {};
    const startSeconds = engineParams.start || 0;
    const hlLang = audioLang ? normalizeLangCode(audioLang as any) : (engineParams.hl || undefined);
    const ccLang = subtitleLang
      ? normalizeLangCode(subtitleLang as any)
      : (engineParams.cc_lang_pref || engineParams.ccLang || hlLang || undefined);
    const ccLoadPolicy = engineParams.cc_load_policy !== undefined ? engineParams.cc_load_policy : 1;

    const initialRef = useRef({ hl: hlLang, cc: ccLang, start: startSeconds });
    const lastVideoRef = useRef(effectiveVideoId);
    if (lastVideoRef.current !== effectiveVideoId) {
      lastVideoRef.current = effectiveVideoId;
      initialRef.current = { hl: hlLang, cc: ccLang, start: startSeconds };
    }

    const opts: YouTubeProps['opts'] = useMemo(() => {
      const init = initialRef.current;
      return {
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          enablejsapi: 1,
          modestbranding: 1,
          showinfo: 0,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          cc_load_policy: ccLoadPolicy,
          playsinline: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
          widget_referrer: typeof window !== 'undefined' ? window.location.origin : undefined,
          ...(init.start > 0 ? { start: init.start } : {}),
          ...(init.hl ? { hl: init.hl } : {}),
          ...(init.cc ? { cc_lang_pref: init.cc } : {}),
        },
      };
    }, [autoplay, effectiveVideoId, ccLoadPolicy]); // NOT the language

    const stopTicker = () => {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
    };

    const startTicker = (player: YouTubePlayer) => {
      stopTicker();
      tickerRef.current = window.setInterval(() => {
        void (async () => {
          try {
            if (!player || typeof player.getCurrentTime !== 'function') return;
            const time = await player.getCurrentTime();
            if (typeof time === 'number' && !Number.isNaN(time)) {
              lastKnownTimeRef.current = time;
              onTimeUpdate?.({ currentTarget: { currentTime: time } });
            }

            const state = typeof player.getPlayerState === 'function' ? await player.getPlayerState() : -1;
            const duration = typeof player.getDuration === 'function' ? await player.getDuration() : 0;
            if (state === 0 || (duration > 1 && typeof time === 'number' && time >= duration - 0.4)) {
              stopTicker();
              onEnded?.();
            }
          } catch {}
        })();
      }, 250);
    };

    // Initialize mediaRef with a fallback adapter so it is NEVER null
    useEffect(() => {
      if (mediaRef && !mediaRef.current) {
        (mediaRef as React.MutableRefObject<YouTubeAdapter | null>).current = {
          play: () => Promise.resolve(),
          pause: () => {},
          get currentTime() {
            return lastKnownTimeRef.current;
          },
          set currentTime(time: number) {
            lastKnownTimeRef.current = time;
          },
          get muted() {
            return !!muted;
          },
          set muted(_val: boolean) {},
          get volume() {
            return 1;
          },
          set volume(_vol: number) {},
          engine: null,
          getIframe: () => iframeRef.current,
          setAudioTrack: (_langOrId: string) => {},
          getAvailableAudioTracks: () => [],
        };
      }
    }, [mediaRef, muted]);

    useEffect(() => {
      return () => {
        stopTicker();
      };
    }, []);

    // Sync muted prop with the active YouTube player
    useEffect(() => {
      if (!playerRef.current) return;
      try {
        if (muted) {
          if (typeof playerRef.current.mute === 'function') playerRef.current.mute();
        } else {
          if (typeof playerRef.current.unMute === 'function') playerRef.current.unMute();
        }
      } catch {}
    }, [muted]);

    const handleReady = async (event: YouTubeEvent) => {
      const player = event.target;
      playerRef.current = player;

      let iframeEl: HTMLIFrameElement | null = null;
      try {
        if (player && typeof player.getIframe === 'function') {
          const res = player.getIframe();
          if (res instanceof Promise) {
            iframeEl = await res;
          } else {
            iframeEl = res;
          }
        }
      } catch {}

      if (iframeEl) {
        iframeRef.current = iframeEl;
        if (typeof ref === 'function') {
          ref(iframeEl);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLIFrameElement | null>).current = iframeEl;
        }
      }

      const adapter: YouTubeAdapter = {
        play: () => {
          try {
            if (player && typeof player.playVideo === 'function') {
              const res = player.playVideo();
              if (res && typeof res.catch === 'function') {
                return res.catch(() => {});
              }
              return Promise.resolve(res);
            }
          } catch {}
          return Promise.resolve();
        },
        pause: () => {
          try {
            if (player && typeof player.pauseVideo === 'function') {
              player.pauseVideo();
            }
          } catch {}
        },
        get currentTime() {
          return lastKnownTimeRef.current;
        },
        set currentTime(time: number) {
          lastKnownTimeRef.current = time;
          try {
            if (player && typeof player.seekTo === 'function') {
              player.seekTo(time, true);
            }
          } catch {}
        },
        get muted() {
          return !!muted;
        },
        set muted(val: boolean) {
          try {
            if (player) {
              if (val && typeof player.mute === 'function') player.mute();
              else if (!val && typeof player.unMute === 'function') player.unMute();
            }
          } catch {}
        },
        get volume() {
          return 1;
        },
        set volume(vol: number) {
          try {
            if (player && typeof player.setVolume === 'function') {
              player.setVolume(Math.round(vol * 100));
            }
          } catch {}
        },
        engine: player,
        getIframe: () => iframeRef.current,
        setAudioTrack: (langOrId: string) => {
          void applyAudioTrack(player, langOrId, { force: true });
        },
        getAvailableAudioTracks: () => {
          try {
            if (player && typeof player.getAvailableAudioTracks === 'function') {
              return player.getAvailableAudioTracks() || [];
            }
          } catch {}
          return [];
        },
      };

      if (mediaRef) {
        (mediaRef as React.MutableRefObject<YouTubeAdapter | null>).current = adapter;
      }

      try {
        if (player) {
          if (typeof player.loadModule === 'function') {
            player.loadModule('captions');
          }
          if (ccLang && typeof player.setOption === 'function') {
            player.setOption('captions', 'track', { languageCode: ccLang });
            player.setOption('cc', 'track', { languageCode: ccLang });
          }
          if (hlLang) void applyAudioTrack(player, hlLang);
        }
      } catch {}

      try {
        if (player) {
          if (muted || defaultMuted) {
            if (typeof player.mute === 'function') player.mute();
          } else {
            if (typeof player.unMute === 'function') player.unMute();
          }
        }
      } catch {}

      if (autoplay && player && typeof player.playVideo === 'function') {
        try {
          player.playVideo();
        } catch {}
      }

      try {
        onLoadedMetadata?.({ currentTarget: adapter });
      } catch {}
    };

    // Synchronize subtitles and audio track whenever language changes
    useEffect(() => {
      const player = playerRef.current;
      if (!player) return;
      try {
        if (typeof player.loadModule === 'function') player.loadModule('captions');
        if (ccLang && typeof player.setOption === 'function') {
          player.setOption('captions', 'track', { languageCode: ccLang });
          player.setOption('cc', 'track', { languageCode: ccLang });
        }
      } catch {}
      if (hlLang) void applyAudioTrack(player, hlLang);
    }, [hlLang, ccLang]);

    const handlePlay = (event: YouTubeEvent<number>) => {
      if (event.target) {
        startTicker(event.target);
        if (hlLang) void applyAudioTrack(event.target, hlLang);
      }
      onPlay?.(event);
      onPlaying?.(event);
    };

    const handlePause = (event: YouTubeEvent<number>) => {
      stopTicker();
      onPause?.(event);
      void (async () => {
        try {
          const player = event.target;
          if (player) {
            const time = typeof player.getCurrentTime === 'function' ? await player.getCurrentTime() : 0;
            const duration = typeof player.getDuration === 'function' ? await player.getDuration() : 0;
            if (duration > 1 && typeof time === 'number' && time >= duration - 0.4) {
              onEnded?.(event);
            }
          }
        } catch {}
      })();
    };

    const handleEnd = (event: YouTubeEvent<number>) => {
      stopTicker();
      onEnded?.(event);
    };

    const key = instanceKey || `yt-${effectiveVideoId}`;

    return (
      <YouTubeErrorBoundary resetKey={key}>
        <div
          className={className}
          style={{ width: '100%', height: '100%', pointerEvents: 'none', ...style }}
        >
          {effectiveVideoId ? (
            <YouTube
              key={key}
              videoId={effectiveVideoId}
              opts={opts}
              onReady={(event) => {
                void handleReady(event);
              }}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnd={handleEnd}
              className="w-full h-full pointer-events-none select-none"
              iframeClassName={iframeClassName}
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            />
          ) : null}
        </div>
      </YouTubeErrorBoundary>
    );
  }
);
