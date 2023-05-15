const noble = require('@abandonware/noble');
const { Client } = require('node-osc');

const oscClient = new Client('127.0.0.1', 5000);
const nearbyDevices = new Map();
const ANNOUNCEMENTS_THRESHOLD = 10;
const FORGET_TIMEOUT = 5000;
const DELETE_TIMEOUT = 2000;

setInterval(() => {
    console.log(`Nearby devices: ${nearbyDevices.size}`);
    let activeDevices = 0;
    nearbyDevices.forEach((x) => {
        if (x.announcements >= ANNOUNCEMENTS_THRESHOLD) {
            activeDevices += 1;
        }
    })
    console.log(`Sounding devices: ${activeDevices}`);
}, 2000);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sendOsc = (address, value) => {
    return new Promise((resolve, reject) => {
        oscClient.send(address, value, (res) => {
            if (res == null) {
                resolve()
            } else {
                reject(res);
            }
        });
    });
};

noble.on('discover', async (peripheral) => {
    let index = 0;
    const id = peripheral.id;
    const now = new Date();

    if (nearbyDevices.has(id)) {
        const nearbyDevice = nearbyDevices.get(id);
        index = nearbyDevice.index;
        nearbyDevice.announcements += 1;
        nearbyDevice.date = now;
        if (nearbyDevices.get(id).announcements == ANNOUNCEMENTS_THRESHOLD) {
            await sendOsc(`/btle/${index}/status`, 1);
        }
        if (nearbyDevices.get(id).announcements >= ANNOUNCEMENTS_THRESHOLD) {
            await sendOsc(`/btle/${index}/rssi`, peripheral.rssi);
        }
    } else {
        let takenIndices = new Set(new Array(...nearbyDevices.values()).map((x) => x.index));
        while (takenIndices.has(index)) {
            ++index;
        }

        nearbyDevices.set(id, {
            date: now,
            index: index,
            announcements: 1,
        });

        if (nearbyDevices.get(id).announcements == ANNOUNCEMENTS_THRESHOLD) {
            await sendOsc(`/btle/${index}/status`, 1);
        }
        if (nearbyDevices.get(id).announcements >= ANNOUNCEMENTS_THRESHOLD) {
            await sendOsc(`/btle/${index}/rssi`, peripheral.rssi);
        }
    }

    wait(FORGET_TIMEOUT)
        .then(async () => {
            if (nearbyDevices.get(id)?.date == now) {
                await sendOsc(`/btle/${index}/status`, 0);
                setTimeout(() => nearbyDevices.delete(id), DELETE_TIMEOUT);
            }
        })
});

noble.on('stateChange', async (state) => {
    if (state === 'poweredOn') {
        await noble.startScanningAsync([], true);
    }
});

function stop(signal) {
    console.log(`Caught ${signal} signal`);

    noble.stopScanningAsync()
        .then(async () => {
            for (const { index } of nearbyDevices.values()) {
                await sendOsc(`/btle/${index}/status`, 0);
            }
            nearbyDevices.clear()
        })
        .then(() => process.exit());
}

process.on('SIGINT', stop);
