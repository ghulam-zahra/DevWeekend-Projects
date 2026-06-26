(function() {
    "use strict";

    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');

    let currentInput = '0';
    let previousInput = '';
    let operator = null;
    let shouldResetDisplay = false;
    let justEvaluated = false;
    let expression = '';

    function updateDisplay() {
        let displayValue = currentInput;
        if (displayValue.length > 14) {
            displayValue = parseFloat(displayValue).toExponential(6);
        }
        resultEl.textContent = displayValue;
        expressionEl.textContent = expression;
    }

    function evaluate(a, op, b) {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (isNaN(numA) || isNaN(numB)) return '0';

        let result;
        switch (op) {
            case '+': result = numA + numB; break;
            case '−': result = numA - numB; break;
            case '×': result = numA * numB; break;
            case '÷':
                if (numB === 0) return 'Error';
                result = numA / numB;
                break;
            default: return currentInput;
        }

        if (Number.isFinite(result)) {
            if (Number.isInteger(result)) {
                return result.toString();
            } else {
                return parseFloat(result.toPrecision(12)).toString();
            }
        }
        return 'Error';
    }

    function inputDigit(digit) {
        if (justEvaluated) {
            currentInput = '0';
            previousInput = '';
            operator = null;
            justEvaluated = false;
            shouldResetDisplay = false;
            expression = '';
        }

        if (shouldResetDisplay) {
            currentInput = '0';
            shouldResetDisplay = false;
        }

        if (digit === '.') {
            if (currentInput.includes('.')) return;
            currentInput += '.';
        } else {
            if (currentInput === '0' && digit !== '.') {
                currentInput = digit;
            } else {
                if (currentInput.replace('-', '').replace('.', '').length >= 15) return;
                currentInput += digit;
            }
        }

        // Update expression with current number
        if (operator && !justEvaluated) {
            const parts = expression.split(' ');
            if (parts.length >= 2) {
                parts[parts.length - 1] = currentInput;
                expression = parts.join(' ');
            } else {
                expression = previousInput + ' ' + operator + ' ' + currentInput;
            }
        } else if (!operator) {
            expression = currentInput;
        }

        updateDisplay();
    }

    function handleOperator(op) {
        const current = parseFloat(currentInput);
        if (isNaN(current)) return;

        if (operator && !shouldResetDisplay) {
            const result = evaluate(previousInput, operator, currentInput);
            currentInput = result;
            updateDisplay();
            previousInput = currentInput;
            // Update expression for chaining
            const parts = expression.split(' ');
            if (parts.length >= 3) {
                expression = currentInput + ' ' + op + ' ';
            } else {
                expression = currentInput + ' ' + op + ' ';
            }
        } else {
            previousInput = currentInput;
            if (expression && !expression.includes(' ' + operator + ' ')) {
                expression = expression + ' ' + op + ' ';
            } else {
                expression = currentInput + ' ' + op + ' ';
            }
        }

        operator = op;
        shouldResetDisplay = true;
        justEvaluated = false;
        updateDisplay();
    }

    function handleEquals() {
        if (!operator) {
            justEvaluated = true;
            return;
        }

        const result = evaluate(previousInput, operator, currentInput);
        // Build full expression for display
        const exprString = previousInput + ' ' + operator + ' ' + currentInput + ' =';
        expression = exprString;
        currentInput = result;
        updateDisplay();

        previousInput = '';
        operator = null;
        shouldResetDisplay = true;
        justEvaluated = true;
    }

    function clearAll() {
        currentInput = '0';
        previousInput = '';
        operator = null;
        shouldResetDisplay = false;
        justEvaluated = false;
        expression = '';
        updateDisplay();
    }

    function negate() {
        if (currentInput === '0') return;
        if (currentInput.startsWith('-')) {
            currentInput = currentInput.slice(1);
        } else {
            currentInput = '-' + currentInput;
        }
        // Update expression with negated number
        if (operator && !justEvaluated) {
            const parts = expression.split(' ');
            if (parts.length >= 2) {
                parts[parts.length - 1] = currentInput;
                expression = parts.join(' ');
            }
        } else if (!operator) {
            expression = currentInput;
        }
        updateDisplay();
    }

    function percent() {
        const num = parseFloat(currentInput);
        if (isNaN(num)) return;
        const result = num / 100;
        currentInput = result.toString();
        if (operator && !justEvaluated) {
            const parts = expression.split(' ');
            if (parts.length >= 2) {
                parts[parts.length - 1] = currentInput;
                expression = parts.join(' ');
            }
        } else if (!operator) {
            expression = currentInput;
        }
        updateDisplay();
    }

    function onButtonClick(e) {
        const value = e.currentTarget.dataset.value;

        if ((value >= '0' && value <= '9') || value === '.') {
            inputDigit(value);
            return;
        }

        if (value === '+' || value === '−' || value === '×' || value === '÷') {
            if (currentInput === 'Error') {
                clearAll();
            }
            handleOperator(value);
            return;
        }

        if (value === '=') {
            if (currentInput === 'Error') {
                clearAll();
                return;
            }
            handleEquals();
            return;
        }

        if (value === 'C') {
            clearAll();
            return;
        }

        if (value === '±') {
            negate();
            return;
        }

        if (value === '%') {
            percent();
            return;
        }
    }

    // Attach event listeners
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', onButtonClick);
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        let targetValue = null;

        if (key >= '0' && key <= '9') targetValue = key;
        else if (key === '.') targetValue = '.';
        else if (key === '+') targetValue = '+';
        else if (key === '-') targetValue = '−';
        else if (key === '*') targetValue = '×';
        else if (key === '/') {
            e.preventDefault();
            targetValue = '÷';
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            targetValue = '=';
        } else if (key === 'Backspace') {
            if (currentInput.length > 1 && currentInput !== '0') {
                currentInput = currentInput.slice(0, -1);
                if (operator && !justEvaluated) {
                    const parts = expression.split(' ');
                    if (parts.length >= 2) {
                        parts[parts.length - 1] = currentInput || '0';
                        expression = parts.join(' ');
                    }
                } else if (!operator) {
                    expression = currentInput || '0';
                }
                updateDisplay();
            } else {
                currentInput = '0';
                if (!operator) expression = '0';
                updateDisplay();
            }
            return;
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            targetValue = 'C';
        } else if (key === '%') {
            targetValue = '%';
        }

        if (targetValue) {
            const btn = document.querySelector(`.btn[data-value="${targetValue}"]`);
            if (btn) {
                btn.click();
                btn.style.transform = 'scale(0.94)';
                setTimeout(() => btn.style.transform = '', 120);
            }
        }
    });

    updateDisplay();
})();