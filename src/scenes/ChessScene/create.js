export default function create(gameState) {
	// Grid
	const gridTop = this.add.sprite(0, 0, "grid")
	gridTop.setOrigin(0, 0)
	gridTop.displayWidth = this.sys.game.config.width
	gridTop.displayHeight = this.sys.game.config.height / 2
	const gridBottom = this.add.sprite(0, this.sys.game.config.height / 2, "grid")
	gridBottom.setOrigin(0, 0)
	gridBottom.displayWidth = this.sys.game.config.width
	gridBottom.displayHeight = this.sys.game.config.height / 2

	// Boxes
	let createBox = true
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			if (createBox) {
				let sqr = this.add.rectangle(i * 40 + 20, j * 40 + 160, 40, 40, 0xffffff, 0.15)
				sqr.setOrigin(0, 0)
			}
			if (j !== 7) {
				createBox = !createBox
			}
		}
	}

	// Rook
	const pos = getRenderPosition(8, { x: 6, y: 5.5 })
	this.rook = this.add.sprite(pos.x, pos.y, "player").setInteractive()
	this.rook.setOrigin(0, 0)

	// Endpoint
	const boxSize = 40
	const padding = 20
	this.endpoint = this.add.sprite(padding + 22, 12 * boxSize - 18, "endpoint")
	this.endpoint.setOrigin(0.5, 0.5)

	// Avatars
	const playerAvatar = this.add.sprite(160, 568, "playeravatar")
	playerAvatar.setOrigin(0, 0)
	const opponentAvatar = this.add.sprite(155, 32, "opponentavatar")
	opponentAvatar.setOrigin(0, 0)

	this.playerLoader = this.add.rexCircularProgress({
		x: 155,
		y: 563,
		radius: 28,
		trackColor: 0x2a2a2a,
		barColor: 0x3dd771,
		value: 0.0,
	})
	this.playerLoader.setOrigin(0, 0)
	this.playerLoader.alpha = 1

	this.opponentLoader = this.add.rexCircularProgress({
		x: 150,
		y: 27,
		radius: 25,
		trackColor: 0x2a2a2a,
		barColor: 0x3dd771,
		value: 0.0,
	})
	this.opponentLoader.setOrigin(0, 0)
	this.opponentLoader.alpha = 1

	// Pointers
	this.rook.on("pointerdown", function (ptr) {
		if (gameState.moving) return
		if (gameState.playerMove) {
			gameState.validMoves = getValidMoves(gameState.currentPosition)
		}
	})
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
	let x = padding + ((chessSquare - 1) % 8) * size + centerPadding.x
	let y = verticalGap * size + parseInt((chessSquare - 1) / 8) * size + centerPadding.y

	return { x, y }
}
