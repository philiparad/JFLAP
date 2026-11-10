# L-system colors (Task 53)

Line color (`color`) and polygon fill (`polygonColor`) accept the original JFLAP names and numeric triples. These work in the parameter list and in word commands such as `color(dukeBlue)`, `color=255,0,0`, and `polygonColor=0.5,1,1`. Word symbols are separated by whitespace, so keep command triples together; parameter values may contain spaces.

Names are case-sensitive. Java's standard color names have lowercase/camelCase and uppercase aliases: white, lightGray/LIGHT_GRAY, gray, darkGray/DARK_GRAY, black, red, pink, orange, yellow, green, magenta, cyan and blue. The additional original names are dukeBlue, brown, oliveDrab, darkOliveGreen, orangeRed, maroon, forestGreen, purple, springGreen, violetRed, goldenrod and darkOliveGreen2. Original RGB values take precedence over CSS interpretations: brown is (129,0,0), green is (0,255,0), purple is (209,0,255), and dukeBlue is (0,0,156). The example plant now uses the original spelling forestGreen.

A numeric triple uses HSB (hue, saturation, brightness) when every value is in 0–1, and RGB otherwise. For example, `0.5,1,1` is cyan; `0,0,0.5` is gray (128,128,128); `255,127.9,0` is RGB (255,127,0). RGB values must be within 0–255 and truncate fractional channels. HSB results use the original Java float32 arithmetic and rounding. Hue 1 wraps to hue 0.

Scientific notation, Java float suffixes and hexadecimal float notation are supported. Like the original tokenizer, empty comma fields are skipped and only the first three fields are used. Names are not whitespace-trimmed. Unknown names, malformed triples and values outside the valid range show a rendering error instead of silently relying on browser color fallback. CSS-only names and CSS hex notation are not original color syntax. The original accidentally coerces NaN channels; this implementation explicitly rejects nonfinite channels. A reflected non-color constant such as OPAQUE is also rejected with a readable error.

Branches restore their previous colors. SVG output stores explicit RGB values for these inputs, including polygon fills. Existing hue-change commands are not revised here; their saturation/brightness behavior remains Task 54.

## Evidence and checks

REA identified the supplied archive as SHA-256 `a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406`. Bytecode inspection of `gui.lsystem.Turtle.colorForString`, its setters and `Renderer` color handlers established the syntax, palette and assignment/command paths. The original Java method supplies 247 fixture observations covering all 38 names, numerical boundaries, float syntax and malformed input. Tests compare finite valid results exactly and check explicit rejection of invalid/nonfinite cases.

Regenerate the oracle with `python tests/lsystem-color-fixture.py --java-home <JDK-path> --jar <JFLAP7.1.jar>`. The regression suite has 202 passing checks. `python tests/lsystem-colors.py` verifies actual rendered line/polygon colors, branch restoration, parameter edits, exported SVG and invalid-color feedback in Chromium. Java, Python Playwright and Chromium are test-only prerequisites.
