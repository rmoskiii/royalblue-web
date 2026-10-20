/** Open a blob URL from an async fetch. `window.open` after `await` is blocked. */
export async function openFetchedBlob(load: () => Promise<string>) {
  const tab = window.open('about:blank', '_blank');
  try {
    const url = await load();
    if (tab && !tab.closed) {
      tab.location.replace(url);
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
  } catch (error) {
    tab?.close();
    throw error;
  }
}
