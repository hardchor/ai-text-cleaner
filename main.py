#!/usr/bin/env python3
import sys
import re

def normalize(text: str) -> str:
    # 1. Replace em‑dash (—, U+2014), en‑dash (–, U+2013), and non-breaking hyphen (‑, U+2011) with simple hyphen (-)
    for dash in ('\u2014', '\u2013', '\u2011'):
        text = text.replace(dash, '-')

    # 2. Normalize quotes: curly to straight
    for quote in ('\u201C', '\u201D'): # “ ”
        text = text.replace(quote, '"')
    for quote in ('\u2018', '\u2019'): # ‘ ’
        text = text.replace(quote, "'")

    # 3. Strip non‑breaking and zero‑width spaces
    #    U+00A0 (NBSP), U+202F (narrow NBSP), U+200B (zero‑width space)
    for ch in ('\u00A0', '\u202F', '\u200B'):
        text = text.replace(ch, '')

    # 4. Replace ellipsis with three periods
    text = text.replace('\u2026', '...')

    # 5. Replace common ligatures
    text = text.replace('\uFB01', 'fi') # ﬁ
    text = text.replace('\uFB02', 'fl') # ﬂ

    # 6. Replace mathematical minus (−, U+2212) and soft hyphen (U+00AD)
    for ch in ('\u2212',):  # mathematical minus
        text = text.replace(ch, '-')
    text = text.replace('\u00AD', '')  # soft hyphen

    # 7. Replace angle quotes: « » → " and ‹ › → '
    for ch in ('\u00AB', '\u00BB'):
        text = text.replace(ch, '"')  # guillemet double
    for ch in ('\u2039', '\u203A'):
        text = text.replace(ch, "'")  # single angle quotes

    # 8. Replace bullet (•) with hyphen
    text = text.replace('\u2022', '-')

    # 9. Replace additional ligatures: ﬀ, ﬃ, ﬄ
    for lig, repl in (('\uFB00','ff'), ('\uFB03','ffi'), ('\uFB04','ffl')):
        text = text.replace(lig, repl)

    # # 10. Collapse any remaining runs of whitespace to a single space (optional)
    # text = re.sub(r'\s+', ' ', text)

    return text

def main():
    if len(sys.argv) > 1:
        # read from file
        with open(sys.argv[1], encoding='utf-8') as f:
            data = f.read()
    else:
        # read from STDIN
        data = sys.stdin.read()

    sys.stdout.write(normalize(data))

if __name__ == '__main__':
    main()
