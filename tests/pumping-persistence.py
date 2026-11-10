"""Pumping game XML persistence at every turn in real Chromium.
Run: python tests/pumping-persistence.py (requires Python Playwright + Chromium).
"""
import functools
import json
import tempfile
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
  with tempfile.TemporaryDirectory() as directory:
   for cf in [False,True]:
    for mode in ['human-first','computer-first']:
     kind='pumpingcf' if cf else 'pumpingreg';language='AnBnCF' if cf else 'AnEven'
     page.evaluate("([type,language])=>localStorage.setItem('jflap.documents',JSON.stringify([{type,language,name:'Saved & game'}]))",[kind,language]);page.reload()
     page.locator('#game-mode').select_option(mode);page.get_by_role('button',name='Start game',exact=True).click()
     def checkpoint():
      expected=page.evaluate("JSON.parse(localStorage.getItem('jflap.documents')).at(-1).game")
      phase=page.locator('#game-phase').text_content();moves=page.locator('#game-moves').text_content();result=page.locator('#game-result').text_content()
      with page.expect_download() as download:
       page.get_by_role('button',name='File',exact=True).hover();page.get_by_role('button',name='Download copy',exact=True).click();page.mouse.move(1300,20)
      saved=download.value;assert saved.suggested_filename.endswith('.jff')
      path=Path(directory)/'resume.jff';saved.save_as(path)
      assert '<web-game>' in path.read_text(encoding='utf-8')
      page.locator('#file').set_input_files(path)
      expect(page.locator('#game-phase')).to_have_text(phase);expect(page.locator('#game-moves')).to_have_text(moves);expect(page.locator('#game-result')).to_have_text(result)
      actual=page.evaluate("JSON.parse(localStorage.getItem('jflap.documents')).at(-1).game");assert actual==expected
      page.evaluate("()=>localStorage.setItem('jflap.documents',JSON.stringify([JSON.parse(localStorage.getItem('jflap.documents')).at(-1)]))");page.reload()
      expect(page.locator('#game-phase')).to_have_text(phase);expect(page.locator('#game-moves')).to_have_text(moves)
     def submit(value):page.locator('#game-value').fill(value);page.get_by_role('button',name='Submit move',exact=True).click()
     def computer():page.get_by_role('button',name='Computer move',exact=True).click()
     checkpoint()
     if mode=='human-first':submit('4' if cf else '2')
     else:computer()
     checkpoint()
     if mode=='human-first':computer()
     else:submit('aaaabbbb' if cf else 'aaaa')
     checkpoint()
     if mode=='human-first':
      for i,part in enumerate(['aaa','a','','b','bbb'] if cf else ['','aa','']):page.locator(f'#game-part-{i}').fill(part)
      page.get_by_role('button',name='Submit move',exact=True).click()
     else:computer()
     checkpoint()
     if mode=='human-first':computer()
     else:submit('0')
     checkpoint()
     page.get_by_role('button',name='Try another '+('split' if mode=='human-first' else 'exponent'),exact=True).click();checkpoint()
     if mode=='human-first':page.get_by_role('button',name='Submit move',exact=True).click();computer()
     else:submit('2')
     checkpoint();expect(page.locator('#game-result')).to_contain_text('2:')
     page.get_by_role('button',name='Restart game',exact=True).click();page.reload();expect(page.get_by_role('button',name='Start game',exact=True)).to_be_visible()
     print(f'PASS {kind} {mode}: every turn, complete outcome, retry, attempts, XML import and reload')
  assert not errors,errors
  browser.close()
finally:
 server.shutdown();server.server_close()
