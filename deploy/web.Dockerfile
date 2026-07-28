# syntax=docker/dockerfile:1
#
# Vrindavan web edge: builds the Flutter web bundle, then serves it behind Caddy, which also
# reverse-proxies the API and static uploads to the backend and terminates HTTPS (auto Let's
# Encrypt certificate for $SITE_ADDRESS).
#
# API_BASE_URL is baked into the Flutter bundle at BUILD time (compile-time --dart-define), so it
# must be the PUBLIC url the browser will use, e.g. https://app.yourdomain.com/api. Because Caddy
# serves the app and proxies /api on the same origin, there is no CORS hop in production.

# ---------- Flutter build ----------
# We install the exact Flutter SDK the app is developed/verified against (3.44.6 → Dart 3.12.2,
# satisfying pubspec's `sdk: ^3.12.2`) rather than a prebuilt CI image: cirruslabs' newest
# published tag is only 3.44.0 (Dart 3.12.0), which fails `pub get`. Cloning the SDK at a pinned
# tag keeps the build deterministic AND matched to the toolchain, with no reliance on a third-party
# image's release cadence. Bump FLUTTER_VERSION in lockstep with the app's toolchain.
FROM debian:bookworm-slim AS build
ARG FLUTTER_VERSION=3.44.6
ENV FLUTTER_HOME=/opt/flutter
ENV PATH="${FLUTTER_HOME}/bin:${FLUTTER_HOME}/bin/cache/dart-sdk/bin:${PATH}"

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
         git curl unzip xz-utils zip ca-certificates libglu1-mesa \
    && rm -rf /var/lib/apt/lists/* \
    && git clone --depth 1 -b "${FLUTTER_VERSION}" https://github.com/flutter/flutter.git "${FLUTTER_HOME}" \
    && git config --global --add safe.directory "${FLUTTER_HOME}" \
    && flutter --version \
    && flutter config --no-analytics --enable-web \
    && flutter precache --web

WORKDIR /app/frontend

# Compile-time API origin. Passed via compose build args from .env (API_BASE_URL).
ARG API_BASE_URL=http://localhost:3000/api

# pub get first for layer caching.
COPY frontend/pubspec.yaml frontend/pubspec.lock ./
RUN flutter pub get

COPY frontend/ ./
RUN flutter build web --release --dart-define=API_BASE_URL=${API_BASE_URL}

# ---------- Caddy serve + reverse proxy ----------
FROM caddy:2 AS serve
COPY --from=build /app/frontend/build/web /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443
