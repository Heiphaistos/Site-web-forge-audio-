// Téléchargements de bureau : les liens du HTML pointent déjà vers les fichiers d'une release réelle (repli) ;
// si l'API GitHub répond, ils passent aux fichiers de la dernière release. Jamais vers une page web.
// L'API n'est appelée que sur les pages qui ont de tels liens.
if (document.querySelector('a[data-asset]')) {
  fetch('https://api.github.com/repos/Heiphaistos/Forge-audio-/releases/latest')
    .then((r) => (r.ok ? r.json() : null))
    .then((rel) => {
      if (!rel || !Array.isArray(rel.assets)) return;
      for (const a of document.querySelectorAll('a[data-asset]')) {
        const asset = rel.assets.find((x) => x.name.endsWith(a.dataset.asset));
        if (!asset) continue;
        a.href = asset.browser_download_url;
        const size = a.querySelector('small');
        if (size) size.textContent = `${Math.round(asset.size / 1048576)} Mo`;
      }
      if (rel.tag_name) for (const v of document.querySelectorAll('[data-desk-version]')) v.textContent = rel.tag_name.replace(/^v/, '');
    })
    .catch(() => {});
}

// Système du visiteur : sa carte passe en premier (page Télécharger) ; sur Mac, le bon bouton est mis en avant.
(() => {
  const ua = navigator.userAgent;
  const touchMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1; // iPadOS se présente comme un Mac
  const os = /Android/i.test(ua) ? 'android'
    : /iPhone|iPad|iPod/.test(ua) || touchMac ? 'ios'
    : /Windows/.test(ua) ? 'windows'
    : /Macintosh|Mac OS X/.test(ua) ? 'macos'
    : /Linux|X11|CrOS/.test(ua) ? 'linux' : '';
  const names = { android: 'Android', ios: 'iPhone / iPad', windows: 'Windows', macos: 'macOS', linux: 'Linux' };
  const card = os && document.querySelector(`[data-os="${os}"]`);
  if (card) {
    card.classList.add('is-you');
    card.parentElement.prepend(card);
    const out = document.querySelector('.detected');
    if (out) out.textContent = `Vous semblez être sur ${names[os]} : la carte correspondante est en premier.`;
  }
  // Puce du Mac : seuls les navigateurs Chromium la donnent ; Safari ne la dit pas, le visiteur choisit.
  if (os === 'macos' && navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    navigator.userAgentData.getHighEntropyValues(['architecture']).then((h) => {
      const want = h.architecture === 'arm' ? 'mac-arm64.dmg' : h.architecture === 'x86' ? 'mac-x64.dmg' : '';
      const btn = want && document.querySelector(`a[data-asset="${want}"]`);
      if (btn) btn.classList.add('btn-fire');
    }).catch(() => {});
  }
})();
