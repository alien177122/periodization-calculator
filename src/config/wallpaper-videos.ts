export interface WallpaperClip {
  video: string;
  poster: string;
  posterAvif: string;
}

/** Compressed WebM + posters in `public/wallpapers/`. Masters stay in `assets/wallpapers-src/`. */
export const WALLPAPER_CLIPS: readonly WallpaperClip[] = [
  {
    video: 'wallpapers/tiktok-1.webm',
    poster: 'wallpapers/tiktok-1.webp',
    posterAvif: 'wallpapers/tiktok-1.avif',
  },
  {
    video: 'wallpapers/tiktok-2.webm',
    poster: 'wallpapers/tiktok-2.webp',
    posterAvif: 'wallpapers/tiktok-2.avif',
  },
  {
    video: 'wallpapers/tiktok-3.webm',
    poster: 'wallpapers/tiktok-3.webp',
    posterAvif: 'wallpapers/tiktok-3.avif',
  },
];
