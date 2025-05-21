// Default configuration for all normalization steps
const DEFAULT_CONFIG = {
    surround_dashes: true,
    normalize_dashes: true,
    normalize_quotes: true,
    strip_spaces: true,
    replace_ellipsis: true,
    replace_common_ligatures: true,
    replace_math_minus: true,
    replace_angle_quotes: true,
    replace_bullet: true,
    replace_additional_ligatures: true,
};

function normalize(text, config = {}) {
    // Merge passed config with defaults
    const cfg = {...DEFAULT_CONFIG, ...config};

    // 0. Surround em/en dashes without surrounding space
    if (cfg.surround_dashes) {
        // Python: re.sub(r'(?<=\S)[—–](?=\S)', ' - ', text)
        // JavaScript: text.replace(/(?<=\S)([—–])(?=\S)/g, ' - ')
        text = text.replace(/(?<=\S)([—–])(?=\S)/g, ' - ');
    }

    // 1. Replace various dash characters with '-'
    if (cfg.normalize_dashes) {
        const dashes = ['—', '–', '‑'];
        for (const dash of dashes) {
            text = text.replaceAll(dash, '-');
        }
    }

    // 2. Normalize curly quotes to straight
    if (cfg.normalize_quotes) {
        const doubleQuotes = ['“', '”'];
        for (const quote of doubleQuotes) {
            text = text.replaceAll(quote, '"');
        }
        const singleQuotes = ['‘', '’'];
        for (const quote of singleQuotes) {
            text = text.replaceAll(quote, "'");
        }
    }

    // 3. Strip non-breaking & zero-width spaces
    if (cfg.strip_spaces) {
        // Non-breaking space, narrow non-breaking space
        const nonBreakingSpaces = [' ', ' '];
        for (const ch of nonBreakingSpaces) {
            text = text.replaceAll(ch, ' ');
        }
        text = text.replaceAll('​', ''); // Zero-width space
    }

    // 4. Replace ellipsis
    if (cfg.replace_ellipsis) {
        text = text.replaceAll('…', '...');
    }

    // 5. Replace common ligatures fi, fl
    if (cfg.replace_common_ligatures) {
        text = text.replaceAll('ﬁ', 'fi');
        text = text.replaceAll('ﬂ', 'fl');
    }

    // 6. Math minus & soft hyphen
    if (cfg.replace_math_minus) {
        const mathMinuses = ['−']; // Mathematical minus
        for (const ch of mathMinuses) {
            text = text.replaceAll(ch, '-');
        }
        text = text.replaceAll('­', ''); // Soft hyphen
    }

    // 7. Angle quotes
    if (cfg.replace_angle_quotes) {
        const doubleAngleQuotes = ['«', '»'];
        for (const ch of doubleAngleQuotes) {
            text = text.replaceAll(ch, '"');
        }
        const singleAngleQuotes = ['‹', '›'];
        for (const ch of singleAngleQuotes) {
            text = text.replaceAll(ch, "'");
        }
    }

    // 8. Bullet
    if (cfg.replace_bullet) {
        text = text.replaceAll('•', '-');
    }

    // 9. Additional ligatures ff, ffi, ffl
    if (cfg.replace_additional_ligatures) {
        const ligatures = [['ﬀ', 'ff'], ['ﬃ', 'ffi'], ['ﬄ', 'ffl']];
        for (const [lig, repl] of ligatures) {
            text = text.replaceAll(lig, repl);
        }
    }

    return text;
}

// The Python-specific parts like `if __name__ == '__main__':` and command-line argument parsing
// are not translated as they are not needed for the Chrome extension's JavaScript module.
// The normalize function will be imported or used directly in popup.js.
