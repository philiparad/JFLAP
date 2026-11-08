"""Browser import/export plus the original Java codec as a compatibility oracle.

Requires Python Playwright/Chromium and a JDK:
python tests/block-xml.py --java-home "C:/Program Files/Java/jdk1.8.0_202"
"""
import argparse
import functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import subprocess
import tempfile
from threading import Thread
import os
from playwright.sync_api import sync_playwright, expect

parser=argparse.ArgumentParser()
parser.add_argument('--java-home',required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
java=Path(args.java_home)/'bin'/'java'
javac=Path(args.java_home)/'bin'/'javac'
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
try:
    with tempfile.TemporaryDirectory() as directory, sync_playwright() as p:
        temp=Path(directory)
        subprocess.run([str(javac),'-cp',str(root/'vendor/JFLAP7.1.jar'),'-d',str(temp),str(root/'tests/BlockCodecFixture.java')],check=True,timeout=30)
        command=[str(java),'-Djava.awt.headless=true','-cp',os.pathsep.join([str(temp),str(root/'vendor/JFLAP7.1.jar')]),'BlockCodecFixture']
        generated=temp/'original-blocks.jff'
        subprocess.run(command+['generate',str(generated)],check=True,timeout=30)
        subprocess.run(command+['check',str(generated)],check=True,timeout=30)
        browser=p.chromium.launch()
        page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{server.server_port}/')
        page.locator('#file').set_input_files(generated)
        expect(page.locator('#title')).to_have_text('original-blocks')
        expect(page.locator('[data-state]')).to_have_count(3)
        # Follow the imported reference using the actual nested editor.
        page.locator('[data-state="0"] circle').first.dblclick()
        page.locator('[name="block"]').select_option('edit')
        page.get_by_role('button',name='Apply',exact=True).click()
        expect(page.locator('[data-state]')).to_have_count(2)
        page.get_by_role('button',name='↰ Parent block',exact=True).click()
        expect(page.locator('[data-state]')).to_have_count(3)
        with page.expect_download() as download:
            page.get_by_role('button',name='File',exact=True).hover()
            page.get_by_role('button',name='Download copy',exact=True).click()
        exported=temp/'web-blocks.jff'
        download.value.save_as(exported)
        subprocess.run(command+['check',str(exported)],check=True,timeout=30)
        page.locator('#file').set_input_files(exported)
        expect(page.locator('#title')).to_have_text('web-blocks')
        expect(page.locator('[data-state]')).to_have_count(3)
        assert not errors,errors
        browser.close()
        print('PASS original Java generation -> browser import/nested editor/export -> original Java reopen -> browser reopen')
finally:
    server.shutdown()
    server.server_close()
