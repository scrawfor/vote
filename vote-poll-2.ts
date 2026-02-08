import { exec, execSync } from "child_process";

let count = 0;
const maxCalls = 25;

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
		setTimeout(fetchAndUpdate, 800);
	} else {
		console.log("Reached maximum calls. Updating VPN.");

		updateMullvad();
		setTimeout(() => {
			count = 0;
			fetchAndUpdate();
		}, 10000);
		// exec(
		// 	'powershell -ExecutionPolicy Bypass -File "./random-mullvad.ps1"',
		// 	(err, stdout, stderr) => {
		// 		if (err) {
		// 			console.error("Error running random-mullvad.ps1:", err);
		// 		} else {
		// 			//console.log(stdout);
		// 		}

		// 		console.log("Waiting 5 seconds before restarting...");
		// 		setTimeout(() => {
		// 			count = 0;
		// 			fetchAndUpdate();
		// 		}, 10000);
		// 	},
		// );
	}
}

async function updateMullvad() {
	// Get all relay groups from Mullvad
	console.log("Disconnecting VPN");
	execSync("mullvad disconnect");
	await new Promise((resolve) => setTimeout(resolve, 2_000));
	console.log("Updating Location VPN");
	execSync("mullvad relay set location any");
	await new Promise((resolve) => setTimeout(resolve, 2_000));
	execSync("mullvad connect");
	console.log("Connecting VPN");
	await new Promise((resolve) => setTimeout(resolve, 2_000));
	const newVPN = execSync("mullvad status", { encoding: "utf-8" });
	console.log("New VPN:", newVPN);

	// const relays = output
	// 	.split("\n")
	// 	.filter((line) => /^[a-z]{2}\s/.test(line))
	// 	.map((line) => {
	// 		const parts = line.split(/\s+/);
	// 		return {
	// 			country: parts[0],
	// 			city: parts[1],
	// 		};
	// 	});

	// console.log({ relays, output });

	// // Pick a random relay
	// const randomRelay = relays[Math.floor(Math.random() * relays.length)];

	// console.log(
	// 	`Random relay selected: ${randomRelay.country} ${randomRelay.city}`,
	// );

	// // Set the relay location
	// execSync(
	// 	`mullvad relay set location ${randomRelay.country} ${randomRelay.city}`,
	// 	{ stdio: "inherit" },
	// );

	// // Reconnect
	// execSync("mullvad disconnect", { stdio: "inherit" });
	// setTimeout(() => {
	// 	execSync("mullvad connect", { stdio: "inherit" });

	// 	// Show status
	// 	execSync("mullvad status", { stdio: "inherit" });
	// }, 1000);
}

fetchAndUpdate();
