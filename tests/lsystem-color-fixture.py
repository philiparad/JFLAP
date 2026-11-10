"""Regenerate original JFLAP L-system color observations. Requires --java-home and --jar."""
import argparse,hashlib,json,os,subprocess,tempfile
from pathlib import Path
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--java-home',required=True,type=Path)
parser.add_argument('--jar',required=True,type=Path)
parser.add_argument('--output',type=Path,default=Path(__file__).parent/'fixtures'/'lsystem-colors.json')
args=parser.parse_args()
expected='a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406'
if hashlib.sha256(args.jar.read_bytes()).hexdigest()!=expected:parser.error('Use the supplied original JFLAP7.1.jar with its verified SHA-256.')
suffix='.exe' if os.name=='nt' else ''
with tempfile.TemporaryDirectory(prefix='jflap-colors-') as build:
 subprocess.run([str(args.java_home/'bin'/('javac'+suffix)),'-encoding','UTF-8','-cp',str(args.jar),'-d',build,str(Path(__file__).with_name('LSystemColorFixture.java'))],check=True)
 result=subprocess.run([str(args.java_home/'bin'/('java'+suffix)),'-Djava.awt.headless=true','-cp',build+os.pathsep+str(args.jar),'LSystemColorFixture'],check=True,capture_output=True,encoding='utf-8')
data=json.loads(result.stdout)
args.output.write_text(result.stdout,encoding='utf-8',newline='\n')
print(f"Wrote {len(data['records'])} color observations, including {len(data['palette'])} named colors.")
