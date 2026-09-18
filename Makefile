ui:
	cd gopocket-ui && pnpm run dev

api:
	go run .

build-ui:
	bash ./scripts/build-ui.sh

build: build-ui
	bash ./scripts/build.sh

build-windows: build-ui
	bash ./scripts/build-windows.sh

run: build
	./dist/gopocket
