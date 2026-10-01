// Desktop downloads: point the buttons at the files of the latest release (asset names carry the version).
fetch('https://api.github.com/repos/Heiphaistos/Forge-audio-/releases/latest')
  .then((r) => (r.ok ? r.json() : null))
  .then((rel) => {
    if (!rel || !Array.isArray(rel.assets)) return;
    for (const a of document.querySelectorAll('a[data-asset]')) {
      const asset = rel.assets.find((x) => x.name.endsWith(a.dataset.asset));
      if (asset) a.href = asset.browser_download_url;
    }
    const v = document.getElementById('desk-version');
    if (v && rel.tag_name) v.textContent = `Version de bureau ${rel.tag_name.replace(/^v/, '')}.`;
  })
  .catch(() => {});
