import React, { Component, forwardRef, useMemo } from 'react';
import {
  YouTubeVideo,
  type YouTubeVideoProps,
  type YouTubeAdapter,
} from '@videojs/react/media/youtube-video';
import { YouTubeAdapter as CoreYouTubeAdapter } from '@videojs/youtube-video';

// Patch YouTubeAdapter.prototype.detach once so YT.Player.destroy() never removes
// the React-managed <iframe> node from its parent before React's own unmount phase
// calls parentNode.removeChild(iframe).
const PATCH_SYMBOL = Symbol.for('legend.youtubeAdapterDetachPatched');
if (!(CoreYouTubeAdapter.prototype as any)[PATCH_SYMBOL]) {
  (CoreYouTubeAdapter.prototype as any)[PATCH_SYMBOL] = true;
  const originalDetach = CoreYouTubeAdapter.prototype.detach;

  CoreYouTubeAdapter.prototype.detach = function patchedDetach(this: CoreYouTubeAdapter) {
    const target = this.target;
    const parent = target?.parentNode;
    const nextSibling = target?.nextSibling ?? null;

    if (target && parent) {
      const originalRemoveChild = parent.removeChild;
      parent.removeChild = function <T extends Node>(child: T): T {
        if ((child as unknown) === target) {
          return child;
        }
        return originalRemoveChild.call(this, child) as T;
      };
      try {
        originalDetach.call(this);
      } catch {
        // Ignore errors from third-party YT.Player.destroy()
      } finally {
        parent.removeChild = originalRemoveChild;
      }

      if (target.parentNode !== parent) {
        try {
          parent.insertBefore(target, nextSibling);
        } catch {}
      }
      return;
    }

    try {
      originalDetach.call(this);
    } catch {}
  };
}

interface BoundaryProps {
  resetKey: string;
  children: React.ReactNode;
}

interface BoundaryState {
  hasError: boolean;
  retryCount: number;
}

class YouTubeErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
  declare props: Readonly<BoundaryProps>;
  state: BoundaryState = {
    hasError: false,
    retryCount: 0,
  };

  constructor(props: BoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(): Partial<BoundaryState> {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: BoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      (this as any).setState({ hasError: false });
    } else if (this.state.hasError && this.state.retryCount < 2) {
      (this as any).setState((prev: BoundaryState) => ({
        hasError: false,
        retryCount: prev.retryCount + 1,
      }));
    }
  }

  componentDidCatch() {
    // Recover automatically if an iframe lifecycle error occurs
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
    return <React.Fragment key={this.state.retryCount}>{this.props.children}</React.Fragment>;
  }
}

export type SafeYouTubeVideoProps = YouTubeVideoProps & {
  instanceKey?: string;
};

export const SafeYouTubeVideo = forwardRef<HTMLIFrameElement, SafeYouTubeVideoProps>(
  function SafeYouTubeVideo({ instanceKey, source, src, ...restProps }, ref) {
    // Freeze `source` for the lifetime of this mounted instance (keyed by `instanceKey`)
    // so @videojs/react's `useSyncProps` never triggers synchronous DOM detach/re-insert
    // during React's render phase.
    const stableSource = useMemo(() => source, [instanceKey]);
    const effectiveSrc = stableSource?.src ? undefined : src;

    return (
      <YouTubeErrorBoundary resetKey={instanceKey || String(src || stableSource?.src || '')}>
        <YouTubeVideo
          key={instanceKey}
          ref={ref}
          src={effectiveSrc}
          source={stableSource}
          {...restProps}
        />
      </YouTubeErrorBoundary>
    );
  }
);

export type { YouTubeAdapter };
