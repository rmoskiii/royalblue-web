import { Camera, ImageUp, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { compressKycImage } from '@/lib/compressImage';
import { cn } from '@/lib/cn';

let stopActiveCamera: (() => void) | null = null;

/** Chrome on macOS keeps the camera LED on until tracks stop and the <video> drops srcObject. */
export function releaseActiveCamera() {
  stopActiveCamera?.();
}

function isMobile() {
  return typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

function detachVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
  video.srcObject = null;
  video.removeAttribute('src');
  video.load();
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop());
}

/**
 * Take a photo with the webcam (HTML5 getUserMedia), or upload one instead
 * (PRD View 6). Needs HTTPS or localhost for camera access.
 */
export function CameraCapture({
  label,
  hint,
  facing,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  /** 'user' = front camera (selfie), 'environment' = back camera (documents) */
  facing: 'user' | 'environment';
  value: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraTries, setCameraTries] = useState(0);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const kind = facing === 'user' ? 'selfie' : 'document';
  const allowUpload = kind !== 'selfie' || cameraUnavailable || cameraTries >= 2;

  const preview = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const stop = useCallback(() => {
    detachVideo(videoRef.current);
    const stream = streamRef.current;
    streamRef.current = null;
    if (stopActiveCamera === stop) stopActiveCamera = null;
    stopTracks(stream);
    setLive(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const onLeave = () => stop();
    window.addEventListener('pagehide', onLeave);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('pagehide', onLeave);
      stop();
    };
  }, [stop]);

  useEffect(() => {
    if (kind !== 'selfie' || !navigator.mediaDevices?.enumerateDevices) {
      if (kind === 'selfie' && !navigator.mediaDevices?.getUserMedia) setCameraUnavailable(true);
      return;
    }
    void navigator.mediaDevices.enumerateDevices().then((devices) => {
      if (!mountedRef.current) return;
      if (!devices.some((d) => d.kind === 'videoinput')) setCameraUnavailable(true);
    });
  }, [kind]);

  useEffect(() => {
    if (live && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [live]);

  const setFile = async (file: File | null) => {
    if (!file) {
      onChange(null);
      return;
    }
    try {
      onChange(await compressKycImage(file, kind));
    } catch {
      onChange(file);
    }
  };

  const start = async () => {
    setError(null);
    stopActiveCamera?.();
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraUnavailable(true);
      setError('This device has no camera. Upload a photo instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      if (!mountedRef.current) {
        stopTracks(stream);
        return;
      }
      streamRef.current = stream;
      stopActiveCamera = stop;
      setCameraTries((n) => n + 1);
      setLive(true);
    } catch {
      setCameraUnavailable(true);
      setError('We couldn’t open your camera. Allow camera access, or upload a photo instead.');
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (facing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          void setFile(
            new File([blob], `${kind}.jpg`, {
              type: 'image/jpeg',
            }),
          );
        }
        stop();
      },
      'image/jpeg',
      0.82,
    );
  };

  return (
    <div className="grid gap-2">
      <p className="text-[13px] font-medium text-ink-2">{label}</p>
      <div
        className={cn(
          'relative isolate aspect-[4/3] w-full max-w-md overflow-hidden rounded-tile border-[1.5px] border-dashed border-surface-3 bg-surface-2',
          (live || preview) && 'border-solid border-line',
        )}
      >
        {live ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              'absolute inset-0 size-full object-cover',
              facing === 'user' && '-scale-x-100',
            )}
          />
        ) : preview ? (
          <img src={preview} alt={label} className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center justify-items-center gap-1 px-4 text-center text-[13px] break-words text-ink-3">
            <Camera className="size-6" />
            {hint}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
        {live ? (
          <>
            <Button className="max-sm:w-full" onClick={capture}>
              <Camera className="size-4" /> Take photo
            </Button>
            <Button variant="secondary" className="max-sm:w-full" onClick={stop}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" className="max-sm:w-full" onClick={() => void start()}>
              {value ? <RefreshCw className="size-4" /> : <Camera className="size-4" />}
              {value ? 'Retake' : 'Use camera'}
            </Button>
            {allowUpload && (
              <>
                <label htmlFor={inputId} className="max-sm:w-full cursor-pointer">
                  <span className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-field bg-surface-2 px-4 font-medium hover:bg-surface-3 sm:w-auto">
                    <ImageUp className="size-4" /> Upload photo
                  </span>
                </label>
                <input
                  id={inputId}
                  type="file"
                  accept="image/*"
                  capture={isMobile() ? facing : undefined}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    e.target.value = '';
                    void setFile(file);
                  }}
                />
              </>
            )}
          </>
        )}
      </div>
      {error && <p className="text-xs text-primary-text">{error}</p>}
    </div>
  );
}
