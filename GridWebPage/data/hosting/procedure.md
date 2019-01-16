## tippercanoe
### geojson to mbtiles
`tippecanoe -o bj_ss_grid.mbtiles -z 18 --coalesce-densest-as-needed --extend-zooms-if-still-dropping ss_grid_bejing_extracted.geojson`

---

## tippecanoe
build from source, prerequisites: sqlie3, zlib

Ubuntu `sudo apt-get install build-essential libsqlite3-dev zlib1g-dev`

## tilehut (Node.js)
`git clone https://github.com/b-g/tilehut.git`

( if there's a sqlite3 error after npm install, use npm rebuild)