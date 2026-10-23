import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';
import { normalizeLangCode } from '../lib/assetRegistry';
import { applyAudioTrack as syncYtEngineAudioTrack } from '../lib/youtubeAudioTrack';

export interface VideoJsPlayerHandle {
  play: () => Promise<void> | void;
  pause: () => void;
  togglePlay: () => void;
  setMuted: (muted: boolean) => void;
  changeAudioTrack: (langCode: string) => void;
  changeSubtitleTrack: (langCode: string) => void;
  getAudioTracks: () => any[];
  getCurrentAudioTrackId: () => string;
  getPlayer: () => any;
}

export interface VideoJsPlayerProps {
  videoId?: string;
  src?: string;
  autoplay?: boolean;
  muted?: boolean;
  audioLang?: string;
  subtitleLang?: string;
  className?: string;
  onPlayerReady?: (player: any) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (err?: any) => void;
  onAudioTracksChanged?: (tracks: any[], activeTrackId: string) => void;
}

const SUPPORTED_AUDIO_DUBS = [
  { id: 'en-dub', kind: 'main', label: 'English', language: 'en', default: true },
  { id: 'es-dub', kind: 'translation', label: 'Español', language: 'es', default: false },
  { id: 'it-dub', kind: 'translation', label: 'Italiano', language: 'it', default: false },
  { id: 'pt-dub', kind: 'translation', label: 'Português', language: 'pt', default: false },
  { id: 'nl-dub', kind: 'translation', label: 'Nederlands', language: 'nl', default: false },
];

export const VideoJsPlayer = forwardRef<VideoJsPlayerHandle, VideoJsPlayerProps>(
  function VideoJsPlayer(
    {
      videoId,
      src,
      autoplay = true,
      muted = false,
      audioLang = 'EN',
      subtitleLang = 'EN',
      className = '',
      onPlayerReady,
      onPlay,
      onPause,
      onEnded,
      onError,
      onAudioTracksChanged,
    },
    ref
  ) {
    const videoRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<any>(null);

    // Track active audio track id
    const currentTrackIdRef = useRef<string>('');

    // Programmatic change audio track
    const changeAudioTrack = useCallback((langCode: string) => {
      const player = playerRef.current;
      if (!player) return;

      const norm = normalizeLangCode(langCode);
      const audioTracks = typeof player.audioTracks === 'function' ? player.audioTracks() : null;

      if (audioTracks && audioTracks.length > 0) {
        let matchedId = '';
        for (let i = 0; i < audioTracks.length; i++) {
          const track = audioTracks[i];
          const isMatch =
            track.language === norm ||
            track.id === `${norm}-dub` ||
            track.id === norm ||
            track.id === langCode ||
            (track.label && track.label.toLowerCase().includes(norm));

          if (isMatch) {
            track.enabled = true;
            matchedId = track.id;
          } else {
            track.enabled = false;
          }
        }
        if (matchedId) {
          currentTrackIdRef.current = matchedId;
        }
      }

      // If YouTube Tech is active, also notify the underlying engine
      try {
        const tech = typeof player.tech === 'function' ? player.tech({ IWillNotUseThisInPlugins: true }) : null;
        const ytPlayer = (tech as any)?.ytPlayer || (player as any).engine;
        if (ytPlayer) {
          void syncYtEngineAudioTrack(ytPlayer, norm, { force: true });
        }
      } catch {}
    }, []);

    // Programmatic change subtitle track
    const changeSubtitleTrack = useCallback((langCode: string) => {
      const player = playerRef.current;
      if (!player) return;

      const norm = normalizeLangCode(langCode);
      const textTracks = typeof player.textTracks === 'function' ? player.textTracks() : null;

      if (textTracks) {
        for (let i = 0; i < textTracks.length; i++) {
          const track = textTracks[i];
          if (langCode === 'off' || norm === 'off') {
            track.mode = 'disabled';
          } else if (
            (track.language === norm || track.language === langCode) &&
            (track.kind === 'subtitles' || track.kind === 'captions')
          ) {
            track.mode = 'showing';
          } else {
            track.mode = 'disabled';
          }
        }
      }

      // If YouTube tech, also sync caption module
      try {
        const tech = typeof player.tech === 'function' ? player.tech({ IWillNotUseThisInPlugins: true }) : null;
        const ytPlayer = (tech as any)?.ytPlayer;
        if (ytPlayer) {
          if (typeof ytPlayer.loadModule === 'function') ytPlayer.loadModule('captions');
          if (typeof ytPlayer.setOption === 'function') {
            ytPlayer.setOption('captions', 'track', { languageCode: norm });
            ytPlayer.setOption('cc', 'track', { languageCode: norm });
          }
        }
      } catch {}
    }, []);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          if (playerRef.current) {
            return playerRef.current.play();
          }
        },
        pause: () => {
          if (playerRef.current) {
            playerRef.current.pause();
          }
        },
        togglePlay: () => {
          if (!playerRef.current) return;
          if (playerRef.current.paused()) {
            playerRef.current.play();
          } else {
            playerRef.current.pause();
          }
        },
        setMuted: (isMuted: boolean) => {
          if (playerRef.current) {
            playerRef.current.muted(isMuted);
          }
        },
        changeAudioTrack,
        changeSubtitleTrack,
        getAudioTracks: () => {
          if (!playerRef.current) return [];
          const tracks = typeof playerRef.current.audioTracks === 'function' ? playerRef.current.audioTracks() : null;
          if (!tracks) return [];
          const list: any[] = [];
          for (let i = 0; i < tracks.length; i++) {
            list.push(tracks[i]);
          }
          return list;
        },
        getCurrentAudioTrackId: () => currentTrackIdRef.current,
        getPlayer: () => playerRef.current,
      }),
      [changeAudioTrack, changeSubtitleTrack]
    );

    // Determine media source
    const effectiveSrc = React.useMemo(() => {
      if (videoId) {
        return {
          type: 'video/youtube',
          src: `https://www.youtube.com/watch?v=${videoId}`,
        };
      }
      if (src) {
        const isYt = src.includes('youtube.com') || src.includes('youtu.be');
        if (isYt) {
          return { type: 'video/youtube', src };
        }
        if (src.includes('.m3u8')) {
          return { type: 'application/x-mpegURL', src };
        }
        return { type: 'video/mp4', src };
      }
      return null;
    }, [videoId, src]);

    // Initialize or update Video.js player
    useEffect(() => {
      if (!videoRef.current || !effectiveSrc) return;

      // Create a fresh <video-js> or <video> element inside the container
      const videoElement = document.createElement('video-js');
      videoElement.className = 'vjs-fill vjs-default-skin select-none pointer-events-none';
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoRef.current.innerHTML = '';
      videoRef.current.appendChild(videoElement);

      const options = {
        autoplay: autoplay ? 'any' : false,
        controls: false, // Customized overlay controls are used by the app
        muted: muted,
        playsinline: true,
        preload: 'auto',
        responsive: true,
        fluid: false,
        fill: true,
        techOrder: ['youtube', 'html5'],
        sources: [effectiveSrc],
        youtube: {
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          enablejsapi: 1,
          hl: normalizeLangCode(audioLang),
          cc_lang_pref: normalizeLangCode(subtitleLang),
        },
      };

      const player = videojs(videoElement, options, function onPlayerReadyInternal() {
        playerRef.current = player;

        // 1. PROGRAMMATIC AUDIO TRACKS
        // Setup programmatic dub tracks for multi-language support (English, Spanish, Italian, Portuguese, Dutch)
        if (typeof (player as any).audioTracks === 'function') {
          const trackList = (player as any).audioTracks();

          // If no audio tracks exist yet from manifest/media, register programmatically
          if (trackList.length === 0) {
            const initialLang = normalizeLangCode(audioLang || 'en');

            SUPPORTED_AUDIO_DUBS.forEach((dub) => {
              const isDefault = dub.language === initialLang;
              try {
                const audioTrackConstructor = (videojs as any).AudioTrack;
                if (typeof audioTrackConstructor === 'function') {
                  const track = new audioTrackConstructor({
                    id: dub.id,
                    kind: dub.kind,
                    label: dub.label,
                    language: dub.language,
                    enabled: isDefault,
                  });
                  trackList.addTrack(track);
                  if (isDefault) {
                    currentTrackIdRef.current = dub.id;
                  }
                }
              } catch (err) {
                console.warn('[VideoJS] Error adding AudioTrack:', err);
              }
            });
          }

          // Monitor audio track changes
          trackList.on('change', function () {
            const activeList: any[] = [];
            let activeId = '';
            for (let i = 0; i < trackList.length; i++) {
              const trk = trackList[i];
              activeList.push({
                id: trk.id,
                label: trk.label || trk.language,
                language: trk.language,
                enabled: trk.enabled,
              });
              if (trk.enabled) {
                activeId = trk.id;
                currentTrackIdRef.current = trk.id;
                console.log('[VideoJS] Audio changed to: ' + trk.label);
              }
            }
            if (onAudioTracksChanged) {
              onAudioTracksChanged(activeList, activeId);
            }
          });

          // Emit initial track list
          if (onAudioTracksChanged) {
            const initialList: any[] = [];
            for (let i = 0; i < trackList.length; i++) {
              const trk = trackList[i];
              initialList.push({
                id: trk.id,
                label: trk.label || trk.language,
                language: trk.language,
                enabled: trk.enabled,
              });
            }
            onAudioTracksChanged(initialList, currentTrackIdRef.current);
          }
        }

        // Apply initial audio & subtitle track
        changeAudioTrack(audioLang);
        changeSubtitleTrack(subtitleLang);

        // Mute state
        if (typeof player.muted === 'function') {
          player.muted(muted);
        }

        // Notify ready
        if (onPlayerReady) {
          onPlayerReady(player);
        }

        // Autoplay attempt
        if (autoplay) {
          try {
            const p = player.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } catch {}
        }
      });

      // Events
      player.on('play', () => {
        if (onPlay) onPlay();
      });
      player.on('pause', () => {
        if (onPause) onPause();
      });
      player.on('ended', () => {
        if (onEnded) onEnded();
      });
      player.on('error', (err: any) => {
        console.warn('[VideoJS] Error event:', err);
        if (onError) onError(err);
      });

      return () => {
        if (player) {
          try {
            player.dispose();
          } catch {}
          playerRef.current = null;
        }
      };
    }, [effectiveSrc]);

    // Sync mute when prop changes
    useEffect(() => {
      if (playerRef.current && typeof playerRef.current.muted === 'function') {
        playerRef.current.muted(muted);
      }
    }, [muted]);

    // Sync audio language when prop changes
    useEffect(() => {
      if (playerRef.current) {
        changeAudioTrack(audioLang);
      }
    }, [audioLang, changeAudioTrack]);

    // Sync subtitle language when prop changes
    useEffect(() => {
      if (playerRef.current) {
        changeSubtitleTrack(subtitleLang);
      }
    }, [subtitleLang, changeSubtitleTrack]);

    return (
      <div
        data-vjs-player
        className={`relative w-full h-full overflow-hidden flex items-center justify-center bg-black ${className}`}
      >
        <div ref={videoRef} className="w-full h-full flex items-center justify-center pointer-events-none" />
      </div>
    );
  }
);
