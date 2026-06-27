// script.js – interactive background, effects & animations

(function() {
  "use strict";

  // DOM refs
  const imageFrame = document.getElementById('imageFrame');
  const displayImage = document.getElementById('displayImage');
  const bgColorPicker = document.getElementById('bgColor');
  const effectSelect = document.getElementById('effectSelect');
  const animationSelect = document.getElementById('animationSelect');
  const resetBtn = document.getElementById('resetBtn');

  // ----- helper: remove all animation classes -----
  function removeAllAnimations() {
    displayImage.classList.remove('anim-float', 'anim-pulse', 'anim-spin', 'anim-bounce');
  }

  // ----- apply animation from select -----
  function applyAnimation(animValue) {
    removeAllAnimations();
    if (animValue === 'none') return;
    // map select value to class
    const animMap = {
      'float': 'anim-float',
      'pulse': 'anim-pulse',
      'spin': 'anim-spin',
      'bounce': 'anim-bounce'
    };
    const className = animMap[animValue];
    if (className) {
      displayImage.classList.add(className);
    }
  }

  // ----- apply effect (filter) -----
  function applyEffect(effectValue) {
    const filterMap = {
      'none': 'none',
      'blur': 'blur(6px)',
      'grayscale': 'grayscale(0.8)',
      'sepia': 'sepia(0.7)',
      'saturate': 'saturate(2.4)',
      'hue-rotate': 'hue-rotate(190deg)'
    };
    const filterValue = filterMap[effectValue] || 'none';
    displayImage.style.filter = filterValue;
  }

  // ----- change background color of frame -----
  function setBackgroundColor(colorHex) {
    imageFrame.style.backgroundColor = colorHex;
    // also keep the picker in sync
    bgColorPicker.value = colorHex;
  }

  // ----- reset everything to default (cute) -----
  function resetAll() {
    // reset background to default pastel
    const defaultBg = '#ffe4f0';
    setBackgroundColor(defaultBg);
    // reset effect
    effectSelect.value = 'none';
    applyEffect('none');
    // reset animation
    animationSelect.value = 'none';
    removeAllAnimations();
    // additional clean: remove any inline transform from animations (safe)
    displayImage.style.transform = '';
    // sync picker
    bgColorPicker.value = defaultBg;
  }

  // ----- event listeners -----

  // 1. background color picker
  bgColorPicker.addEventListener('input', function(e) {
    const color = e.target.value;
    setBackgroundColor(color);
  });

  // 2. effect dropdown
  effectSelect.addEventListener('change', function(e) {
    const effect = e.target.value;
    applyEffect(effect);
  });

  // 3. animation dropdown
  animationSelect.addEventListener('change', function(e) {
    const anim = e.target.value;
    applyAnimation(anim);
  });

  // 4. reset button
  resetBtn.addEventListener('click', resetAll);

  // ----- initialise with default values (already set in html, but ensure consistency) -----
  function init() {
    // set background from picker initial value
    const initialBg = bgColorPicker.value || '#ffe4f0';
    setBackgroundColor(initialBg);
    // set effect from select
    const initialEffect = effectSelect.value || 'none';
    applyEffect(initialEffect);
    // set animation from select (none by default)
    const initialAnim = animationSelect.value || 'none';
    removeAllAnimations();
    // if not none, apply it (but default is none)
    if (initialAnim !== 'none') {
      applyAnimation(initialAnim);
    }
    // extra: ensure image frame has a pleasant border
    imageFrame.style.borderRadius = '60px 60px 40px 40px';
  }

  // run init
  init();

  // (optional) small extra: if image fails to load, keep it cute
  displayImage.addEventListener('error', function() {
    // just a subtle fallback
    displayImage.alt = '🌸 aesthetic';
  });

})();