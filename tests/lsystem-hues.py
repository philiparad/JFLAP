"""L-system hue shifts in real Chromium.
Run: python tests/lsystem-hues.py (requires Python Playwright + Chromium).
"""
import functools
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright,expect

root=Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(10000)
  page.add_init_script('globalThis.randomFraction=0;Math.random=()=>globalThis.randomFraction')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}/')
  model={'type':'lsystem','name':'Hue shifts','axiom':'g # g [ hueChange=60 # g ] @ g color(gray) #(120) g ## { g + g + g } @@ { g + g + g }','productions':[],'parameters':{'color':'128,64,96','polygonColor':'128,64,96','hueChange':120,'angle':90}}
  page.evaluate("m=>localStorage.setItem('jflap.documents',JSON.stringify([m]))",model);page.reload();page.get_by_role('button',name='Render system',exact=True).click()
  expect(page.locator('#ls-svg polyline')).to_have_count(5)
  assert page.locator('#ls-svg polyline').evaluate_all("els=>els.map(e=>e.getAttribute('stroke'))")==['rgb(128, 64, 96)','rgb(96, 128, 64)','rgb(64, 128, 96)','rgb(128, 64, 96)','rgb(128, 128, 128)']
  assert page.locator('#ls-svg polygon').evaluate_all("els=>els.map(e=>e.getAttribute('fill'))")==['rgb(96, 128, 64)','rgb(128, 64, 96)']
  with page.expect_download() as download:page.get_by_role('button',name='Export SVG',exact=True).click()
  svg=Path(download.value.path()).read_text(encoding='utf-8');assert 'rgb(96, 128, 64)' in svg and 'hsl(' not in svg
  assert not errors,errors
  print('PASS hue preservation, independent polygon shifts, branch increment/color restoration, gray stability and exported SVG')
  browser.close()
finally:
 server.shutdown();server.server_close()
