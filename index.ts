import { Elysia } from "elysia";
import { exec } from "child_process";
import fs from "fs";
import { join } from "path";

const videos = {
	"sus.mp4": {
		beginning: 2.2,
		end: 28,
		bpm: 132,
		fontSize: 40,
	},
	"bayern.mp4": {
		beginning: 8.0,
		end: 18,
		bpm: 135,
		fontSize: 40,
	},
	"money.mp4": {
		beginning: 7.0,
		end: 21,
		bpm: 111,
		fontSize: 40,
	},
	"meow.mp4": {
		beginning: 3.0,
		end: 23,
		bpm: 168,
		fontSize: 10,
	},
	"doom.mp4": {
		beginning: 3.0,
		end: 24.0,
		bpm: 165,
		fontSize: 40,
	},
	"shikanoko.mp4": {
		beginning: 10.5,
		end: 25.0,
		bpm: 184,
		fontSize: 40,
	},
};

const videoNames = Object.keys(videos);

const app = new Elysia()
	.get("*", async () => {
		const videoName =
			videoNames[Math.floor(Math.random() * videoNames.length)] as string;
		return new Response(null, {
			status: 302,
			headers: {
				Location: `/get-rekt-${encodeURIComponent(videoName)}`,
			},
		});
	})
	.get(
		"/:videoName",
		async ({
			params,
			query,
			headers,
			path,
			request,
			url,
		}: {
			params: any;
			query: any;
			headers: any;
			path: any;
			request: any;
			url: any;
		}) => {
			const videoName = params.videoName.replace(/^get-rekt-/, "");

			if (!/^[a-zA-Z0-9_.-]+$/.test(videoName ?? "")) {
				return { error: "Invalid video name: " + videoName };
			}

			if (!videos[videoName]) {
				return { error: "Video not found: " + videoName };
			}

			const ip = query.ip || "localhost";
			try {
				const cfIp = headers["cf-connecting-ip"];
				const resolvedIp =
					cfIp || (ip === "localhost" ? "1.1.1.1" : ip);

				const hash = Bun.hash(resolvedIp + Date.now());
				const tempOutputVideo = join("./videos", `${hash}.mp4`);

				const res = await fetch(`http://ip-api.com/json/${resolvedIp}`);
				const res2 = await fetch(`http://ipwho.is/${resolvedIp}`);
				const data = (await res.json()) as any;
				const data2 = (await res2.json()) as any;

				if (data.status !== "success") {
					return { error: "Failed to fetch IP data." };
				}

				const entries = [
					["IP Address", data.query],
					["IP Type", data.type || "IPv4"],
					["Hostname", data.reverse || "127.0.0.1"],
					["Country", `${data.country} (${data.countryCode})`],
					["Region", `${data.regionName} (${data.region})`],
					["City", data.city],
					["Latitude", data.lat],
					["Longitude", data.lon],
					["ISP", data.isp],
					["Autonomous System", data.as],
					["User Agent", headers["user-agent"] || "N/A"],
					["Connection Method", "HTTP"],
					["Request URL", url],
					["Request Path", path],
					["Request Protocol", request.protocol || "HTTP/1.1"],
					["Secure Connection", request.secure ? "Yes" : "No"],
					["Proxy IPs", JSON.stringify(request.ips || [])],
					[
						"Continent",
						`${data2.continent} (${data2.continent_code})`,
					],
					["Postal Code", data2.postal || "N/A"],
					["Calling Code", data2.calling_code || "N/A"],
					["Capital", data2.capital || "N/A"],
					["Borders", data2.borders || "N/A"],
					[
						"Timezone",
						`${data2.timezone?.id} (${data2.timezone?.abbr})`,
					],
					["Anonymous", data2.security?.anonymous ? "Yes" : "No"],
					["Using Proxy", data2.security?.proxy ? "Yes" : "No"],
					["Using VPN", data2.security?.vpn ? "Yes" : "No"],
					["Using Tor", data2.security?.tor ? "Yes" : "No"],
					["Is dum dum", "Yes"],
					["Threat Level", "high"],
					["Hacked?", "Definitely :P"],
					["WHO HACKED ME", "YO FUCKING PET"],
				];

				const bpm = videos[videoName as keyof typeof videos].bpm;
				const step = 60 / bpm;

				const offset = videos[videoName as keyof typeof videos].beginning;
				const endTime = videos[videoName as keyof typeof videos].end;
				const maxFont = videos[videoName as keyof typeof videos].fontSize;
				const minFont = 2;

				const esc = (s: string) =>
					String(s).replace(/[:\\]/g, "\\$&").replace(/'/g, "\\'");

				const parts = [];
				for (let m = 0; m < entries.length; m++) {
					const k = m + 1;
					const tStart = offset + m * step;
					const tEnd =
						m === entries.length - 1
							? endTime
							: offset + (m + 1) * step;

					const fontSize = Math.max(
						minFont,
						Math.min(maxFont, Math.floor(500 / k))
					);

					for (let i = 0; i < k; i++) {
						const [label, value] = entries[i] as any;
						const text = `${label}: ${value}`;
						parts.push(
							`drawtext=text='${esc(
								text
							)}':fontsize=${fontSize}:fontcolor=black:bordercolor=white:borderw=2:` +
								`x=(w-text_w)/2:` +
								`y=${i}*(h/${k}):` +
								`enable='between(t,${tStart.toFixed(
									3
								)},${tEnd.toFixed(3)})'`
						);
					}
				}

				const filters = parts.join(",");

				const inputVideo = join("./videos/" + videoName);
				const outputVideo = params.videoName;

				if (!fs.existsSync(inputVideo)) {
					return { error: "Input video file not found." };
				}

				const cmd = `ffmpeg -y -hide_banner -loglevel error -i ${inputVideo} -vf "${filters}" -t ${videos[videoName as keyof typeof videos].end} -c:v libx264 -preset ultrafast -crf 20 -movflags +faststart -c:a copy -threads 1 -f mp4 ${tempOutputVideo}`;
				console.log("Running ffmpeg for IP ", resolvedIp);
				await new Promise((resolve, reject) => {
					exec(cmd, (err) => {
						if (err) {
							console.error("Error:", err);
							reject(err);
							return;
						}
						console.log("FFmpeg finished. Output:", tempOutputVideo);
						resolve(void 0);
					});
				});

				const videoBuffer = fs.readFileSync(tempOutputVideo);
				fs.rmSync(tempOutputVideo);

				return new Response(videoBuffer, {
					headers: {
						"Content-Type": "video/mp4",
					},
				});
			} catch (error: any) {
				console.error(error.message);
				return { error: "An error occurred." };
			}
		}
	);

app.listen(process.argv[2] || 3000);

console.log("GET REKT!!! is running on http://localhost:" + (process.argv[2] || 3000));
