
(function() {
  'use strict';

  // DOM refs
  const taskInput = document.getElementById('taskInput');
  const addBtn = document.getElementById('addBtn');
  const taskList = document.getElementById('taskList');
  const taskCounter = document.getElementById('taskCounter');
  const clearCompletedBtn = document.getElementById('clearCompleted');

  // ----- helper: update counter -----
  function updateCounter() {
    const items = taskList.querySelectorAll('.task-item');
    const total = items.length;
    const completed = taskList.querySelectorAll('.task-item.completed').length;
    taskCounter.textContent = `${total} task${total !== 1 ? 's' : ''}`;
  }

  // ----- create a new task element -----
  function createTaskElement(taskText, isCompleted = false) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (isCompleted) li.classList.add('completed');

    // checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = isCompleted;

    // text span
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = taskText;

    // delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';

    // assemble
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);

    // ----- event listeners (attached to the element) -----
    // toggle completed
    checkbox.addEventListener('change', function(e) {
      if (this.checked) {
        li.classList.add('completed');
      } else {
        li.classList.remove('completed');
      }
      updateCounter();
      // optional: save to localStorage if needed, but we keep it simple
    });

    // delete task
    delBtn.addEventListener('click', function(e) {
      li.remove();
      updateCounter();
    });

    return li;
  }

  // ----- add task from input -----
  function addTaskFromInput() {
    const rawText = taskInput.value.trim();
    if (rawText === '') {
      // subtle feedback: shake or just ignore
      taskInput.style.border = '1px solid #d95b5b';
      setTimeout(() => { taskInput.style.border = 'none'; }, 400);
      return;
    }
    // clear any error style
    taskInput.style.border = 'none';

    const newLi = createTaskElement(rawText, false);
    taskList.appendChild(newLi);
    taskInput.value = '';
    taskInput.focus();
    updateCounter();
  }

  // ----- clear completed tasks -----
  function clearCompleted() {
    const completedItems = taskList.querySelectorAll('.task-item.completed');
    if (completedItems.length === 0) {
      // subtle hint: maybe flash the counter
      taskCounter.style.color = '#b05a5a';
      setTimeout(() => { taskCounter.style.color = ''; }, 400);
      return;
    }
    completedItems.forEach(item => item.remove());
    updateCounter();
  }

  // ----- load demo tasks from screenshot (if not already present) -----
  function loadDemoTasks() {
    const existingItems = taskList.querySelectorAll('.task-item');
    if (existingItems.length === 0) {
      // fallback: create the three demo tasks
      const demos = [
        { text: 'Create a JavaScript project', done: false },
        { text: 'Upload it online', done: false },
        { text: 'Add project link in the resume', done: true }
      ];
      demos.forEach(d => {
        const li = createTaskElement(d.text, d.done);
        taskList.appendChild(li);
      });
    } else {
      // attach events to existing static items (they have no listeners)
      existingItems.forEach(li => {
        const checkbox = li.querySelector('.task-checkbox');
        const delBtn = li.querySelector('.delete-btn');
        if (checkbox) {
          // replace with fresh listener (remove old ones by cloning? we just add)
          // but to avoid duplicate listeners, we remove existing and add new.
          // we use a simple approach: we recreate the listeners.
          const newCheckbox = checkbox.cloneNode(true);
          checkbox.parentNode.replaceChild(newCheckbox, checkbox);
          // attach toggle
          newCheckbox.addEventListener('change', function(e) {
            if (this.checked) li.classList.add('completed');
            else li.classList.remove('completed');
            updateCounter();
          });
          // also ensure that if checkbox is checked, li has class
          if (newCheckbox.checked) li.classList.add('completed');
          else li.classList.remove('completed');
        }
        if (delBtn) {
          const newDel = delBtn.cloneNode(true);
          delBtn.parentNode.replaceChild(newDel, delBtn);
          newDel.addEventListener('click', function(e) {
            li.remove();
            updateCounter();
          });
        }
      });
    }
    updateCounter();
  }

  // ----- event listeners for Add button and Enter key -----
  addBtn.addEventListener('click', addTaskFromInput);

  taskInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTaskFromInput();
    }
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  // ----- init: load demo tasks and update counter -----
  loadDemoTasks();
  window.todo = {
    addTaskFromInput,
    clearCompleted,
    updateCounter
  };

})();