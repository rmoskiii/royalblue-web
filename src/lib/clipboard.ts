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

export async function copyImage(blob: Blob) {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    throw new Error('Image clipboard is not available');
  }
  await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
}

/** Share a file (Mail on iOS/Android), else copy the image, else open a mailto draft. */
export async function shareFileOrCopyImage(input: {
  title: string;
  text: string;
  file: File;
}): Promise<'shared' | 'copied' | 'emailed' | 'cancelled'> {
  const { title, text, file } = input;
  try {
    if (typeof navigator.share === 'function') {
      const payload: ShareData = { title, text, files: [file] };
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
  try {
    await copyImage(file);
    return 'copied';
  } catch {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    return 'emailed';
  }
}
