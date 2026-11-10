"""L-system original colors in real Chromium.
Run: python tests/lsystem-colors.py (requires Python Playwright + Chromium).
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
  model={'type':'lsystem','name':'Colors','axiom':'g [ color=0.5,1,1 g ] g polygonColor(brown) { g + g + g }','productions':[],'parameters':{'color':'dukeBlue','angle':90}}
  page.evaluate("m=>localStorage.setItem('jflap.documents',JSON.stringify([m]))",model);page.reload()
  page.get_by_role('button',name='Render system',exact=True).click()
  expect(page.locator('#ls-svg polyline')).to_have_count(3)
  assert page.locator('#ls-svg polyline').evaluate_all("els=>els.map(e=>e.getAttribute('stroke'))")==['rgb(0, 0, 156)','rgb(0, 255, 255)','rgb(0, 0, 156)']
  expect(page.locator('#ls-svg polygon')).to_have_attribute('fill','rgb(129, 0, 0)')
  with page.expect_download() as download:page.get_by_role('button',name='Export SVG',exact=True).click()
  svg=Path(download.value.path()).read_text(encoding='utf-8');assert 'rgb(129, 0, 0)' in svg and 'rgb(0, 0, 156)' in svg
  page.get_by_role('tab',name='Editor',exact=True).click();page.locator('#ls-params').fill('color = 0,0,0.5\npolygonColor = springGreen')
  page.get_by_role('button',name='Render system',exact=True).click()
  expect(page.locator('#ls-svg polyline').first).to_have_attribute('stroke','rgb(128, 128, 128)')
  page.get_by_role('tab',name='Editor',exact=True).click();page.locator('#ls-params').fill('color = 256,0,0')
  page.get_by_role('button',name='Render system',exact=True).click();expect(page.locator('#dialog')).to_be_visible();expect(page.locator('#dialog-body')).to_contain_text('Invalid L-system color')
  assert not errors,errors
  print('PASS rendered line/polygon colors, branch restoration, parameter triples, SVG export and malformed-input feedback')
  browser.close()
finally:
 server.shutdown();server.server_close()
