export default function preload() {
	this.load.image("player", "/assets/player-idle.png")
	this.load.image("endpoint", "/assets/end.png")
	this.load.image("grid", "/assets/grid.png")
	this.load.image("validmove", "/assets/validmove.png")
	this.load.image("playeravatar", "/assets/player-avatar.png")
	this.load.image("opponentavatar", "/assets/opponent-avatar.png")
	this.load.plugin(
		"rexcircularprogressplugin",
		"https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcircularprogressplugin.min.js",
		true
	)
}
