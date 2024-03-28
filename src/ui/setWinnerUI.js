export default function setWinnerUI(isWinner) {
	const winUI = `
	<div class="modal">
		<h1>You Won !</h1>
	</div>
	`
	const lostUI = `
	<div class="modal">
		<h1 style="color:red">You Lost !</h1>
	</div>
	`
	const backdrop = document.createElement("div")
	backdrop.classList.add("backdrop")
	backdrop.innerHTML = isWinner ? winUI : lostUI
	document.body.appendChild(backdrop)
}
