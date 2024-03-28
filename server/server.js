const express = require("express")
const app = express()
const path = require("path")
const server = require("http").createServer(app)
const { Server: Socket } = require("socket.io")
const { v4: uuid } = require("uuid")

const io = new Socket(server, {
	cors: ["http://localhost:5173"], // WS cors configuration
})

const GAMES = {}

// Host client
app.use(express.static(path.resolve("../dist")))
app.get("/*", (req, res) => {
	res.sendFile(path.resolve("../dist", "index.html"))
})

io.on("connection", (client) => {
	client.on("create-game", () => {
		const roomName = uuid().split("-")[0]
		client.join(roomName)
		client.emit("game-created", roomName)
		client.gameCode = roomName
	})

	client.on("disconnect", () => {
		if (client.gameCode) {
			let winnerId = GAMES[client.gameCode].currentPlayer
			if (GAMES[client.gameCode].currentPlayer === client.id) {
				winnerId = GAMES[client.gameCode].nextPlayer
			}
			io.to(client.gameCode).emit("win", winnerId)
		}
	})

	client.on("join-game", (gameCode) => {
		const roomExists = io.sockets.adapter.rooms.has(gameCode)
		if (roomExists) {
			client.join(gameCode)
			client.gameCode = gameCode
			const players = Array.from(io.sockets.adapter.rooms.get(gameCode))
			createGame(players, gameCode)
			players.forEach((player) => {
				const gameData = { playerMove: GAMES[gameCode].currentPlayer === player, gameCode }
				io.to(player).emit("ready", gameData)
			})
			return
		}
		client.emit("wrong-code")
	})

	client.on("player-moved", (gameCode, moveTo) => {
		// Check if move sent by client is a valid move
		const allValidMoves = getValidMoves(GAMES[gameCode].currentRookPosition)
		if (!allValidMoves.includes(parseInt(moveTo))) return

		// Check if won
		if (parseInt(moveTo) === 57) {
			io.to(gameCode).emit("win", GAMES[gameCode].currentPlayer)
		}

		// Let opponent know where player moved
		io.to(GAMES[gameCode].nextPlayer).emit("opponent-moved", moveTo)

		// Swap players
		const temp = GAMES[gameCode].nextPlayer
		GAMES[gameCode].nextPlayer = GAMES[gameCode].currentPlayer
		GAMES[gameCode].currentPlayer = temp
		GAMES[gameCode].currentRookPosition = moveTo

		// Flip player chance
		const players = Array.from(io.sockets.adapter.rooms.get(gameCode))
		players.forEach((player) => {
			const gameData = { playerMove: GAMES[gameCode].currentPlayer === player }
			io.to(player).emit("ready-next-move", gameData)
		})
	})

	client.on("lost-time", (gameCode) => {
		if (!gameCode) return
		const winner = GAMES[gameCode].nextPlayer
		io.to(gameCode).emit("time-win", winner)
	})
})

function createGame(players, gameCode) {
	GAMES[gameCode] = {
		currentPlayer: players[0],
		nextPlayer: players[1],
		currentRookPosition: 8,
	}
}

function getValidMoves(currentPosition) {
	const validMoves = []

	// Valid left postions
	for (let i = currentPosition - 1; i <= 64; i--) {
		if (i < 1) break
		if (i % 8 === 0) {
			break
		}
		validMoves.push(i)
	}

	// Valid down postions
	for (let i = currentPosition + 8; i <= 64; i += 8) {
		validMoves.push(i)
	}
	return validMoves
}

server.listen(3000, () => {
	console.log("server active on port 3000")
})
