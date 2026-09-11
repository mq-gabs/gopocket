#!/bin/sh

cd gopocket-ui && pnpm run build
cd ..
mkdir -p dist
go build -o dist/gopocket
