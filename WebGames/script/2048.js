
// Sélectionner les éléments du DOM
const gameBoard = document.getElementById("gameBoard");
const scoreElement = document.getElementById("score");
const gameOverElement = document.getElementById("gameOver");

// Initialiser la grille 4x4 et le score
let grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
];
let score = 0;

// Fonction pour générer une nouvelle tuile
function generateTile() {
    let emptyCells = [];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
}

// Fonction pour dessiner la grille
function drawGrid() {
    gameBoard.innerHTML = ""; // Effacer les anciennes tuiles
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const value = grid[row][col];
            const tile = document.createElement("div");
            tile.className = "tile";
            if (value !== 0) {
                tile.textContent = value;
                tile.dataset.value = value;
            }
            gameBoard.appendChild(tile);
        }
    }
    // Mettre à jour l'affichage du score
    scoreElement.textContent = score;
}

// Fonction pour fusionner les tuiles
function slide(row) {
    let arr = row.filter(val => val); // Supprimer les zéros
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i]; // Ajouter au score
            arr[i + 1] = 0;
        }
    }
    arr = arr.filter(val => val); // Supprimer les zéros après fusion
    while (arr.length < 4) arr.push(0); // Compléter avec des zéros
    return arr;
}

// Fonction pour effectuer un mouvement dans une direction
function move(direction) {
    let moved = false;

    for (let i = 0; i < 4; i++) {
        if (direction === "LEFT") {
            const newRow = slide(grid[i]);
            if (!arraysEqual(grid[i], newRow)) moved = true;
            grid[i] = newRow;
        }
        if (direction === "RIGHT") {
            const newRow = slide(grid[i].reverse()).reverse();
            if (!arraysEqual(grid[i], newRow)) moved = true;
            grid[i] = newRow;
        }
    }

    if (direction === "UP") {
        for (let col = 0; col < 4; col++) {
            let column = [grid[0][col], grid[1][col], grid[2][col], grid[3][col]];
            const newColumn = slide(column);
            if (!arraysEqual(column, newColumn)) moved = true;
            for (let row = 0; row < 4; row++) grid[row][col] = newColumn[row];
        }
    }

    if (direction === "DOWN") {
        for (let col = 0; col < 4; col++) {
            let column = [grid[0][col], grid[1][col], grid[2][col], grid[3][col]];
            const newColumn = slide(column.reverse()).reverse();
            if (!arraysEqual(column, newColumn)) moved = true;
            for (let row = 0; row < 4; row++) grid[row][col] = newColumn[row];
        }
    }

    if (moved) {
        generateTile(); // Générer une nouvelle tuile seulement si le plateau a changé
        drawGrid(); // Redessiner la grille
        if (isGameOver()) {
            endGame(); // Fin de la partie si aucun mouvement n'est possible
        }
    }
}

// Fonction pour vérifier si deux tableaux sont égaux
function arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

// Fonction pour vérifier la fin de la partie
function isGameOver() {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid[row][col] === 0) return false; // Case vide disponible
            if (col < 3 && grid[row][col] === grid[row][col + 1]) return false; // Fusion possible horizontalement
            if (row < 3 && grid[row][col] === grid[row + 1][col]) return false; // Fusion possible verticalement
        }
    }
    return true; // Aucun mouvement possible
}

// Fonction pour terminer le jeu
function endGame() {
    gameOverElement.style.display = "block"; // Afficher le message de fin
}

// Fonction pour redémarrer le jeu
function restartGame() {
    score = 0;
    grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
    generateTile();
    generateTile();
    drawGrid();
    gameOverElement.style.display = "none"; // Cacher le message de fin
}

// Événements pour les flèches directionnelles
document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") move("LEFT");
    if (event.key === "ArrowRight") move("RIGHT");
    if (event.key === "ArrowUp") move("UP");
    if (event.key === "ArrowDown") move("DOWN");
});

// Initialiser le jeu
generateTile();
generateTile();
drawGrid();