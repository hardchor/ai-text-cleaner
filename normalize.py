#!/usr/bin/env python3
import sys
import re
from typing import Optional, Dict

# Default configuration for all normalization steps
DEFAULT_CONFIG: Dict[str, bool] = {
    'surround_dashes': True,
    'normalize_dashes': True,
    'normalize_quotes': True,
    'strip_spaces': True,
    'replace_ellipsis': True,
    'replace_common_ligatures': True,
    'replace_math_minus': True,
    'replace_angle_quotes': True,
    'replace_bullet': True,
    'replace_additional_ligatures': True,
}

def normalize(text: str, config: Optional[Dict[str, bool]] = None) -> str:
    # merge passed config with defaults
    cfg = {**DEFAULT_CONFIG, **(config or {})}
    # 0. Surround em/en dashes without surrounding space
    if cfg['surround_dashes']:
        text = re.sub(r'(?<=\S)[\u2014\u2013](?=\S)', ' - ', text)
    # 1. Replace various dash characters with '-'
    if cfg['normalize_dashes']:
        for dash in ('\u2014', '\u2013', '\u2011'):
            text = text.replace(dash, '-')
    # 2. Normalize curly quotes to straight
    if cfg['normalize_quotes']:
        for quote in ('\u201C', '\u201D'):
            text = text.replace(quote, '"')
        for quote in ('\u2018', '\u2019'):
            text = text.replace(quote, "'")
    # 3. Strip non-breaking & zero-width spaces
    if cfg['strip_spaces']:
        for ch in ('\u00A0', '\u202F', '\u200B'):
            text = text.replace(ch, '')
    # 4. Replace ellipsis
    if cfg['replace_ellipsis']:
        text = text.replace('\u2026', '...')
    # 5. Replace common ligatures fi, fl
    if cfg['replace_common_ligatures']:
        text = text.replace('\uFB01', 'fi')
        text = text.replace('\uFB02', 'fl')
    # 6. Math minus & soft hyphen
    if cfg['replace_math_minus']:
        for ch in ('\u2212',):
            text = text.replace(ch, '-')
        text = text.replace('\u00AD', '')
    # 7. Angle quotes
    if cfg['replace_angle_quotes']:
        for ch in ('\u00AB', '\u00BB'):
            text = text.replace(ch, '"')
        for ch in ('\u2039', '\u203A'):
            text = text.replace(ch, "'")
    # 8. Bullet
    if cfg['replace_bullet']:
        text = text.replace('\u2022', '-')
    # 9. Additional ligatures ff, ffi, ffl
    if cfg['replace_additional_ligatures']:
        for lig, repl in (('\uFB00','ff'), ('\uFB03','ffi'), ('\uFB04','ffl')):
            text = text.replace(lig, repl)
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
