"""Save UI tests using real Chromium file handles in private origin storage.

The native picker is substituted deterministically; no user files are touched.
Run: python tests/save-files.py (requires Python Playwright and Chromium).
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
setup=r"""
window.picker={calls:0,nextName:'first.jff',cancel:false,fail:false,openNames:[]};
window.readSaved=async name=>(await (await (await navigator.storage.getDirectory()).getFileHandle(name)).getFile()).text();
window.writeFixture=async(name,text)=>{const h=await (await navigator.storage.getDirectory()).getFileHandle(name,{create:true}),s=await h.createWritable();await s.write(text);await s.close();};
const wrap=h=>({name:h.name,getFile:()=>h.getFile(),createWritable:async()=>{if(picker.fail)throw new DOMException('Test permission denied','NotAllowedError');return h.createWritable();}});
window.showSaveFilePicker=async options=>{picker.calls++;picker.options=options;if(picker.cancel)throw new DOMException('Test cancel','AbortError');return wrap(await (await navigator.storage.getDirectory()).getFileHandle(picker.nextName,{create:true}));};
window.showOpenFilePicker=async()=>Promise.all(picker.openNames.map(async name=>wrap(await (await navigator.storage.getDirectory()).getFileHandle(name))));
"""
try:
    with sync_playwright() as p:
        browser=p.chromium.launch()
        page=browser.new_page(viewport={'width':1440,'height':1000})
        page.set_default_timeout(10000)
        page.add_init_script(setup)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{server.server_port}/')

        def menu(name):
            page.get_by_role('button',name='File',exact=True).hover()
            page.get_by_role('button',name=name,exact=True).click()
            page.mouse.move(1300,20)

        def saved(name):
            expect(page.locator('#status')).to_have_text('Saved to '+name+'.')

        page.locator('#save').click()
        saved('first.jff')
        assert page.evaluate('picker.calls')==1
        page.locator('[data-state="0"] circle').first.dblclick()
        page.locator('[name="name"]').fill('changed-on-disk')
        page.get_by_role('button',name='Apply',exact=True).click()
        expect(page.locator('#dialog')).not_to_be_visible()
        page.locator('#save').click()
        page.wait_for_function("async()=>{try{return (await readSaved('first.jff')).includes('changed-on-disk');}catch{return false;}}")
        assert page.evaluate('picker.calls')==1
        page.get_by_role('button',name='↶',exact=True).click()
        page.locator('#save').click()
        page.wait_for_function("async()=>{try{return !(await readSaved('first.jff')).includes('changed-on-disk');}catch{return false;}}")
        assert page.evaluate('picker.calls')==1
        print('PASS Save writes a real file and retains its association through edits and undo')

        page.evaluate("picker.nextName='copy.jff'")
        menu('Save As')
        saved('copy.jff')
        assert page.evaluate('picker.calls')==2
        expect(page.locator('#save')).to_have_attribute('title','Save to copy.jff')
        page.evaluate('picker.cancel=true')
        menu('Save As')
        expect(page.locator('#status')).to_have_text('Save cancelled. Document kept open.')
        expect(page.locator('#save')).to_have_attribute('title','Save to copy.jff')
        page.evaluate('picker.cancel=false')
        page.locator('#save').click()
        saved('copy.jff')
        assert page.evaluate('picker.calls')==3
        print('PASS Save As and cancelled Save As preserve the correct destination')

        page.evaluate("async()=>{const m=JSON.parse(localStorage.getItem('jflap.documents'))[0];m.name='Opened JSON';await writeFixture('opened.json',JSON.stringify(m));picker.openNames=['opened.json'];}")
        page.locator('#open').click()
        expect(page.locator('#title')).to_have_text('Opened JSON')
        expect(page.locator('#documents .doc-item')).to_have_count(2)
        page.locator('#save').click()
        saved('opened.json')
        assert page.evaluate("async()=>JSON.parse(await readSaved('opened.json')).name")=='Opened JSON'
        assert page.evaluate('picker.calls')==3
        page.locator('[data-doc="0"]').click()
        page.locator('#save').click()
        saved('copy.jff')
        page.locator('[data-doc="1"]').click()
        print('PASS native-handle Open, JSON preservation and separate document associations')

        # A failed Save and close leaves the document and its association intact.
        page.evaluate('picker.fail=true')
        page.locator('[data-close="1"]').click()
        page.get_by_role('button',name='Apply',exact=True).click()
        expect(page.locator('#dialog-title')).to_have_text('Unable to complete operation')
        expect(page.locator('#documents .doc-item')).to_have_count(2)
        page.get_by_role('button',name='Close',exact=True).click()
        page.evaluate('picker.fail=false')
        page.locator('[data-close="1"]').click()
        page.get_by_role('button',name='Apply',exact=True).click()
        expect(page.locator('#documents .doc-item')).to_have_count(1)
        print('PASS failed Save and close preserves the document; successful retry closes it')

        page.locator('#example').click()
        expect(page.locator('#documents .doc-item')).to_have_count(2)
        page.evaluate("picker.cancel=true;picker.nextName='new.jff'")
        page.locator('[data-close="1"]').click()
        page.get_by_role('button',name='Apply',exact=True).click()
        expect(page.locator('#status')).to_have_text('Save cancelled. Document kept open.')
        expect(page.locator('#documents .doc-item')).to_have_count(2)
        page.evaluate('picker.cancel=false')
        page.locator('[data-close="1"]').click()
        page.locator('[name="action"]').select_option('close')
        page.get_by_role('button',name='Apply',exact=True).click()
        expect(page.locator('#documents .doc-item')).to_have_count(1)
        print('PASS cancelled first Save and close keeps the unsaved document open')

        # Explicit export never changes the bound file.
        with page.expect_download() as download:
            menu('Download copy')
        assert download.value.suggested_filename.endswith('.jff')
        expect(page.locator('#save')).to_have_attribute('title','Save to copy.jff')
        # Feature-detection fallback is visible and uses the ordinary download path.
        page.evaluate('window.showSaveFilePicker=undefined')
        page.locator('[data-doc="0"]').click()
        expect(page.locator('#save')).to_have_text('Download .jff ↓')
        with page.expect_download():
            page.locator('#save').click()
        expect(page.locator('#status')).to_contain_text('cannot save back to a file')
        page.reload()
        expect(page.locator('#save')).to_have_attribute('title','Choose a file on first save. File associations last until this page is reloaded.')
        assert not errors,errors
        print('PASS explicit Download copy and unsupported-browser fallback; no browser errors')
        browser.close()
finally:
    server.shutdown()
    server.server_close()
