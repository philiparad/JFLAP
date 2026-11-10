"""Original pumping XML -> browser -> original codec, including roles and attempts.
Run with Python Playwright/Chromium and --java-home pointing to a JDK.
"""
import argparse
import functools
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import subprocess
import tempfile
from threading import Thread
import os
from playwright.sync_api import sync_playwright,expect

parser=argparse.ArgumentParser()
parser.add_argument('--java-home',required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
suffix='.exe' if os.name=='nt' else ''
java=Path(args.java_home)/'bin'/('java'+suffix)
javac=Path(args.java_home)/'bin'/('javac'+suffix)
class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as directory,sync_playwright() as p:
  temp=Path(directory);jar=root/'vendor/JFLAP7.1.jar'
  subprocess.run([str(javac),'-encoding','UTF-8','-cp',str(jar),'-d',str(temp),str(root/'tests/PumpingCodecFixture.java')],check=True,timeout=30)
  command=[str(java),'-Djava.awt.headless=true','-cp',os.pathsep.join([str(temp),str(jar)]),'PumpingCodecFixture']
  originals=temp/'originals'
  subprocess.run(command+['generate',str(originals)],check=True,capture_output=True,text=True,timeout=30)
  browser=p.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1000});errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.goto(f'http://127.0.0.1:{server.server_port}/')
  for original in sorted(originals.glob('*.jff')):
   xml=original.read_text(encoding='utf-8')
   result=page.evaluate("""async xml=>{
    const {deserialize,serialize}=await import('./js/files.js');
    const model=deserialize(xml,'Original game');const exported=serialize(model);
    const reopened=deserialize(exported,'Reopened game');
    return {exported,equal:JSON.stringify({...model,name:''})===JSON.stringify({...reopened,name:''})};
   }""",xml)
   assert result['equal'],original.name
   exported=temp/('web-'+original.name);exported.write_text(result['exported'],encoding='utf-8')
   subprocess.run(command+['compare',str(original),str(exported)],check=True,capture_output=True,text=True,timeout=30)
  print('PASS 16 original regular/CF XML states, both roles, attempts and CF cases round-trip through browser and original codec')
  # Exercise actual Open and Download copy, not only module calls.
  for original in [originals/'reg-human-3.jff',originals/'cf-computer-3.jff']:
   page.locator('#file').set_input_files(original)
   expect(page.locator('#game-phase')).to_have_text('Attempt complete')
   expect(page.locator('#game-result')).to_contain_text('attempt')
   with page.expect_download() as download:
    page.get_by_role('button',name='File',exact=True).hover();page.get_by_role('button',name='Download copy',exact=True).click()
   exported=temp/('ui-'+original.name);download.value.save_as(exported)
   assert exported.read_text(encoding='utf-8').lstrip().startswith('<?xml')
   subprocess.run(command+['compare',str(original),str(exported)],check=True,capture_output=True,text=True,timeout=30)
  assert not errors,errors
  browser.close()
  print('PASS original pumping file UI Open -> Download XML -> original Java reopen; no browser errors')
finally:
 server.shutdown();server.server_close()
