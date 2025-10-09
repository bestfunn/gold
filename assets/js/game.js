// Chess3D Game
(function() {
    // Canvas setup
    const canvas = document.getElementById('chessCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Game state
    let gameRunning = false;
    let moves = 0;
    let capturedWhite = 0;
    let capturedBlack = 0;
    let gameStatus = "Your Turn";
    let boardRotation = 0;
    let selectedPiece = null;
    let validMoves = [];
    let moveHistory = [];
    
    // Update UI elements
    document.getElementById('moves').textContent = moves;
    document.getElementById('capturedWhite').textContent = capturedWhite;
    document.getElementById('capturedBlack').textContent = capturedBlack;
    document.getElementById('gameStatus').textContent = gameStatus;
    
    // Canvas sizing
    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = Math.min(canvas.width * 0.8, 600);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Chess board and pieces
    const boardSize = 8;
    const squareSize = Math.min(canvas.width, canvas.height) * 0.9 / boardSize;
    const boardOffsetX = (canvas.width - squareSize * boardSize) / 2;
    const boardOffsetY = (canvas.height - squareSize * boardSize) / 2;
    
    // Chess pieces data structure
    let board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));
    
    // Initialize chess board
    function initBoard() {
        // Clear the board
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                board[i][j] = null;
            }
        }
        
        // Set up pawns
        for (let i = 0; i < boardSize; i++) {
            board[1][i] = { type: 'pawn', color: 'black', hasMoved: false };
            board[6][i] = { type: 'pawn', color: 'white', hasMoved: false };
        }
        
        // Set up other pieces
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        for (let i = 0; i < boardSize; i++) {
            board[0][i] = { type: pieceOrder[i], color: 'black', hasMoved: false };
            board[7][i] = { type: pieceOrder[i], color: 'white', hasMoved: false };
        }
        
        // Reset game state
        moves = 0;
        capturedWhite = 0;
        capturedBlack = 0;
        gameStatus = "Your Turn";
        selectedPiece = null;
        validMoves = [];
        moveHistory = [];
        
        updateUI();
    }
    
    // Update UI
    function updateUI() {
        document.getElementById('moves').textContent = moves;
        document.getElementById('capturedWhite').textContent = capturedWhite;
        document.getElementById('capturedBlack').textContent = capturedBlack;
        document.getElementById('gameStatus').textContent = gameStatus;
    }
    
    // Draw functions with 3D perspective
    function drawBoard() {
        // Draw board base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(boardOffsetX - 10, boardOffsetY - 10, 
                    squareSize * boardSize + 20, squareSize * boardSize + 20);
        
        // Draw individual squares
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const x = boardOffsetX + col * squareSize;
                const y = boardOffsetY + row * squareSize;
                
                // Alternate square colors
                if ((row + col) % 2 === 0) {
                    ctx.fillStyle = '#F0D9B5'; // Light squares
                } else {
                    ctx.fillStyle = '#B58863'; // Dark squares
                }
                
                // Draw square with 3D effect
                ctx.fillRect(x, y, squareSize, squareSize);
                
                // Add 3D border effect
                ctx.strokeStyle = (row + col) % 2 === 0 ? '#D7B48E' : '#9C6D46';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, squareSize, squareSize);
                
                // Draw coordinate labels
                if (row === 7) {
                    ctx.fillStyle = (col % 2 === 0) ? '#B58863' : '#F0D9B5';
                    ctx.font = '12px Arial';
                    ctx.fillText(String.fromCharCode(97 + col), x + squareSize - 15, y + squareSize - 5);
                }
                if (col === 0) {
                    ctx.fillStyle = (row % 2 === 0) ? '#B58863' : '#F0D9B5';
                    ctx.font = '12px Arial';
                    ctx.fillText(8 - row, x + 5, y + 15);
                }
            }
        }
        
        // Highlight valid moves
        validMoves.forEach(move => {
            const x = boardOffsetX + move.col * squareSize;
            const y = boardOffsetY + move.row * squareSize;
            
            ctx.fillStyle = 'rgba(144, 238, 144, 0.5)';
            ctx.fillRect(x, y, squareSize, squareSize);
        });
        
        // Highlight selected piece
        if (selectedPiece) {
            const x = boardOffsetX + selectedPiece.col * squareSize;
            const y = boardOffsetY + selectedPiece.row * squareSize;
            
            ctx.strokeStyle = '#3B82F6';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, squareSize, squareSize);
        }
    }
    
    function drawPieces() {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const piece = board[row][col];
                if (piece) {
                    drawPiece(piece, row, col);
                }
            }
        }
    }
    
    function drawPiece(piece, row, col) {
        const x = boardOffsetX + col * squareSize + squareSize / 2;
        const y = boardOffsetY + row * squareSize + squareSize / 2;
        const radius = squareSize * 0.35;
        
        // Piece base (3D effect)
        ctx.fillStyle = piece.color === 'white' ? '#F8FAFC' : '#1E293B';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Piece border
        ctx.strokeStyle = piece.color === 'white' ? '#CBD5E1' : '#0F172A';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Piece symbol
        ctx.fillStyle = piece.color === 'white' ? '#1E293B' : '#F8FAFC';
        ctx.font = `${radius * 1.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let symbol = '';
        switch(piece.type) {
            case 'king': symbol = '♔'; break;
            case 'queen': symbol = '♕'; break;
            case 'rook': symbol = '♖'; break;
            case 'bishop': symbol = '♗'; break;
            case 'knight': symbol = '♘'; break;
            case 'pawn': symbol = '♙'; break;
        }
        
        // Adjust symbol for black pieces
        if (piece.color === 'black') {
            symbol = symbol.toLowerCase();
        }
        
        ctx.fillText(symbol, x, y);
        
        // 3D shadow effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function drawBackground() {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1E40AF');
        gradient.addColorStop(1, '#1E3A8A');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Chess-themed decorative elements
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 4; i++) {
            const size = 50 + i * 30;
            ctx.beginPath();
            ctx.arc(canvas.width * 0.2, canvas.height * 0.8, size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(canvas.width * 0.8, canvas.height * 0.2, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Game logic
    function getValidMoves(piece, row, col) {
        const moves = [];
        
        // Simplified move logic for demonstration
        // In a full implementation, this would include all chess rules
        
        if (piece.type === 'pawn') {
            const direction = piece.color === 'white' ? -1 : 1;
            
            // Move forward
            if (isInBounds(row + direction, col) && !board[row + direction][col]) {
                moves.push({row: row + direction, col: col});
                
                // Double move from starting position
                if (!piece.hasMoved && isInBounds(row + 2 * direction, col) && 
                    !board[row + 2 * direction][col]) {
                    moves.push({row: row + 2 * direction, col: col});
                }
            }
            
            // Capture diagonally
            for (let dc of [-1, 1]) {
                if (isInBounds(row + direction, col + dc) && 
                    board[row + direction][col + dc] && 
                    board[row + direction][col + dc].color !== piece.color) {
                    moves.push({row: row + direction, col: col + dc});
                }
            }
        }
        
        // Basic movement for other pieces (simplified)
        const pieceMoves = {
            knight: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
            king: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
            rook: [[-1,0],[1,0],[0,-1],[0,1]],
            bishop: [[-1,-1],[-1,1],[1,-1],[1,1]],
            queen: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
        };
        
        if (pieceMoves[piece.type]) {
            for (let [dr, dc] of pieceMoves[piece.type]) {
                let newRow = row + dr;
                let newCol = col + dc;
                
                // For sliding pieces (rook, bishop, queen)
                if (['rook', 'bishop', 'queen'].includes(piece.type)) {
                    while (isInBounds(newRow, newCol)) {
                        if (!board[newRow][newCol]) {
                            moves.push({row: newRow, col: newCol});
                        } else {
                            if (board[newRow][newCol].color !== piece.color) {
                                moves.push({row: newRow, col: newCol});
                            }
                            break;
                        }
                        newRow += dr;
                        newCol += dc;
                    }
                } else {
                    // For jumping pieces (knight, king)
                    if (isInBounds(newRow, newCol) && 
                        (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color)) {
                        moves.push({row: newRow, col: newCol});
                    }
                }
            }
        }
        
        return moves;
    }
    
    function isInBounds(row, col) {
        return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
    }
    
    function movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol];
        if (!piece) return false;
        
        // Check if move is valid
        const validMove = validMoves.some(move => move.row === toRow && move.col === toCol);
        if (!validMove) return false;
        
        // Record move for undo functionality
        moveHistory.push({
            from: {row: fromRow, col: fromCol},
            to: {row: toRow, col: toCol},
            captured: board[toRow][toCol]
        });
        
        // Capture piece if applicable
        if (board[toRow][toCol]) {
            if (board[toRow][toCol].color === 'white') {
                capturedWhite++;
            } else {
                capturedBlack++;
            }
        }
        
        // Move the piece
        board[toRow][toCol] = piece;
        board[fromRow][fromCol] = null;
        piece.hasMoved = true;
        
        // Update game state
        moves++;
        gameStatus = moves % 2 === 0 ? "Your Turn" : "AI Thinking...";
        
        // Clear selection
        selectedPiece = null;
        validMoves = [];
        
        updateUI();
        
        // Simple AI move after a delay
        if (gameStatus === "AI Thinking...") {
            setTimeout(makeAIMove, 1000);
        }
        
        return true;
    }
    
    function makeAIMove() {
        // Find all black pieces
        const blackPieces = [];
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] && board[row][col].color === 'black') {
                    blackPieces.push({row, col});
                }
            }
        }
        
        // Try to find a valid move
        for (let i = 0; i < blackPieces.length; i++) {
            const randomIndex = Math.floor(Math.random() * blackPieces.length);
            const {row, col} = blackPieces[randomIndex];
            const piece = board[row][col];
            const moves = getValidMoves(piece, row, col);
            
            if (moves.length > 0) {
                const randomMove = moves[Math.floor(Math.random() * moves.length)];
                movePiece(row, col, randomMove.row, randomMove.col);
                return;
            }
        }
        
        // If no valid moves found, switch back to player
        gameStatus = "Your Turn";
        updateUI();
    }
    
    function undoMove() {
        if (moveHistory.length === 0) return;
        
        const lastMove = moveHistory.pop();
        const piece = board[lastMove.to.row][lastMove.to.col];
        
        // Move piece back
        board[lastMove.from.row][lastMove.from.col] = piece;
        board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
        
        // Update captured pieces count
        if (lastMove.captured) {
            if (lastMove.captured.color === 'white') {
                capturedWhite--;
            } else {
                capturedBlack--;
            }
        }
        
        // Update game state
        moves--;
        gameStatus = "Your Turn";
        
        updateUI();
    }
    
    function showHints() {
        if (selectedPiece) return;
        
        // Find all possible moves for white pieces
        const allMoves = [];
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const piece = board[row][col];
                if (piece && piece.color === 'white') {
                    const moves = getValidMoves(piece, row, col);
                    allMoves.push(...moves.map(move => ({...move, from: {row, col}})));
                }
            }
        }
        
        // Highlight a random suggested move
        if (allMoves.length > 0) {
            const hint = allMoves[Math.floor(Math.random() * allMoves.length)];
            validMoves = [hint];
            
            // Flash the hint
            setTimeout(() => {
                validMoves = [];
                drawGame();
            }, 2000);
        }
    }
    
    // Input handling
    canvas.addEventListener('click', (e) => {
        if (!gameRunning || gameStatus !== "Your Turn") return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert click to board coordinates
        const col = Math.floor((x - boardOffsetX) / squareSize);
        const row = Math.floor((y - boardOffsetY) / squareSize);
        
        if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
            // If a piece is already selected, try to move it
            if (selectedPiece) {
                if (movePiece(selectedPiece.row, selectedPiece.col, row, col)) {
                    drawGame();
                    return;
                }
            }
            
            // Select a new piece if it's white (player's color)
            const piece = board[row][col];
            if (piece && piece.color === 'white') {
                selectedPiece = {row, col};
                validMoves = getValidMoves(piece, row, col);
                drawGame();
            }
        }
    });
    
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            // Rotate board
            boardRotation = (boardRotation + 90) % 360;
            drawGame();
        } else if (e.key === 'z' || e.key === 'Z') {
            // Undo move
            undoMove();
            drawGame();
        } else if (e.key === 'h' || e.key === 'H') {
            // Show hints
            showHints();
            drawGame();
        }
    });
    
    // Button event listeners
    document.getElementById('newGameBtn').addEventListener('click', () => {
        gameRunning = true;
        initBoard();
        drawGame();
    });
    
    document.getElementById('hintBtn').addEventListener('click', () => {
        if (gameRunning) {
            showHints();
            drawGame();
        }
    });
    
    document.getElementById('undoBtn').addEventListener('click', () => {
        if (gameRunning) {
            undoMove();
            drawGame();
        }
    });
    
    // Main draw function
    function drawGame() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw game elements
        drawBackground();
        
        // Apply board rotation
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(boardRotation * Math.PI / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        
        drawBoard();
        drawPieces();
        
        ctx.restore();
    }
    
    // Initialize and start the game
    initBoard();
    gameRunning = true;
    drawGame();
})();