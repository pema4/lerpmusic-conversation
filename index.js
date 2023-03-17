const noble = require('@abandonware/noble');
const { Client } = require('node-osc');

const oscClient = new Client('127.0.0.1', 5000);
const nearbyDevices = new Map();
const forgetTimeout = 5000;

setInterval(() => {
    console.log(`${nearbyDevices.size} devices nearby`);
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
    const id = peripheral.id;
    const now = new Date();

    if (nearbyDevices.has(id)) {
        const index = nearbyDevices.get(id).index;
        await sendOsc(`/btle/${index}/rssi`, peripheral.rssi);
    } else {
        let takenIndices = new Set(new Array(...nearbyDevices.values()).map((x) => x.index));
        let index = 0;
        while (takenIndices.has(index)) {
            ++index;
        }

        nearbyDevices.set(id, {
            date: now,
            index: index,
        });

        await sendOsc(`/btle/${index}/status`, 1);
        await sendOsc(`/btle/${index}/rssi`, peripheral.rssi);

        wait(forgetTimeout)
            .then(async () => {
                if (nearbyDevices.get(id).date == now) {
                    nearbyDevices.delete(id);
                    await sendOsc(`/btle/${index}/status`, 0);
                }
            })
    }
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
