// script.js – dynamic calendar with month navigation

(function() {
  // DOM elements
  const monthDisplay = document.getElementById('monthDisplay');
  const yearDisplay = document.getElementById('yearDisplay');
  const daysGrid = document.getElementById('daysGrid');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // current date state (default: June 2026 – matching screenshot)
  let currentDate = new Date(2026, 5, 13); // month is 0-indexed: June = 5

  // helper: get month name (full)
  function getMonthName(monthIndex) {
    const names = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return names[monthIndex];
  }

  // render calendar based on currentDate
  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    // update header
    monthDisplay.textContent = getMonthName(month);
    yearDisplay.textContent = year;

    // first day of the month (0 = Sunday, 1 = Monday ...)
    const firstDayOfMonth = new Date(year, month, 1);
    let startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

    // we want Monday as first column → shift so Monday = 0
    // if Sunday (0) → shift to 6; else shift -1
    let startOffset = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1;

    // number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // number of days in previous month (for filling empty cells)
    const prevMonthDate = new Date(year, month, 0);
    const daysInPrevMonth = prevMonthDate.getDate();

    // get today's date (for highlighting)
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // build grid: 6 rows × 7 columns = 42 cells
    let gridHTML = '';

    // total cells: 42 (always enough for 6 rows)
    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
      let dayNumber;
      let isOtherMonth = false;
      let isToday = false;

      // calculate which day to display
      if (i < startOffset) {
        // days from previous month
        const prevMonthDay = daysInPrevMonth - startOffset + i + 1;
        dayNumber = prevMonthDay;
        isOtherMonth = true;
      } else if (i >= startOffset + daysInMonth) {
        // days from next month
        const nextMonthDay = i - (startOffset + daysInMonth) + 1;
        dayNumber = nextMonthDay;
        isOtherMonth = true;
      } else {
        // current month
        dayNumber = i - startOffset + 1;
        isOtherMonth = false;

        // check if it's today
        if (todayYear === year && todayMonth === month && todayDate === dayNumber) {
          isToday = true;
        }
      }

      // build cell classes
      let cellClass = 'day-cell';
      if (isOtherMonth) cellClass += ' other-month';
      if (isToday) cellClass += ' today';

      gridHTML += `<div class="${cellClass}">${dayNumber}</div>`;
    }

    daysGrid.innerHTML = gridHTML;
  }

  // navigation: change month by delta (prev/next)
  function changeMonth(delta) {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    currentDate = newDate;
    renderCalendar();
  }

  // event listeners
  prevBtn.addEventListener('click', function() {
    changeMonth(-1);
  });

  nextBtn.addEventListener('click', function() {
    changeMonth(1);
  });

  // initial render (June 2026 as shown in screenshot)
  renderCalendar();
})();