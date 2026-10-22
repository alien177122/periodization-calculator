import {useCallback, useEffect, useRef, useState} from 'react';
import {WALLPAPER_CLIPS} from '../../config/wallpaper-videos';
import {useWallpaperOverlayGate} from '../../hooks/useWallpaperOverlayGate';
import {useReducedMotion} from '../../hooks/useReducedMotion';
import {publicAsset} from '../../utils/publicAsset';
import '../../styles/components/app/app-wallpaper-video.css';

interface AppWallpaperVideoProps {
  /** When false, playback stops (logged-in shell uses ambient canvas). */
  active?: boolean;
}

type NetworkConnection = {
  type?: string;
  saveData?: boolean;
};

function canEagerLoadOnWifi(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as Navigator & {connection?: NetworkConnection}).connection;
  if (!conn || conn.saveData) return false;
  return conn.type === 'wifi' || conn.type === 'ethernet';
}

export function AppWallpaperVideo({active = true}: AppWallpaperVideoProps) {
  const reduced = useReducedMotion();
  const audioAllowed = useWallpaperOverlayGate(active && !reduced);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [gestureUnlocked, setGestureUnlocked] = useState(false);
  const [mediaEnabled, setMediaEnabled] = useState(false);

  const clip = WALLPAPER_CLIPS[index] ?? WALLPAPER_CLIPS[0];
  const videoSrc = publicAsset(clip.video);
  const posterSrc = publicAsset(clip.poster);
  const posterAvif = publicAsset(clip.posterAvif);

  const tryPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !active || reduced || !mediaEnabled) return;
    const wantSound = audioAllowed && gestureUnlocked;
    video.muted = !wantSound;
    try {
      await video.play();
    } catch {
      video.muted = true;
      try {
        await video.play();
      } catch {
        /* autoplay blocked — wait for user gesture */
      }
    }
  }, [active, audioAllowed, gestureUnlocked, mediaEnabled, reduced]);

  useEffect(() => {
    if (!active || reduced) return;

    let idleId = 0;
    let timeoutId = 0;
    const enableIfWifi = () => {
      if (canEagerLoadOnWifi()) setMediaEnabled(true);
    };
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(enableIfWifi, {timeout: 1500});
    } else {
      timeoutId = window.setTimeout(enableIfWifi, 0);
    }

    const unlock = () => {
      setGestureUnlocked(true);
      setMediaEnabled(true);
    };
    document.addEventListener('pointerdown', unlock, {passive: true});
    document.addEventListener('keydown', unlock);
    return () => {
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, [active, reduced]);

  useEffect(() => {
    if (!mediaEnabled) return;
    void tryPlay();
  }, [tryPlay, mediaEnabled, videoSrc, index]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active || reduced) {
      video.pause();
      video.muted = true;
      return;
    }
    video.muted = !(audioAllowed && gestureUnlocked);
  }, [active, audioAllowed, gestureUnlocked, reduced]);

  if (!active || reduced) return null;

  return (
    <div className="app-wallpaper-video" aria-hidden="true">
      <picture className="app-wallpaper-video__poster">
        <source type="image/avif" srcSet={posterAvif} />
        <img
          className="app-wallpaper-video__media"
          src={posterSrc}
          alt=""
          decoding="async"
          fetchPriority="low"
        />
      </picture>
      {mediaEnabled ? (
        <video
          ref={videoRef}
          className="app-wallpaper-video__media"
          src={videoSrc}
          poster={posterSrc}
          playsInline
          muted
          preload="none"
          onEnded={() => setIndex(current => (current + 1) % WALLPAPER_CLIPS.length)}
        />
      ) : null}
      <div className="app-wallpaper-video__scrim" />
    </div>
  );
}
