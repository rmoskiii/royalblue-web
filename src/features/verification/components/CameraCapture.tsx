import { Camera, ImageUp, RefreshCw } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

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
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  };
  useEffect(() => stop, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false,
      });
      streamRef.current = stream;
      setLive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setError('We couldn’t open your camera. Allow camera access, or upload a photo instead.');
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (facing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob)
          onChange(
            new File([blob], `${facing === 'user' ? 'selfie' : 'document'}.jpg`, {
              type: 'image/jpeg',
            }),
          );
        stop();
      },
      'image/jpeg',
      0.9,
    );
  };

  return (
    <div className="grid gap-2">
      <p className="text-[13px] font-medium text-ink-2">{label}</p>
      <div
        className={cn(
          'relative grid aspect-[4/3] max-w-full place-items-center overflow-hidden rounded-tile border-[1.5px] border-dashed border-surface-3 bg-surface-2',
          (live || preview) && 'border-solid border-line',
        )}
      >
        {live ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn('size-full object-cover', facing === 'user' && '-scale-x-100')}
          />
        ) : preview ? (
          <img src={preview} alt={label} className="size-full object-cover" />
        ) : (
          <div className="grid justify-items-center gap-1 px-4 text-center text-[13px] text-ink-3">
            <Camera className="size-6" />
            {hint}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {live ? (
          <>
            <Button onClick={capture}>
              <Camera className="size-4" /> Take photo
            </Button>
            <Button variant="secondary" onClick={stop}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={start}>
              {value ? <RefreshCw className="size-4" /> : <Camera className="size-4" />}
              {value ? 'Retake' : 'Use camera'}
            </Button>
            <label htmlFor={inputId} className="cursor-pointer">
              <span className="inline-flex h-10 items-center gap-2 rounded-field bg-surface-2 px-4 font-medium hover:bg-surface-3">
                <ImageUp className="size-4" /> Upload photo
              </span>
            </label>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              capture={facing}
              className="sr-only"
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
          </>
        )}
      </div>
      {error && <p className="text-xs text-primary-text">{error}</p>}
    </div>
  );
}
