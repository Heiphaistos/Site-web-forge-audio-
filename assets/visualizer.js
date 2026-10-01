// Visualiseur simulé du héros : spectre (canvas 2D) + forme d'onde (SVG). Aucun son, aucun autoplay.
// Boucle limitée à 30 i/s, arrêtée hors écran et onglet caché ; mouvement réduit = une image fixe.
(() => {
  const hero = document.querySelector('.hero');
  const cv = hero && hero.querySelector('.spectrum');
  const paths = hero ? hero.querySelectorAll('.wave path') : [];
  if (!cv || !paths.length || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BEAT = 60000 / 104; // tempo simulé
  const REST = 0.55, HOT = 1;
  let W = 0, H = 0, N = 0, vals, peaks, fill;
  let energy = REST, target = REST, visible = true, raf = 0, last = 0;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    N = Math.max(24, Math.min(96, Math.round(W / 20)));
    vals = new Float32Array(N); peaks = new Float32Array(N);
    fill = ctx.createLinearGradient(0, H, 0, 0);
    fill.addColorStop(0, 'rgba(215, 38, 61, .35)');
    fill.addColorStop(0.2, 'rgba(255, 106, 26, .85)');
    fill.addColorStop(0.55, 'rgba(255, 179, 71, .95)');
  }

  // Spectre plausible : plus de graves, grosse caisse qui décroît, attaque rapide et relâche lente.
  function step(t, smooth) {
    const kick = Math.pow(1 - (t % BEAT) / BEAT, 3);
    const breath = 0.82 + 0.18 * Math.sin(t * 0.00105); // respiration lente (~6 s)
    for (let i = 0; i < N; i++) {
      const x = Math.abs(i - (N - 1) / 2) / ((N - 1) / 2); // symétrique : graves au centre, aigus aux bords
      const k = Math.round(x * 40);
      const n = 0.5 + 0.5 * Math.sin(t * 0.0021 * (1 + k * 0.13) + k * 1.7 + (i < N / 2 ? 0 : 0.9)) * Math.sin(t * 0.0013 + k * 0.6);
      const low = x < 0.25 ? kick * (1 - x / 0.25) : 0;
      const v = Math.min(1, (0.06 + 0.8 * Math.pow(n, 1.6) * (1 - x * 0.6) + 0.6 * low) * energy * breath * 1.25);
      vals[i] = smooth ? vals[i] + (v - vals[i]) * (v > vals[i] ? 0.6 : 0.2) : v;
      peaks[i] = Math.max(vals[i], peaks[i] - 0.015);
    }
    return kick;
  }

  function draw(t, smooth) {
    const kick = step(t, smooth);
    const gap = W / N * 0.32, bw = W / N - gap, top = H * 0.94;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < N; i++) {
      const x = i * (bw + gap) + gap / 2, h = vals[i] * top;
      ctx.globalAlpha = 1 - Math.pow(Math.abs(i - (N - 1) / 2) / ((N - 1) / 2), 1.5) * 0.8; // s'efface vers les bords
      ctx.fillStyle = fill; ctx.fillRect(x, H - h, bw, h);
      ctx.fillStyle = '#ffb347'; ctx.fillRect(x, H - peaks[i] * top - 5, bw, 2);
    }
    ctx.globalAlpha = 1;
    // Forme d'onde : enveloppe en fuseau, amplitude qui suit l'énergie et la grosse caisse.
    let d = '';
    const amp = 22 * energy * (0.55 + 0.45 * kick);
    for (let j = 0; j <= 80; j++) {
      const env = Math.sin(Math.PI * j / 80);
      const s = Math.sin(j * 0.5 - t * 0.011) * 0.55 + Math.sin(j * 1.31 - t * 0.019) * 0.3 + Math.sin(j * 0.17 + t * 0.004) * 0.35;
      d += (j ? 'L' : 'M') + (j * 5) + ' ' + (30 + env * amp * s).toFixed(1);
    }
    for (const p of paths) p.setAttribute('d', d);
  }

  function loop(t) {
    raf = 0;
    if (t - last >= 33) { last = t; energy += (target - energy) * 0.12; draw(t, true); }
    if (visible && !document.hidden) raf = requestAnimationFrame(loop);
  }
  const run = () => { if (!raf && !calm && visible && !document.hidden) raf = requestAnimationFrame(loop); };

  function init() {
    size();
    draw(1200, false); // première image immédiate (et seule image si mouvement réduit)
    if (calm) return;
    new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; run(); }).observe(hero);
    document.addEventListener('visibilitychange', run);
    // Les boutons font « monter le son » du visualiseur.
    for (const b of document.querySelectorAll('.btn')) {
      b.addEventListener('pointerenter', () => { target = HOT; });
      b.addEventListener('pointerleave', () => { target = REST; });
      b.addEventListener('focus', () => { target = HOT; });
      b.addEventListener('blur', () => { target = REST; });
    }
  }
  new ResizeObserver(() => { if (W) { size(); draw(performance.now(), false); } }).observe(cv);
  if (document.readyState === 'complete') init(); else addEventListener('load', init);
})();
