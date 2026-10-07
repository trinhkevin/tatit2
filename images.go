package main

import (
	"fmt"
	"strconv"
	"strings"
)

// imageInfo describes an original image and the resized variants that exist next to it.
type imageInfo struct {
	W, H   int
	Widths []int
}

func imgInfo(src string) imageInfo {
	if m, ok := imageMeta[src]; ok {
		return m
	}
	return imageInfo{}
}

// srcset lists the generated variants plus the original, e.g. "images/a-480.webp 480w, images/a.webp 1120w".
func srcset(src string) string {
	m := imgInfo(src)
	if m.W == 0 {
		return ""
	}
	base := strings.TrimSuffix(src, ".webp")
	parts := make([]string, 0, len(m.Widths)+1)
	for _, w := range m.Widths {
		parts = append(parts, fmt.Sprintf("%s-%d.webp %dw", base, w, w))
	}
	parts = append(parts, fmt.Sprintf("%s %dw", src, m.W))
	return strings.Join(parts, ", ")
}

func imgW(src string) string { return strconv.Itoa(imgInfo(src).W) }
func imgH(src string) string { return strconv.Itoa(imgInfo(src).H) }
