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
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title, text });
      return 'shared';
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return 'cancelled';
    }
  }
  await copyText(text);
  return 'copied';
}
