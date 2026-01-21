let playerHP = 20;
let bossHP = 30;
let maxBossHP = 30;

const playerHPDisplay = document.getElementById('player-hp');
const bossHPDisplay = document.getElementById('boss-hp');
const attackDie = document.getElementById('attack-die');
const healDie = document.getElementById('heal-die');
const shieldDie = document.getElementById('shield-die');
const log = document.getElementById('log');
const rollBtn = document.getElementById('roll');
const newGameBtn = document.getElementById('new-game');
const checkboxes = document.querySelectorAll('.choices input');
const bossHPInput = document.getElementById('boss-hp-input');
const startBtn = document.getElementById('start-game');

const statsDiv = document.querySelector('.stats');
const choicesDiv = document.querySelector('.choices');
const diceRowDiv = document.querySelector('.dice-row');

function updateDisplay() {
  playerHPDisplay.textContent = playerHP;
  bossHPDisplay.textContent = bossHP;
}

function rollDie(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSelectedActions() {
  const selected = [];
  checkboxes.forEach(cb => {
    if (cb.checked) selected.push(cb.value);
  });
  return selected;
}

// Lancer la partie
startBtn.addEventListener('click', () => {
  const inputValue = parseInt(bossHPInput.value);
  if (isNaN(inputValue) || inputValue <= 0) {
    log.textContent = "❗ Entrez un nombre de PV valide pour le boss.";
    return;
  }

  playerHP = 20;
  bossHP = inputValue;
  maxBossHP = inputValue;
  updateDisplay();
  log.textContent = '';

  // Afficher la partie
  statsDiv.style.display = 'block';
  choicesDiv.style.display = 'block';
  diceRowDiv.style.display = 'flex';
  rollBtn.style.display = 'inline-block';
  newGameBtn.style.display = 'inline-block';
});

rollBtn.addEventListener('click', () => {
  if (playerHP <= 0 || bossHP <= 0) return;

  const selected = getSelectedActions();
  if (selected.length !== 2) {
    log.textContent = "❗ Choisis exactement 2 actions !";
    return;
  }

  let attack = 0;
  let heal = 0;
  let shield = 0;

  if (selected.includes("attack")) {
    attack = rollDie(1, 6);
    attackDie.textContent = attack;
    bossHP -= attack;
  } else {
    attackDie.textContent = "-";
  }

  if (selected.includes("heal")) {
    heal = rollDie(1, 5);
    healDie.textContent = heal;
    playerHP += heal;
  } else {
    healDie.textContent = "-";
  }

  if (selected.includes("shield")) {
    shield = rollDie(1, 4);
    shieldDie.textContent = shield;
  } else {
    shieldDie.textContent = "-";
  }

  const bossAttack = rollDie(3, 7);
  let damage = bossAttack - shield;
  if (damage < 0) damage = 0;
  playerHP -= damage;

  // Clamp HP
  if (playerHP > 20) playerHP = 20;
  if (playerHP < 0) playerHP = 0;
  if (bossHP < 0) bossHP = 0;

  updateDisplay();

  if (playerHP <= 0 && bossHP <= 0) {
    log.textContent = "Égalité ! Les deux sont tombés 💀";
  } else if (playerHP <= 0) {
    log.textContent = "Tu es vaincu... 😵";
  } else if (bossHP <= 0) {
    log.textContent = "Tu as vaincu le boss ! 🎉🔥";
  } else {
    log.textContent = `Tu as choisi : ${selected.join(" & ")} | Boss attaque avec ${bossAttack} → Tu perds ${damage} PV mais tu te soignes de ${heal} donc vous perdez ${damage-heal}PV .`;
  }

  checkboxes.forEach(cb => cb.checked = false);
});

newGameBtn.addEventListener('click', () => {
  playerHP = 20;
  bossHP = maxBossHP;
  updateDisplay();
  attackDie.textContent = '-';
  healDie.textContent = '-';
  shieldDie.textContent = '-';
  log.textContent = '';
  checkboxes.forEach(cb => cb.checked = false);
});
