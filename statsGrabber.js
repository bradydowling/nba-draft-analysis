const {firefox} = require("playwright");

(async () => {
	const browser = await firefox.launch({headless: false, slowMo: 50});
	const page = await browser.newPage();
	await page.goto("https://www.basketball-reference.com/draft/NBA_2003.html");
	const handle = await page.evaluateHandle(() => ({window, document}));
	const properties = await handle.getProperties();
	// const windowHandle = properties.get('window');
	const documentHandle = properties.get("document");
	const players = [...documentHandle.querySelectorAll("#stats tr")].filter((row) =>
		row.querySelectorAll("td").length > 0
	).map((tr) => {
		const cells = tr.querySelectorAll("td");
		const pickNum = parseInt(cells[0].innerText);
		const playerName = cells[2].innerText;
		const careerPoints = parseInt(cells[8].innerText) || 0;
		return {pickNum, playerName, careerPoints};
	}).sort((playerA, playerB) => {
		return playerB.careerPoints - playerA.careerPoints;
	}).map((player, i) => {
		const pointRanking = i + 1;
		return {
			draftPickQuality: player.pickNum - pointRanking,
			...player,
			pointRanking,
		};
	}).sort((playerA, playerB) => {
		return playerB.draftPickQuality - playerA.draftPickQuality;
	});
	console.log(players);
	await browser.close();
})();