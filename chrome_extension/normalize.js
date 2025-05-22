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

function getNormalizationSteps(text, config = {}) {
    const steps = [];
    const cfg = {...DEFAULT_CONFIG, ...config};

    // Helper function to find all occurrences of a substring
    const findAllOccurrences = (str, subStr, replacement, description) => {
        let startIndex = 0;
        while ((startIndex = str.indexOf(subStr, startIndex)) !== -1) {
            steps.push({
                startIndex: startIndex,
                endIndex: startIndex + subStr.length,
                original: subStr,
                replacement: replacement,
                description: description
            });
            startIndex += subStr.length; // Move past the current found substring
        }
    };

    // 0. Surround em/en dashes without surrounding space
    if (cfg.surround_dashes) {
        const regex = /(?<=\S)([—–])(?=\S)/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const originalDash = match[1]; // The dash itself
            steps.push({
                startIndex: match.index,
                endIndex: match.index + originalDash.length,
                original: originalDash,
                replacement: ' - ',
                description: `Surround ${originalDash === '—' ? 'em-dash' : 'en-dash'} (${originalDash}) with spaces`
            });
        }
    }

    // 1. Replace various dash characters with '-'
    if (cfg.normalize_dashes) {
        const dashes = [
            { char: '—', name: 'em-dash' },
            { char: '–', name: 'en-dash' },
            { char: '‑', name: 'non-breaking hyphen' }
        ];
        for (const dash of dashes) {
            findAllOccurrences(text, dash.char, '-', `Replaced ${dash.name} (${dash.char}) with hyphen (-)`);
        }
    }

    // 2. Normalize curly quotes to straight
    if (cfg.normalize_quotes) {
        const quotes = [
            { char: '“', name: 'curly double quote', replacement: '"' },
            { char: '”', name: 'curly double quote', replacement: '"' },
            { char: '‘', name: 'curly single quote', replacement: "'" },
            { char: '’', name: 'curly single quote', replacement: "'" }
        ];
        for (const quote of quotes) {
            findAllOccurrences(text, quote.char, quote.replacement, `Normalized ${quote.name} (${quote.char}) to straight quote (${quote.replacement})`);
        }
    }

    // 3. Strip non-breaking & zero-width spaces
    if (cfg.strip_spaces) {
        const nonBreakingSpaces = [
            { char: ' ', name: 'non-breaking space' },
            { char: ' ', name: 'narrow non-breaking space' }
        ];
        for (const space of nonBreakingSpaces) {
            findAllOccurrences(text, space.char, ' ', `Replaced ${space.name} with regular space`);
        }
        findAllOccurrences(text, '​', '', 'Stripped zero-width space');
    }

    // 4. Replace ellipsis
    if (cfg.replace_ellipsis) {
        findAllOccurrences(text, '…', '...', 'Replaced ellipsis character (…) with three periods (...)');
    }

    // 5. Replace common ligatures fi, fl
    if (cfg.replace_common_ligatures) {
        findAllOccurrences(text, 'ﬁ', 'fi', 'Replaced ligature ﬁ with fi');
        findAllOccurrences(text, 'ﬂ', 'fl', 'Replaced ligature ﬂ with fl');
    }

    // 6. Math minus & soft hyphen
    if (cfg.replace_math_minus) {
        findAllOccurrences(text, '−', '-', 'Replaced mathematical minus (−) with hyphen (-)');
        findAllOccurrences(text, '­', '', 'Stripped soft hyphen'); // '­' is U+00AD
    }

    // 7. Angle quotes
    if (cfg.replace_angle_quotes) {
        const angleQuotes = [
            { char: '«', name: 'double angle quote', replacement: '"' },
            { char: '»', name: 'double angle quote', replacement: '"' },
            { char: '‹', name: 'single angle quote', replacement: "'" },
            { char: '›', name: 'single angle quote', replacement: "'" }
        ];
        for (const quote of angleQuotes) {
            findAllOccurrences(text, quote.char, quote.replacement, `Replaced ${quote.name} (${quote.char}) with ${quote.replacement === '"' ? 'double' : 'single'} quote (${quote.replacement})`);
        }
    }

    // 8. Bullet
    if (cfg.replace_bullet) {
        findAllOccurrences(text, '•', '-', 'Replaced bullet (•) with hyphen (-)');
    }

    // 9. Additional ligatures ff, ffi, ffl
    if (cfg.replace_additional_ligatures) {
        const ligatures = [
            { lig: 'ﬀ', repl: 'ff', name: 'ﬀ ligature' },
            { lig: 'ﬃ', repl: 'ffi', name: 'ﬃ ligature' },
            { lig: 'ﬄ', repl: 'ffl', name: 'ﬄ ligature' }
        ];
        for (const ligInfo of ligatures) {
            findAllOccurrences(text, ligInfo.lig, ligInfo.repl, `Replaced ${ligInfo.name} with ${ligInfo.repl}`);
        }
    }
    
    // Sort steps by startIndex to make them easier to process sequentially
    steps.sort((a, b) => a.startIndex - b.startIndex);

    return steps;
}

// The Python-specific parts like `if __name__ == '__main__':` and command-line argument parsing
// are not translated as they are not needed for the Chrome extension's JavaScript module.
// The normalize function will be imported or used directly in popup.js.
