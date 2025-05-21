document.addEventListener('DOMContentLoaded', () => {
  const codeInput = document.getElementById('codeInput');
  const cleanButton = document.getElementById('cleanButton');
  const copyButton = document.getElementById('copyButton');
  const highlightedTextDisplay = document.getElementById('highlightedTextDisplay');

  // Helper function to escape HTML characters
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function updateHighlighting() {
    if (!codeInput || !highlightedTextDisplay) {
      console.error('Code input or highlight display area not found.');
      return;
    }
    if (typeof getNormalizationSteps !== 'function') {
      console.error('getNormalizationSteps function not found. Make sure normalize.js is loaded.');
      highlightedTextDisplay.textContent = 'Error: Highlighting unavailable (missing getNormalizationSteps).';
      return;
    }

    const text = codeInput.value;
    const steps = getNormalizationSteps(text); // Assuming config is default
    
    let htmlContent = '';
    let currentIndex = 0;

    steps.forEach(step => {
      // Add text before the current step
      if (step.startIndex > currentIndex) {
        htmlContent += escapeHTML(text.substring(currentIndex, step.startIndex));
      }
      
      // Add highlighted text for the current step
      const originalSegment = escapeHTML(step.original);
      const tooltipText = escapeHTML(step.description);
      
      htmlContent += `<span class="highlight-char">${originalSegment}<span class="tooltip-text">${tooltipText}</span></span>`;
      
      currentIndex = step.endIndex;
    });

    // Add any remaining text after the last step
    if (currentIndex < text.length) {
      htmlContent += escapeHTML(text.substring(currentIndex));
    }

    highlightedTextDisplay.innerHTML = htmlContent;
  }

  if (cleanButton) {
    cleanButton.addEventListener('click', () => {
      if (codeInput) {
        const inputText = codeInput.value;
        if (typeof normalize === 'function') {
          const cleanedText = normalize(inputText);
          codeInput.value = cleanedText;
          // After cleaning, update highlighting as well
          updateHighlighting(); 
        } else {
          console.error('normalize function not found. Make sure normalize.js is loaded.');
        }
      }
    });
  } else {
    console.error('Clean button not found.');
  }

  if (copyButton) {
    copyButton.addEventListener('click', () => {
      if (codeInput) {
        const textToCopy = codeInput.value;
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
              copyButton.textContent = originalText;
            }, 1500);
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
          });
      }
    });
  } else {
    console.error('Copy button not found.');
  }

  if (codeInput) {
    codeInput.addEventListener('input', updateHighlighting);
    // Initial call to highlight any pre-filled text (e.g., from browser cache)
    updateHighlighting(); 
  } else {
    console.error('Code input element not found.');
  }
});
