// ── Data ────────────────────────────────────────────
const COL_COLORS = [
  '#7c6af7', '#5eead4', '#f472b6', '#fb923c', '#34d399', '#60a5fa', '#e879f9'
];

let columns = [
  {
    id: 'col-1', title: 'To Do', color: COL_COLORS[0],
    tasks: [
      { id: 't1', title: 'Research competitors', priority: 'medium' },
      { id: 't2', title: 'Write project brief', priority: 'high' },
      { id: 't3', title: 'Set up repo & CI', priority: 'low' },
    ]
  },
  {
    id: 'col-2', title: 'In Progress', color: COL_COLORS[1],
    tasks: [
      { id: 't4', title: 'Design wireframes', priority: 'high' },
      { id: 't5', title: 'Build auth flow', priority: 'medium' },
    ]
  },
  {
    id: 'col-3', title: 'Review', color: COL_COLORS[2],
    tasks: [
      { id: 't6', title: 'Code review PR #12', priority: 'medium' },
    ]
  },
  {
    id: 'col-4', title: 'Done', color: COL_COLORS[3],
    tasks: [
      { id: 't7', title: 'Project kickoff meeting', priority: 'low' },
      { id: 't8', title: 'Stakeholder sign-off', priority: 'low' },
    ]
  },
];

let colorIndex = columns.length;
let dragCard   = null;   // the card element being dragged
let dragTaskId = null;
let dragSrcCol = null;   // source column id
let placeholder = null;
let activeTaskColId = null; // which column the "add task" modal targets
let selectedPriority = 'low';

// ── DOM ─────────────────────────────────────────────
const board        = document.getElementById('board');
const taskCount    = document.getElementById('taskCount');
const addColBtn    = document.getElementById('addColBtn');
const colModal     = document.getElementById('colModal');
const colNameInput = document.getElementById('colNameInput');
const colCancel    = document.getElementById('colCancel');
const colConfirm   = document.getElementById('colConfirm');
const taskModal    = document.getElementById('taskModal');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskCancel   = document.getElementById('taskCancel');
const taskConfirm  = document.getElementById('taskConfirm');
const priBtns      = document.querySelectorAll('.pri-btn');
const toastEl      = document.getElementById('toast');

// ── Render ───────────────────────────────────────────
function render() {
  board.innerHTML = '';

  if (columns.length === 0) {
    board.innerHTML = `
      <div class="empty-hint">
        <span class="big">⬡</span>
        <p>No columns yet.<br>Click <strong>+ Add Column</strong> to get started.</p>
      </div>`;
    updateCount();
    return;
  }

  columns.forEach(col => {
    const colEl = buildColumn(col);
    board.appendChild(colEl);
  });

  updateCount();
  attachDragListeners();
}

function buildColumn(col) {
  const el = document.createElement('div');
  el.className = 'column';
  el.dataset.colId = col.id;

  el.innerHTML = `
    <div class="col-header">
      <div class="col-title-wrap">
        <span class="col-dot" style="background:${col.color}"></span>
        <span class="col-title">${esc(col.title)}</span>
      </div>
      <span class="col-count">${col.tasks.length}</span>
      <div class="col-actions">
        <button class="col-btn delete" data-col="${col.id}" title="Delete column">✕</button>
      </div>
    </div>
    <div class="task-list" data-col="${col.id}">
      ${col.tasks.map(t => buildCardHTML(t)).join('')}
    </div>
    <button class="add-task-btn" data-col="${col.id}">＋ Add task</button>
  `;

  // Delete column
  el.querySelector('.col-btn.delete').addEventListener('click', () => {
    columns = columns.filter(c => c.id !== col.id);
    render();
    toast(`"${col.title}" removed`);
  });

  // Add task
  el.querySelector('.add-task-btn').addEventListener('click', () => {
    activeTaskColId = col.id;
    taskTitleInput.value = '';
    setSelectedPriority('low');
    openModal(taskModal);
    taskTitleInput.focus();
  });

  // Delete task buttons
  el.querySelectorAll('.task-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const tid = btn.dataset.task;
      const c = columns.find(c => c.id === col.id);
      const taskTitle = c.tasks.find(t => t.id === tid)?.title || 'Task';
      c.tasks = c.tasks.filter(t => t.id !== tid);
      render();
      toast(`"${taskTitle}" deleted`);
    });
  });

  return el;
}

function buildCardHTML(task) {
  return `
    <div class="task-card" draggable="true" data-task="${task.id}" data-priority="${task.priority}">
      <span class="task-title">${esc(task.title)}</span>
      <div class="task-footer">
        <span class="priority-tag ${task.priority}">${task.priority}</span>
        <button class="task-delete" data-task="${task.id}" title="Delete task">✕</button>
      </div>
    </div>
  `;
}

// ── Count ────────────────────────────────────────────
function updateCount() {
  const total = columns.reduce((sum, c) => sum + c.tasks.length, 0);
  taskCount.textContent = `${total} task${total !== 1 ? 's' : ''}`;
}

// ── Drag & Drop ──────────────────────────────────────
function attachDragListeners() {
  // Cards
  document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('dragstart', onDragStart);
    card.addEventListener('dragend', onDragEnd);
  });

  // Task lists (drop zones)
  document.querySelectorAll('.task-list').forEach(list => {
    list.addEventListener('dragover', onDragOver);
    list.addEventListener('dragleave', onDragLeave);
    list.addEventListener('drop', onDrop);
  });
}

function onDragStart(e) {
  dragCard   = e.currentTarget;
  dragTaskId = dragCard.dataset.task;
  dragSrcCol = dragCard.closest('.task-list').dataset.col;
  dragCard.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragTaskId);
}

function onDragEnd() {
  if (dragCard) dragCard.classList.remove('dragging');
  removePlaceholder();
  document.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
  dragCard = null;
  dragTaskId = null;
  dragSrcCol = null;
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const list = e.currentTarget;
  list.closest('.column').classList.add('drag-over');

  // Find insertion point
  const afterEl = getDragAfterElement(list, e.clientY);

  // Move or create placeholder
  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.className = 'drop-placeholder';
  }

  if (afterEl == null) {
    list.appendChild(placeholder);
  } else {
    list.insertBefore(placeholder, afterEl);
  }
}

function onDragLeave(e) {
  const list = e.currentTarget;
  if (!list.contains(e.relatedTarget)) {
    list.closest('.column').classList.remove('drag-over');
  }
}

function onDrop(e) {
  e.preventDefault();
  const list    = e.currentTarget;
  const destCol = list.dataset.col;

  // Find after element again
  const afterEl = getDragAfterElement(list, e.clientY);
  const afterTaskId = afterEl ? afterEl.dataset.task : null;

  // Move task in data
  moveTask(dragTaskId, dragSrcCol, destCol, afterTaskId);

  removePlaceholder();
  document.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
  render();
}

function getDragAfterElement(list, y) {
  const cards = [...list.querySelectorAll('.task-card:not(.dragging)')];
  return cards.reduce((closest, card) => {
    const box = card.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: card };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function removePlaceholder() {
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.removeChild(placeholder);
  }
  placeholder = null;
}

function moveTask(taskId, srcColId, destColId, afterTaskId) {
  const src  = columns.find(c => c.id === srcColId);
  const dest = columns.find(c => c.id === destColId);
  if (!src || !dest) return;

  const taskIdx = src.tasks.findIndex(t => t.id === taskId);
  if (taskIdx === -1) return;

  const [task] = src.tasks.splice(taskIdx, 1);

  if (afterTaskId == null) {
    dest.tasks.push(task);
  } else {
    const afterIdx = dest.tasks.findIndex(t => t.id === afterTaskId);
    dest.tasks.splice(afterIdx, 0, task);
  }
}

// ── Add Column ───────────────────────────────────────
addColBtn.addEventListener('click', () => {
  colNameInput.value = '';
  openModal(colModal);
  colNameInput.focus();
});
colCancel.addEventListener('click', () => closeModal(colModal));
colModal.addEventListener('click', e => { if (e.target === colModal) closeModal(colModal); });

colConfirm.addEventListener('click', () => {
  const name = colNameInput.value.trim();
  if (!name) { colNameInput.focus(); return; }

  columns.push({
    id: 'col-' + Date.now(),
    title: name,
    color: COL_COLORS[colorIndex++ % COL_COLORS.length],
    tasks: []
  });

  closeModal(colModal);
  render();
  toast(`"${name}" column added`);
});

colNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') colConfirm.click(); });

// ── Add Task ─────────────────────────────────────────
taskCancel.addEventListener('click', () => closeModal(taskModal));
taskModal.addEventListener('click', e => { if (e.target === taskModal) closeModal(taskModal); });

priBtns.forEach(btn => {
  btn.addEventListener('click', () => setSelectedPriority(btn.dataset.priority));
});

function setSelectedPriority(p) {
  selectedPriority = p;
  priBtns.forEach(b => b.classList.toggle('active', b.dataset.priority === p));
}

taskConfirm.addEventListener('click', () => {
  const title = taskTitleInput.value.trim();
  if (!title) { taskTitleInput.focus(); return; }

  const col = columns.find(c => c.id === activeTaskColId);
  if (!col) return;

  col.tasks.push({
    id: 't' + Date.now(),
    title,
    priority: selectedPriority
  });

  closeModal(taskModal);
  render();
  toast(`Task added to "${col.title}"`);
});

taskTitleInput.addEventListener('keydown', e => { if (e.key === 'Enter') taskConfirm.click(); });

// ── Modals ───────────────────────────────────────────
function openModal(m)  { m.classList.add('open'); }
function closeModal(m) { m.classList.remove('open'); }

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal(colModal);
    closeModal(taskModal);
  }
});

// ── Toast ────────────────────────────────────────────
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2500);
}

// ── Helpers ──────────────────────────────────────────
function esc(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ─────────────────────────────────────────────
render();