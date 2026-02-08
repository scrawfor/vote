import { exec, execSync } from "child_process";

let count = 0;
const maxCalls = 50;

async function fetchAndUpdate() {
	try {
		const response = await fetch(
			"https://poll.fm/n/1b2a4659dc54a5fbb2bac60bc78a3634/16592369?1770520398307",
		);
		if (!response.ok) throw new Error("Network response was not ok");

		const data = await response.text();
		const match = data.match(/=(.*?);/);

		if (match && match[1]) {
			const newValue = match[1].replace(/'/g, "").trim();

			const sourceURL =
				"https://polls.polldaddy.com/vote-js.php?p=16592369&b=0&a=72767567,&o=&va=16&cookie=0&tags=16592369-src:poll-embed&n=c81e7e8cc5|694&url=https%3A//www.usatodaynetworkservice.com/tangstatic/html/nmwd/sf-q1a2z3584c02f3.min.html";

			const updatedURL = sourceURL.replace(/(n=)[^&]*/, `$1${newValue}`);

			//console.log(updatedURL);

			const updatedResponse = await fetch(updatedURL);

			console.log(`Request ${count}`, updatedResponse.status);
			if (!updatedResponse.ok)
				throw new Error("Network response was not ok for updated URL");

			const updatedData = await updatedResponse.text();
			//console.log('Response from updated URL:', updatedData);
		} else {
			console.log("Value not found");
		}
	} catch (error) {
		console.error("There has been a problem:", error);
	}

	count++;

	if (count < maxCalls) {
		setTimeout(fetchAndUpdate, 50);
	} else {
		console.log("Reached maximum calls. Updating VPN.");

		await updateMullvad();
		count = 0;
		fetchAndUpdate();
	}
}

async function updateMullvad() {
	// Get all relay groups from Mullvad
	console.log("Disconnecting VPN");
	execSync("mullvad disconnect");
	await new Promise((resolve) => setTimeout(resolve, 750));

	console.log("Updating Location VPN");
	execSync("mullvad relay set location us");
	await new Promise((resolve) => setTimeout(resolve, 1300));

	execSync("mullvad connect");
	console.log("Connecting VPN");
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const newVPN = execSync("mullvad status", { encoding: "utf-8" });
	console.log("New VPN:", newVPN);
}

fetchAndUpdate();
