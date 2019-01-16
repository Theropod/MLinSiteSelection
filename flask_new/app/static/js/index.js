var map = L.map("map", { minZoom: 9, maxZoom: 18 }).setView(
	[39.90726389, 116.39111111],
	12
);

/**
 * BASE MAPS
 */
// Bing Satellite Layer
var BING_KEY =
	"AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L";
var bingLayer = L.tileLayer.bing(BING_KEY, {
	maxZoom: 18,
	minZoom: 9,
	zIndex: 210
});
//	var TiandituTile = L.tileLayer
// 	.chinaProvider("TianDiTu.Satellite.Map", { maxZoom: 18, minZoom: 10 ,zIndex:240})
// 	.addTo(map);
// OSM base Layer
var osmTile = L.tileLayer(
	"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	{
		maxZoom: 18,
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ',
		zIndex: 220
	}
);
// GaoDe base Layer
var GaoDeTile = L.tileLayer.chinaProvider("GaoDe.Normal.Map", {
	maxZoom: 18,
	minZoom: 9,
	zIndex: 230,
	attribution:
		'&copy; <a href="https://www.amap.com">高德软件GS(2018)1709号 - 甲测资字11002004 </a>'
});
// MapBox base layer
var mapBoxTile = L.tileLayer(
	"https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
	{
		minZoom: 9,
		maxZoom: 18,
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: "mapbox.light",
		zIndex: 240
	}
).addTo(map);

/**
 * DATA TO DISPLAY
 */
// beijing grids color definition
function getColor_People(d) {
	return d > 10000
		? "#800026"
		: d > 5000
		? "#BD0026"
		: d > 2500
		? "#E31A1C"
		: d > 1000
		? "#FC4E2A"
		: d > 500
		? "#FD8D3C"
		: d > 200
		? "#FEB24C"
		: d > 50
		? "#FED976"
		: "#FFEDA0";
}
function getColor_Competence(d) {
	return d > 4050
		? "#990000"
		: d > 786
		? "#9e4f00"
		: d > 155
		? "#9c8b00"
		: d > 34
		? "#81993a"
		: d > 10
		? "#539990"
		: d > 6
		? "#188499"
		: d > 3
		? "#22479c"
		: "#000099";
}
function getColor_Veronoi(d) {
	return d > 500000
		? "#800026"
		: d > 250000
		? "#BD0026"
		: d > 100000
		? "#E31A1C"
		: d > 75000
		? "#FC4E2A"
		: d > 50000
		? "#FD8D3C"
		: d > 25000
		? "#FEB24C"
		: d > 10000
		? "#FED976"
		: "#FFEDA0";
}

// map.createPane("gridPane");
// map.getPane("gridPane").style.zIndex = 350;

// Need Progress Bar or disable user interaction when zooming?
var gridLayer;
var previousGridId = null;
var gridPopup = L.popup({ maxWidth: 1500, maxHeight: 400 });
// load grid with pbf tiles
var gridLayer = L.vectorGrid.protobuf(
	// "http://62.234.212.250:8080/bj_ss_grid/{z}/{x}/{y}.pbf",
	'https://b.tiles.mapbox.com/v4/theropod.a8d1pvqu/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoidGhlcm9wb2QiLCJhIjoiY2pxMTI3Y3g5MHQzYTQzc2J3MTlqYnJ3MyJ9.NN_GFA23GnubEtznlOjX1A',
	{
		// pane: "gridPane",
		rendererFactory: L.canvas.tile,
		attribution: "© SmartSteps",
		interactive: true,
		getFeatureId: function(feature) {
			return feature.properties.fnid;
		},
		vectorTileLayerStyles: {
			// "ss_grid_bejing_extracted": function(properties, zoom) {
			// 	var p = properties.competence;
			// 	return {
			// 		// fillColor: getColor_Income(p),
			// 		fillColor: "transparent",
			// 		color: "orange",
			// 		weight: 1,
			// 		fillOpacity: 0.3
			// }
			ss_grid_beijing_extracted: function(feature) {
				return {
					// fill: true is needed
					fill: true,
					fillColor: getColor_People(feature.people),
					fillOpacity: 0.7,
					stroke: false,
					color: "#595959",
					weight: 0.6
				};
			}
		}
	}
);
gridLayer.on("click", function(e) {
	if (map.getZoom() < 14) {
	} else {
		//console.log(e);
		var prop = e.layer.properties;
		//var latlng = [Number(parcel.y), Number(parcel.x)];
		var latlng = e.latlng;
		// settimeout otherwise when map click fires it will override this color change
		// clear selection if slect on the same grid
		var selectedGridId = prop["fnid"];
		gridLayer.resetFeatureStyle(previousGridId);
		if (selectedGridId === previousGridId && !gridPopup.isOpen()) {
			gridPopup.remove();
			selectedGridId = null;
		} else {
			gridPopup
				.setLatLng(latlng)
				.setContent(JSON.stringify(prop))
				.openOn(map);
			gridPopup.bringToFront();
			map.panTo(latlng);
			setTimeout(function() {
				gridLayer.setFeatureStyle(
					selectedGridId,
					{
						color: "red"
					},
					100
				);
			});
		}
		previousGridId = selectedGridId;
	}
});
// gridLayer legends
var gridLayerLegend = L.control({ position: "bottomright" });
gridLayerLegend.onAdd = function(map) {
	var div = L.DomUtil.create("div", "info legend"),
		grades = [50, 200, 500, 1000, 2500, 5000, 10000],
		labels = ['人流量'];
	div.innerHTML+='<h4>人流量</h4>';
	// loop through our density intervals and generate a label with a colored square for each interval
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML +=
			'<i style="background:' +
			getColor_People(grades[i] + 1) +
			'"></i> ' +
			grades[i] +
			(grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
	}

	return div;
};

//to load gridlayer with geojson
// var rawGridLayer = omnivore.topojson("/static/data/csv2geojson/grid.topojson");
// rawGridLayer.on("ready", function() {
// 	grids = rawGridLayer.toGeoJSON();
// 	buildMapGrid();
// });

// function buildMapGrid() {
// 	gridLayer = L.vectorGrid
// 		.slicer(grids, {
// 			rendererFactory: L.canvas.tile,
// 			vectorTileLayerStyles: {
// 				sliced: function(properties, zoom) {
// 					var p = properties.people;

// 					return {
// 						fillColor: getColor_People(p),
// 						fillOpacity: 0.8,
// 						stroke: true,
// 						fill: true,
// 						color: "black",
// 						weight: 0
// 					};
// 				},
// 				interactive: true
// 			},
// 			maxZoom: 22,
// 			indexMaxZoom: 5, // max zoom in the initial tile index
// 			interactive: true,
// 			getFeatureId: function(feature) {
// 				return feature.properties["fnid"];
// 			},
// 			zIndex: 620
// 		})
// 		.addTo(map);
// 		gridLayer.on("click", function(e) {
// 			if (map.getZoom() < 14) {
// 			} else {
// 				//console.log(e);
// 				var prop = e.layer.properties;
// 				//var latlng = [Number(parcel.y), Number(parcel.x)];
// 				var latlng = e.latlng;
// 				// settimeout otherwise when map click fires it will override this color change
// 				// clear selection if slect on the same grid
// 				var selectedGridId = prop["fnid"];
// 				gridLayer.resetFeatureStyle(previousGridId);
// 				if (selectedGridId === previousGridId && !gridPopup.isOpen()) {
// 					gridPopup.remove();
// 					selectedGridId = null;
// 				} else {
// 					gridPopup
// 						.setLatLng(latlng)
// 						.setContent(JSON.stringify(prop))
// 						.openOn(map);
// 					gridPopup.bringToFront();
// 					map.panTo(latlng);
// 					setTimeout(function() {
// 						gridLayer.setFeatureStyle(
// 							selectedGridId,
// 							{
// 								color: "red"
// 							},
// 							100
// 						);
// 					});
// 				}
// 				previousGridId = selectedGridId;
// 			}
// 		});
// }

var gridLayer2 = L.vectorGrid.protobuf(
	// "http://62.234.212.250:8080/bj_ss_grid/{z}/{x}/{y}.pbf",
	"https://b.tiles.mapbox.com/v4/theropod.a8d1pvqu/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoidGhlcm9wb2QiLCJhIjoiY2pxMTI3Y3g5MHQzYTQzc2J3MTlqYnJ3MyJ9.NN_GFA23GnubEtznlOjX1A",
	{
		// pane: "gridPane",
		rendererFactory: L.canvas.tile,
		attribution: "© SmartSteps",
		interactive: true,
		getFeatureId: function(feature) {
			return feature.properties.fnid;
		},
		vectorTileLayerStyles: {
			ss_grid_beijing_extracted: function(feature) {
				return {
					fill: true,
					fillColor: getColor_Competence(feature.competence * 100000),
					fillOpacity: 0.7,
					stroke: false,
					color: "black",
					weight: 0.6
				};
			}
		}
	}
);
gridLayer2.on("click", function(e) {
	if (map.getZoom() < 14) {
	} else {
		//console.log(e);
		var prop = e.layer.properties;
		//var latlng = [Number(parcel.y), Number(parcel.x)];
		var latlng = e.latlng;
		// settimeout otherwise when map click fires it will override this color change
		// clear selection if slect on the same grid
		var selectedGridId = prop["fnid"];
		gridLayer2.resetFeatureStyle(previousGridId);
		if (selectedGridId === previousGridId && !gridPopup.isOpen()) {
			gridPopup.remove();
			selectedGridId = null;
		} else {
			gridPopup
				.setLatLng(latlng)
				.setContent(JSON.stringify(prop))
				.openOn(map);
			gridPopup.bringToFront();
			map.panTo(latlng);
			setTimeout(function() {
				gridLayer2.setFeatureStyle(
					selectedGridId,
					{
						color: "red"
					},
					100
				);
			});
		}
		previousGridId = selectedGridId;
	}
});
// gridLayer2 legends
var gridLayer2Legend = L.control({ position: "bottomright" });
gridLayer2Legend.onAdd = function(map) {
	var div = L.DomUtil.create("div", "info legend"),
		grades = [3, 6, 10, 34, 155, 786, 4050],
		labels = ['Competence*100000'];
	div.innerHTML+='<h4>Competence*100000</h4>';
	// loop through our density intervals and generate a label with a colored square for each interval
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML +=
			'<i style="background:' +
			getColor_Competence(grades[i] + 1) +
			'"></i> ' +
			grades[i] +
			(grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
	}

	return div;
};

// evnets to fire when adding and removing overlays
map.on("overlayadd", function(e) {
	switch (e.name) {
		case "Grid人流量":
			gridLayerLegend.addTo(map);
			break;
		case "Grid_Competence":
			gridLayer2Legend.addTo(map);
			break;
		default:
			break;
	}
});

map.on("overlayremove", function(e) {
	switch (e.name) {
		case "Grid人流量":
			gridLayerLegend.remove();
			break;
		case "Grid_Competence":
			gridLayer2Legend.remove();
			break;
		default:
			break;
	}
});

// unicom layer
var unicomLayer = omnivore
	.geojson(
		"/static/data/csv2geojson/bj_unicom_businesshall.geojson",
		null,
		unicomLayerSytle
	)
	.addTo(map);
// Voronoi Graph
var options = {
	bbox: [115, 39, 117.5, 41.5]
};
var unicomPoints = omnivore.geojson(
	"/static/data/csv2geojson/bj_unicom_businesshall.geojson"
);
var voronoiPolygons;
var voronoiLayer;
unicomPoints.on("ready", function() {
	var unicomPointsGeojson = unicomPoints.toGeoJSON();
	voronoiPolygons = turf.voronoi(unicomPointsGeojson, options);
	// console.log(JSON.stringify(voronoiPolygons));
	voronoiLayer = L.geoJSON(voronoiPolygons, {
		style: function(feature) {
			var property;
			unicomPointsGeojson.features.forEach(unicomPoint => {
				if (turf.booleanWithin(unicomPoint, feature)) {
					property = unicomPoint.properties["出账收入"];
				}
			});
			// console.log(JSON.stringify(voronoiPolygons));
			return {
				fillColor: getColor_Veronoi(property),
				fillOpacity: 0.4,
				stroke: true,
				fill: true,
				color: "black",
				weight: 1
			};
		}
	});
	layerControl.addOverlay(voronoiLayer, "门店收入Voronoi");
});

// points that not in cluster:unicom_businesshall
var unicomLayerSytle = L.geoJson(null, {
	zIndex: 610
}).bindPopup(function(layer) {
	if (layer.feature.properties) {
		return JSON.stringify(layer.feature.properties);
	}
});
// use Leaflet.FeatureGroup.SubGroup plugin to manage this cluster layer as a ordinary leaflet layer in L.control.layers
// therefore here we need need a subLayerParent to do the trick
var subLayerParent = L.markerClusterGroup();
// cluster points: conveni_store,dianping,mall,supermarket,
var pointStores = [];
["bj_conveni_store", "bj_dianping", "bj_mall", "bj_supermarket"].forEach(
	pointStore => {
		pointStores.push({
			LayerName: pointStore,
			clusterLayer: null
		});
	}
);
// // use below to learn 'Promise', should use omnivore normally
var clusterPromises = pointStores.map(function(pointStore) {
	return fetch("/static/data/csv2geojson/" + pointStore.LayerName + ".geojson")
		.then(function(response) {
			return response.json();
		})
		.then(function(points) {
			var clusterLayer = L.featureGroup.subGroup(subLayerParent);
			pointStore.clusterLayer = clusterLayer;
			points.features.forEach(point => {
				marker = L.marker(
					[point.geometry.coordinates[1], point.geometry.coordinates[0]],
					{ title: point.properties.shop_name }
				);
				marker.bindPopup(JSON.stringify(point.properties)).openPopup();
				marker.addTo(pointStore.clusterLayer);
			});
			return pointStore;
		});
});

Promise.all(clusterPromises).then(function(pointStores) {
	for (let i = 0; i < pointStores.length; i++) {
		layerControl.addOverlay(
			pointStores[i].clusterLayer,
			pointStores[i].LayerName
		);
	}
});

// adding 2 cluster layer seperately
// var conveni_storeCluster = L.featureGroup.subGroup(subLayerParent);
// var supermarketCluster = L.featureGroup.subGroup(subLayerParent);

// var getConveni_store = fetch("/data/csv2geojson/bj_conveni_store.geojson")
// 	.then(function(response) {
// 		return response.json();
// 	})
// 	.then(function(conveni_stores) {
// 		conveni_stores.features.forEach(point => {
// 			marker = L.marker(
// 				[point.geometry.coordinates[1], point.geometry.coordinates[0]],
// 				{ title: point.properties.bank_name }
// 			);
// 			marker.bindPopup(JSON.stringify(point.properties)).openPopup();
// 			marker.addTo(conveni_storeCluster);
// 		});
// 	});
// var addLayerConveni_store = new Promise(function(resolve, reject) {
// 	resolve(getConveni_store);
// }).then(function() {
// 	subLayerParent.addTo(map);
// 	subLayerParent.setZIndex(600);
// });

// var getSupermarket = fetch("/data/csv2geojson/bj_supermarket.geojson")
// 	.then(function(response) {
// 		return response.json();
// 	})
// 	.then(function(supermarkets) {
// 		supermarkets.features.forEach(point => {
// 			marker = L.marker(
// 				[point.geometry.coordinates[1], point.geometry.coordinates[0]],
// 				{ title: point.properties.bank_name }
// 			);
// 			marker.bindPopup(JSON.stringify(point.properties)).openPopup();
// 			marker.addTo(supermarketCluster);
// 		});
// 	});
// var addLayerSupermarket = new Promise(function(resolve, reject) {
// 	resolve(getSupermarket);
// }).then(function() {
// 	subLayerParent.addTo(map);
// 	subLayerParent.setZIndex(600);
// });

subLayerParent.addTo(map);
subLayerParent.setZIndex(600);

/**
 * LAYER CONTROLS
 */
var baseMaps = {
	BingSatellite: bingLayer,
	OSM: osmTile,
	GaoDe: GaoDeTile,
	Grayscale: mapBoxTile
};
var overlayMaps = {
	Grid人流量: gridLayer,
	Grid_Competence: gridLayer2,
	bj_unicom_businesshall: unicomLayer
};
var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

/**
 * DRAWING AND SPATIALQUERY
 */
// data
// it's too slow to calculate the intersection of all grid and drawn polygons
// use points instead
var geojsonPoints = { type: "FeatureCollection", features: [] };
var geojsonGrid;
// learn to use async/await
(async () => {
	try {
		// execute after fetch was resolve()
		let response = await fetch(
			"/static/data/csv2geojson/grid.json",
			// "http://62.234.212.250/grid",
			{ mode: "no-cors" }
		);
		let gridsData = await response.json();
		//console.log(gridsData);
		geojsonGrid = L.geoJSON(gridsData, {
			style: {},
			onEachFeature: buildPointRef
		});
	} catch (e) {
		console.log(e);
	}
})();

function buildPointRef(feature, layer) {
	var gridPoint = {
		type: "Feature",
		geometry: {
			type: "Point",
			coordinates: getGridCenter(feature)
		},
		properties: {
			fnid: feature.properties.fnid,
			gridFeatureRef: feature
		}
	};
	geojsonPoints.features.push(gridPoint);
}
function getGridCenter(grid) {
	var lng =
		(grid.geometry.coordinates[0][0][0] + grid.geometry.coordinates[0][1][0]) /
		2;
	var lat =
		(grid.geometry.coordinates[0][0][1] + grid.geometry.coordinates[0][2][1]) /
		2;
	return [lng, lat];
}

// querying functions
var ptsWithin, ptsWithinLayer, highlightgrid;
function withinQuery(extentLayer) {
	ptsWithin = turf.within(geojsonPoints, extentLayer);
	console.log("Found " + ptsWithin.features.length + " features");
	console.log("results " + JSON.stringify(ptsWithin));
	//highlighting
	//map.removeLayer(ptsWithinLayer);
	if (ptsWithinLayer) {
		ptsWithinLayer.remove();
	}
	highlightgrid = { type: "FeatureCollection", features: [] };
	ptsWithin.features.forEach(element => {
		highlightgrid.features.push(element.properties.gridFeatureRef);
	});
	ptsWithinLayer = L.geoJSON(highlightgrid, {
		style: {
			fillColor: "#515151",
			fillOpacity: 0.6,
			color: "#0089a8",
			weight: 0.6
		}
	}).addTo(map);
}

// drawing widgets
// drawnItems is to store the editable layers
var queryItems = new L.FeatureGroup();
var nonqueryItems = new L.FeatureGroup();
var drawnItems = new L.FeatureGroup();
map.addLayer(queryItems);
map.addLayer(nonqueryItems);
var drawControl = new L.Control.Draw({
	draw: {
		// polyline:false,
		marker: false
		// circlemarker:false
	},
	edit: {
		featureGroup: queryItems
	}
}).addTo(map);
// drawing and querying case swtiching funciton
function queryCaseSwitcher(e) {
	var query = 0;
	switch (e.layerType) {
		case "rectangle":
			queryItems.addLayer(e.layer);
			query = 1;
			break;
		case "polygon":
			queryItems.addLayer(e.layer);
			query = 1;
			break;
		case "polyline":
			nonqueryItems.addLayer(e.layer);
			query = 0;
			break;
		case "circle":
			nonqueryItems.addLayer(e.layer);
			query = 0;
			break;
		case "circlemarker":
			nonqueryItems.addLayer(e.layer);
			query = 0;
			break;
		default:
			query = 1;
			break;
	}
	if (query === 1) {
		var extentlayer = queryItems.toGeoJSON();
		withinQuery(extentlayer);
	}
	switch (e.type) {
		case "draw:deleted":
			if (ptsWithinLayer) {
				ptsWithinLayer.remove();
			}
			break;
		default:
			break;
	}
}
map.on("draw:created", queryCaseSwitcher);
map.on("draw:edited", queryCaseSwitcher);
map.on("draw:deleted", queryCaseSwitcher);

// Recommending Interactions
var Recommending = document.getElementById("recommending");
Recommending.onclick = function() {
	var predictCondition = {
		num: 2,
		list: [],
		size: 500
	};
	ptsWithin.features.forEach(element => {
		predictCondition.list.push(parseInt(element.properties.fnid));
	});
	// // ES2017 async posting
	// (async () => {
	// 	try {
	// 		const rawResponse = await fetch("http://62.234.212.250/predict", {
	// 			method: "POST",
	// 			headers: {
	// 				Accept: "application/json",
	// 				"Content-Type": "application/json"
	// 			},
	// 			body: JSON.stringify(predictCondition),
	// 			mode:'no-cors'
	// 		});
	// 		const content = await rawResponse.json();
	// 		var selectedShop = L.geoJSON(content, {
	// 			style: {
	// 				fillColor: "#515151",
	// 				fillOpacity: 0.6,
	// 				color: "#0089a8",
	// 				weight: 0.6
	// 			}
	// 		}).addTo(map);
	// 		console.log(content);
	// 	} catch (error) {
	// 		console.error("Error:", error);
	// 	}
	// })();
	var predictConditionData = JSON.stringify(predictCondition);
	var xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.addEventListener("readystatechange", function() {
		if (this.readyState === 4) {
			console.log(this.responseText);
			alert(this.responseText);
			var recommandLayer = omnivore
				.geojson(this.responseText.toGeoJSON(), null, unicomLayerSytle)
				.addTo(map);
		}
	});
	xhr.open("POST", "http://62.234.212.250/predict");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("cache-control", "no-cache");
	xhr.setRequestHeader("Postman-Token", "f936e2b1-3402-4d5b-a40b-34c600b0fd69");
	xhr.send(
		JSON.stringify({
			num: 5,
			list: [168806, 175192, 191650, 134574, 104624],
			size: 500
		})
	);
	console.log(predictConditionData);
};
