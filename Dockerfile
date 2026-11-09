# Build: Rust origin + node toolchain for the template pipeline
FROM rust:1-slim AS rust-build
WORKDIR /build
RUN apt-get update && apt-get install -y pkg-config && rm -rf /var/lib/apt/lists/*
COPY Cargo.toml Cargo.lock ./
COPY crates ./crates
COPY apps ./apps
COPY rust-toolchain.toml ./
RUN cargo build --release -p vexillum-server -p vexillum-auth

FROM node:24-slim AS node-build
WORKDIR /build
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
RUN pnpm install --frozen-lockfile --allow-build=esbuild --allow-build=@parcel/watcher \
  && pnpm --filter @vexillum/compiler compile

FROM debian:13-slim
RUN apt-get update && apt-get install -y ca-certificates sqlite3 && rm -rf /var/lib/apt/lists/*
COPY --from=rust-build /build/target/release/vexillum-server /usr/local/bin/vexillum-server
# ops one-off: provision API keys against the same data dir (see
# docs/DEPLOY-RUNBOOK.md §6)
COPY --from=rust-build /build/target/release/create-key /usr/local/bin/create-key
WORKDIR /data
EXPOSE 8080
CMD ["vexillum-server", "--listen", "0.0.0.0:8080", "--data-dir", "/data"]
