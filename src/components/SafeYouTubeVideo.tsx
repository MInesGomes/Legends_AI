import { VideoJsPlayer, type VideoJsPlayerProps, type VideoJsPlayerHandle } from './VideoJsPlayer';

export { VideoJsPlayer, type VideoJsPlayerProps, type VideoJsPlayerHandle };
export type YouTubeAdapter = VideoJsPlayerHandle;
export const SafeYouTubeVideo = VideoJsPlayer;
export type SafeYouTubeVideoProps = VideoJsPlayerProps;
export default VideoJsPlayer;
