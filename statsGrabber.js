const { firefox } = require("playwright");
const { Parser } = require('json2csv');
const fs = require('fs');

(async () => {
	const browser = await firefox.launch({ slowMo: 50 });
	const page = await browser.newPage();
	await page.goto("https://www.basketball-reference.com/draft/NBA_2003.html");
	const players = await page.evaluate(() => {
		const players = [...document.querySelectorAll("#stats tr")].filter((row) =>
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
		return players;
	});
	await browser.close();

	const fields = Object.keys(players[0]);
	const opts = { fields };

	try {
		const parser = new Parser(opts);
		const playersCsv = parser.parse(players);
		const csvOutputFile = 'draftPickData.csv';
		fs.writeFile(csvOutputFile, playersCsv, (err) => {
			if (err) {
				throw err;
			}
			console.log('The file has been saved!');
		});
	} catch (err) {
		console.error(err);
	}
})();
