        document.addEventListener('DOMContentLoaded', () => {
            // Configuration initiale
            const boardElement = document.getElementById('chess-board');
            const currentTurnElement = document.getElementById('current-turn');
            const gameStatusElement = document.getElementById('game-status');
            const moveHistoryElement = document.getElementById('move-history');
            const promotionModal = document.getElementById('promotion-modal');
            const promotionChoices = document.querySelectorAll('.promotion-choice');
            const gameOverModal = document.getElementById('game-over-modal');
            const gameOverTitle = document.getElementById('game-over-title');
            const gameOverMessage = document.getElementById('game-over-message');
            
            // État du jeu
            let board = Array(8).fill().map(() => Array(8).fill(null));
            let selectedSquare = null;
            let possibleMoves = [];
            let currentPlayer = 'w';
            let gameStatus = 'active';
            let moveHistory = [];
            let whiteKingPos = { x: 4, y: 7 };
            let blackKingPos = { x: 4, y: 0 };
            let enPassantSquare = null;
            let castlingRights = {
                w: { kingSide: true, queenSide: true },
                b: { kingSide: true, queenSide: true }
            };
            
            // Initialisation du plateau
            function initializeBoard() {
                // Pions
                for (let i = 0; i < 8; i++) {
                    board[i][1] = { type: 'p', color: 'b', hasMoved: false };
                    board[i][6] = { type: 'p', color: 'w', hasMoved: false };
                }
                
                // Pièces noires
                board[0][0] = { type: 'r', color: 'b', hasMoved: false };
                board[1][0] = { type: 'n', color: 'b', hasMoved: false };
                board[2][0] = { type: 'b', color: 'b', hasMoved: false };
                board[3][0] = { type: 'q', color: 'b', hasMoved: false };
                board[4][0] = { type: 'k', color: 'b', hasMoved: false };
                board[5][0] = { type: 'b', color: 'b', hasMoved: false };
                board[6][0] = { type: 'n', color: 'b', hasMoved: false };
                board[7][0] = { type: 'r', color: 'b', hasMoved: false };
                
                // Pièces blanches
                board[0][7] = { type: 'r', color: 'w', hasMoved: false };
                board[1][7] = { type: 'n', color: 'w', hasMoved: false };
                board[2][7] = { type: 'b', color: 'w', hasMoved: false };
                board[3][7] = { type: 'q', color: 'w', hasMoved: false };
                board[4][7] = { type: 'k', color: 'w', hasMoved: false };
                board[5][7] = { type: 'b', color: 'w', hasMoved: false };
                board[6][7] = { type: 'n', color: 'w', hasMoved: false };
                board[7][7] = { type: 'r', color: 'w', hasMoved: false };
            }
            
            // Affichage du plateau
            function renderBoard() {
                boardElement.innerHTML = '';
                
                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 8; x++) {
                        const square = document.createElement('div');
                        square.className = `square ${(x + y) % 2 === 0 ? 'light' : 'dark'}`;
                        square.dataset.x = x;
                        square.dataset.y = y;
                        
                        if (selectedSquare && selectedSquare.x === x && selectedSquare.y === y) {
                            square.classList.add('selected');
                        }
                        
                        if (gameStatus === 'active' && board[x][y] && board[x][y].type === 'k' && isInCheck(board[x][y].color)) {
                            square.classList.add('check');
                        }
                        
                        if (enPassantSquare && enPassantSquare.x === x && enPassantSquare.y === y) {
                            square.classList.add('highlight');
                        }
                        
                        square.addEventListener('click', () => handleSquareClick(x, y));
                        
                        if (board[x][y]) {
                            const piece = document.createElement('div');
                            piece.className = 'piece';
                            piece.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${board[x][y].color}${board[x][y].type}.png')`;
                            
                            if (gameStatus !== 'active' && board[x][y].type === 'k' && board[x][y].color === (gameStatus.includes('white') ? 'w' : 'b')) {
                                piece.parentElement.classList.add('game-over');
                            }
                            
                            square.appendChild(piece);
                        }
                        
                        boardElement.appendChild(square);
                    }
                }
                
                // Afficher les mouvements possibles
                if (selectedSquare) {
                    const fromX = selectedSquare.x;
                    const fromY = selectedSquare.y;
                    
                    if (board[fromX][fromY] && board[fromX][fromY].color === currentPlayer) {
                        possibleMoves = getPossibleMoves(fromX, fromY);
                        
                        possibleMoves.forEach(move => {
                            const square = document.querySelector(`.square[data-x="${move.x}"][data-y="${move.y}"]`);
                            
                            if (board[move.x][move.y]) {
                                const captureHint = document.createElement('div');
                                captureHint.className = 'capture-hint';
                                square.appendChild(captureHint);
                            } else {
                                const moveHint = document.createElement('div');
                                moveHint.className = 'possible-move';
                                square.appendChild(moveHint);
                            }
                        });
                    }
                }
            }
            
            // Gestion du clic sur une case
            function handleSquareClick(x, y) {
                // Si la partie est terminée, ne rien faire
                if (gameStatus !== 'active') return;
                
                // Si une case est déjà sélectionnée
                if (selectedSquare) {
                    const fromX = selectedSquare.x;
                    const fromY = selectedSquare.y;
                    
                    // Vérifier si le coup est valide
                    const isValidMove = possibleMoves.some(move => move.x === x && move.y === y);
                    
                    if (isValidMove) {
                        // Effectuer le mouvement
                        makeMove(fromX, fromY, x, y);
                        selectedSquare = null;
                        possibleMoves = [];
                    } else {
                        // Si on clique sur une pièce de la même couleur, changer la sélection
                        if (board[x][y] && board[x][y].color === currentPlayer) {
                            selectedSquare = { x, y };
                            possibleMoves = getPossibleMoves(x, y);
                        } else {
                            selectedSquare = null;
                            possibleMoves = [];
                        }
                    }
                } else {
                    // Sélectionner une pièce si elle appartient au joueur courant
                    if (board[x][y] && board[x][y].color === currentPlayer) {
                        selectedSquare = { x, y };
                        possibleMoves = getPossibleMoves(x, y);
                    }
                }
                
                renderBoard();
            }
            
            // Obtenir les mouvements possibles pour une pièce
            function getPossibleMoves(fromX, fromY) {
                if (!board[fromX][fromY]) return [];
                
                const piece = board[fromX][fromY];
                const moves = [];
                
                switch (piece.type) {
                    case 'p': // Pion
                        // Direction du pion (1 pour blanc, -1 pour noir)
                        const direction = piece.color === 'w' ? -1 : 1;
                        
                        // Avance d'une case
                        if (isValidSquare(fromX, fromY + direction) && !board[fromX][fromY + direction]) {
                            if (!wouldBeInCheck(fromX, fromY, fromX, fromY + direction)) {
                                moves.push({ x: fromX, y: fromY + direction });
                                
                                // Avance de deux cases (premier mouvement)
                                if (!piece.hasMoved && !board[fromX][fromY + 2 * direction] && 
                                    isValidSquare(fromX, fromY + 2 * direction) && 
                                    !wouldBeInCheck(fromX, fromY, fromX, fromY + 2 * direction)) {
                                    moves.push({ x: fromX, y: fromY + 2 * direction });
                                }
                            }
                        }
                        
                        // Capture diagonale
                        for (const dx of [-1, 1]) {
                            const newX = fromX + dx;
                            const newY = fromY + direction;
                            
                            if (isValidSquare(newX, newY)) {
                                // Capture normale
                                if (board[newX][newY] && board[newX][newY].color !== piece.color) {
                                    if (!wouldBeInCheck(fromX, fromY, newX, newY)) {
                                        moves.push({ x: newX, y: newY });
                                    }
                                }
                                
                                // Prise en passant
                                if (enPassantSquare && enPassantSquare.x === newX && enPassantSquare.y === newY) {
                                    const enemyPawnY = newY - direction;
                                    if (!wouldBeInCheck(fromX, fromY, newX, newY)) {
                                        moves.push({ x: newX, y: newY, isEnPassant: true });
                                    }
                                }
                            }
                        }
                        break;
                        
                    case 'r': // Tour
                        // Directions: horizontal et vertical
                        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                            let newX = fromX + dx;
                            let newY = fromY + dy;
                            
                            while (isValidSquare(newX, newY)) {
                                if (!board[newX][newY]) {
                                    if (!wouldBeInCheck(fromX, fromY, newX, newY)) {
                                        moves.push({ x: newX, y: newY });
                                    }
                                    newX += dx;
                                    newY += dy;
                                } else {
                                    if (board[newX][newY].color !== piece.color) {
                                        if (!wouldBeInCheck(fromX, fromY, newX, newY)) {
                                            moves.push({ x: newX, y: newY });
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        break;
                        
                    case 'n': // Cavalier
                        // Mouvements en L
                        for (const [dx, dy] of [[2, 1], [2, -1], [-2, 1], [-2, -1], 
                                               [1, 2], [1, -2], [-1, 2], [-1, -2]]) {
                            const newX = fromX + dx;
                            const newY = fromY + dy;
                            
                            if (isValidSquare(newX, newY) && 
                                (!board[newX][newY] || board[newX][newY].color !== piece.color)) {
                                if (!wouldBeInCheck(fromX, fromY, newX, newY)) {
                                    moves.push({ x: newX, y: newY });
                                }
                            }
                        }
                        break;
                        
                    case 'b': // Fou
                        // Directions diagonales
                        for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
                            let newX = fromX + dx;
                            let newY = fromY + dy;
                            
                            while (isValidSquare(newX, newY)) {
                                if (!board[newX][newY]) {
                                    if (!wouldBeInCheck(fromX, fromY, newX, newY)) {
                                        moves.push({ x: newX, y: newY });
                                    }
                                    newX += dx;
                                    newY += dy;
                                } else {
                                    if (board[newX][newY].color !== piece.color) {
                                        if (!wouldBeInCheck(fromX, fromY, newX, newY)) {
                                            moves.push({ x: newX, y: newY });
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        break;
                        
                    case 'q': // Dame
                        // Combinaison de tour et fou
                        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], 
                                               [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
                            let newX = fromX + dx;
                            let newY = fromY + dy;
                            
                            while (isValidSquare(newX, newY)) {
                                if (!board[newX][newY]) {
                                    if (!wouldBeInCheck(fromX, fromY, newX, newY)) {
                                        moves.push({ x: newX, y: newY });
                                    }
                                    newX += dx;
                                    newY += dy;
                                } else {
                                    if (board[newX][newY].color !== piece.color) {
                                        if (!wouldBeInCheck(fromX, fromY, newX, newY)) {
                                            moves.push({ x: newX, y: newY });
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        break;
                        
                    case 'k': // Roi
                        // Mouvements d'une case dans toutes les directions
                        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], 
                                               [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
                            const newX = fromX + dx;
                            const newY = fromY + dy;
                            
                            if (isValidSquare(newX, newY) && 
                                (!board[newX][newY] || board[newX][newY].color !== piece.color)) {
                                // Vérifier si le roi serait en échec après ce mouvement
                                if (!wouldBeInCheck(fromX, fromY, newX, newY)) {
                                    moves.push({ x: newX, y: newY });
                                }
                            }
                        }
                        
                        // Roque
                        if (!piece.hasMoved && !isInCheck(piece.color)) {
                            // Petit roque (côté roi)
                            if (castlingRights[piece.color].kingSide) {
                                const kingSideClear = !board[5][fromY] && !board[6][fromY];
                                const kingSideSafe = !isSquareUnderAttack(fromX + 1, fromY, piece.color) && 
                                                    !isSquareUnderAttack(fromX + 2, fromY, piece.color);
                                
                                if (kingSideClear && kingSideSafe) {
                                    moves.push({ x: fromX + 2, y: fromY, isCastle: true, rookX: 7, rookNewX: 5 });
                                }
                            }
                            
                            // Grand roque (côté dame)
                            if (castlingRights[piece.color].queenSide) {
                                const queenSideClear = !board[3][fromY] && !board[2][fromY] && !board[1][fromY];
                                const queenSideSafe = !isSquareUnderAttack(fromX - 1, fromY, piece.color) && 
                                                     !isSquareUnderAttack(fromX - 2, fromY, piece.color);
                                
                                if (queenSideClear && queenSideSafe) {
                                    moves.push({ x: fromX - 2, y: fromY, isCastle: true, rookX: 0, rookNewX: 3 });
                                }
                            }
                        }
                        break;
                }
                
                return moves;
            }
            
            // Vérifier si une case est valide
            function isValidSquare(x, y) {
                return x >= 0 && x < 8 && y >= 0 && y < 8;
            }
            
            // Effectuer un mouvement
            function makeMove(fromX, fromY, toX, toY, promotionPiece = null) {
                const piece = board[fromX][fromY];
                const move = {
                    piece: piece,
                    from: { x: fromX, y: fromY },
                    to: { x: toX, y: toY },
                    captured: board[toX][toY],
                    isPromotion: false,
                    isEnPassant: false,
                    isCastle: false,
                    previousEnPassant: enPassantSquare,
                    previousCastlingRights: JSON.parse(JSON.stringify(castlingRights))
                };
                
                // Réinitialiser la case de prise en passant
                enPassantSquare = null;
                
                // Déplacer la pièce
                board[fromX][fromY] = null;
                
                // Gestion spéciale pour le pion
                if (piece.type === 'p') {
                    // Prise en passant
                    const moveObj = possibleMoves.find(m => m.x === toX && m.y === toY && m.isEnPassant);
                    if (moveObj && moveObj.isEnPassant) {
                        const capturedPawnY = toY + (piece.color === 'w' ? 1 : -1);
                        move.captured = board[toX][capturedPawnY];
                        move.isEnPassant = true;
                        board[toX][capturedPawnY] = null;
                    }
                    
                    // Avance de deux cases -> marquer la prise en passant possible
                    if (Math.abs(toY - fromY) === 2) {
                        enPassantSquare = { x: toX, y: toY + (piece.color === 'w' ? 1 : -1) };
                    }
                    
                    // Promotion
                    if ((piece.color === 'w' && toY === 0) || (piece.color === 'b' && toY === 7)) {
                        if (!promotionPiece) {
                            showPromotionModal(toX, toY, piece.color);
                            return; // L'exécution continue après la sélection de promotion
                        } else {
                            piece.type = promotionPiece;
                            move.isPromotion = true;
                            move.promotedTo = promotionPiece;
                        }
                    }
                }
                
                // Roque
                const castleMove = possibleMoves.find(m => m.x === toX && m.y === toY && m.isCastle);
                if (castleMove && castleMove.isCastle) {
                    move.isCastle = true;
                    // Déplacer la tour
                    const rook = board[castleMove.rookX][fromY];
                    board[castleMove.rookX][fromY] = null;
                    board[castleMove.rookNewX][fromY] = rook;
                    rook.hasMoved = true;
                }
                
                // Mettre à jour la position du roi si nécessaire
                if (piece.type === 'k') {
                    if (piece.color === 'w') {
                        whiteKingPos = { x: toX, y: toY };
                    } else {
                        blackKingPos = { x: toX, y: toY };
                    }
                }
                
                // Enregistrer que la pièce a bougé (pour roque et prise en passant)
                piece.hasMoved = true;
                
                // Placer la pièce sur la nouvelle case
                const capturedPiece = board[toX][toY];
                if (capturedPiece) {
                    move.captured = capturedPiece;
                }
                board[toX][toY] = piece;
                
                // Mettre à jour les droits de roque
                updateCastlingRights(piece, fromX, fromY);
                
                // Ajouter le mouvement à l'historique
                moveHistory.push(move);
                
                // Mettre à jour l'affichage du dernier coup
                updateMoveHistory();
                
                // Changer de joueur
                currentPlayer = currentPlayer === 'w' ? 'b' : 'w';
                currentTurnElement.textContent = currentPlayer === 'w' ? 'Blanc' : 'Noir';
                
                // Vérifier l'état de la partie
                checkGameStatus();
                
                renderBoard();
            }
            
            // Afficher la modal de promotion
            function showPromotionModal(x, y, color) {
                promotionChoices.forEach(choice => {
                    choice.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}${choice.dataset.piece}.png')`;
                    choice.onclick = () => {
                        const promotionPiece = choice.dataset.piece;
                        promotionModal.style.display = 'none';
                        makeMove(selectedSquare.x, selectedSquare.y, x, y, promotionPiece);
                    };
                });
                
                promotionModal.style.display = 'flex';
            }
            
            // Mettre à jour les droits de roque
            function updateCastlingRights(piece, fromX, fromY) {
                if (piece.type === 'k') {
                    castlingRights[piece.color].kingSide = false;
                    castlingRights[piece.color].queenSide = false;
                } else if (piece.type === 'r') {
                    if (piece.color === 'w' && fromX === 0 && fromY === 7) {
                        castlingRights.w.queenSide = false;
                    } else if (piece.color === 'w' && fromX === 7 && fromY === 7) {
                        castlingRights.w.kingSide = false;
                    } else if (piece.color === 'b' && fromX === 0 && fromY === 0) {
                        castlingRights.b.queenSide = false;
                    } else if (piece.color === 'b' && fromX === 7 && fromY === 0) {
                        castlingRights.b.kingSide = false;
                    }
                }
            }
            
            // Vérifier si une case est attaquée par l'adversaire
            function isSquareUnderAttack(x, y, color) {
                const opponentColor = color === 'w' ? 'b' : 'w';
                
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        if (board[i][j] && board[i][j].color === opponentColor) {
                            const moves = getRawMoves(i, j);
                            if (moves.some(move => move.x === x && move.y === y)) {
                                return true;
                            }
                        }
                    }
                }
                
                return false;
            }
            
            // Obtenir les mouvements bruts (sans vérification d'échec)
            function getRawMoves(fromX, fromY) {
                if (!board[fromX][fromY]) return [];
                
                const piece = board[fromX][fromY];
                const moves = [];
                
                switch (piece.type) {
                    case 'p': // Pion
                        const direction = piece.color === 'w' ? -1 : 1;
                        
                        // Capture diagonale
                        for (const dx of [-1, 1]) {
                            const newX = fromX + dx;
                            const newY = fromY + direction;
                            
                            if (isValidSquare(newX, newY)) {
                                moves.push({ x: newX, y: newY });
                            }
                        }
                        break;
                        
                    case 'r': // Tour
                    case 'b': // Fou
                    case 'q': // Dame
                        // Directions: horizontal, vertical, ou diagonales selon la pièce
                        const directions = [];
                        
                        if (piece.type === 'r' || piece.type === 'q') {
                            directions.push([1, 0], [-1, 0], [0, 1], [0, -1]);
                        }
                        if (piece.type === 'b' || piece.type === 'q') {
                            directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
                        }
                        
                        for (const [dx, dy] of directions) {
                            let newX = fromX + dx;
                            let newY = fromY + dy;
                            
                            while (isValidSquare(newX, newY)) {
                                moves.push({ x: newX, y: newY });
                                if (board[newX][newY]) break;
                                newX += dx;
                                newY += dy;
                            }
                        }
                        break;
                        
                    case 'n': // Cavalier
                        for (const [dx, dy] of [[2, 1], [2, -1], [-2, 1], [-2, -1], 
                                               [1, 2], [1, -2], [-1, 2], [-1, -2]]) {
                            const newX = fromX + dx;
                            const newY = fromY + dy;
                            if (isValidSquare(newX, newY)) {
                                moves.push({ x: newX, y: newY });
                            }
                        }
                        break;
                        
                    case 'k': // Roi
                        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], 
                                               [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
                            const newX = fromX + dx;
                            const newY = fromY + dy;
                            if (isValidSquare(newX, newY)) {
                                moves.push({ x: newX, y: newY });
                            }
                        }
                        break;
                }
                
                return moves;
            }
            
            // Vérifier si le roi est en échec
            function isInCheck(color) {
                const kingPos = color === 'w' ? whiteKingPos : blackKingPos;
                return isSquareUnderAttack(kingPos.x, kingPos.y, color);
            }
            
            // Vérifier si un mouvement mettrait le roi en échec
            function wouldBeInCheck(fromX, fromY, toX, toY) {
                const piece = board[fromX][fromY];
                if (!piece) return false;
                
                // Faire une copie du plateau et tester le mouvement
                const originalBoard = JSON.parse(JSON.stringify(board));
                const originalKingPos = piece.color === 'w' ? {...whiteKingPos} : {...blackKingPos};
                
                // Effectuer le mouvement temporaire
                board[fromX][fromY] = null;
                const capturedPiece = board[toX][toY];
                board[toX][toY] = piece;
                
                // Mettre à jour la position du roi si c'est un roi qui bouge
                if (piece.type === 'k') {
                    if (piece.color === 'w') {
                        whiteKingPos = { x: toX, y: toY };
                    } else {
                        blackKingPos = { x: toX, y: toY };
                    }
                }
                
                // Vérifier si le roi est en échec
                const inCheck = isInCheck(piece.color);
                
                // Restaurer le plateau et la position du roi
                board = originalBoard;
                if (piece.type === 'k') {
                    if (piece.color === 'w') {
                        whiteKingPos = originalKingPos;
                    } else {
                        blackKingPos = originalKingPos;
                    }
                }
                
                return inCheck;
            }
            
            // Vérifier l'état de la partie (échec et mat, pat, etc.)
            function checkGameStatus() {
                const currentColor = currentPlayer;
                const hasLegalMove = hasAnyLegalMove(currentColor);
                
                if (isInCheck(currentColor)) {
                    if (!hasLegalMove) {
                        // Échec et mat
                        gameStatus = currentColor === 'w' ? 'white_checkmate' : 'black_checkmate';
                        gameStatusElement.textContent = currentColor === 'w' ? 'Échec et mat (Noirs gagnent)' : 'Échec et mat (Blancs gagnent)';
                        showGameOverModal(gameStatus);
                    } else {
                        // Échec
                        gameStatusElement.textContent = currentColor === 'w' ? 'Échec aux Blancs' : 'Échec aux Noirs';
                    }
                } else {
                    if (!hasLegalMove) {
                        // Pat
                        gameStatus = 'stalemate';
                        gameStatusElement.textContent = 'Pat - Match nul';
                        showGameOverModal(gameStatus);
                    } else {
                        gameStatus = 'active';
                        gameStatusElement.textContent = 'En cours';
                    }
                }
                
                // Vérifier les cas de match nul (matériel insuffisant)
                if (isInsufficientMaterial()) {
                    gameStatus = 'insufficient_material';
                    gameStatusElement.textContent = 'Match nul - Matériel insuffisant';
                    showGameOverModal(gameStatus);
                }
            }
            
            // Vérifier si un joueur a au moins un mouvement légal
            function hasAnyLegalMove(color) {
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        if (board[x][y] && board[x][y].color === color) {
                            const moves = getPossibleMoves(x, y);
                            if (moves.length > 0) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
            
            // Vérifier si le matériel est insuffisant pour donner échec et mat
            function isInsufficientMaterial() {
                let whitePieces = [];
                let blackPieces = [];
                
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        if (board[x][y]) {
                            if (board[x][y].color === 'w') {
                                whitePieces.push(board[x][y].type);
                            } else {
                                blackPieces.push(board[x][y].type);
                            }
                        }
                    }
                }
                
                // Seul les rois
                if (whitePieces.length === 1 && blackPieces.length === 1) {
                    return true;
                }
                
                // Roi et fou contre roi
                if (whitePieces.length === 2 && blackPieces.length === 1 && 
                    whitePieces.includes('k') && whitePieces.includes('b') && 
                    blackPieces.includes('k')) {
                    return true;
                }
                
                if (blackPieces.length === 2 && whitePieces.length === 1 && 
                    blackPieces.includes('k') && blackPieces.includes('b') && 
                    whitePieces.includes('k')) {
                    return true;
                }
                
                // Roi et cavalier contre roi
                if (whitePieces.length === 2 && blackPieces.length === 1 && 
                    whitePieces.includes('k') && whitePieces.includes('n') && 
                    blackPieces.includes('k')) {
                    return true;
                }
                
                if (blackPieces.length === 2 && whitePieces.length === 1 && 
                    blackPieces.includes('k') && blackPieces.includes('n') && 
                    whitePieces.includes('k')) {
                    return true;
                }
                
                // Roi et deux cavaliers contre roi (techniquement forçable mais très rare)
                if (whitePieces.length === 3 && blackPieces.length === 1 && 
                    whitePieces.includes('k') && whitePieces.filter(p => p === 'n').length === 2 && 
                    blackPieces.includes('k')) {
                    return true;
                }
                
                return false;
            }
            
            // Mettre à jour l'historique des coups
            function updateMoveHistory() {
                if (moveHistory.length === 0) {
                    moveHistoryElement.innerHTML = '';
                    return;
                }
                
                const lastMove = moveHistory[moveHistory.length - 1];
                const moveNumber = Math.ceil(moveHistory.length / 2);
                
                let moveText = '';
                if (moveHistory.length % 2 === 1) {
                    // Premier coup du tour (Blancs)
                    moveText += `${moveNumber}. `;
                }
                
                moveText += getMoveNotation(lastMove);
                
                if (moveHistory.length % 2 === 0) {
                    // Deuxième coup du tour (Noirs)
                    const prevMoveText = moveHistoryElement.lastChild.textContent.trim();
                    moveHistoryElement.lastChild.textContent = prevMoveText + ' ' + moveText;
                } else {
                    const div = document.createElement('div');
                    div.textContent = moveText;
                    moveHistoryElement.appendChild(div);
                }
                
                // Faire défiler vers le bas
                moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
            }
            
            // Obtenir la notation algébrique d'un coup
            function getMoveNotation(move) {
                let notation = '';
                const piece = move.piece;
                const from = move.from;
                const to = move.to;
                const captured = move.captured;
                
                // Pièce (sauf pour les pions)
                if (piece.type !== 'p') {
                    notation += piece.type.toUpperCase();
                }
                
                // Nécessité de spécifier la colonne/départ en cas d'ambiguité
                if (piece.type !== 'p') {
                    let samePieces = [];
                    
                    for (let x = 0; x < 8; x++) {
                        for (let y = 0; y < 8; y++) {
                            if (board[x][y] && board[x][y].type === piece.type && board[x][y].color === piece.color) {
                                const moves = getPossibleMoves(x, y);
                                if (moves.some(m => m.x === to.x && m.y === to.y) && !(x === from.x && y === from.y)) {
                                    samePieces.push({ x, y });
                                }
                            }
                        }
                    }
                    
                    if (samePieces.length > 0) {
                        const sameColumn = samePieces.some(p => p.x === from.x);
                        if (sameColumn) {
                            notation += (from.y + 1).toString();
                        } else {
                            notation += String.fromCharCode(97 + from.x);
                        }
                    }
                }
                
                // Capture
                if (captured) {
                    if (piece.type === 'p') {
                        notation += String.fromCharCode(97 + from.x);
                    }
                    notation += 'x';
                }
                
                // Destination
                notation += String.fromCharCode(97 + to.x);
                notation += (8 - to.y).toString();
                
                // Promotion
                if (move.isPromotion) {
                    notation += '=' + move.promotedTo.toUpperCase();
                }
                
                // Roque
                if (move.isCastle) {
                    if (to.x > from.x) {
                        notation = 'O-O'; // Petit roque
                    } else {
                        notation = 'O-O-O'; // Grand roque
                    }
                }
                
                // Échec (à vérifier après le mouvement)
                const tempCurrentPlayer = currentPlayer;
                currentPlayer = currentPlayer === 'w' ? 'b' : 'w'; // Inverse temporairement pour vérifier l'échec
                if (isInCheck(tempCurrentPlayer === 'w' ? 'b' : 'w')) {
                    // Vérifier si c'est échec et mat
                    currentPlayer = tempCurrentPlayer; // Rétablir avant de vérifier les mouvements
                    if (!hasAnyLegalMove(tempCurrentPlayer === 'w' ? 'b' : 'w')) {
                        notation += '#';
                    } else {
                        notation += '+';
                    }
                } else {
                    currentPlayer = tempCurrentPlayer;
                }
                
                return notation;
            }
            
            // Afficher la modal de fin de partie
            function showGameOverModal(status) {
                gameOverModal.classList.remove('hidden');
                
                switch (status) {
                    case 'white_checkmate':
                        gameOverTitle.textContent = 'Partie terminée';
                        gameOverMessage.textContent = 'Échec et mat! Les Noirs gagnent.';
                        break;
                    case 'black_checkmate':
                        gameOverTitle.textContent = 'Partie terminée';
                        gameOverMessage.textContent = 'Échec et mat! Les Blancs gagnent.';
                        break;
                    case 'stalemate':
                        gameOverTitle.textContent = 'Partie terminée';
                        gameOverMessage.textContent = 'Match nul par pat.';
                        break;
                    case 'insufficient_material':
                        gameOverTitle.textContent = 'Partie terminée';
                        gameOverMessage.textContent = 'Match nul - Matériel insuffisant.';
                        break;
                }
            }
            
            // Nouvelle partie
            function newGame() {
                board = Array(8).fill().map(() => Array(8).fill(null));
                selectedSquare = null;
                possibleMoves = [];
                currentPlayer = 'w';
                gameStatus = 'active';
                moveHistory = [];
                enPassantSquare = null;
                whiteKingPos = { x: 4, y: 7 };
                blackKingPos = { x: 4, y: 0 };
                castlingRights = {
                    w: { kingSide: true, queenSide: true },
                    b: { kingSide: true, queenSide: true }
                };
                
                initializeBoard();
                renderBoard();
                
                currentTurnElement.textContent = 'Blanc';
                gameStatusElement.textContent = 'En cours';
                moveHistoryElement.innerHTML = '';
                
                if (gameOverModal) {
                    gameOverModal.classList.add('hidden');
                }
                
                if (promotionModal) {
                    promotionModal.style.display = 'none';
                }
            }
            
            // Raccourcis clavier
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    selectedSquare = null;
                    possibleMoves = [];
                    renderBoard();
                } else if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
                    newGame();
                }
            });
            
            // Événements des boutons
            document.getElementById('btn-new-game').addEventListener('click', newGame);
            document.getElementById('btn-resign').addEventListener('click', () => {
                gameStatus = currentPlayer === 'w' ? 'white_resign' : 'black_resign';
                gameStatusElement.textContent = currentPlayer === 'w' ? 'Blancs abandonnent - Noirs gagnent' : 'Noirs abandonnent - Blancs gagnent';
                showGameOverModal(gameStatus);
            });
            document.getElementById('btn-draw').addEventListener('click', () => {
                gameStatus = 'draw_agreement';
                gameStatusElement.textContent = 'Match nul par accord';
                showGameOverModal(gameStatus);
            });
            
            // Événements de la modal de fin de jeu
            document.getElementById('btn-modal-new-game').addEventListener('click', newGame);
            document.getElementById('btn-modal-close').addEventListener('click', () => {
                gameOverModal.classList.add('hidden');
            });
            
            // Clic à l'extérieur de la modal de promotion
            promotionModal.addEventListener('click', (e) => {
                if (e.target === promotionModal) {
                    promotionModal.style.display = 'none';
                }
            });
            
            // Commencer une nouvelle partie
            newGame();
        });