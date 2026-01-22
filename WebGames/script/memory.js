const emojiBank = [
  '🐶','🐱','🐰','🦊','🐻','🐼','🐸','🦁','🐨','🐯','🦄','🐷','🐮','🐵','🐔','🐙',
  '🦋','🐢','🦉','🐬','🐳','🦓','🐝','🐞','🦀','🦕','🦖','🐲','🐡','🦩','🦧','🦝','🦨'
];

const game = document.getElementById('game');
const movesDisplay = document.getElementById('moves');
const message = document.getElementById('message');
const difficultySelect = document.getElementById('difficulty');

let firstCard, secondCard, lockBoard, moves, matchedPairs, gridSize;

function startGame() {
  game.innerHTML = '';
  message.textContent = '';
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  moves = 0;
  matchedPairs = 0;
  movesDisplay.textContent = 'Coups : 0';

  gridSize = parseInt(difficultySelect.value);
  const totalCards = gridSize * gridSize;
  const totalPairs = totalCards / 2;
  const emojis = emojiBank.slice(0, totalPairs);
  let deck = [...emojis, ...emojis];
  deck = deck.sort(() => Math.random() - 0.5);

  game.style.gridTemplateColumns = `repeat(${gridSize}, 80px)`;

  deck.forEach(emoji => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.textContent = '';

    card.addEventListener('click', () => {
      if (lockBoard || card.classList.contains('revealed') || card === firstCard) return;

      card.textContent = emoji;
      card.classList.add('revealed');

      if (!firstCard) {
        firstCard = card;
      } else {
        secondCard = card;
        lockBoard = true;
        moves++;
        movesDisplay.textContent = `Coups : ${moves}`;

        if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
          firstCard.classList.add('correct');
          secondCard.classList.add('correct');
          matchedPairs++;
          if (matchedPairs === totalPairs) {
            message.textContent = "🎉 Bravo ! Vous avez trouvé toutes les paires !";
          }
          firstCard = null;
          secondCard = null;
          lockBoard = false;
        } else {
          firstCard.classList.add('wrong');
          secondCard.classList.add('wrong');
          setTimeout(() => {
            firstCard.textContent = '';
            secondCard.textContent = '';
            firstCard.classList.remove('revealed', 'wrong');
            secondCard.classList.remove('revealed', 'wrong');
            firstCard = null;
            secondCard = null;
            lockBoard = false;
          }, 1000);
        }
      }
    });

    game.appendChild(card);
  });
}

// Auto-start on page load with default difficulty
window.onload = startGame;