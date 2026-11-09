"""Regenerate the regular-strategy oracle from the supplied original JAR.

python tests/regular-pumping-fixture.py --java-home "C:/Program Files/Java/jdk1.8.0_202" --jar "C:/Users/phili/Downloads/JFLAP7.1.jar"
Compilation uses a temporary directory; no generated classes enter the repo.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--java-home', required=True, type=Path)
parser.add_argument('--jar', required=True, type=Path)
parser.add_argument('--output', type=Path, default=Path(__file__).parent/'fixtures'/'regular-pumping.json')
args = parser.parse_args()
expected = 'a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406'
if hashlib.sha256(args.jar.read_bytes()).hexdigest() != expected:
    parser.error('Use the original JFLAP 7.1 archive identified in the fixture; its SHA-256 differs.')
suffix = '.exe' if os.name == 'nt' else ''
with tempfile.TemporaryDirectory(prefix='jflap-regular-oracle-') as build:
    subprocess.run([str(args.java_home/'bin'/('javac'+suffix)), '-encoding', 'UTF-8', '-cp', str(args.jar), '-d', build,
                    str(Path(__file__).with_name('RegularPumpingFixture.java'))], check=True)
    result = subprocess.run([str(args.java_home/'bin'/('java'+suffix)), '-Dfile.encoding=UTF-8', '-cp',
                             build+os.pathsep+str(args.jar), 'RegularPumpingFixture'], check=True, capture_output=True, encoding='utf-8')
data = json.loads(result.stdout)
args.output.write_text(result.stdout, encoding='utf-8', newline='\n')
print(f"Wrote {len(data['records'])} controlled original-method observations to {args.output}")
