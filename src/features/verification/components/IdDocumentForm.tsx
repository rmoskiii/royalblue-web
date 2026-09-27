import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { verificationService } from '@/api/services/verification';
import type { IdDocumentType } from '@/api/types';
import { Button, SelectField, TextField } from '@/components/ui';
import { CameraCapture } from './CameraCapture';

const idTypes: { value: IdDocumentType; label: string; placeholder: string }[] = [
  { value: 'voters-card', label: 'Voter’s card', placeholder: 'VIN' },
  { value: 'passport', label: 'International passport', placeholder: 'Passport number' },
  { value: 'drivers-licence', label: 'Driver’s licence', placeholder: 'Licence number' },
  { value: 'nin-slip', label: 'NIN slip', placeholder: '11-digit NIN' },
];

/** ID number, a photo of the document, and a selfie to match it (PRD View 6). */
export function IdDocumentForm({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<IdDocumentType>('voters-card');
  const [number, setNumber] = useState('');
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const current = idTypes.find((t) => t.value === type) ?? idTypes[0];

  const submit = useMutation({
    mutationFn: () =>
      verificationService.submitIdDocument({
        type,
        number,
        documentImage: documentImage as File,
        selfie: selfie as File,
      }),
    onSuccess: onDone,
  });
  const ready = number.trim().length >= 6 && documentImage && selfie;

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) submit.mutate();
      }}
    >
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
      <div className="grid gap-4 sm:grid-cols-2">
        <CameraCapture
          label="Photo of your ID"
          hint="Place the front of your ID flat, in good light."
          facing="environment"
          value={documentImage}
          onChange={setDocumentImage}
        />
        <CameraCapture
          label="Selfie"
          hint="Face the camera with nothing covering your face."
          facing="user"
          value={selfie}
          onChange={setSelfie}
        />
      </div>
      {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
      <Button type="submit" className="justify-self-start" disabled={!ready || submit.isPending}>
        {submit.isPending ? 'Uploading…' : 'Submit ID'}
      </Button>
    </form>
  );
}
