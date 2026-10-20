(function () {
  try {
    var saved = localStorage.getItem('rb.theme');
    var theme =
      saved === 'light' || saved === 'dark'
        ? saved
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
