ui:
	cd gopocket-ui && pnpm run dev

api:
	go run .

build:
	bash ./scripts/build.sh

run: build
	./dist/gopocket
