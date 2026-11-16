from pathlib import Path
import subprocess, re, base64, json, urllib.request, tempfile

root = Path(__file__).resolve().parent.parent
(root / 'docs').mkdir(exist_ok=True)
(root / 'deliverables').mkdir(exist_ok=True)
with tempfile.TemporaryDirectory() as temporary:
    js = Path(temporary) / 'standalone.js'
    subprocess.run([
        'pnpm', 'exec', 'esbuild', 'client/src/main.tsx', '--bundle',
        '--format=iife', '--jsx=automatic', '--target=es2020', '--minify',
        '--loader:.css=empty', '--define:import.meta.env={}',
        '--alias:@=' + str(root / 'client/src'),
        '--alias:@shared=' + str(root / 'shared'), '--outfile=' + str(js)
    ], cwd=root, check=True)
    script = js.read_text()

for filename in ['afc-logo.png', 'asset-logo.png']:
    data = 'data:image/png;base64,' + base64.b64encode((root / 'client/public' / filename).read_bytes()).decode()
    script = script.replace('/' + filename, data)
script = script.replace('</script', '<\\/script')
html = (root / 'dist/public/index.html').read_text()
css = '\n'.join(p.read_text() for p in (root / 'dist/public/assets').glob('*.css'))
font_url = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;450;500;550;600;650;700;750;800&display=swap'
try:
    request = urllib.request.Request(font_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=20) as response:
        fonts = response.read().decode()
    for url in set(re.findall(r'url\((https://[^)]+)\)', fonts)):
        with urllib.request.urlopen(url, timeout=20) as response:
            data = 'data:font/woff2;base64,' + base64.b64encode(response.read()).decode()
        fonts = fonts.replace(url, data)
    css = fonts + '\n' + css
except Exception as exc:
    print('Font embedding unavailable; browser fallback retained:', type(exc).__name__)
html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.S)
html = re.sub(r'<link[^>]*(?:href="(?:https://fonts\.[^"]*|/assets/[^"]*|/manifest\.webmanifest|/app-icon-[^"]*|/favicon\.svg)")[^>]*>', '', html)
html = html.replace('</head>', '<style>' + css + '</style></head>')
html = html.replace('</body>', '<script>window.__AFC_STATIC_DEMO__=true;</script><script>' + script + '</script></body>')
for output in [root / 'docs/index.html', root / 'deliverables/AFC_Workspace.html']:
    output.write_text(html)
(root / 'docs/.nojekyll').write_text('')
print(json.dumps({'file': str(root / 'docs/index.html'), 'bytes': len(html.encode()), 'self_contained': True, 'backend': False}))
