    const ROWS = 6;
    const COLS = 7;
    const boardEl = document.getElementById('board');
    const statusEl = document.getElementById('status');
    const resetBtn = document.getElementById('reset');
    let currentPlayer = 'red';
    let board = [];

    function createBoard() {
      board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
      boardEl.innerHTML = '';
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = document.createElement('div');
          cell.classList.add('cell');
          cell.dataset.row = r;
          cell.dataset.col = c;
          cell.addEventListener('click', handleClick);
          boardEl.appendChild(cell);
        }
      }
    }

    function handleClick(e) {
      const col = parseInt(e.target.dataset.col);
      for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) {
          board[row][col] = currentPlayer;
          const cell = getCellElement(row, col);
          cell.classList.add(currentPlayer);
          if (checkWin(row, col)) {
            statusEl.textContent = `🎉 Joueur ${currentPlayer === 'red' ? 'Rouge' : 'Jaune'} a gagné !`;
            endGame();
          } else if (board.flat().every(cell => cell)) {
            statusEl.textContent = "Match nul !";
          } else {
            currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
            statusEl.textContent = `Au tour de ${currentPlayer === 'red' ? 'Rouge' : 'Jaune'}`;
          }
          break;
        }
      }
    }

    function getCellElement(row, col) {
      return boardEl.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    }

    function checkWin(r, c) {
      return checkDirection(r, c, 1, 0) || // vertical
             checkDirection(r, c, 0, 1) || // horizontal
             checkDirection(r, c, 1, 1) || // diagonale /
             checkDirection(r, c, 1, -1);  // diagonale \
    }

    function checkDirection(r, c, dr, dc) {
      let count = 1;
      count += countDirection(r, c, dr, dc);
      count += countDirection(r, c, -dr, -dc);
      return count >= 4;
    }

    function countDirection(r, c, dr, dc) {
      let count = 0;
      let row = r + dr;
      let col = c + dc;
      while (row >= 0 && row < ROWS && col >= 0 && col < COLS && board[row][col] === currentPlayer) {
        count++;
        row += dr;
        col += dc;
      }
      return count;
    }

    function endGame() {
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => cell.removeEventListener('click', handleClick));
    }

    resetBtn.addEventListener('click', () => {
      currentPlayer = 'red';
      statusEl.textContent = 'Joueur Rouge commence';
      createBoard();
    });

    createBoard();