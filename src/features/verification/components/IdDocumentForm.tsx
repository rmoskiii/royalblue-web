import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { verificationService } from '@/api/services/verification';
import type { IdDocumentSubmission, IdDocumentType } from '@/api/types';
import { Button, SelectField, TextField } from '@/components/ui';
import { CameraCapture, releaseActiveCamera } from './CameraCapture';

const idTypes: { value: IdDocumentType; label: string; placeholder: string }[] = [
  { value: 'voters-card', label: 'Voter’s card', placeholder: 'VIN' },
  { value: 'passport', label: 'International passport', placeholder: 'Passport number' },
  { value: 'drivers-licence', label: 'Driver’s licence', placeholder: 'Licence number' },
  { value: 'nin-slip', label: 'NIN slip', placeholder: '11-digit NIN' },
];

function needsIdFallback(message: string) {
  return /photograph your original id/i.test(message);
}

/** Live selfie first (match BVN/NIN photo). Physical ID only if that match fails. */
export function IdDocumentForm({
  onDone,
  onSkip,
  persist = true,
  canMatchOnFile = true,
}: {
  onDone: (payload: IdDocumentSubmission) => void;
  onSkip?: () => void;
  persist?: boolean;
  canMatchOnFile?: boolean;
}) {
  const [type, setType] = useState<IdDocumentType>('nin-slip');
  const [number, setNumber] = useState('');
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [requireId, setRequireId] = useState(!canMatchOnFile);
  const current = idTypes.find((t) => t.value === type) ?? idTypes[0];

  const submit = useMutation({
    mutationFn: async () => {
      const payload: IdDocumentSubmission = {
        type,
        number,
        selfie: selfie as File,
        documentImage: documentImage ?? undefined,
      };
      if (persist) await verificationService.submitIdDocument(payload);
      return payload;
    },
    onSuccess: (payload) => {
      releaseActiveCamera();
      onDone(payload);
    },
    onError: (error: Error) => {
      if (needsIdFallback(error.message)) setRequireId(true);
    },
  });
  const ready = Boolean(selfie) && (!requireId || (number.trim().length >= 6 && documentImage));

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) submit.mutate();
      }}
    >
      <CameraCapture
        label="Live selfie"
        hint="Use the webcam, look at the lens, and stay in the frame. We confirm you are present, then match this to your BVN or NIN photo."
        facing="user"
        value={selfie}
        onChange={setSelfie}
      />
      {requireId && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="ID type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as IdDocumentType);
                setNumber('');
              }}
              options={idTypes}
            />
            <TextField
              label="ID number"
              autoComplete="off"
              placeholder={current.placeholder}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
          <CameraCapture
            label="Photo of your ID"
            hint="Place the front of your original ID flat, in good light. Do not use a screenshot."
            facing="environment"
            value={documentImage}
            onChange={setDocumentImage}
          />
        </>
      )}
      {submit.isError && (
        <p className="rounded-tile bg-amber-500/10 px-4 py-3 text-[13px] text-amber-900 dark:text-amber-200">
          {submit.error.message}
        </p>
      )}
      <Button type="submit" className="justify-self-start" disabled={!ready || submit.isPending}>
        {submit.isPending ? 'Checking your selfie…' : persist ? 'Submit selfie' : 'Continue'}
      </Button>
      {onSkip && (
        <button
          type="button"
          className="justify-self-start text-sm font-medium text-ink-2"
          onClick={() => {
            releaseActiveCamera();
            onSkip();
          }}
        >
          Skip for now — finish later in Account limits
        </button>
      )}
    </form>
  );
}
