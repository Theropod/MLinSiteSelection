var map = L.map("map", { minZoom: 10, maxZoom: 18 }).setView(
	[39.90726389, 116.39111111],
	12
);

// MapBox base layer
var mapBoxTile = L.tileLayer(
	"https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
	{
		maxZoom: 18,
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: "mapbox.light",
		zIndex: 210
	}
);
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
var GaoDeTile = L.tileLayer.chinaProvider('GaoDe.Normal.Map',{maxZoom:18,minZoom:10}).addTo(map);
// TianDitu base Layer
//var TiandituTile = L.tileLayer.chinaProvider('TianDiTu.Normal.Map',{maxZoom:18,minZoom:10}).addTo(map);


// Topojson beijing grids
var grids,
	selectedGridId = 0;
// use Leaflet.FeatureGroup.SubGroup plugin to manage this cluster layer as a ordinary leaflet layer in L.control.layers
// therefore here we need need a subLayerParent to do the trick
var subLayerParent = L.markerClusterGroup();
var gridLayer = L.featureGroup.subGroup(subLayerParent);

var rawGridLayer = omnivore.geojson(
	"./data/csv2geojson/ss_grid_bejing_extracted.geojson"
);
// Need Progress Bar or disable user interaction when zooming to level 9 and 10
rawGridLayer.on("ready", function() {
	grids = rawGridLayer.toGeoJSON();
	buildMapGrid();
});

map.createPane("gridsPane");
map.getPane("gridsPane").style.zIndex = 650;

function buildMapGrid() {
	gridLayer = L.vectorGrid
		.slicer(grids, {
			rendererFactory: L.canvas.tile,
			vectorTileLayerStyles: {
				sliced: {
					fillColor: "#515151",
					fillOpacity: 0.6,
					color: "#515151",
					weight: 0.3
				},
				interactive: true
			},
			maxZoom: 22,
			indexMaxZoom: 5, // max zoom in the initial tile index
			interactive: true,
			getFeatureId: function(feature) {
				return feature.properties["fnid"];
			},
			zIndex: 230
		})
		.addTo(map);

	gridLayer.on("click", function(e) {
		if (map.getZoom() < 14) {
		} else {
			console.log(e);
			if (e.layer.feature) {
				var prop = e.layer.feature.properties;
				//var latlng = [e.latlng.lat,e.latlng.lng];
			} else {
				var prop = e.layer.properties;
				//var latlng = [Number(parcel.y), Number(parcel.x)];
				var latlng = e.latlng;
				var gridPopup = L.popup({ maxWidth: 1500, maxHeight: 400 })
					.setLatLng(latlng)
					.setContent(JSON.stringify(prop))
					.openOn(map);
				gridPopup.bringToFront();
			}
			// settimeout otherwise when map click fires it will override this color change
			// clear selection if slect on the same layer
			if (selectedGridId != 0) {
				gridLayer.resetFeatureStyle(selectedGridId);
			}
			selectedGridId = prop["fnid"];
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
	});
}

// not in cluster:unicom_businesshall
var unicomLayerSytle = L.geoJson(null, {
	zIndex: 610
}).bindPopup(function(layer) {
	if (layer.feature.properties) {
		return JSON.stringify(layer.feature.properties);
	}
});
var unicomLayer = omnivore
	.geojson(
		"./data/csv2geojson/bj_unicom_businesshall.geojson",
		null,
		unicomLayerSytle
	)
	.addTo(map);

// Layer control
var baseMaps = {
	Grayscale: mapBoxTile,
	Streets: osmTile,
	GaoDe: GaoDeTile
};

var overlayMaps = {
	Grid: gridLayer,
	// bj_conveni_store: conveni_storeCluster,
	// bj_dianping: dianpingLayer,
	// bj_mall: bj_mall,
	// bj_supermarket: supermarketCluster,
	bj_unicom_businesshall: unicomLayer
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

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

var clusterPromises = pointStores.map(function(pointStore) {
	return fetch("./data/csv2geojson/" + pointStore.LayerName + ".geojson")
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
		layerControl.addOverlay(pointStores[i].clusterLayer,pointStores[i].LayerName);
	}
});

subLayerParent.addTo(map);
subLayerParent.setZIndex(600);

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
