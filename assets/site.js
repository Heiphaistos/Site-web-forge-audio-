// Animated equalizer (the logo's bars).
const eq = document.querySelector('.eq');
for (let i = 0; i < 28; i++) {
  const b = document.createElement('i');
  b.style.animationDelay = `${(-Math.random() * 1.2).toFixed(2)}s`;
  b.style.animationDuration = `${(0.7 + Math.random() * 0.9).toFixed(2)}s`;
  eq.append(b);
}
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
