"""Both pumping game turn orders in real Chromium.
Run: python tests/pumping-game.py (requires Python Playwright + Chromium).
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
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}/')
  for cf in [False,True]:
   for mode in ['human-first','computer-first']:
    kind='pumpingcf' if cf else 'pumpingreg'
    language=('AnBnCF' if mode=='human-first' else 'AnBnCn') if cf else ('AnEven' if mode=='human-first' else 'AnBn')
    page.evaluate("([type,language])=>localStorage.setItem('jflap.documents',JSON.stringify([{type,language,name:'Game'},{type:'re',name:'Other',expression:'a*'}]))",[kind,language]);page.reload()
    page.locator('#game-mode').select_option(mode);page.get_by_role('button',name='Start game',exact=True).click()
    def submit(value):
     page.locator('#game-value').fill(value);page.get_by_role('button',name='Submit move',exact=True).click()
    def computer():page.get_by_role('button',name='Computer move',exact=True).click()
    if mode=='human-first':
     submit('0');expect(page.locator('#game-feedback')).to_contain_text('1 to 20');submit('3');computer()
     page.get_by_role('button',name='Submit move',exact=True).click();expect(page.locator('#game-feedback')).not_to_be_empty()
     parts=['aa','a','','b','bb'] if cf else ['','aa','aaaa']
     for i,part in enumerate(parts):page.locator(f'#game-part-{i}').fill(part)
     page.get_by_role('button',name='Submit move',exact=True).click();computer()
    else:
     computer();submit('b');expect(page.locator('#game-feedback')).to_contain_text('word in the language')
     submit('aaabbbccc' if cf else 'aaabbb');computer();submit('1');expect(page.locator('#game-feedback')).to_contain_text('2 to 12');submit('0')
    expect(page.locator('#game-result')).to_contain_text('You win this attempt')
    history=page.locator('#game-moves').text_content()
    page.locator('[data-doc="1"]').click();page.locator('[data-doc="0"]').click();expect(page.locator('#game-moves')).to_have_text(history)
    page.get_by_role('button',name='Try another '+('split' if mode=='human-first' else 'exponent'),exact=True).click()
    if mode=='human-first':page.get_by_role('button',name='Submit move',exact=True).click();computer()
    else:submit('2')
    expect(page.locator('#game-result')).to_contain_text('2: Won')
    page.get_by_role('button',name='Free exploration',exact=True).click();expect(page.locator('#pump-word')).to_be_visible()
    page.get_by_role('button',name='Pumping game',exact=True).click();expect(page.locator('#game-result')).to_contain_text('2: Won')
    page.get_by_role('button',name='Restart game',exact=True).click();expect(page.locator('#game-moves')).to_be_empty();expect(page.locator('#game-mode')).to_be_enabled()
    print(f'PASS {kind} {mode}: validation, round outcome, retry, document retention, exploration and restart')
  assert not errors,errors
  browser.close()
finally:
 server.shutdown();server.server_close()
