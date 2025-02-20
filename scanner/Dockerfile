FROM node:18.12.1
RUN apt-get update && apt-get install -y bluetooth bluez libbluetooth-dev libudev-dev libcap2-bin
COPY . /app
WORKDIR /app
RUN npm install
RUN setcap cap_net_raw+eip $(eval readlink -f `which node`)
#CMD ["node", "index.js"]
CMD ["sleep", "10000000"]