document.addEventListener('DOMContentLoaded', () => {
  const codeInput = document.getElementById('codeInput');
  const cleanButton = document.getElementById('cleanButton');
  const copyButton = document.getElementById('copyButton');

  if (cleanButton) {
    cleanButton.addEventListener('click', () => {
      if (codeInput) {
        const inputText = codeInput.value;
        // Assuming normalize.js is loaded and normalize function is in global scope
        if (typeof normalize === 'function') {
          const cleanedText = normalize(inputText);
          codeInput.value = cleanedText;
        } else {
          console.error('normalize function not found. Make sure normalize.js is loaded.');
          // Optionally, alert the user or show an error in the UI
          // alert('Error: Normalization script not loaded correctly.');
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
            // Optional: Visual feedback
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
              copyButton.textContent = originalText;
            }, 1500); // Revert after 1.5 seconds
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
            // Optionally, alert the user or show an error in the UI
            // alert('Error: Could not copy text to clipboard.');
          });
      }
    });
  } else {
    console.error('Copy button not found.');
  }
});
