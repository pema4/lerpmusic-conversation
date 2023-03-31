# Conversation

An interactive piece of music made with Pure Data.
Composition reacts to the presence of Bluetooth LE-enabled devices nearby.

The excerpt is released on the [Bandcamp](https://lerp.bandcamp.com/track/conversation-excerpt) under my artistic name Lerp.
This piece is designed to run on Raspberry Pi and to be presented at the local art exhibition. Stay tuned for the updates.

## Running locally

Project consists from two applications:
1. [`js/index.js`](https://github.com/pema4/lerpmusic-conversation/tree/main/js/index.js) -
   Bluetooth announcements listener powered by Node.js.
2. [`pd/main.pd`](https://github.com/pema4/lerpmusic-conversation/tree/main/pd/main.pd) -
   Pure Data patch entry point.

UDP port 5000 is used for communication between applications.

### Bluetooth announcements listener

The script may require sudo to work correctly.

```bash
cd js
npm install
node index.js
```
### Pure Data patch

Patch runs on Pure Data Vanilla 0.53-2 (maybe on some older versions to, I didn't tested it).

```bash
cd pd
pd -open main.pd
```