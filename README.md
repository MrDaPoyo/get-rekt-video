# GET REKT!!!
GET REKT!!! is a silly harmless project meant to scare the shit out of your friends.

It works via sending two requests to `ip-api.com/json/<ip>` and `ipwho.is/<ip>`, then merging the data on a single dictionary.
After that, it uses FFmpeg to create a video with the gathered information, following the beats of the song provided in the video. The BPMs are hardcoded sadly.

## How to get started SCARING THE SHIT OUT OF YOUR FRIENDS?
First of all, install [FFmpeg](https://github.com/FFmpeg/FFmpeg) and [Bun](https://bun.sh).
Then, run

```bash
bun install
```

To install dependencies. That's it! You're ready to scare the shit out of your friends. >:D

Finally, you will need to run the following command to start GET REKT!!! at localhost:3000.

```bash
bun run index.ts
```

You can also append the port you want GET REKT!!! to run on following the command:

```bash
bun run index.ts <port>
```

---

THANK YOU FOR YOUR TIME :33333