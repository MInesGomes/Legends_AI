import React, { Component, forwardRef, useEffect, useRef, useMemo } from 'react';
import YouTube, { type YouTubeProps, type YouTubeEvent, type YouTubePlayer } from 'react-youtube';
import { extractYouTubeVideoId } from '../lib/assetRegistry';

export interface YouTubeAdapter {
  play: () => Promise<any>;
  pause: () => void;
  currentTime: number;
  muted: boolean;
  volume: number;
  engine: YouTubePlayer | null;
  getIframe: () => HTMLIFrameElement | null;
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
    const effectiveVideoId = propVideoId || extractYouTubeVideoId(src) || '';
    const playerRef = useRef<YouTubePlayer | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const tickerRef = useRef<number | null>(null);
    const lastKnownTimeRef = useRef<number>(0);

    const engineParams = source?.engine?.youtube || {};
    const startSeconds = engineParams.start || 0;
    const hlLang = engineParams.hl || undefined;

    const opts: YouTubeProps['opts'] = useMemo(() => {
      return {
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          showinfo: 0,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          cc_load_policy: 0,
          playsinline: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
          widget_referrer: typeof window !== 'undefined' ? window.location.origin : undefined,
          ...(startSeconds > 0 ? { start: startSeconds } : {}),
          ...(hlLang ? { hl: hlLang } : {}),
        },
      };
    }, [autoplay, startSeconds, hlLang]);

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
      };

      if (mediaRef) {
        (mediaRef as React.MutableRefObject<YouTubeAdapter | null>).current = adapter;
      }

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

    const handlePlay = (event: YouTubeEvent<number>) => {
      if (event.target) {
        startTicker(event.target);
      }
      onPlay?.(event);
      onPlaying?.(event);
    };

    const handlePause = (event: YouTubeEvent<number>) => {
      stopTicker();
      onPause?.(event);
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
