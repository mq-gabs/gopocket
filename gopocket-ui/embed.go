package ui

import (
	"embed"
	"io/fs"
)

//go:embed all:out
var files embed.FS

func FS() (fs.FS, error) {
	return fs.Sub(files, "out")
}