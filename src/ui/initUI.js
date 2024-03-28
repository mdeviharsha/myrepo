import socket from "../socket";
import timeWinnerUI from "./timeWinnerUI";
import createdGameUI from "./createdGameUI";
import Typewriter from 'typewriter-effect/dist/core';

function initUI() {
    const backdrop = document.createElement("div");

    backdrop.classList.add("backdrop");
    backdrop.innerHTML = `
    <div class="navbar">
        <div class="typewriter-container">
            <p class="typewriter-text"></p>
        </div>
        <div class="navbar-buttons">
            <div class="createContainer">
                <h1>Create Game</h1>
                <button class="create-game-btn">Create Game</button>
            </div>
            <div class="roomContainer">
                <div class="join-game-form">
                    <h1>Join Game</h1>
                    <input type="text" class="join-game-input" placeholder="Game Code">
                    <p class="error"></p>
                    <button class="join-game-btn">Join Game</button>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.appendChild(backdrop);

    // Typewriter Effect
    const typewriterContainer = document.querySelector(".typewriter-container");
    const typewriterText = document.querySelector(".typewriter-text");

    const typewriter = new Typewriter(typewriterText, {
        loop: true,
    });

    typewriter.typeString('Welcome to Rook Move♟️')
              .pauseFor(2000) // Pause for 2 seconds after typing
              .start();

    // Apply CSS styles to typewriter text
    typewriterText.style.color = "red"; // Example color (change as needed)
    typewriterText.style.fontSize = "30px"; // Example font size (change as needed)

    // Create game
    const createGameButton = document.querySelector(".create-game-btn");
    createGameButton.addEventListener("click", () => {
        createGame();
        createGameButton.disabled = true;
        createGameButton.innerText = "Creating Game..";
    });

    // Join game
    const joinGameButton = document.querySelector(".join-game-btn");
    joinGameButton.addEventListener("click", () => {
        socket.on("wrong-code", () => {
            const error = document.querySelector(".error");
            error.innerText = "Wrong Room Code";
            socket.off("wrong-code");
        });
        joinGame();
    });

    // Both players ready
    socket.on("ready", () => {
        backdrop.remove();
    });

    socket.on("time-win", (winnerId) => {
        let isWinner = false;
        if (winnerId === socket.id) {
            isWinner = true;
        }
        if (this?.timer) {
            clearTimeout(this.timer);
        }
        backdrop.innerHTML = timeWinnerUI(isWinner);
        document.body.appendChild(backdrop);
    });
}

function createGame() {
    socket.emit("create-game");
    socket.on("game-created", (gameCode) => {
        const modal = document.querySelector(".createContainer");
        modal.innerHTML = createdGameUI(gameCode);
        socket.off("game-created");
    });
}

function joinGame() {
    const input = document.querySelector(".join-game-input");
    const roomCode = input.value;
    if (!roomCode) return;
    socket.emit("join-game", roomCode);
}

export default initUI;
