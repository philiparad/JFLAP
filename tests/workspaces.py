"""Persistent panes, document histories and isolated windows in real Chromium.
Run: python tests/workspaces.py (requires Python Playwright + Chromium).
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
  def operation(name):
   tab=page.get_by_role('tab',name=name,exact=True)
   if tab.count():tab.click()
   else:page.locator('#operation-picker').select_option(name)
  def rename_state(name,target=page):
   target.locator('[data-state="0"] circle').first.dblclick()
   target.locator('[name="name"]').fill(name);target.get_by_role('button',name='Apply',exact=True).click()
   expect(target.locator('[data-state="0"] text').first).to_have_text(name)
  def menu(name,target=page):
   target.get_by_role('button',name='File',exact=True).hover();target.get_by_role('button',name=name,exact=True).click();target.mouse.move(1300,20)
  operation('Simulate');page.locator('#run-input').fill('1101');page.get_by_role('button',name='Start',exact=True).click();page.get_by_role('button',name='Step',exact=True).click()
  first=page.locator('#sim-result').text_content()
  operation('Multiple Run');page.locator('#batch').fill('01\n0');page.get_by_role('button',name='Run inputs',exact=True).click()
  matrix=page.locator('#configurations').text_content()
  operation('Simulate');expect(page.locator('#sim-result')).to_have_text(first);page.get_by_role('button',name='Step',exact=True).click()
  assert page.locator('#sim-result').text_content()!=first
  operation('Multiple Run');expect(page.locator('#batch')).to_have_value('01\n0');expect(page.locator('#configurations')).to_have_text(matrix)
  page.get_by_role('button',name='Dismiss Simulate',exact=True).click();expect(page.locator('#configurations')).to_have_text(matrix)
  page.get_by_role('button',name='Dismiss Multiple Run',exact=True).click();expect(page.get_by_role('tab',name='Editor',exact=True)).to_have_attribute('aria-selected','true')
  operation('Simulate');expect(page.locator('#sim-result')).to_be_empty()
  print('PASS operation results/inputs/runners retained; inactive/active dismissal and fresh reopening')

  operation('Editor');rename_state('First history');page.locator('#example').click();rename_state('Second history')
  operation('Simulate');page.get_by_role('button',name='Start',exact=True).click();page.get_by_role('button',name='Step',exact=True).click();second=page.locator('#sim-result').text_content()
  page.locator('[data-doc="0"]').click();expect(page.locator('[data-state="0"] text').first).to_have_text('First history')
  page.get_by_role('button',name='↶',exact=True).click();expect(page.locator('[data-state="0"] text').first).to_have_text('q0')
  page.locator('[data-doc="1"]').click();expect(page.locator('#sim-result')).to_have_text(second)
  operation('Editor');expect(page.locator('[data-state="0"] text').first).to_have_text('Second history');page.get_by_role('button',name='↶',exact=True).click();expect(page.locator('[data-state="0"] text').first).to_have_text('q0')
  page.locator('[data-doc="0"]').click();page.get_by_role('button',name='↷',exact=True).click();expect(page.locator('[data-state="0"] text').first).to_have_text('First history')
  # A changed source cannot restore an obsolete computation.
  operation('Simulate');expect(page.locator('#sim-result')).to_be_empty();operation('Editor')
  print('PASS document-specific tabs, simulation state and independent undo/redo; stale results invalidated')

  page.locator('#new').click();page.locator('[data-new="grammar"]').click()
  page.locator('#grammar-input').fill('S -> aSb | λ');page.get_by_role('button',name='Apply grammar',exact=True).click()
  operation('Manual Derivation');page.get_by_role('button',name='Apply production',exact=True).click();expect(page.locator('#rewrite-current')).to_have_text('aSb')
  operation('Parse');page.locator('#parse-method').select_option('llParse');page.get_by_role('button',name='Parse',exact=True).click();parse=page.locator('#parse-output').text_content()
  operation('Manual Derivation');expect(page.locator('#rewrite-current')).to_have_text('aSb');page.get_by_role('button',name='Apply production',exact=True).click();expect(page.locator('#rewrite-current')).to_have_text('aaSbb')
  operation('Parse');expect(page.locator('#parse-output')).to_have_text(parse)
  page.locator('[data-doc="0"]').click();page.locator('[data-doc="2"]').click();expect(page.locator('#parse-output')).to_have_text(parse)
  print('PASS manual derivation and parse-tree/table results survive tab/document switching')

  operation('Editor');page.locator('#grammar-input').fill('S -> SS | a');page.get_by_role('button',name='Apply grammar',exact=True).click();operation('Parse')
  page.locator('#grammar-word').fill('b');page.get_by_role('button',name='Parse',exact=True).click();operation('Editor');operation('Parse')
  expect(page.locator('#parse-result')).to_contain_text('PAUSED')
  page.get_by_role('button',name='Resume search',exact=True).click();page.get_by_role('button',name='Pause search',exact=True).evaluate('(button)=>button.click()')
  expect(page.locator('#parse-result')).to_contain_text('PAUSED');page.get_by_role('button',name='Dismiss Parse',exact=True).click()
  print('PASS background grammar search pauses, resumes and disposes on tab dismissal')

  page.locator('[data-doc="0"]').click();operation('Editor')
  before=page.evaluate("localStorage.getItem('jflap.documents')")
  with page.expect_popup() as popup:menu('Open copy in new window')
  child=popup.value;child.on('pageerror',lambda e:errors.append(str(e)));child.wait_for_url('**/?window=1');expect(child.locator('#documents .doc-item')).to_have_count(1)
  rename_state('Child only',child)
  assert page.evaluate("localStorage.getItem('jflap.documents')")==before
  expect(page.locator('[data-state="0"] text').first).to_have_text('First history')
  child.get_by_role('button',name='↶',exact=True).click();expect(child.locator('[data-state="0"] text').first).to_have_text('First history')
  child.get_by_role('button',name='↷',exact=True).click();child.reload();expect(child.locator('[data-state="0"] text').first).to_have_text('Child only')
  assert page.evaluate("localStorage.getItem('jflap.documents')")==before
  assert child.evaluate('window.opener===null')
  child.close()
  # Closing an inactive document must preserve the current operation.
  operation('Simulate');page.get_by_role('button',name='Start',exact=True).click()
  current=page.locator('#sim-result').text_content()
  page.locator('[data-close="1"]').click();page.locator('[name="action"]').select_option('close');page.get_by_role('button',name='Apply',exact=True).click()
  expect(page.locator('#sim-result')).to_have_text(current)
  assert not errors,errors
  print('PASS separate document window, isolated edits/history, private reload backup and no browser errors')
  browser.close()
finally:
 server.shutdown();server.server_close()
