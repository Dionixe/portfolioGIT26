const diceDisplay = document.getElementById('dice-display');
const result = document.getElementById('result');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const choiceButtons = document.querySelectorAll('.choice');

let currentNumber = null;
let correctAnswers = new Set();
let clickedCorrect = new Set();

let score = 0;
let errors = 0;
let countdown = 30;
let timer;
let gameActive = false;

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function getCorrectAnswers(number) {
  const answers = new Set();
  if (number % 2 === 0) answers.add('even');
  else answers.add('odd');
  if (number % 3 === 0) answers.add('multiple3');
  if (isPrime(number)) answers.add('prime');
  return answers;
}

function newNumber() {
  currentNumber = Math.floor(Math.random() * 6) + 1;
  diceDisplay.textContent = `🎲 ${currentNumber}`;
  correctAnswers = getCorrectAnswers(currentNumber);
  clickedCorrect.clear();

  // Reactivate all buttons
  choiceButtons.forEach(btn => btn.disabled = false);
}

function handleClick(e) {
  if (!gameActive) return;

  const type = e.target.dataset.type;

  if (correctAnswers.has(type)) {
    if (!clickedCorrect.has(type)) {
      clickedCorrect.add(type);
      score++;
    }
  } else {
    errors++;
  }

  e.target.disabled = true;
  updateResult();

  // Check if all correct answers were found
  if (clickedCorrect.size === correctAnswers.size) {
    setTimeout(newNumber, 500);
  }
}

function updateResult() {
  result.textContent = `Score : ${score} | Erreurs : ${errors}`;
}

function startGame() {
  score = 0;
  errors = 0;
  countdown = 30;
  gameActive = true;
  updateResult();
  timerDisplay.textContent = `⏱ Temps restant : ${countdown}s`;
  startBtn.disabled = true;
  newNumber();

  timer = setInterval(() => {
    countdown--;
    timerDisplay.textContent = `⏱ Temps restant : ${countdown}s`;
    if (countdown <= 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(timer);
  gameActive = false;
  diceDisplay.textContent = "🛑 Fin !";
  choiceButtons.forEach(btn => btn.disabled = true);
  startBtn.disabled = false;
}

startBtn.addEventListener('click', startGame);
choiceButtons.forEach(btn => btn.addEventListener('click', handleClick));
