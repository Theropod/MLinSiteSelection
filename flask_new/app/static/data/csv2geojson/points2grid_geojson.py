# link points to grid fnid
# 3 output: point geojson, point csv with fnid, summarized points csv
# working directory csv2geojson
import os
import csv
import json
import math
import pathlib
import pandas as pd
from pathlib import Path
from geojson import Feature, FeatureCollection, Point


# read fnid lat lng from ss_grid_beijing_wgs84 into a dict
gridFnidDict = {}
with open(r'ss_grid_beijing_wgs84.csv', newline='', encoding='utf-8') as csvfile:
    gridDictReader = csv.DictReader(csvfile, delimiter=',')
    for row in gridDictReader:
        gridFnidDict[row['gcol_4326']+','+row['grow_4326']] = row['fnid']


# lat,lng -> col,row -> fnid
def get_fnid(lng, lat):
    gridCol = math.ceil((lng - 115.42341096) / 0.00292887126273668)
    gridRow = math.ceil((lat-39.44275803) / 0.00225356264738742)
    try:
        fnid = gridFnidDict[str(gridCol)+','+str(gridRow)]
    except KeyError:
        fnid = "-1"
    return {'fnid': fnid, 'gridCol': gridCol, 'gridRow': gridRow}


# processed rows counter
Counter = 1
# row manipulation in panda


def row_manipulation(pointRow, pointCsv):
    global Counter
    lng = float(pointRow['lng_wgs84'])
    lat = float(pointRow['lat_wgs84'])
    fnidResult = get_fnid(lng, lat)
    pointProperties = json.loads(pointRow.to_json())
    pointProperties.pop('lng_wgs84')
    pointProperties.pop('lat_wgs84')
    pointProperties.update({'fnid': fnidResult.get('fnid')})
    # print(pointProperties)
    print(pointCsv)
    print('gridCol', fnidResult.get('gridCol'))
    print('gridRow', fnidResult.get('gridRow'))
    print('fnid: ', fnidResult.get('fnid'))
    print('count：', Counter)
    print('----------')
    features.append(
        Feature(
            type="Feature",
            geometry={
                "type": "Point",
                "coordinates": [lng, lat]
            },
            properties=pointProperties
        )
    )
    Counter += 1
    return fnidResult.get('fnid')

# test
# points=pd.read_csv(r'D:\Tsinghua\Courses\BigDataSystemsB\Project\GridWebPage\data\bj_conveni_store.csv')
# points.iloc[1:5,:].apply(lambda row: row_manipulation(row,axis=1)

# Dataframe to save merged data
bj_grid_sum = pd.DataFrame(columns=['fnid'])

# Read Csv, get fnid and write
PointCsvs = []
for file in os.listdir('..'):
    if file.endswith('.csv'):
        PointCsvs.append(file)

for pointCsv in PointCsvs:
    parentDir = Path(os.getcwd()).parent
    points = pd.read_csv(os.path.join(parentDir, pointCsv))
    features = []
    # do row_manipulation for all rows
    # points = points.iloc[0:5, :] # test
    points['fnid'] = points.apply(
        lambda row: row_manipulation(row, pointCsv), axis=1)
    # generate a  dataframe and merge it
    pointCsvName = pointCsv.replace('.csv', '')
    if 'dianping' in pointCsvName:
        dianpingScore=points.loc[:, ['shop_Q', 'shop_E', 'shop_S']]
        dianpingScore.replace('N','-1',inplace=True)
        points[pointCsvName] = dianpingScore.astype(float,errors='ignore').mean(axis=1)
        pointsGrouped = points.loc[:,['fnid',pointCsvName]].groupby(['fnid'],as_index=False).mean()
    else:
        # use this column to represent number of points
        points[pointCsvName]=points.index
        pointsGrouped = points.loc[:,['fnid',pointCsvName]].groupby(['fnid'],as_index=False).count()
    bj_grid_sum = bj_grid_sum.merge(pointsGrouped, left_on='fnid',
                                          right_on='fnid', how='outer')
    # write features in json
    collection = FeatureCollection(features)
    outGeojson = os.path.join(
        os.getcwd(), pointCsv).replace('.csv', '.geojson')
    with open(outGeojson, "w", encoding='utf-8') as f:
        f.write(json.dumps(collection, ensure_ascii=False))
        f.close()
    # write a new csv contaning fnid
    outCsv = os.path.join(
        os.getcwd(), pointCsv).replace('bj', 'fnid_bj')
    points=points.drop([pointCsvName],axis=1)
    points.to_csv(outCsv, index=False)
    points

# Merged dataframe to csv. datatype: not string
bj_grid_sum.to_csv('bj_grid_sum.csv', index=False)

# Merge with grid csv
bj_grid_sum['fnid']=bj_grid_sum['fnid'].astype('int64')
grids=pd.read_csv(r'ss_grid_beijing_wgs84.csv')
bj_grids_merged = grids.merge(bj_grid_sum, left_on='fnid',
                                          right_on='fnid', how='left')
bj_grids_merged.to_csv('ss_grid_beijing_wgs84_merged.csv', index=False)