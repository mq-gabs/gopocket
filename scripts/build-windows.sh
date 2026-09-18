#!/bin/bash

set -e

APP_NAME="gopocket"
OUTPUT_DIR="dist"

echo "Building $APP_NAME for Windows..."

mkdir -p "$OUTPUT_DIR"

GOOS=windows GOARCH=amd64 CGO_ENABLED=0 \
go build \
  -trimpath \
  -ldflags="-s -w" \
  -o "$OUTPUT_DIR/$APP_NAME.exe" .

echo "Build complete:"
echo "$OUTPUT_DIR/$APP_NAME.exe"
