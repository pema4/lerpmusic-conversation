# Stage 1: Build Pure Data
FROM arm64v8/debian:buster-slim AS build-pd
RUN apt-get update && apt-get install -y build-essential automake autoconf libtool gettext libasound2 libasound2-dev
COPY pure-data /app/pure-data
WORKDIR /app/pure-data
RUN ./autogen.sh && ./configure && make

# Stage 2: Build externals
FROM arm64v8/debian:buster-slim AS build-externals
RUN apt-get update && apt-get install -y build-essential
COPY lerp /app/lerp
COPY pure-data /app/pure-data
WORKDIR /app/lerp
RUN PDINCLUDEDIR=/app/pure-data/src/ make

# Stage 3: Run Announcer
FROM arm64v8/debian:buster-slim AS announcer
RUN apt-get update && apt-get install -y alsa-utils libasound2
COPY --from=build-pd /app/pure-data /app/pure-data
COPY --from=build-externals /app/lerp /app/lerp
COPY *.pd /app/
COPY voice /app/voice
WORKDIR /app
EXPOSE 5000
CMD ["/app/pure-data/bin/pd", "-r", "44100", "-rt", "-nogui", "-noadc", "-audiooutdev", "0", "-open", "main.pd"]
#CMD ["/app/pure-data/bin/pd", "-r", "44100", "-rt", "-nogui", "-noadc", "-nodac", "-open", "main.pd"]
