document.addEventListener('DOMContentLoaded', function () {
  const editableCodeInput = document.getElementById('editableCodeInput');
  const toastNotification = document.getElementById('toastNotification');

  // --- Helper: escapeHTML ---
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // --- Helper: Debounce ---
  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  // --- Helper: Toast ---
  let toastTimeout; // To manage clearing existing toast timeouts
  function showToast(message, duration = 2000) {
    if (!toastNotification) return;
    clearTimeout(toastTimeout); // Clear any existing toast timeout
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, duration);
  }

  // --- Helper: Selection/Cursor (Character Offset Based) ---
  // This approach saves the cursor position based on character offsets
  // within the plain text content of the container.
  function saveSelection(containerEl) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || !containerEl.contains(selection.anchorNode)) {
      return null; // No selection or selection is outside the container
    }
    const range = selection.getRangeAt(0);
    const preSelectionRange = document.createRange();
    preSelectionRange.selectNodeContents(containerEl);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    return {
      start: start,
      end: start + range.toString().length
    };
  }

  function restoreSelection(containerEl, savedSel) {
    if (!savedSel) return;

    let charIndex = 0;
    const range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);

    let nodeStack = [containerEl];
    let node, foundStart = false, foundEnd = false;

    while (!foundEnd && (node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharIndex = charIndex + node.length;
        if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
          range.setStart(node, savedSel.start - charIndex);
          foundStart = true;
        }
        if (!foundEnd && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
          range.setEnd(node, savedSel.end - charIndex);
          foundEnd = true;
        }
        charIndex = nextCharIndex;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }
    // Fallback if end was not found (e.g. text shortened)
     if (!foundEnd) {
        range.setEnd(containerEl, containerEl.childNodes.length);
     }


    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  
  // --- Helper: Get Raw Text from contenteditable ---
  function getRawText(containerEl) {
    let text = '';
    containerEl.childNodes.forEach(node => {
        text += node.textContent;
    });
    return text;
  }


  // --- Core Logic: processInputAndHighlight ---
  function processInputAndHighlight() {
    if (!editableCodeInput || typeof getNormalizationSteps !== 'function' || typeof normalize !== 'function') {
      console.error("Missing elements or normalize functions.");
      // Optionally show a toast error here if it's a persistent issue
      return;
    }
    
    const rawText = getRawText(editableCodeInput);
    const savedSel = saveSelection(editableCodeInput);
    const steps = getNormalizationSteps(rawText); // Assuming this is available from normalize.js

    editableCodeInput.innerHTML = ''; // Clear previous content

    let currentIndex = 0;
    // Ensure steps are sorted by startIndex, as getNormalizationSteps should already do
    // steps.sort((a, b) => a.startIndex - b.startIndex); 

    for (const step of steps) {
      if (currentIndex < step.startIndex) {
        editableCodeInput.appendChild(document.createTextNode(rawText.substring(currentIndex, step.startIndex)));
      }
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'highlight-char';
      // Use textContent for setting text on spans to prevent creating HTML entities from original text
      highlightSpan.textContent = step.original; 

      const tooltipSpan = document.createElement('span');
      tooltipSpan.className = 'tooltip-text';
      tooltipSpan.textContent = step.description; // Descriptions are assumed to be safe or should be escaped if from user
      highlightSpan.appendChild(tooltipSpan);

      editableCodeInput.appendChild(highlightSpan);
      currentIndex = step.endIndex;
    }
    if (currentIndex < rawText.length) {
      editableCodeInput.appendChild(document.createTextNode(rawText.substring(currentIndex)));
    }
    
    if (savedSel) {
      restoreSelection(editableCodeInput, savedSel);
    } else {
      // Fallback: place cursor at the end if no selection could be saved/restored
      const rangeToEnd = document.createRange();
      rangeToEnd.selectNodeContents(editableCodeInput);
      rangeToEnd.collapse(false); // false to collapse to end
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(rangeToEnd);
    }

    // Normalize and copy
    const cleanedText = normalize(rawText); 
    navigator.clipboard.writeText(cleanedText)
      .then(() => {
        // Only show copy success if text was actually copied and is not empty
        if (cleanedText.length > 0) {
            showToast("Copied cleaned text to clipboard!");
        } else if (rawText.length > 0 && cleanedText.length === 0) {
            // Edge case: if normalization results in empty string from non-empty input
            showToast("Text normalized to empty, clipboard not changed.");
        }
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        showToast("Failed to copy text.");
      });
  }

  // --- Event Listener Setup ---
  if (editableCodeInput) {
    editableCodeInput.addEventListener('input', debounce(processInputAndHighlight, 300)); // 300ms delay
    
    // Initial processing if content is already there (e.g. browser restore)
    // Check if it's not just placeholder-like or empty
    if (getRawText(editableCodeInput).trim().length > 0) {
       processInputAndHighlight(); 
    } else {
      // Set a placeholder visually via CSS if possible, or a gentle JS nudge
      // For now, we assume CSS :empty:before might handle this, or it's fine to be blank.
    }
  } else {
    console.error("editableCodeInput element not found.");
    showToast("Error: Code input area not found!", 5000);
  }
});
