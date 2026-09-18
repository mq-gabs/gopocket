#!/bin/sh

set -e

APP_NAME="gopocket"
OUTPUT_DIR="dist"


echo "Building $APP_NAME..."

mkdir -p "$OUTPUT_DIR"

go build \
  -o "$OUTPUT_DIR/$APP_NAME" .

echo "Build complete!"
