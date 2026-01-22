        document.addEventListener('DOMContentLoaded', () => {
            const board = document.getElementById('board');
            const currentPlayerDisplay = document.getElementById('current-player');
            const whiteCountDisplay = document.getElementById('white-count');
            const blackCountDisplay = document.getElementById('black-count');
            const moveHistory = document.getElementById('move-history');
            const newGameBtn = document.getElementById('new-game');
            const undoMoveBtn = document.getElementById('undo-move');
            const gameStatus = document.getElementById('game-status');

            let gameState = {
                board: Array(10).fill().map(() => Array(10).fill(null)),
                currentPlayer: 'white',
                selectedPiece: null,
                possibleMoves: [],
                mandatoryCaptures: [],
                gameHistory: [],
                whiteCount: 20,
                blackCount: 20,
                isGameOver: false
            };

            // Initialiser le jeu
            initGame();

            function initGame() {
                // Initialiser le plateau
                gameState.board = Array(10).fill().map(() => Array(10).fill(null));

                // Placer les pions blancs
                for (let row = 0; row < 4; row++) {
                    for (let col = 0; col < 10; col++) {
                        if ((row + col) % 2 === 1) {
                            gameState.board[row][col] = { type: 'pawn', color: 'white' };
                        }
                    }
                }

                // Placer les pions noirs
                for (let row = 6; row < 10; row++) {
                    for (let col = 0; col < 10; col++) {
                        if ((row + col) % 2 === 1) {
                            gameState.board[row][col] = { type: 'pawn', color: 'black' };
                        }
                    }
                }

                // Réinitialiser l'état du jeu
                gameState.currentPlayer = 'white';
                gameState.selectedPiece = null;
                gameState.possibleMoves = [];
                gameState.mandatoryCaptures = [];
                gameState.gameHistory = [];
                gameState.whiteCount = 20;
                gameState.blackCount = 20;
                gameState.isGameOver = false;

                updateUI();
                renderBoard();
            }

            function renderBoard() {
                board.innerHTML = '';
                
                // Détecter les prises obligatoires avant de rendre le plateau
                updateMandatoryCaptures();

                for (let row = 0; row < 10; row++) {
                    for (let col = 0; col < 10; col++) {
                        const cell = document.createElement('div');
                        const isLight = (row + col) % 2 === 0;
                        cell.className = `cell ${isLight ? 'light' : 'dark'}`;
                        cell.dataset.row = row;
                        cell.dataset.col = col;

                        // Marquer les cases de capture obligatoire
                        const isMandatoryCapture = gameState.mandatoryCaptures.some(
                            piece => piece.row === row && piece.col === col
                        );

                        if (isMandatoryCapture && !gameState.isGameOver) {
                            cell.classList.add('must-capture');
                        }

                        // Ajouter le pion s'il y en a un
                        const piece = gameState.board[row][col];
                        if (piece) {
                            const pieceElement = document.createElement('div');
                            pieceElement.className = `piece ${piece.color} ${piece.type === 'king' ? 'king' : ''}`;
                            
                            // Si c'est la pièce sélectionnée, ajouter la classe selected
                            if (gameState.selectedPiece && gameState.selectedPiece.row === row && gameState.selectedPiece.col === col) {
                                pieceElement.classList.add('selected');
                            }
                            
                            pieceElement.addEventListener('click', () => handlePieceClick(row, col));
                            cell.appendChild(pieceElement);
                        }

                        // Marquer les mouvements possibles
                        const isPossibleMove = gameState.possibleMoves.some(move => 
                            move.row === row && move.col === col && !move.isCapture
                        );
                        const isCaptureMove = gameState.possibleMoves.some(move => 
                            move.row === row && move.col === col && move.isCapture
                        );

                        if (isPossibleMove) {
                            cell.classList.add('possible-move');
                            cell.addEventListener('click', () => handleMoveClick(row, col));
                        } else if (isCaptureMove) {
                            cell.classList.add('possible-move');
                            cell.addEventListener('click', () => handleMoveClick(row, col));
                        } else if (!piece) {
                            cell.addEventListener('click', () => handleMoveClick(row, col));
                        }

                        board.appendChild(cell);
                    }
                }
            }

            function handlePieceClick(row, col) {
                if (gameState.isGameOver) return;

                const piece = gameState.board[row][col];
                
                // Si le joueur clique sur une pièce de sa couleur et que c'est son tour
                if (piece && piece.color === gameState.currentPlayer) {
                    // Vérifier si cette pièce doit obligatoirement capturer
                    const mustCapture = gameState.mandatoryCaptures.some(
                        p => p.row === row && p.col === col
                    );

                    // Si des prises sont obligatoires et que ce pion n'en fait pas partie, ignorer
                    if (gameState.mandatoryCaptures.length > 0 && !mustCapture) {
                        return;
                    }

                    gameState.selectedPiece = { row, col, ...piece };
                    gameState.possibleMoves = getPossibleMoves(row, col);
                    
                    // Si des captures sont disponibles, ne garder que celles-ci
                    const captureMoves = gameState.possibleMoves.filter(move => move.isCapture);
                    if (captureMoves.length > 0) {
                        gameState.possibleMoves = captureMoves;
                    }

                    renderBoard();
                } else if (gameState.selectedPiece) {
                    // Si une pièce est déjà sélectionnée, le clic sur une autre pièce change la sélection
                    if (piece && piece.color === gameState.currentPlayer) {
                        gameState.selectedPiece = { row, col, ...piece };
                        gameState.possibleMoves = getPossibleMoves(row, col);
                        
                        // Si des captures sont disponibles, ne garder que celles-ci
                        const captureMoves = gameState.possibleMoves.filter(move => move.isCapture);
                        if (captureMoves.length > 0) {
                            gameState.possibleMoves = captureMoves;
                        }

                        renderBoard();
                    }
                }
            }

            function handleMoveClick(targetRow, targetCol) {
                if (!gameState.selectedPiece || gameState.isGameOver) return;

                const { row: sourceRow, col: sourceCol } = gameState.selectedPiece;
                const move = gameState.possibleMoves.find(
                    m => m.row === targetRow && m.col === targetCol
                );

                if (move) {
                    // Sauvegarder l'état actuel pour l'historique
                    const historyEntry = {
                        board: JSON.parse(JSON.stringify(gameState.board)),
                        currentPlayer: gameState.currentPlayer,
                        move: {
                            from: { row: sourceRow, col: sourceCol },
                            to: { row: targetRow, col: targetCol },
                            captures: move.captures,
                            promoted: move.promoted
                        }
                    };

                    // Effectuer le déplacement
                    gameState.board[targetRow][targetCol] = { 
                        ...gameState.board[sourceRow][sourceCol] 
                    };
                    gameState.board[sourceRow][sourceCol] = null;

                    // Promotion en dame
                    if (move.promoted) {
                        gameState.board[targetRow][targetCol].type = 'king';
                    }

                    // Capturer les pions adverses
                    if (move.captures && move.captures.length > 0) {
                        move.captures.forEach(({ row, col }) => {
                            if (gameState.board[row][col].color === 'white') {
                                gameState.whiteCount--;
                            } else {
                                gameState.blackCount--;
                            }
                            gameState.board[row][col] = null;
                        });

                        // Après une capture, vérifier s'il y a d'autres captures possibles avec la même pièce
                        const followUpCaptures = getCaptures(targetRow, targetCol);
                        if (followUpCaptures.length > 0 && !move.promoted) {
                            // Le joueur doit continuer à capturer avec la même pièce
                            gameState.selectedPiece = { row: targetRow, col: targetCol, ...gameState.board[targetRow][targetCol] };
                            gameState.possibleMoves = followUpCaptures;
                            renderBoard();
                            return;
                        }
                    }

                    // Ajouter à l'historique
                    gameState.gameHistory.push(historyEntry);
                    updateHistoryDisplay();

                    // Changer de joueur
                    gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
                    gameState.selectedPiece = null;
                    gameState.possibleMoves = [];

                    // Vérifier l'état de la partie
                    checkGameStatus();

                    // Si le jeu n'est pas terminé, vérifier les captures obligatoires pour le prochain joueur
                    if (!gameState.isGameOver) {
                        updateMandatoryCaptures();
                    }

                    updateUI();
                    renderBoard();

                    undoMoveBtn.disabled = gameState.gameHistory.length === 0;
                }
            }

            function getPossibleMoves(row, col) {
                const piece = gameState.board[row][col];
                if (!piece) return [];

                const moves = [];
                const direction = piece.color === 'white' ? 1 : -1; // Blanc vers le haut, noir vers le bas

                if (piece.type === 'pawn') {
                    // Mouvements normaux
                    const forwardLeft = { row: row + direction, col: col - 1 };
                    const forwardRight = { row: row + direction, col: col + 1 };

                    [forwardLeft, forwardRight].forEach(pos => {
                        if (isValidPosition(pos.row, pos.col) && gameState.board[pos.row][pos.col] === null) {
                            moves.push({
                                row: pos.row,
                                col: pos.col,
                                isCapture: false,
                                promoted: (piece.color === 'white' && pos.row === 9) || 
                                         (piece.color === 'black' && pos.row === 0)
                            });
                        }
                    });

                    // Captures
                    const captures = getCaptures(row, col);
                    moves.push(...captures);

                    // Si des captures sont disponibles, ne retourner que celles-ci
                    if (captures.length > 0) {
                        return captures;
                    }

                    return moves;
                } else if (piece.type === 'king') {
                    // Pour les dames, vérifier les 4 directions diagonales
                    const directions = [
                        { dr: 1, dc: 1 },   // Bas-droite
                        { dr: 1, dc: -1 },  // Bas-gauche
                        { dr: -1, dc: 1 },  // Haut-droite
                        { dr: -1, dc: -1 }  // Haut-gauche
                    ];

                    directions.forEach(({ dr, dc }) => {
                        let r = row + dr;
                        let c = col + dc;
                        let pathBlocked = false;

                        // Parcourir la diagonale jusqu'à ce qu'on atteigne un bord ou une pièce
                        while (isValidPosition(r, c) && !pathBlocked) {
                            const targetPiece = gameState.board[r][c];

                            if (targetPiece === null) {
                                // Case vide - mouvement possible
                                moves.push({
                                    row: r,
                                    col: c,
                                    isCapture: false
                                });
                            } else {
                                if (targetPiece.color === piece.color) {
                                    // Pièce de la même couleur - bloqué
                                    pathBlocked = true;
                                } else {
                                    // Pièce adverse - vérifier si on peut sauter par-dessus
                                    const landingRow = r + dr;
                                    const landingCol = c + dc;

                                    if (isValidPosition(landingRow, landingCol) && 
                                        gameState.board[landingRow][landingCol] === null) {
                                        // On peut capturer cette pièce
                                        moves.push({
                                            row: landingRow,
                                            col: landingCol,
                                            isCapture: true,
                                            captures: [{ row: r, col: c }]
                                        });

                                        // Après une capture, vérifier les captures multiples
                                        const followUpCaptures = getKingCapturesAfterMove(landingRow, landingCol, []);
                                        followUpCaptures.forEach(followUp => {
                                            moves.push({
                                                row: followUp.row,
                                                col: followUp.col,
                                                isCapture: true,
                                                captures: [{ row: r, col: c }, ...followUp.captures]
                                            });
                                        });
                                    }
                                    pathBlocked = true;
                                }
                            }

                            r += dr;
                            c += dc;
                        }
                    });

                    return moves;
                }

                return [];
            }

            function getCaptures(row, col) {
                const piece = gameState.board[row][col];
                if (!piece || piece.type === 'king') return [];

                const captures = [];
                const direction = piece.color === 'white' ? 1 : -1;
                const opponentColor = piece.color === 'white' ? 'black' : 'white';

                // Vérifier les 4 directions diagonales pour les captures
                const directions = [
                    { dr: 1, dc: 1 },   // Bas-droite
                    { dr: 1, dc: -1 },  // Bas-gauche
                    { dr: -1, dc: 1 },  // Haut-droite
                    { dr: -1, dc: -1 }  // Haut-gauche
                ];

                directions.forEach(({ dr, dc }) => {
                    const midRow = row + dr;
                    const midCol = col + dc;
                    const targetRow = row + 2 * dr;
                    const targetCol = col + 2 * dc;

                    if (isValidPosition(midRow, midCol) && isValidPosition(targetRow, targetCol)) {
                        const midPiece = gameState.board[midRow][midCol];
                        const targetPiece = gameState.board[targetRow][targetCol];

                        if (midPiece && midPiece.color === opponentColor && targetPiece === null) {
                            // Capture possible
                            captures.push({
                                row: targetRow,
                                col: targetCol,
                                isCapture: true,
                                captures: [{ row: midRow, col: midCol }],
                                promoted: (piece.color === 'white' && targetRow === 9) || 
                                         (piece.color === 'black' && targetRow === 0)
                            });

                            // Après cette capture, vérifier les captures multiples
                            const followUpCaptures = getCaptures(targetRow, targetCol);
                            if (followUpCaptures.length > 0) {
                                followUpCaptures.forEach(followUp => {
                                    captures.push({
                                        row: followUp.row,
                                        col: followUp.col,
                                        isCapture: true,
                                        captures: [{ row: midRow, col: midCol }, ...followUp.captures],
                                        promoted: followUp.promoted
                                    });
                                });
                            }
                        }
                    }
                });

                return captures;
            }

            function getKingCapturesAfterMove(row, col, alreadyCaptured) {
                const piece = gameState.board[row][col];
                if (!piece || piece.type !== 'king') return [];

                const captures = [];
                const directions = [
                    { dr: 1, dc: 1 },   // Bas-droite
                    { dr: 1, dc: -1 },  // Bas-gauche
                    { dr: -1, dc: 1 },  // Haut-droite
                    { dr: -1, dc: -1 }  // Haut-gauche
                ];

                directions.forEach(({ dr, dc }) => {
                    let r = row + dr;
                    let c = col + dc;
                    let foundOpponent = false;
                    let opponentPos = { row: -1, col: -1 };

                    // Parcourir la diagonale
                    while (isValidPosition(r, c)) {
                        const targetPiece = gameState.board[r][c];

                        if (foundOpponent) {
                            if (targetPiece === null) {
                                // Espace libre après l'opposant, capture possible
                                if (!alreadyCaptured.some(cap => cap.row === opponentPos.row && cap.col === opponentPos.col)) {
                                    captures.push({
                                        row: r,
                                        col: c,
                                        isCapture: true,
                                        captures: [{ row: opponentPos.row, col: opponentPos.col }]
                                    });

                                    // Vérifier les captures supplémentaires après ce mouvement
                                    const followUpCaptures = getKingCapturesAfterMove(r, c, [
                                        ...alreadyCaptured, 
                                        { row: opponentPos.row, col: opponentPos.col }
                                    ]);

                                    if (followUpCaptures.length > 0) {
                                        followUpCaptures.forEach(followUp => {
                                            captures.push({
                                                row: followUp.row,
                                                col: followUp.col,
                                                isCapture: true,
                                                captures: [
                                                    { row: opponentPos.row, col: opponentPos.col },
                                                    ...followUp.captures
                                                ]
                                            });
                                        });
                                    }
                                }
                            } else {
                                // Bloqué après l'opposant, fin de parcours
                                break;
                            }
                        } else {
                            if (targetPiece && targetPiece.color !== piece.color) {
                                // Opposant trouvé
                                foundOpponent = true;
                                opponentPos = { row: r, col: c };

                                // Vérifier qu'on n'a pas déjà capturé cette pièce
                                if (alreadyCaptured.some(cap => cap.row === r && cap.col === c)) {
                                    break;
                                }
                            } else if (targetPiece && targetPiece.color === piece.color) {
                                // Pièce alliée, bloqué
                                break;
                            }
                        }

                        r += dr;
                        c += dc;
                    }
                });

                return captures;
            }

            function updateMandatoryCaptures() {
                gameState.mandatoryCaptures = [];
                
                for (let row = 0; row < 10; row++) {
                    for (let col = 0; col < 10; col++) {
                        const piece = gameState.board[row][col];
                        
                        if (piece && piece.color === gameState.currentPlayer) {
                            const captures = piece.type === 'pawn' ? 
                                getCaptures(row, col) : 
                                getKingCapturesAfterMove(row, col, []);
                            
                            if (captures.length > 0) {
                                gameState.mandatoryCaptures.push({ row, col });
                            }
                        }
                    }
                }
            }

            function isValidPosition(row, col) {
                return row >= 0 && row < 10 && col >= 0 && col < 10;
            }

            function checkGameStatus() {
                // Vérifier s'il reste des pièces de la couleur actuelle
                let hasPieces = false;
                let canMove = false;

                for (let row = 0; row < 10; row++) {
                    for (let col = 0; col < 10; col++) {
                        const piece = gameState.board[row][col];
                        if (piece && piece.color === gameState.currentPlayer) {
                            hasPieces = true;
                            
                            // Vérifier si cette pièce peut bouger
                            const moves = getPossibleMoves(row, col);
                            if (moves.length > 0) {
                                canMove = true;
                                break;
                            }
                        }
                    }
                    if (canMove) break;
                }

                if (!hasPieces || (hasPieces && !canMove)) {
                    gameState.isGameOver = true;
                    const winner = gameState.currentPlayer === 'white' ? 'Noirs' : 'Blancs';
                    gameStatus.textContent = `Partie terminée ! Les ${winner} gagnent !`;
                    gameStatus.classList.remove('hidden');
                    gameStatus.classList.add(
                        winner === 'Blancs' ? 'bg-gray-200' : 'bg-black', 
                        winner === 'Blancs' ? 'text-black' : 'text-white'
                    );
                } else {
                    gameStatus.classList.add('hidden');
                }
            }

            function updateUI() {
                currentPlayerDisplay.textContent = gameState.currentPlayer === 'white' ? 'Blanc' : 'Noir';
                currentPlayerDisplay.className = gameState.currentPlayer === 'white' ? 'text-gray-100' : 'text-black';
                whiteCountDisplay.textContent = gameState.whiteCount;
                blackCountDisplay.textContent = gameState.blackCount;
            }

            function updateHistoryDisplay() {
                moveHistory.innerHTML = '';
                
                gameState.gameHistory.forEach((entry, index) => {
                    const moveNumber = Math.floor(index / 2) + 1;
                    const isWhiteMove = entry.currentPlayer === 'white';
                    
                    if (isWhiteMove) {
                        const moveItem = document.createElement('div');
                        moveItem.className = 'history-item p-2 border-b';
                        moveItem.textContent = `${moveNumber}. ${formatMove(entry.move)}`;
                        moveItem.addEventListener('click', () => revertToMove(index));
                        moveHistory.appendChild(moveItem);
                    } else {
                        // Pour les noirs, on ajoute au dernier élément blanc s'il existe
                        const lastItem = moveHistory.lastChild;
                        if (lastItem) {
                            lastItem.textContent += ` ${formatMove(entry.move)}`;
                        } else {
                            const moveItem = document.createElement('div');
                            moveItem.className = 'history-item p-2 border-b';
                            moveItem.textContent = `${moveNumber}... ${formatMove(entry.move)}`;
                            moveItem.addEventListener('click', () => revertToMove(index));
                            moveHistory.appendChild(moveItem);
                        }
                    }
                });
            }

            function formatMove(move) {
                const fromPos = `${String.fromCharCode(97 + move.from.col)}${10 - move.from.row}`;
                const toPos = move.isCapture ? 'x' : '-';
                return `${fromPos}${toPos}${String.fromCharCode(97 + move.to.col)}${10 - move.to.row}`;
            }

            function revertToMove(historyIndex) {
                const newHistory = gameState.gameHistory.slice(0, historyIndex + 1);
                const lastEntry = newHistory[newHistory.length - 1];
                
                gameState.board = JSON.parse(JSON.stringify(lastEntry.board));
                gameState.currentPlayer = lastEntry.currentPlayer;
                gameState.selectedPiece = null;
                gameState.possibleMoves = [];
                
                // Mettre à jour les comptes
                gameState.whiteCount = 0;
                gameState.blackCount = 0;
                for (let row = 0; row < 10; row++) {
                    for (let col = 0; col < 10; col++) {
                        const piece = gameState.board[row][col];
                        if (piece) {
                            if (piece.color === 'white') {
                                gameState.whiteCount++;
                            } else {
                                gameState.blackCount++;
                            }
                        }
                    }
                }
                
                gameState.gameHistory = newHistory;
                gameState.isGameOver = false;
                gameStatus.classList.add('hidden');
                
                updateUI();
                updateMandatoryCaptures();
                renderBoard();
                
                undoMoveBtn.disabled = gameState.gameHistory.length === 0;
            }

            // Écouteurs d'événements
            newGameBtn.addEventListener('click', initGame);
            
            undoMoveBtn.addEventListener('click', () => {
                if (gameState.gameHistory.length > 0) {
                    const lastMove = gameState.gameHistory.pop();
                    gameState.board = JSON.parse(JSON.stringify(lastMove.board));
                    gameState.currentPlayer = lastMove.currentPlayer;
                    gameState.selectedPiece = null;
                    gameState.possibleMoves = [];
                    
                    // Mettre à jour les comptes
                    gameState.whiteCount = 0;
                    gameState.blackCount = 0;
                    for (let row = 0; row < 10; row++) {
                        for (let col = 0; col < 10; col++) {
                            const piece = gameState.board[row][col];
                            if (piece) {
                                if (piece.color === 'white') {
                                    gameState.whiteCount++;
                                } else {
                                    gameState.blackCount++;
                                }
                            }
                        }
                    }
                    
                    gameState.isGameOver = false;
                    gameStatus.classList.add('hidden');
                    
                    updateUI();
                    updateMandatoryCaptures();
                    renderBoard();
                    updateHistoryDisplay();
                    
                    undoMoveBtn.disabled = gameState.gameHistory.length === 0;
                }
            });
        });