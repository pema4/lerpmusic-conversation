# Conversation

An interactive piece of music made with Pure Data.
Composition reacts to the presence of Bluetooth LE-enabled devices nearby.

The excerpt is released on the [Bandcamp](https://lerp.bandcamp.com/track/conversation-excerpt) under my artist name 'lerp'.
This piece is designed to run on Raspberry Pi and to be presented at the local art exhibition. Stay tuned for the updates.

## Running locally

Project consists from two applications:
1. [`scanner/index.js`](https://github.com/pema4/lerpmusic-conversation/tree/main/scanner/index.js) -
   Bluetooth announcements listener powered by Node.js.
2. [`announcer/main.pd`](https://github.com/pema4/lerpmusic-conversation/tree/main/announcer/main.pd) -
   Pure Data patch entry point.

UDP port 5000 is used for communication between applications.

### Setup

Just run the script [`install.sh`](https://github.com/pema4/lerpmusic-conversation/tree/main/install.sh).

### Bluetooth announcements listener

The script may require sudo to work correctly.

```bash
cd scanner
npm install
node index.js
```
### Pure Data patch

Patch runs on Pure Data Vanilla 0.53-2 (maybe on some older versions too, I didn't tested it).

You need to compile some native externals before installation:
```bash
cd announcer/lerp
make
# or make pdincludepath=PATH-TO-PD, if you use non-globally installed Pure Data
```

And then you can run the patch:

```bash
pd -open main.pd
```