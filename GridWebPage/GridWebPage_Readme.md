## 关于此目录下的网页和数据
---
- `github pages 地址 https://theropod.github.io/MLinSiteSelection/GridWebPage/index.html`
- `/data` 路径下（不含子目录中的）是将提供的原始数据转成的csv，将`bank_name`统一为`shop_name`，将经纬度统一为`lng_wgs84`和`lat_wgs84`，分隔符统一为`,`
- `/data/csv2geojson`中
    - `points2grid_geojson.py`是将所有的点计算出对应格网的`fnid`后写入以`fnid_`开头的csv和`geojson`，统计了每个网格中各种类型点的数量或评均值，输出在`bj_grid_sum.csv`，并将统计的数据再次附加到网格`ss_grid_beijing_wgs84_merged.csv`
    - `ss_grid_csv2geojson.py` 将有附加数据的网格转换成geojson，后转成topojson
    - `shp`中是有附加数据的网格转成的`shapefile`
- 其他目录下为网页需要的文件文档
