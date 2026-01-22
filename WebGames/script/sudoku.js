  let fullGrid = [];

  function generateFullGrid() {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

    function isValid(row, col, num) {
      for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) return false;
      }
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (grid[boxRow + i][boxCol + j] === num) return false;
        }
      }
      return true;
    }

    function fill(row = 0, col = 0) {
      if (row === 9) return true;
      if (col === 9) return fill(row + 1, 0);

      const nums = [...Array(9).keys()].map(n => n + 1).sort(() => Math.random() - 0.5);
      for (let num of nums) {
        if (isValid(row, col, num)) {
          grid[row][col] = num;
          if (fill(row, col + 1)) return true;
          grid[row][col] = 0;
        }
      }
      return false;
    }

    fill();
    return grid;
  }

  function removeCells(grid, level) {
    const clone = grid.map(row => row.slice());
    let attempts = level === 'easy' ? 30 : level === 'medium' ? 45 : 60;

    while (attempts > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (clone[row][col] !== 0) {
        clone[row][col] = 0;
        attempts--;
      }
    }
    return clone;
  }

  function displayGrid(solution, puzzle) {
    const container = document.getElementById('sudoku');
    container.innerHTML = '';

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const input = document.createElement('input');
        input.maxLength = 1;
        input.className = 'cell';
        input.dataset.row = i;
        input.dataset.col = j;

        if (i % 3 === 0) input.classList.add('row-start');
        if (i % 3 === 2) input.classList.add('row-end');

        if (puzzle[i][j] !== 0) {
          input.value = puzzle[i][j];
          input.readOnly = true;
        } else {
          input.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (isNaN(val) || val < 1 || val > 9) {
              e.target.value = '';
            }
          });
        }

        container.appendChild(input);
      }
    }
  }

  function newGame() {
    document.getElementById('message').textContent = '';
    const level = document.getElementById('difficulty').value;
    fullGrid = generateFullGrid();
    const puzzleGrid = removeCells(fullGrid, level);
    displayGrid(fullGrid, puzzleGrid);
  }

  function checkSolution() {
    const inputs = document.querySelectorAll('.cell');
    let correct = true;

    inputs.forEach(input => {
      const row = parseInt(input.dataset.row);
      const col = parseInt(input.dataset.col);
      const userVal = parseInt(input.value);

      if (!input.readOnly) {
        if (userVal !== fullGrid[row][col]) {
          input.style.backgroundColor = '#ffc6c6'; // rouge clair
          correct = false;
        } else {
          input.style.backgroundColor = '#c6ffc6'; // vert clair
        }
      }
    });

    const msg = document.getElementById('message');
    msg.textContent = correct ? '✔️ Bravo, vous avez complété la grille correctement !' : '❌ Il y a des erreurs. Essayez encore !';
    msg.style.color = correct ? 'green' : 'red';
  }

  // Initialisation
  newGame();