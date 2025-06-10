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
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // 0. Surround em/en dashes without surrounding space
  if (cfg.surround_dashes) {
    // Use Unicode escapes to avoid encoding issues
    // \u2014 = em-dash, \u2013 = en-dash
    text = text.replace(/(?<=\S)([\u2014\u2013])(?=\S)/g, " - ");
  }

  // 1. Replace various dash characters with '-'
  if (cfg.normalize_dashes) {
    // Use Unicode escapes: em-dash, en-dash, non-breaking hyphen
    const dashes = ["\u2014", "\u2013", "\u2011"];
    for (const dash of dashes) {
      text = text.replaceAll(dash, "-");
    }
  }

  // 2. Normalize curly quotes to straight
  if (cfg.normalize_quotes) {
    // Double quotes: left and right curly quotes
    const doubleQuotes = ["\u201C", "\u201D"];
    for (const quote of doubleQuotes) {
      text = text.replaceAll(quote, '"');
    }
    // Single quotes: left and right curly quotes
    const singleQuotes = ["\u2018", "\u2019"];
    for (const quote of singleQuotes) {
      text = text.replaceAll(quote, "'");
    }
  }

  // 3. Strip non-breaking & zero-width spaces
  if (cfg.strip_spaces) {
    // Non-breaking space, narrow non-breaking space
    const nonBreakingSpaces = ["\u00A0", "\u202F"];
    for (const ch of nonBreakingSpaces) {
      text = text.replaceAll(ch, " ");
    }
    text = text.replaceAll("\u200B", ""); // Zero-width space
  }

  // 4. Replace ellipsis
  if (cfg.replace_ellipsis) {
    text = text.replaceAll("\u2026", "...");
  }

  // 5. Replace common ligatures fi, fl
  if (cfg.replace_common_ligatures) {
    text = text.replaceAll("\uFB01", "fi");
    text = text.replaceAll("\uFB02", "fl");
  }

  // 6. Math minus & soft hyphen
  if (cfg.replace_math_minus) {
    text = text.replaceAll("\u2212", "-"); // Mathematical minus
    text = text.replaceAll("\u00AD", ""); // Soft hyphen
  }

  // 7. Angle quotes
  if (cfg.replace_angle_quotes) {
    // Double angle quotes
    const doubleAngleQuotes = ["\u00AB", "\u00BB"];
    for (const ch of doubleAngleQuotes) {
      text = text.replaceAll(ch, '"');
    }
    // Single angle quotes
    const singleAngleQuotes = ["\u2039", "\u203A"];
    for (const ch of singleAngleQuotes) {
      text = text.replaceAll(ch, "'");
    }
  }

  // 8. Bullet
  if (cfg.replace_bullet) {
    text = text.replaceAll("\u2022", "-");
  }

  // 9. Additional ligatures ff, ffi, ffl
  if (cfg.replace_additional_ligatures) {
    const ligatures = [
      ["\uFB00", "ff"],
      ["\uFB03", "ffi"],
      ["\uFB04", "ffl"],
    ];
    for (const [lig, repl] of ligatures) {
      text = text.replaceAll(lig, repl);
    }
  }

  return text;
}

function getNormalizationSteps(text, config = {}) {
  const steps = [];
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Helper function to find all occurrences of a substring
  const findAllOccurrences = (str, subStr, replacement, description) => {
    let startIndex = 0;
    while ((startIndex = str.indexOf(subStr, startIndex)) !== -1) {
      steps.push({
        startIndex: startIndex,
        endIndex: startIndex + subStr.length,
        original: subStr,
        replacement: replacement,
        description: description,
      });
      startIndex += subStr.length; // Move past the current found substring
    }
  };

  // 0. Surround em/en dashes without surrounding space
  if (cfg.surround_dashes) {
    const regex = /(?<=\S)([\u2014\u2013])(?=\S)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const originalDash = match[1]; // The dash itself
      steps.push({
        startIndex: match.index,
        endIndex: match.index + originalDash.length,
        original: originalDash,
        replacement: " - ",
        description: `Surround ${
          originalDash === "\u2014" ? "em-dash" : "en-dash"
        } (${originalDash}) with spaces`,
      });
    }
  }

  // 1. Replace various dash characters with '-'
  if (cfg.normalize_dashes) {
    const dashes = [
      { char: "\u2014", name: "em-dash" },
      { char: "\u2013", name: "en-dash" },
      { char: "\u2011", name: "non-breaking hyphen" },
    ];
    for (const dash of dashes) {
      findAllOccurrences(
        text,
        dash.char,
        "-",
        `Replaced ${dash.name} (${dash.char}) with hyphen (-)`
      );
    }
  }

  // 2. Normalize curly quotes to straight
  if (cfg.normalize_quotes) {
    const quotes = [
      { char: "\u201C", name: "curly double quote", replacement: '"' },
      { char: "\u201D", name: "curly double quote", replacement: '"' },
      { char: "\u2018", name: "curly single quote", replacement: "'" },
      { char: "\u2019", name: "curly single quote", replacement: "'" },
    ];
    for (const quote of quotes) {
      findAllOccurrences(
        text,
        quote.char,
        quote.replacement,
        `Normalized ${quote.name} (${quote.char}) to straight quote (${quote.replacement})`
      );
    }
  }

  // 3. Strip non-breaking & zero-width spaces
  if (cfg.strip_spaces) {
    const nonBreakingSpaces = [
      { char: "\u00A0", name: "non-breaking space" },
      { char: "\u202F", name: "narrow non-breaking space" },
    ];
    for (const space of nonBreakingSpaces) {
      findAllOccurrences(
        text,
        space.char,
        " ",
        `Replaced ${space.name} with regular space`
      );
    }
    findAllOccurrences(text, "\u200B", "", "Stripped zero-width space");
  }

  // 4. Replace ellipsis
  if (cfg.replace_ellipsis) {
    findAllOccurrences(
      text,
      "\u2026",
      "...",
      "Replaced ellipsis character (\u2026) with three periods (...)"
    );
  }

  // 5. Replace common ligatures fi, fl
  if (cfg.replace_common_ligatures) {
    findAllOccurrences(
      text,
      "\uFB01",
      "fi",
      "Replaced ligature \uFB01 with fi"
    );
    findAllOccurrences(
      text,
      "\uFB02",
      "fl",
      "Replaced ligature \uFB02 with fl"
    );
  }

  // 6. Math minus & soft hyphen
  if (cfg.replace_math_minus) {
    findAllOccurrences(
      text,
      "\u2212",
      "-",
      "Replaced mathematical minus (\u2212) with hyphen (-)"
    );
    findAllOccurrences(text, "\u00AD", "", "Stripped soft hyphen");
  }

  // 7. Angle quotes
  if (cfg.replace_angle_quotes) {
    const angleQuotes = [
      { char: "\u00AB", name: "double angle quote", replacement: '"' },
      { char: "\u00BB", name: "double angle quote", replacement: '"' },
      { char: "\u2039", name: "single angle quote", replacement: "'" },
      { char: "\u203A", name: "single angle quote", replacement: "'" },
    ];
    for (const quote of angleQuotes) {
      findAllOccurrences(
        text,
        quote.char,
        quote.replacement,
        `Replaced ${quote.name} (${quote.char}) with ${
          quote.replacement === '"' ? "double" : "single"
        } quote (${quote.replacement})`
      );
    }
  }

  // 8. Bullet
  if (cfg.replace_bullet) {
    findAllOccurrences(
      text,
      "\u2022",
      "-",
      "Replaced bullet (\u2022) with hyphen (-)"
    );
  }

  // 9. Additional ligatures ff, ffi, ffl
  if (cfg.replace_additional_ligatures) {
    const ligatures = [
      { lig: "\uFB00", repl: "ff", name: "\uFB00 ligature" },
      { lig: "\uFB03", repl: "ffi", name: "\uFB03 ligature" },
      { lig: "\uFB04", repl: "ffl", name: "\uFB04 ligature" },
    ];
    for (const ligInfo of ligatures) {
      findAllOccurrences(
        text,
        ligInfo.lig,
        ligInfo.repl,
        `Replaced ${ligInfo.name} with ${ligInfo.repl}`
      );
    }
  }

  // Sort steps by startIndex to make them easier to process sequentially
  steps.sort((a, b) => a.startIndex - b.startIndex);

  return steps;
}

// The normalize function will be imported or used directly in popup.js.
