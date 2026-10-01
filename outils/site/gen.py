# Assemble les pages du site Forge Audio : en-tête, navigation et pied de page communs autour de chaque corps (src/*.html).
import html, pathlib, re, sys

SRC = pathlib.Path(__file__).parent / 'src'
OUT = pathlib.Path(__file__).resolve().parents[2]  # racine du depot
V = '20261001c'
BASE = 'https://forgeaudio.heiphaistos.org'
PLAYER = 'https://connect.forgeaudio.heiphaistos.org/'

NAV = [('accueil', '/', 'Accueil'), ('fonctionnalites', '/fonctionnalites.html', 'Fonctionnalités'),
       ('telecharger', '/telecharger.html', 'Télécharger'), ('nouveautes', '/nouveautes.html', 'Nouveautés'),
       ('faq', '/faq.html', 'FAQ'), ('aide', '/aide.html', 'Aide')]
PLATFORMS = [('windows', 'Windows'), ('macos', 'macOS'), ('linux', 'Linux'), ('android', 'Android'), ('ios', 'iPhone / iPad')]


def meta_of(text):
    m = re.match(r'<!--meta\n(.*?)\n-->\n', text, re.S)
    meta = dict(line.split(': ', 1) for line in m.group(1).splitlines())
    return meta, text[m.end():]


def header(nav_key, exact):
    items = []
    for key, href, label in NAV:
        cur = ''
        if key == nav_key:
            cur = ' aria-current="page"' if exact else ' aria-current="true"'
        items.append(f'<li><a href="{href}"{cur}>{label}</a></li>')
    return f'''  <a class="skip" href="#contenu">Aller au contenu</a>
  <header class="site-header">
    <div class="full bar">
      <a class="brand" href="/"><img src="/assets/icon.svg" alt="" width="30" height="30" /> <span>Forge <span class="grad">Audio</span></span><span class="sr-only"> : accueil</span></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav"><svg class="burger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><svg class="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg><span class="label">Menu</span></button>
      <nav id="site-nav" class="nav" aria-label="Navigation principale">
        <ul>
          {chr(10).join('          ' + i for i in items).strip()}
        </ul>
        <a class="btn btn-fire btn-sm" href="{PLAYER}">Ouvrir le lecteur</a>
      </nav>
    </div>
  </header>'''


def crumbs(spec, title):
    if not spec:
        return ''
    parts = ['<li><a href="/">Accueil</a></li>']
    for p in spec.split('|'):
        if '=' in p:
            label, href = p.split('=', 1)
            parts.append(f'<li><a href="{href}">{label}</a></li>')
        else:
            parts.append(f'<li><span aria-current="page">{p}</span></li>')
    return '<nav class="crumbs" aria-label="Fil d’Ariane"><ol>' + ''.join(parts) + '</ol></nav>'


def platforms(cur):
    lis = ''.join(f'<li><a href="/{k}.html"{" aria-current=\"page\"" if k == cur else ""}>{n}</a></li>' for k, n in PLATFORMS)
    return f'<ul class="platforms" aria-label="Autres plateformes">{lis}</ul>'


FOOTER = f'''  <footer class="site-footer">
    <div class="wrap">
      <div class="foot">
        <div>
          <a class="brand" href="/"><img src="/assets/icon.svg" alt="" width="30" height="30" /> <span>Forge <span class="grad">Audio</span></span></a>
          <p>Lecteur musical sans publicité, sur le web, le téléphone et l'ordinateur. Projet personnel, code ouvert sous licence MIT.</p>
        </div>
        <div>
          <h2>Produit</h2>
          <ul>
            <li><a href="/fonctionnalites.html">Fonctionnalités</a></li>
            <li><a href="/nouveautes.html">Nouveautés</a></li>
            <li><a href="{PLAYER}">Ouvrir le lecteur</a></li>
            <li><a href="https://github.com/Heiphaistos/Forge-audio-">Code source</a></li>
          </ul>
        </div>
        <div>
          <h2>Télécharger</h2>
          <ul>
            <li><a href="/windows.html">Windows</a></li>
            <li><a href="/macos.html">macOS</a></li>
            <li><a href="/linux.html">Linux</a></li>
            <li><a href="/android.html">Android</a></li>
            <li><a href="/ios.html">iPhone et iPad</a></li>
          </ul>
        </div>
        <div>
          <h2>Aide</h2>
          <ul>
            <li><a href="/faq.html">Questions fréquentes</a></li>
            <li><a href="/aide.html">Aide et contact</a></li>
            <li><a href="/mentions-legales.html">Mentions légales</a></li>
            <li><a href="/confidentialite.html">Confidentialité</a></li>
          </ul>
        </div>
      </div>
      <p class="copy">© 2026 Forge Audio · Heiphaistos. Aucun cookie, aucune publicité, aucune mesure d'audience.</p>
    </div>
  </footer>'''


def build(path):
    meta, body = meta_of(path.read_text(encoding='utf-8'))
    name = path.stem
    url = BASE + ('/' if name == 'index' else f'/{name}.html')
    nav_key = meta.get('nav', '')
    body = body.replace('{{crumbs}}', crumbs(meta.get('crumbs', ''), meta['title']))
    body = body.replace('{{platforms}}', platforms(name))
    scripts = [f'  <script src="/assets/nav.js?v={V}" defer></script>', f'  <script src="/assets/site.js?v={V}" defer></script>']
    if meta.get('visualizer'):
        scripts.append(f'  <script src="/assets/visualizer.js?v=20261001" defer></script>')
    robots = '\n  <meta name="robots" content="noindex" />' if name == '404' else ''
    canon = '' if name == '404' else f'\n  <link rel="canonical" href="{url}" />'
    t, d = html.escape(meta['title']), html.escape(meta['description'])
    page = f'''<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>{t}</title>
  <meta name="description" content="{d}" />{robots}
  <meta name="theme-color" content="#0b0908" />
  <meta name="color-scheme" content="dark" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="og:site_name" content="Forge Audio" />
  <meta property="og:title" content="{t}" />
  <meta property="og:description" content="{d}" />
  <meta property="og:image" content="{BASE}/assets/desk-search.webp" />{canon}
  <link rel="icon" href="/assets/icon.svg" type="image/svg+xml" />
  <link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/assets/site.css?v={V}" />
</head>
<body>
{header(nav_key, meta.get('exact', 'yes') == 'yes')}

  <main id="contenu">
{body.rstrip()}
  </main>

{FOOTER}

{chr(10).join(scripts)}
</body>
</html>
'''
    (OUT / f'{name}.html').write_text(page, encoding='utf-8', newline='\n')
    return name


if __name__ == '__main__':
    names = [build(p) for p in sorted(SRC.glob('*.html'))]
    print('pages :', ', '.join(names))
