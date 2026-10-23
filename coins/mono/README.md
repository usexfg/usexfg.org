# Maison coin marks — backup set

Single-tone muted-gold duotones of the chain marks, kept as an alternate
treatment. The live orbit uses the original colour marks at reduced opacity
(`js/orbits.js` → `coins/<id>.png?v=4`).

To regenerate from the originals (ImageMagick):

```sh
magick coins/<id>.png -alpha extract mask.png
magick coins/<id>.png -alpha off -colorspace gray \
  +level-colors '#0D0B08','#8C734B' tone.png
magick tone.png mask.png -alpha off -compose CopyOpacity -composite \
  coins/mono/<id>.png
```

`#0D0B08` is obsidian, `#8C734B` is the house muted gold. The alpha channel is
preserved from the source mark.
