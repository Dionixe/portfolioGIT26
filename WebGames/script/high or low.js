const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let deck = [];
let currentCard;
let score = 0;
let bestScore = 0;

function initDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  deck.sort(() => Math.random() - 0.5);
}

function getCardPower(card) {
  return values.indexOf(card.value);
}

function drawCard() {
  return deck.pop();
}

function updateDisplay(card) {
  document.getElementById('card-display').textContent = `${card.value}${card.suit}`;
}

function guess(direction) {
  if (deck.length === 0) return;

  const nextCard = drawCard();
  const currentPower = getCardPower(currentCard);
  const nextPower = getCardPower(nextCard);

  updateDisplay(nextCard);

  let isCorrect = false;
  if (direction === 'high' && nextPower > currentPower) isCorrect = true;
  if (direction === 'low' && nextPower < currentPower) isCorrect = true;

  if (isCorrect) {
    score++;
    document.getElementById('score').textContent = score;
    currentCard = nextCard;
    document.getElementById('message').textContent = "✅ Bien joué ! Continue...";
  } else {
    document.getElementById('message').textContent = `❌ Mauvais choix ! C'était ${nextCard.value}${nextCard.suit}`;
    document.getElementById('btn-high').disabled = true;
    document.getElementById('btn-low').disabled = true;
    if (score > bestScore) {
      bestScore = score;
      document.getElementById('best-score').textContent = bestScore;
    }
  }
}

function resetGame() {
  score = 0;
  document.getElementById('score').textContent = '0';
  document.getElementById('message').textContent = '';
  document.getElementById('btn-high').disabled = false;
  document.getElementById('btn-low').disabled = false;

  initDeck();
  currentCard = drawCard();
  updateDisplay(currentCard);
}

resetGame();