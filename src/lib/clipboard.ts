/** Copy text, falling back to a hidden textarea where the Clipboard API is blocked. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
  }
}

/** System share sheet, or copy if the browser cannot share. */
export async function shareOrCopy(
  title: string,
  text: string,
): Promise<'shared' | 'copied' | 'cancelled'> {
  const payload: ShareData = { title, text };
  try {
    if (typeof navigator.share === 'function') {
      if (typeof navigator.canShare !== 'function' || navigator.canShare(payload)) {
        await navigator.share(payload);
        return 'shared';
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return 'cancelled';
    }
  }
  await copyText(`${title}\n${text}`);
  return 'copied';
}

export function saveFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/**
 * Share a file through the system sheet (Mail, Files, Photos).
 * File only — no caption text, so Mail/WhatsApp do not paste a hybrid body.
 */
export async function shareFile(input: {
  title: string;
  file: File;
}): Promise<'shared' | 'saved' | 'cancelled'> {
  const { title, file } = input;
  // Desktop Chrome/Safari often accept canShare(PDF) then never resolve share().
  if (file.type === 'application/pdf') {
    saveFile(file);
    return 'saved';
  }
  const filesOnly: ShareData = { files: [file] };
  const withTitle: ShareData = { title, files: [file] };
  try {
    if (typeof navigator.share === 'function') {
      const payload =
        typeof navigator.canShare === 'function'
          ? navigator.canShare(withTitle)
            ? withTitle
            : navigator.canShare(filesOnly)
              ? filesOnly
              : undefined
          : withTitle;
      if (payload) {
        const result = await Promise.race([
          navigator.share(payload).then(() => 'shared' as const),
          new Promise<'timeout'>((resolve) => window.setTimeout(() => resolve('timeout'), 8_000)),
        ]);
        if (result === 'shared') return 'shared';
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return 'cancelled';
    }
  }
  saveFile(file);
  return 'saved';
}
