import { Elysia } from "elysia";
import { exec } from "child_process";
import fs from "fs";

const app = new Elysia();

app.get("/", async (req) => {
	const ip = req.query.ip || "localhost";
	try {
		const cfIp = req.headers["cf-connecting-ip"];
		const resolvedIp = cfIp || (ip === "localhost" ? "1.1.1.1" : ip);
		const res = await fetch(`http://ip-api.com/json/${resolvedIp}`);
        const res2 = await fetch(`http://ipwho.is/${resolvedIp}`);
		const data = await res.json();
        const data2 = await res2.json();

		if (data.status !== "success") {
			return { error: "Failed to fetch IP data." };
		}

		const entries = [
			["IP Address", data.query],
			["Hostname", data.reverse || "N/A"],
			["Country", `${data.country} (${data.countryCode})`],
			["Region", `${data.regionName} (${data.region})`],
			["City", data.city],
			["Latitude", data.lat],
			["Longitude", data.lon],
			["ISP", data.isp],
			["Autonomous System", data.as],
			["User Agent", req.headers["user-agent"] || "N/A"],
			["Connection Method", req.method],
			["Request URL", req.url],
			["Request Path", req.path],
			["Request Protocol", req.protocol],
			["Secure Connection", req.secure ? "Yes" : "No"],
			["Proxy IPs", JSON.stringify(req.ips || [])],
            ["Continent", `${data2.continent} (${data2.continent_code})`],
            ["Postal Code", data2.postal || "N/A"],
            ["Calling Code", data2.calling_code || "N/A"],
            ["Capital", data2.capital || "N/A"],
            ["Borders", data2.borders || "N/A"],
            ["Flag", data2.flag?.emoji || "N/A"],
            ["Timezone", `${data2.timezone?.id} (${data2.timezone?.abbr})`],
            ["Currency", `${data2.currency?.name} (${data2.currency?.code})`],
            ["Currency Symbol", data2.currency?.symbol || "N/A"],
            ["Anonymous", data2.security?.anonymous ? "Yes" : "No"],
            ["Using Proxy", data2.security?.proxy ? "Yes" : "No"],
            ["Using VPN", data2.security?.vpn ? "Yes" : "No"],
            ["Using Tor", data2.security?.tor ? "Yes" : "No"],
            ["Hosting", data2.security?.hosting ? "Yes" : "No"],
		];

		const bpm = 132;
		const step = 60 / bpm;

        const filters = entries
            .map((text, i) => {
				return `drawtext=text='${text[0] + " " + String(text[1])
					.replace(/[:\\]/g, "\\$&")
					.replace(/'/g, "\\'")}':x=(w-text_w)/2:y=(h-text_h)/4+${
					i * 30
				}:fontsize=24:fontcolor=black:enable='between(t,${
					(i + 3.1 + 2.1) * step
				},28)'`;
            })
            .join(",");

		const inputVideo = "input.mp4";
		const outputVideo = "output.mp4";

		if (!fs.existsSync(inputVideo)) {
			return { error: "Input video file not found." };
		}

		const cmd = `ffmpeg -i ${inputVideo} -vf "${filters}" -codec:a copy ${outputVideo}`;

		console.log("Running ffmpeg...");
		await new Promise((resolve, reject) => {
			exec(cmd, (err, stdout, stderr) => {
				if (err) {
					console.error("Error:", err);
					reject(err);
					return;
				}
				console.log("FFmpeg finished. Output:", outputVideo);
				resolve();
			});
		});

		const videoBuffer = fs.readFileSync(outputVideo);
		fs.rmSync(outputVideo);
		return new Response(videoBuffer, {
			headers: {
				"Content-Type": "video/mp4",
				"Content-Disposition": `attachment; filename="get-rekt.mp4"`,
			},
		});
	} catch (error) {
		console.error(error);
		return { error: "An error occurred." };
	}
});

app.listen(3000);

console.log("Server is running on http://localhost:3000");
