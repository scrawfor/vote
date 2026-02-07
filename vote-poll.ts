// ==UserScript==
// @name         PollDaddy Auto Request Sender + Auto Reload
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Extract fresh token/t/pz, send request, wait 2s, load poll page again
// @match        *://*.polldaddy.com/*
// @match        *://*.poll.fm/*
// @grant        none
// ==/UserScript==
//
//
//
import { JSDOM } from "jsdom";

const userAgents = [
	"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
	"Mozilla/5.0 (Linux; Android 13; A52 Pro Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/144.0.7559.94 Mobile Safari/537.36",
	"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
	"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
	"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
	"Mozilla/5.0 (Linux; Android 10; MAR-LX1B Build/HUAWEIMAR-L21B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/144.0.7559.117 Mobile Safari/537.36 IABMV/1 MetaIAB Facebook",
];

function generateRandomHex32() {
	const numBytes = 16; // 16 bytes = 32 hexadecimal characters (2 hex chars per byte)
	const bytes = crypto.getRandomValues(new Uint8Array(numBytes));
	const hexString = Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return hexString;
}

async function getSite(counter) {
	const userAgent = userAgents[counter % userAgents.length];
	const resp = await fetch("https://poll.fm/16592369", {
		headers: {
			"User-Agent": userAgent,
		},
	});

	const setCookieHeader = resp.headers.get("set-cookie") || "";
	const cookies = setCookieHeader
		.split(",")
		.slice(0, 2)
		.map((cookie) => cookie.trim().split(";")[0])
		.join("; ");
	const data = await resp.text();

	const dom = new JSDOM(data);

	const page = dom.window.document;
	const btn = page.querySelector(".vote-button");
	const raw = btn.getAttribute("data-vote");
	if (!raw) {
		console.log("No data-vote attribute found.");
		return;
	}

	let dataVoteAttr: Record<string, string>;
	try {
		dataVoteAttr = JSON.parse(raw);
	} catch (e) {
		console.log("Failed to parse data-vote JSON:", e);
		return;
	}

	const token = encodeURIComponent(dataVoteAttr.n);
	const pzField = page.querySelector("input[name=pz]");

	console.log({ token });

	const finalUrl =
		"https://poll.fm/vote?" +
		"va=50" +
		"&pt=0" +
		"&r=0" +
		"&p=16592369" +
		"&a=72767567," +
		"&o=" +
		"&t=" +
		encodeURIComponent(dataVoteAttr.t + 1) +
		"&token=" +
		encodeURIComponent(dataVoteAttr.n) +
		// "&token=" +
		// generateRandomHex32() +
		"&pz=" +
		encodeURIComponent(pzField.value);

	console.log("Final Request", { finalUrl, cookies });

	const voteResp = await fetch(finalUrl, {
		headers: {
			"User-Agent": userAgent,
			...(cookies && { Cookie: cookies }),
		},
		method: "GET",
	});

	// const voteRespText = await voteResp.text();
	// const voteRespDOM = new JSDOM(voteRespText);

	// const secondVoteCountSelector =
	// 	"#poll > div > div.css-box.pds-box > div > div > main > form > ul > li:nth-child(2) > label > span.pds-feedback-result > span.pds-feedback-votes";
	// const count = voteRespDOM.window.document.querySelector( secondVoteCountSelector, );

	console.log(voteResp.status);

	return data;
}

async function runLoop() {
	for (let i = 0; i < 10000; i++) {
		console.log(`Step ${i}`);
		await getSite(i);
		await new Promise((resolve) => setTimeout(resolve, 12_500));
	}
}
runLoop();

// function sendRequest(btn) {
// 	const raw = btn.getAttribute("data-vote");
// 	if (!raw) {
// 		console.log("No data-vote attribute found.");
// 		return;
// 	}

// 	let data;
// 	try {
// 		data = JSON.parse(raw);
// 	} catch (e) {
// 		console.log("Failed to parse data-vote JSON:", e);
// 		return;
// 	}

// 	const token = data.n;
// 	const t = data.t;

// 	const pzField = document.querySelector("input[name=pz]");
// 	const pz = pzField ? pzField.value : 1;

// 	const finalUrl =
// 		"https://poll.fm/vote?" +
// 		"va=50" +
// 		"&pt=0" +
// 		"&r=0" +
// 		"&p=16592369" +
// 		"&a=72767698," +
// 		"&o=" +
// 		"&t=" +
// 		encodeURIComponent(t) +
// 		"&token=" +
// 		encodeURIComponent(token) +
// 		"&pz=" +
// 		encodeURIComponent(pz);

// 	console.log("=== PollDaddy Auto Request Sender ===");
// 	console.log("token:", token);
// 	console.log("t:", t);
// 	console.log("pz:", pz);
// 	console.log("Final URL:", finalUrl);

// 	fetch(finalUrl, {
// 		method: "GET",
// 		mode: "no-cors",
// 	})
// 		.then(() => {
// 			console.log("Request sent:", finalUrl);

// 			// Wait 2 seconds, then load the poll page again
// 			setTimeout(() => {
// 				window.location.href = POLL_URL;
// 			}, 4000);
// 		})
// 		.catch((err) => {
// 			console.log("Request error:", err);
// 		});

// 	// On‑screen confirmation panel
// 	const panel = document.createElement("div");
// 	panel.style.position = "fixed";
// 	panel.style.bottom = "20px";
// 	panel.style.right = "20px";
// 	panel.style.background = "rgba(0,0,0,0.85)";
// 	panel.style.color = "#fff";
// 	panel.style.padding = "12px";
// 	panel.style.borderRadius = "6px";
// 	panel.style.fontSize = "14px";
// 	panel.style.zIndex = "999999";

// 	panel.innerHTML = `
//             <b>Request Sent</b><br>
//             token: ${token}<br>
//             t: ${t}<br>
//             pz: ${pz}<br><br>
//             <b>URL:</b><br>
//             <span style="font-size:12px">${finalUrl}</span><br><br>
//             Reloading poll in 2 seconds...
//         `;

// 	document.body.appendChild(panel);
// }

// (function () {
// 	"use strict";

// 	const POLL_URL = "https://poll.fm/16592369";

// 	function waitForVoteButton() {
// 		const btn = document.querySelector(".vote-button");
// 		if (!btn) {
// 			setTimeout(waitForVoteButton, 300);
// 			return;
// 		}
// 		sendRequest(btn);
// 	}

// 	function sendRequest(btn) {
// 		const raw = btn.getAttribute("data-vote");
// 		if (!raw) {
// 			console.log("No data-vote attribute found.");
// 			return;
// 		}

// 		let data;
// 		try {
// 			data = JSON.parse(raw);
// 		} catch (e) {
// 			console.log("Failed to parse data-vote JSON:", e);
// 			return;
// 		}

// 		const token = data.n;
// 		const t = data.t;

// 		let pzField = document.querySelector("input[name=pz]");
// 		const pz = pzField ? pzField.value : 1;

// 		const finalUrl =
// 			"https://poll.fm/vote?" +
// 			"va=50" +
// 			"&pt=0" +
// 			"&r=0" +
// 			"&p=16592369" +
// 			"&a=72767698," +
// 			"&o=" +
// 			"&t=" +
// 			encodeURIComponent(t) +
// 			"&token=" +
// 			encodeURIComponent(token) +
// 			"&pz=" +
// 			encodeURIComponent(pz);

// 		console.log("=== PollDaddy Auto Request Sender ===");
// 		console.log("token:", token);
// 		console.log("t:", t);
// 		console.log("pz:", pz);
// 		console.log("Final URL:", finalUrl);

// 		fetch(finalUrl, {
// 			method: "GET",
// 			mode: "no-cors",
// 		})
// 			.then(() => {
// 				console.log("Request sent:", finalUrl);

// 				// Wait 2 seconds, then load the poll page again
// 				setTimeout(() => {
// 					window.location.href = POLL_URL;
// 				}, 4000);
// 			})
// 			.catch((err) => {
// 				console.log("Request error:", err);
// 			});

// 		// On‑screen confirmation panel
// 		const panel = document.createElement("div");
// 		panel.style.position = "fixed";
// 		panel.style.bottom = "20px";
// 		panel.style.right = "20px";
// 		panel.style.background = "rgba(0,0,0,0.85)";
// 		panel.style.color = "#fff";
// 		panel.style.padding = "12px";
// 		panel.style.borderRadius = "6px";
// 		panel.style.fontSize = "14px";
// 		panel.style.zIndex = "999999";

// 		panel.innerHTML = `
//             <b>Request Sent</b><br>
//             token: ${token}<br>
//             t: ${t}<br>
//             pz: ${pz}<br><br>
//             <b>URL:</b><br>
//             <span style="font-size:12px">${finalUrl}</span><br><br>
//             Reloading poll in 2 seconds...
//         `;

// 		document.body.appendChild(panel);
// 	}

// 	waitForVoteButton();
// })();
