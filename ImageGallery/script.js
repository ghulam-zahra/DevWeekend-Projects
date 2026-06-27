// ─── Default Images ───────────────────────────────
const defaultImages = [
  {
    url: 'https://picsum.photos/seed/bloom/600/750',
    caption: 'softly blooming'
  },
  {
    url: 'https://picsum.photos/seed/meadow/600/750',
    caption: 'wild meadow afternoon'
  },
  {
    url: 'https://picsum.photos/seed/petals/600/750',
    caption: 'morning light through petals'
  },
  {
    url: 'https://picsum.photos/seed/lavender/600/750',
    caption: 'lavender fields forever'
  },
  {
    url: 'https://picsum.photos/seed/pastel/600/750',
    caption: 'pastel daydream'
  },
  {
    url: 'https://picsum.photos/seed/wonder/600/750',
    caption: 'a quiet cup of wonder'
  },
];

// ─── State ────────────────────────────────────────
let images        = [...defaultImages];
let currentIndex  = 0;
let direction     = 'horizontal'; // 'horizontal' | 'vertical'

// ─── DOM Refs ────────────────────────────────────
const slider        = document.getElementById('slider');
const sliderWrapper = document.getElementById('sliderWrapper');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const dotsEl        = document.getElementById('dots');
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxCap   = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const modal         = document.getElementById('modal');
const modalCancel   = document.getElementById('modalCancel');
const modalAdd      = document.getElementById('modalAdd');
const addBtn        = document.getElementById('addBtn');
const imgUrlInput   = document.getElementById('imgUrl');
const imgCapInput   = document.getElementById('imgCaption');
const dirBtns       = document.querySelectorAll('[data-direction]');

// ─── Render ───────────────────────────────────────
function render() {
  slider.innerHTML = '';

  if (images.length === 0) {
    slider.innerHTML = '<div class="empty-state">No images yet. Add some! ✿</div>';
    dotsEl.innerHTML = '';
    return;
  }

  images.forEach((img, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${img.url}" alt="${img.caption}" loading="lazy"
           onerror="this.onerror=null;this.src='https://picsum.photos/seed/fallback${i}/600/750'" />
      <div class="card-overlay">
        <p class="card-caption">${img.caption}</p>
      </div>
      <button class="card-delete" title="Remove" data-index="${i}">✕</button>
    `;

    // Open lightbox on card click (not delete btn)
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('card-delete')) return;
      openLightbox(img);
    });

    slider.appendChild(card);
  });

  // Delete buttons
  slider.querySelectorAll('.card-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index);
      images.splice(idx, 1);
      if (currentIndex >= images.length) currentIndex = Math.max(0, images.length - 1);
      render();
      slideTo(currentIndex, false);
    });
  });

  renderDots();
  slideTo(currentIndex, false);
}

// ─── Dots ─────────────────────────────────────────
function renderDots() {
  dotsEl.innerHTML = '';
  images.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === currentIndex ? ' active' : '');
    dot.setAttribute('aria-label', `Go to image ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });
}

function updateDots() {
  dotsEl.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentIndex);
  });
}

// ─── Slide Logic ──────────────────────────────────
function getCardSize() {
  const card = slider.querySelector('.card');
  if (!card) return 0;
  const gap = 24;
  return direction === 'horizontal'
    ? card.offsetWidth + gap
    : card.offsetHeight + gap;
}

function slideTo(index, animate = true) {
  if (!animate) slider.style.transition = 'none';
  else slider.style.transition = '';

  const offset = index * getCardSize();

  if (direction === 'horizontal') {
    slider.style.transform = `translateX(-${offset}px)`;
  } else {
    slider.style.transform = `translateY(-${offset}px)`;
  }

  // Re-enable transition after forced reflow
  if (!animate) requestAnimationFrame(() => { slider.style.transition = ''; });

  updateDots();
}

function goTo(index) {
  if (images.length === 0) return;
  currentIndex = Math.max(0, Math.min(index, images.length - 1));
  slideTo(currentIndex);
}

prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

// ─── Direction Toggle ─────────────────────────────
dirBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    direction = btn.dataset.direction;
    dirBtns.forEach(b => b.classList.toggle('active', b === btn));

    // Reconfigure slider axis
    slider.classList.toggle('vertical', direction === 'vertical');

    // Vertical: fix wrapper height to show one card at a time
    if (direction === 'vertical') {
      const card = slider.querySelector('.card');
      const h = card ? card.offsetHeight + 24 : 444;
      sliderWrapper.style.height = (h - 24) + 'px';
    } else {
      sliderWrapper.style.height = '';
    }

    slideTo(currentIndex, false);
  });
});

// ─── Lightbox ─────────────────────────────────────
function openLightbox(img) {
  lightboxImg.src = img.url;
  lightboxCap.textContent = img.caption;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

// ─── Add Image Modal ──────────────────────────────
addBtn.addEventListener('click', () => {
  imgUrlInput.value = '';
  imgCapInput.value = '';
  modal.classList.add('open');
  imgUrlInput.focus();
});

modalCancel.addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

modalAdd.addEventListener('click', () => {
  const url = imgUrlInput.value.trim();
  const caption = imgCapInput.value.trim() || 'untitled ✿';
  if (!url) { imgUrlInput.focus(); return; }

  images.push({ url, caption });
  modal.classList.remove('open');
  render();
  goTo(images.length - 1);
});

// Allow Enter key in modal
[imgUrlInput, imgCapInput].forEach(inp => {
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') modalAdd.click(); });
});

// ─── Keyboard Navigation ──────────────────────────
document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('open')) {
    if (e.key === 'Escape') closeLightbox();
    return;
  }
  if (modal.classList.contains('open')) {
    if (e.key === 'Escape') modal.classList.remove('open');
    return;
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')   goTo(currentIndex - 1);
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(currentIndex + 1);
});

// ─── Touch / Swipe ────────────────────────────────
let touchStartX = 0, touchStartY = 0;

sliderWrapper.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

sliderWrapper.addEventListener('touchend', (e) => {
  const dx = touchStartX - e.changedTouches[0].clientX;
  const dy = touchStartY - e.changedTouches[0].clientY;

  if (direction === 'horizontal' && Math.abs(dx) > 40) {
    dx > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
  }
  if (direction === 'vertical' && Math.abs(dy) > 40) {
    dy > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
  }
}, { passive: true });

// ─── Init ─────────────────────────────────────────
render();