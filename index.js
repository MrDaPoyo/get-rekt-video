import { Elysia } from "elysia";
import { exec } from "child_process";
import fs from "fs";

const app = new Elysia();

const generateVideo = async (ip, req) => {
    const cfIp = req.headers["cf-connecting-ip"];
    const resolvedIp = cfIp || (ip === "localhost" ? "1.1.1.1" : ip);
    const res = await fetch(`http://ip-api.com/json/${resolvedIp}`);
    const res2 = await fetch(`http://ipwho.is/${resolvedIp}`);
    const data = await res.json();
    const data2 = await res2.json();

    if (data.status !== "success") {
        throw new Error("Failed to fetch IP data.");
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
        ["Timezone", `${data2.timezone?.id} (${data2.timezone?.abbr})`],
        ["Currency", `${data2.currency?.name} (${data2.currency?.code})`],
        ["Currency Symbol", data2.currency?.symbol || "N/A"],
        ["Anonymous", data2.security?.anonymous ? "Yes" : "No"],
        ["Using Proxy", data2.security?.proxy ? "Yes" : "No"],
        ["Using VPN", data2.security?.vpn ? "Yes" : "No"],
        ["Using Tor", data2.security?.tor ? "Yes" : "No"],
        ["Hosting", data2.security?.hosting ? "Yes" : "No"],
        ["Threat Level", "high"],
        ["Hacked?", "Definitely :P"],
        ["WHO HACKED ME", "YO MOMMA"]
    ];

    const bpm = 132;
    const step = 60 / bpm;

    const offset = (5.2) * step;
    const endTime = 28;
    const maxFont = 80;
    const minFont = 4;

    const esc = (s) =>
        String(s)
        .replace(/[:\\]/g, "\\$&")
        .replace(/'/g, "\\'");

    const parts = [];
    for (let m = 0; m < entries.length; m++) {
        const k = m + 1;
        const tStart = offset + m * step;
        const tEnd = m === entries.length - 1 ? endTime : offset + (m + 1) * step;

        const fontSize = Math.max(minFont, Math.min(maxFont, Math.floor(500 / k)));

        for (let i = 0; i < k; i++) {
            const [label, value] = entries[i];
            const text = `${label}: ${value}`;
            parts.push(
                `drawtext=text='${esc(text)}':fontsize=${fontSize}:fontcolor=black:` +
                `x=(w-text_w)/2:` +
                `y=${i}*(h/${k}):` +
                `enable='between(t,${tStart.toFixed(3)},${tEnd.toFixed(3)})'`
            );
        }
    }

    const filters = parts.join(",");

    const inputVideo = "input.mp4";
    const outputVideo = "output.mp4";

    if (!fs.existsSync(inputVideo)) {
        throw new Error("Input video file not found.");
    }

    const cmd = `ffmpeg -y -hide_banner -loglevel error -i ${inputVideo} -vf "${filters}" -c:v libx264 -preset ultrafast -crf 28 -movflags +faststart -c:a copy -threads 0 ${outputVideo}`;

    console.log("Running ffmpeg for IP " + resolvedIp);
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

    return outputVideo;
};

app.get("/", async (req) => {
    const ip = req.query.ip || "localhost";
    try {
        const outputVideo = await generateVideo(ip, req);
        const videoBuffer = fs.readFileSync(outputVideo);
        fs.rmSync(outputVideo);
        return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>GET REKT</title>
            </head>
            <body>
                <h1>HAiiII :333</h1>
                <p>Enjoy this meme I found hehe</p>
                <video controls autoplay>
                    <source src="data:video/mp4;base64,${videoBuffer.toString("base64")}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </body>
            </html>`,
            {
                headers: {
                    "Content-Type": "text/html",
                },
            }
        );
    } catch (error) {
        console.error(error);
        return { error: "An error occurred." };
    }
}).get("/get-rekt.mp4", async (req) => {
    const ip = req.query.ip || "localhost";
    try {
        const outputVideo = await generateVideo(ip, req);
        const videoBuffer = fs.readFileSync(outputVideo);
        fs.rmSync(outputVideo);
        return new Response(videoBuffer, {
            headers: {
                "Content-Type": "video/mp4",
            },
        });
    } catch (error) {
        console.error(error);
        return { error: "An error occurred." };
    }
});

app.listen(3000);

console.log("Server is running on http://localhost:3000");
