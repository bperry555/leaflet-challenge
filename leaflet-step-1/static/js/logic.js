
const streets = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: 'pk.eyJ1IjoiYnBlcnJ5IiwiYSI6ImNrOWMzYW9uZjAwdzIzZXMwcHpnMDd4cGYifQ.f-_rrSpsZs-FkZnABYzfMg'
});

const satelite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: 'pk.eyJ1IjoiYnBlcnJ5IiwiYSI6ImNrOWMzYW9uZjAwdzIzZXMwcHpnMDd4cGYifQ.f-_rrSpsZs-FkZnABYzfMg'
});

var myMap = L.map('map', {
    center: [37.87065, -122.2658],
    zoom: 2,
    layers: streets
});

const baseMaps = {
    Streets: streets,
    Satelite: satelite
}

var controlLayers = L.control.layers(baseMaps).addTo(myMap);

var geojsonMarkerOptions = {
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
function chooseColor(m) {
    return  m >= 5 ? '#EB0100': // 5+
            m >= 4 ? '#E85A00': // 4-5
            m >= 3 ? '#E6B000': // 3-4
            m >= 2 ? '#C3E400': // 2-3
            m >= 1 ? '#6BE200': // 1-2
            m >= 0 ? '#16E000': // 0-1
                '#FFFFFF'
};
function radius(r) {
    return  r > 0 ? r * 1.5 : 1;
};

const monthUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

d3.json(monthUrl, function(geoJsonData) {
    const thirtyDays = L.geoJSON(geoJsonData,{
        style: function(feature) {
            return {
                fillColor: chooseColor(feature.properties.mag),
                radius: radius(feature.properties.mag),
                fillopacity: .03
            }
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            return L.circleMarker(latlng,geojsonMarkerOptions);
        }
        }).bindPopup(function (layer) {
        return "<p><b>" + layer.feature.properties.title +
            "</b></br> Magnitude: " + layer.feature.properties.mag+ "</p>";
    })
    controlLayers.addOverlay(thirtyDays, 'Previous 30 Days');

})
sevenDayJson = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
d3.json(monthUrl, function(geoJsonData) {
    const sevenDays = L.geoJSON(geoJsonData,{
        style: function(feature) {
            return {
                fillColor: chooseColor(feature.properties.mag),
                radius: radius(feature.properties.mag)
            }
        },
        filter: function(feature) {
            var difference = Date.now() - feature.properties.time;
            var daysDifference = Math.floor(difference/1000/60/60/24);
            return  daysDifference <= 7 ? true: false;
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            return L.circleMarker(latlng,geojsonMarkerOptions);
        }})
        .bindPopup(function (layer) {
            return "<p><b>" + layer.feature.properties.title +
                "</b></br> Magnitude: " + layer.feature.properties.mag+ "</p>";
        });
    controlLayers.addOverlay(sevenDays, 'Previous Seven Days');
})

const boundriesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

d3.json(boundriesUrl, function(platesJson) {
    const platesLayer = L.geoJSON(platesJson)
        controlLayers.addOverlay(platesLayer, 'Tectonic plates');
});
  
const legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {
    var div = L.DomUtil.create('div', 'info legend'),
        mag = [0, 1, 2, 3, 4, 5]

        for (var i = 0; i < mag.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + chooseColor(mag[i]) + '"></i>' 
                + mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
        }
        return div;
}
legend.addTo(myMap);
