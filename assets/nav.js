// Menu mobile (sans JavaScript, le pied de page garde tous les liens) : bouton accessible (aria-expanded), Échap ferme et rend le focus, un clic sur un lien ferme.
document.documentElement.classList.add('js');
(() => {
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('site-nav');
  if (!btn || !nav) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('.label').textContent = open ? 'Fermer' : 'Menu';
    nav.classList.toggle('open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
  });
  matchMedia('(min-width: 1061px)').addEventListener('change', (m) => { if (m.matches) set(false); });
})();
