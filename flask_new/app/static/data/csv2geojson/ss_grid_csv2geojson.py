import csv
import json
from geojson import Feature, FeatureCollection, Point

features = []
with open(r'ss_grid_beijing_wgs84_merged.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    next(reader, None)
    for fnid, ext_min_x, ext_min_y, ext_max_x, ext_max_y, grow_4326, gcol_4326, city_code, city_name, province_id, province_name, bj_convenientstore, bj_dianping, bj_mall, bj_supermarket, bj_unicom_businesshall in reader:
        ext_min_x, ext_min_y, ext_max_x, ext_max_y  = map(float, (ext_min_x, ext_min_y, ext_max_x, ext_max_y))
        features.append(
            Feature(
                type="Feature",
                geometry={
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [ext_min_x, ext_min_y],
                            [ext_max_x, ext_min_y],
                            [ext_max_x, ext_max_y],
                            [ext_min_x, ext_max_y],
                            [ext_min_x, ext_min_y]
                        ]
                    ]
                },
                properties={
                    'fnid':fnid,
                    'grow_4326': grow_4326,
                    'gcol_4326': gcol_4326,
                    'city_code': city_code,
                    'bj_convenientstore': bj_convenientstore,
                    'bj_dianping': bj_dianping,
                    'bj_mall': bj_mall,
                    'bj_supermarket': bj_supermarket,
                    'bj_unicom_businesshall': bj_unicom_businesshall
                }
            )
        )

collection = FeatureCollection(features)
with open("ss_grid_beijing_wgs84_merged.geojson", "w", encoding='utf-8') as f:
    f.write(json.dumps(collection))
    f.close()
