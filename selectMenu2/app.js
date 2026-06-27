// ── Tag Picker ──────────────────────────────────────────────
const tags = document.querySelectorAll('#tags .tag');
const tagOutputSpan = document.querySelector('#tag-output span');

function updateTagOutput() {
  const selected = [...tags]
    .filter(t => t.classList.contains('selected'))
    .map(t => t.dataset.val.charAt(0).toUpperCase() + t.dataset.val.slice(1));

  tagOutputSpan.textContent = selected.length ? selected.join(', ') : 'None selected';
}

tags.forEach(tag => {
  tag.addEventListener('click', () => {
    tag.classList.toggle('selected');
    updateTagOutput();
  });
});

// ── Custom Dropdown ─────────────────────────────────────────
const planBtn = document.getElementById('plan-btn');
const planMenu = document.getElementById('plan-menu');
const planLabel = document.getElementById('plan-label');
let planOpen = false;

function openDropdown() {
  planOpen = true;
  planMenu.classList.add('open');
  planBtn.classList.add('open');
  planBtn.setAttribute('aria-expanded', 'true');
}

function closeDropdown() {
  planOpen = false;
  planMenu.classList.remove('open');
  planBtn.classList.remove('open');
  planBtn.setAttribute('aria-expanded', 'false');
}

planBtn.addEventListener('click', () => {
  planOpen ? closeDropdown() : openDropdown();
});

// Set initial label from the default active item
const defaultActive = planMenu.querySelector('.dropdown-item.active');
if (defaultActive) {
  planLabel.textContent = defaultActive.querySelector('.item-name').textContent;
}

planMenu.querySelectorAll('.dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    planMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    planLabel.textContent = item.querySelector('.item-name').textContent;
    closeDropdown();
  });
});

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  if (!document.getElementById('plan-wrap').contains(e.target)) {
    closeDropdown();
  }
});

// Keyboard support: close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && planOpen) closeDropdown();
});

// ── Toast ───────────────────────────────────────────────────
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  toastMsg.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

document.getElementById('submit-btn').addEventListener('click', () => {
  const plan = planLabel.textContent;
  if (plan === 'Select a plan') {
    showToast('Please choose a plan first.');
  } else {
    showToast(`Plan set to "${plan}"`);
  }
});