const bingo = document.getElementById('bingo');
const message = document.getElementById('message');
const drawButton = document.getElementById('drawButton');
const drawnNumberDiv = document.getElementById('drawnNumber');
const gridSize = 5;
let cells = [];

let numbers = Array.from({ length: 75 }, (_, i) => i + 1);
numbers.sort(() => 0.5 - Math.random());
const boardNumbers = numbers.slice(0, gridSize * gridSize);
let remainingDrawNumbers = [...numbers];
let currentNumber = null;

for (let i = 0; i < gridSize * gridSize; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.textContent = boardNumbers[i];
  cell.dataset.number = boardNumbers[i];
  cell.addEventListener('click', (e) => {
    if (cell.classList.contains('active') && cell.textContent == currentNumber) {
      cell.classList.add('marked');
      cell.classList.remove('active');
      currentNumber = null;
      checkWin();
    }
  });
  bingo.appendChild(cell);
  cells.push(cell);
}

function drawNumber() {
  if (remainingDrawNumbers.length === 0) {
    drawnNumberDiv.textContent = "Plus de numéros à tirer.";
    return;
  }
  const index = Math.floor(Math.random() * remainingDrawNumbers.length);
  const number = remainingDrawNumbers.splice(index, 1)[0];
  currentNumber = number;
  drawnNumberDiv.textContent = `Numéro : ${number}`;

  cells.forEach(cell => {
    if (!cell.classList.contains('marked') && cell.textContent == number) {
      cell.classList.add('active');
    } else {
      cell.classList.remove('active');
    }
  });
}

drawButton.addEventListener('click', drawNumber);

function checkWin() {
  for (let i = 0; i < gridSize; i++) {
    let rowWin = true;
    let colWin = true;
    for (let j = 0; j < gridSize; j++) {
      if (!cells[i * gridSize + j].classList.contains('marked')) rowWin = false;
      if (!cells[j * gridSize + i].classList.contains('marked')) colWin = false;
    }
    if (rowWin || colWin) {
      showWin();
      return;
    }
  }
}

function showWin() {
  message.textContent = "🎉 Bingo ! Vous avez gagné !";
  drawButton.disabled = true;
  cells.forEach(cell => cell.classList.remove('active'));
}