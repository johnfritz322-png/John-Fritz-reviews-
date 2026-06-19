const starterButton = document.querySelector('[data-copy-review]');
const starterText = document.querySelector('#starterText');

if (starterButton && starterText) {
  starterButton.addEventListener('click', async () => {
    const text = starterText.textContent.trim();
    starterText.classList.add('visible');

    try {
      await navigator.clipboard.writeText(text);
      starterButton.textContent = 'Copied!';
      setTimeout(() => starterButton.textContent = 'Copy Review Starter', 1800);
    } catch (error) {
      starterButton.textContent = 'Review Starter Shown Below';
    }
  });
}
