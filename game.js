// Max Todd
// 3/1/23

// Modified 3/20/23

// Keep track of the game state
var board;
var bottomPieces;
var gameRunning = true;
const rows = 6;
const columns = 7;

// Player ID
const redPlayer = 1;
const blackPlayer = 2;

// Keep track of current player
currentPlayer = redPlayer;

// Keep track of the connected users player
var selfPlayer = -1;




// Create a socket connection
socket = io()

// Get the users player color
socket.on('id', id => {

    // Ignore any extra connections
    if (id === -1) {

        // Tell the player they can't join the game
        display = document.getElementById("title");
        display.innerHTML = "Sorry, the game is full";

        document.getElementById('game').remove();
        return;
    }

    // startGame();

    selfPlayer = parseInt(id) + 1;
    setConnectionStatus(id);

});

// Set the other players connection status
socket.on('playerConnected', id => {
    setConnectionStatus(id);
});

// Start the game, both players connected
socket.on('bothConnected', twoPlayersConnected => {

    if (selfPlayer == 0) {
        setConnectionStatus(1)
    }
    else {
        setConnectionStatus(0)
    }

    console.log("Starting.");
    console.log(selfPlayer);
    startGame();
});


// Other player had its turn, set new turn

// Get board information
socket.on('turn', a => {

    // console.log("RECIEVING TURN");
    board = a;
    // console.log(board);
    drawBoard(board);

});
// Get turn information
socket.on('currentPlayer', c => {
    if (gameRunning) {updateDisplayWithTurn();}
    currentPlayer = c;
});
// Get bottom pieces information
socket.on('bottomPieces', b => {
    // console.log("in bottom pieces.");
    bottomPieces = b;
    // console.log(bottomPieces);
})


// Player won, set win information
socket.on('win', p => {
    gameRunning = false;
    won(p);
});



// Draw the game board from recieved board
function drawBoard(b) {

    board = b;

    for (let i = 0; i < rows; i++) {

        for (let j = 0; j < columns; j++) {

            let elementID = i.toString() + "," + j.toString();
            let element = document.getElementById(elementID);

            element.className = 'tile';

            // Red tile
            if (board[i][j] == 1) {
                element.className = 'redTile';
            }
            // Black Tile
            else if (board[i][j] == 2) {
                element.className = 'blackTile';
            }

        }

    }

}


// Set connection status
function setConnectionStatus(id) {

    passedPlayer = parseInt(id);

    // Red Player
    if (passedPlayer === 0) {

        checkBox = document.getElementById('redConnected');
        checkBox.style.background = 'green';
        checkBox.innerHTML = "✓";

    }
    // Black Player
    else {

        checkBox = document.getElementById('blackConnected');
        checkBox.style.background = 'green';
        checkBox.innerHTML = "✓";

    }

}


// Set the initial game state
function startGame() {

    // set the board and bottom peices to an array
    board = []
    bottomPieces = []

    for (let i = 0; i < rows; i++) {
        
        // keep track of the row to add
        currentRow = []
        
        for (let j = 0; j < columns; j++) {
            
            // set the bottommost position to 5 for the array
            bottomPieces.push(5)

            // set the empty tiles to a 0
            currentRow.push(0)

            // Create an HTML element for the added tile
            // <span id="00" class="tile"></span>
            let tile = document.createElement("span");
            tile.id = i.toString() + "," + j.toString();
            tile.classList.add("tile");
            tile.innerHTML = " "
            let b = document.getElementsByClassName("board")[0];
            b.appendChild(tile);

        }

        board.push(currentRow)
    }

}


// Drops the game piece into the inputted column
function drop(column) {

    // Don't drop upon ended game
    if (gameRunning == false) {
        return;
    }

    // Only drop if it is the players turn
    if (currentPlayer == selfPlayer) {

        // get the current player
        let player = currentPlayer;

        // get the row to be placed
        row = bottomPieces[column];

        // determine if a tile can be placed

        // cannot place tile, no room
        if (row < 0) {
            return;
        }
        // Can place tile

        // Get the element for the tile to be placed
        elementID = row.toString() + "," + column.toString();
        element = document.getElementById(elementID);

        
        // Red turn, place red tile
        if (player == redPlayer) {
            // set the array as a red player
            board[row][column] = redPlayer;

            // update the appearance as a red tile
            element.classList.add("redTile");

            // check for a red win
            checkWin(redPlayer, row, column);

            // Update turn indicator to black player
            if (gameRunning) {
                updateDisplayWithTurn();
            }

            // set new player turn
            currentPlayer = blackPlayer;
        }

        // Black turn, place black tile
        else if (player == blackPlayer) {
            // set the array as a black player
            board[row][column] = blackPlayer;

            // update the appearance as a black tile
            element.classList.add("blackTile");

            // check for a black win
            checkWin(blackPlayer, row, column);

            // Update turn indicator to black player
            if (gameRunning) {
                updateDisplayWithTurn();
            }

            // set new player turn
            currentPlayer = redPlayer;

        }

        // set the new minimum column height after insertion
        bottomPieces[column] = bottomPieces[column] - 1;
        

        // Send turn information to server
        // console.log("Sending turn");
        socket.emit('turn', board);
        socket.emit('currentPlayer', currentPlayer);
        socket.emit('bottomPieces', bottomPieces);

    }

    
    

}


// Checks the win for the given player
function checkWin(player, row, column) {

    // console.log(board);

    // set no win initially
    win = false;


    // check horizontal win
        let leftIndex = column - 1;
        let rightIndex = column + 1;
        let winProgress = 1;
        

        // check left
        while (leftIndex >= 0 && leftIndex < columns) {
            // player has placed tile to the left, count it
            if (board[row][leftIndex] == player) {
                winProgress++;
                leftIndex--;
            }
            else {
                break;
            }
        }   

        // check right
        while (rightIndex >= 0 && rightIndex < columns) {
            // player has placed tile to the left, count it
            if (board[row][rightIndex] == player) {
                winProgress++;
                rightIndex++;
            }
            else {
                break;
            }
        }

        // check horizontal win
        if (winProgress >= 4) {
            gameRunning = false;
            won(player);
            return;
        }


    // check vertical win
        let upIndex = row - 1;
        let downIndex = row + 1;
        winProgress = 1;
        

        // check up
        while (upIndex >= 0 && upIndex < rows) {
            // player has placed tile upwards, count it
            if (board[upIndex][column] == player) {
                winProgress++;
                upIndex--;
            }
            else {
                break;
            }
        }   

        // check down
        while (downIndex >= 0 && downIndex < rows) {
            // player has placed tile downwards, count it
            if (board[downIndex][column] == player) {
                winProgress++;
                downIndex++;
            }
            else {
                break;
            }
        }

        // check vertical win
        if (winProgress >= 4) {
            gameRunning = false;
            won(player);
            return;
        }


    // check top left to bottom right diagnal win
        leftIndex = column - 1;
        rightIndex = column + 1;
        upIndex = row - 1;
        downIndex = row + 1;
        winProgress = 1;

        // check up left
        while (upIndex >= 0 && upIndex < rows && leftIndex >= 0 && leftIndex < columns) {
            if (board[upIndex][leftIndex] == player) {
                winProgress++;
                upIndex--;
                leftIndex--;
            }
            else {
                break;
            }
        }

        // check down right
        while (downIndex >= 0 && downIndex < rows && rightIndex >= 0 && rightIndex < columns) {
            if (board[downIndex][rightIndex] == player) {
                winProgress++;
                downIndex++;
                rightIndex++;
            }
            else {
                break;
            }
        }

        // check top left to bottom right win
        if (winProgress >= 4) {
            gameRunning = false;
            won(player);
            return;
        }


    // check top right to bottom left diagnal win
        leftIndex = column - 1;
        rightIndex = column + 1;
        upIndex = row - 1;
        downIndex = row + 1;
        winProgress = 1;

        // check up right
        while (upIndex >= 0 && upIndex < rows && rightIndex >= 0 && rightIndex < columns) {
            if (board[upIndex][rightIndex] == player) {
                winProgress++;
                upIndex--;
                rightIndex++;
            }
            else {
                break;
            }
        }

        // check down left
        while (downIndex >= 0 && downIndex < rows && leftIndex >= 0 && leftIndex < columns) {
            if (board[downIndex][leftIndex] == player) {
                winProgress++;
                downIndex++;
                leftIndex--;
            }
            else {
                break;
            }
        }

        // check top right to bottom left win
        if (winProgress >= 4) {
            gameRunning = false;
            won(player);
            return;
        }



    if(win) {
        gameRunning = false;
    }

    gameRunning = true;
}


// Update the turn display
function updateDisplayWithTurn() {

    // Get the element for the turn indicator
    turnIndicator = document.getElementById("turn");

    // Red turn played, display black turn
    if (currentPlayer == redPlayer) {

        console.log("SETTING BLACK PLAYER");
        turnIndicator.innerHTML = "Black Turn";
        turnIndicator.classList.remove("redTurn");
        turnIndicator.classList.add("blackTurn");
        classes = turnIndicator.classList;

    }

    // Black turn played, display red turn
    else if (currentPlayer == blackPlayer) {

        console.log("SETTING RED PLAYER");
        turnIndicator.innerHTML = "Red Turn";
        turnIndicator.classList.remove("blackTurn")
        turnIndicator.classList.add("redTurn")
        classes = turnIndicator.classList;

    }

}


// Displays winning information and stops game
function won(player) {

    // Communicate win with server
    socket.emit('win', player);

    turnIndicator = document.getElementById("turn");

    if (player == redPlayer) {
        turnIndicator.innerHTML = "Red Won!";
    }
    
    else {
        turnIndicator.innerHTML = "Black Won!";
    }
}


// // Restarts the game
// function restart() {

//     // Delete old board
//     for (let i = 0; i < rows; i++) {
//         for (let j = 0; j < columns; j++) {

//             // Get element ID
//             id = i.toString() + "," + j.toString();
            
//             // Remove old element
//             let element = document.getElementById(id);
//             element.remove();

//         }

//         board.push(currentRow)
//     }

//     // Start fresh game
//     gameRunning = true;
//     currentPlayer = redPlayer;
//     turnIndicator = document.getElementById("turn");
//     turnIndicator.innerHTML = "Red Turn";
//     turnIndicator.classList.remove("blackTurn");
//     turnIndicator.classList.remove("redTurn");
//     turnIndicator.classList.add("redTurn")
//     startGame();

// }