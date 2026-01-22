let scores = [0, 0];
let currentScore = 0;
let activePlayer = 0;
let playing = true;

const diceEl = document.getElementById('dice');
const messageEl = document.getElementById('message');
const scoreEls = [document.getElementById('score-0'), document.getElementById('score-1')];
const currentEls = [document.getElementById('current-0'), document.getElementById('current-1')];
const playerEls = [document.getElementById('player-0'), document.getElementById('player-1')];

function switchPlayer() {
  currentEls[activePlayer].textContent = 0;
  currentScore = 0;
  playerEls[activePlayer].classList.remove('active');
  activePlayer = activePlayer === 0 ? 1 : 0;
  playerEls[activePlayer].classList.add('active');
}

document.getElementById('roll').addEventListener('click', function() {
  if (!playing) return;

  const roll = Math.floor(Math.random() * 6) + 1;
  diceEl.textContent = `Dé: ${roll}`;

  if (roll !== 1) {
    currentScore += roll;
    currentEls[activePlayer].textContent = currentScore;
  } else {
    messageEl.textContent = `Oh non ! Joueur ${activePlayer + 1} a fait 1 !`;
    switchPlayer();
  }
});

document.getElementById('hold').addEventListener('click', function() {
  if (!playing) return;

  scores[activePlayer] += currentScore;
  scoreEls[activePlayer].textContent = scores[activePlayer];

  if (scores[activePlayer] >= 50) {
    playing = false;
    messageEl.textContent = `🎉 Joueur ${activePlayer + 1} gagne !`;
  } else {
    switchPlayer();
  }
});

document.getElementById('new-game').addEventListener('click', function() {
  scores = [0, 0];
  currentScore = 0;
  activePlayer = 0;
  playing = true;
  scoreEls[0].textContent = 0;
  scoreEls[1].textContent = 0;
  currentEls[0].textContent = 0;
  currentEls[1].textContent = 0;
  messageEl.textContent = '';
  diceEl.textContent = 'Dé: -';
  playerEls[0].classList.add('active');
  playerEls[1].classList.remove('active');
});
