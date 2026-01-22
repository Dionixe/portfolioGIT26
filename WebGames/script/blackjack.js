const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const suits = ['♠','♥','♦','♣'];
let deck = [];
let playerHand = [];
let dealerHand = [];
let isGameOver = false;

function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  deck.sort(() => Math.random() - 0.5);
}

function drawCard() {
  return deck.pop();
}

function getCardValue(card) {
  if (['J','Q','K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
}

function calculateScore(hand) {
  let score = 0;
  let aceCount = 0;
  for (let card of hand) {
    score += getCardValue(card);
    if (card.value === 'A') aceCount++;
  }
  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }
  return score;
}

function displayHand(hand, elementId) {
  const container = document.getElementById(elementId);
  container.innerHTML = '';
  hand.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card';
    div.textContent = `${card.value}${card.suit}`;
    container.appendChild(div);
  });
}

function updateScores(showDealer = false) {
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);
  document.getElementById('player-score').textContent = `Score : ${playerScore}`;
  document.getElementById('dealer-score').textContent = showDealer ? `Score : ${dealerScore}` : 'Score : ?';
}

function endGame(message) {
  isGameOver = true;

  while (calculateScore(dealerHand) < 17) {
    dealerHand.push(drawCard());
  }

  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  displayHand(dealerHand, 'dealer-hand');
  updateScores(true);

  if (dealerScore > 21) {
    message = "🎉 La banque a explosé. Tu gagnes !";
  } else if (dealerScore > playerScore) {
    message = "😔 Tu perds.";
  } else if (dealerScore < playerScore) {
    message = "🎉 Tu gagnes !";
  } else {
    message = "⚖️ Égalité.";
  }

  document.getElementById('message').textContent = message;
  disableButtons();
}

function hit() {
  if (isGameOver) return;

  playerHand.push(drawCard());
  displayHand(playerHand, 'player-hand');
  updateScores();

  const playerScore = calculateScore(playerHand);
  if (playerScore > 21) {
    isGameOver = true;
    displayHand(dealerHand, 'dealer-hand');
    updateScores(true);
    document.getElementById('message').textContent = "💥 Tu as explosé. Perdu !";
    disableButtons();
  }
}

function stand() {
  if (isGameOver) return;
  endGame();
}

function disableButtons() {
  document.querySelectorAll("button").forEach(btn => {
    if (btn.textContent.includes("Tirer") || btn.textContent.includes("Rester")) {
      btn.disabled = true;
    }
  });
}

function resetGame() {
  isGameOver = false;
  playerHand = [];
  dealerHand = [];
  createDeck();
  playerHand.push(drawCard());
  playerHand.push(drawCard());
  dealerHand.push(drawCard());

  displayHand(playerHand, 'player-hand');
  displayHand(dealerHand, 'dealer-hand');
  updateScores();
  document.getElementById('message').textContent = '';
  document.querySelectorAll("button").forEach(btn => btn.disabled = false);
}

resetGame();