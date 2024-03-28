import setWinnerUI from "../../ui/setWinnerUI"
import socket from "../../socket"

export default function update(gameState) {
	// Handle loader visibility
	if (gameState.playerMove) {
		this.opponentLoader.alpha = 0
		this.playerLoader.alpha = 1

		// Update loader every second
		this.playerLoader.value = gameState.loader / 30
	} else {
		this.opponentLoader.alpha = 1
		this.playerLoader.alpha = 0

		// Update loader every second
		this.opponentLoader.value = gameState.loader / 30
	}

	// Check if time is up
	if (gameState.playerMove && gameState.loader >= 30 && !gameState.gameEnd) {
		gameState.gameEnd = true
		socket.emit("lost-time", gameState.gameCode)
	}

	// Handles endpoint rotation
	this.endpoint.angle += 1

	// Handles move sign overlays
	if (gameState.validMoves.length > 0 && !gameState.movesOverlay) {
		const grp = this.add.group()
		gameState.validMoves.forEach((move) => {
			const pos = getRenderPosition(move, { x: 4.5, y: 4.5 })
			const moveSign = this.add.sprite(pos.x, pos.y, "validmove").setInteractive()
			moveSign.setOrigin(0, 0)
			moveSign.on("pointerdown", (ptr) => {
				gameState.moveTo = pos.chessSquare
				gameState.validMoves = []
				gameState.moving = true
				grp.clear(true)
				gameState.movesOverlay = false
				socket.emit("player-moved", gameState.gameCode, gameState.moveTo)

				// Restart timer
				clearInterval(this?.timer)
				gameState.loader = 0
				this.timer = setInterval(() => {
					if (gameState.loader === 30) {
						clearInterval(this?.timer)
						return
					}
					gameState.loader += 1
				}, 1000)
			})
			grp.add(moveSign)
		})
		gameState.movesOverlay = true
	}

	// Handles rook move
	if (gameState.moveTo && gameState.moving) {
		const currPos = { x: this.rook.x, y: this.rook.y }
		const updatePos = getRenderPosition(gameState.moveTo, { x: 6, y: 5.5 })
		if (currPos.x > updatePos.x) {
			this.rook.x -= 1
		}
		if (currPos.y < updatePos.y) {
			this.rook.y += 1
		}

		if (currPos.x === updatePos.x && currPos.y === updatePos.y) {
			gameState.moving = false
			gameState.currentPosition = updatePos.chessSquare
			if (gameState.gameEnd) {
				setWinnerUI(gameState.isWinner)
			}
		}
	}
}

function getRenderPosition(chessSquare, centerPadding) {
	if (!centerPadding) {
		centerPadding = {
			x: 0,
			y: 0,
		}
	}
	const size = 40
	const padding = 20
	const verticalGap = 4
	const center = centerPadding
	let x = padding + ((chessSquare - 1) % 8) * size + center.x
	let y = verticalGap * size + parseInt((chessSquare - 1) / 8) * size + center.y

	return { chessSquare, x, y }
}
