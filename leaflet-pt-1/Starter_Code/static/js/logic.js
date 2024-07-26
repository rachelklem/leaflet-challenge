// pull data
// perform a GET response to query the data?
let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"

d3.json(queryURL).then(function (data) {
    console.log(data);
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  function markerStyle(feature) {
    console.log(feature.properties.mag)
    console.log(feature.geometry.coordinates)
    let magnitude = feature.properties.mag
    let coordinates = feature.geometry.coordinates
    let depth = coordinates[2]
    let radius = magnitude * 1.5
    let fillColor = chooseColor(depth);
    return {
        radius: radius,
        color: "grey",
        weight: 1,
        fillColor: fillColor,
        opacity: 1,
        fillOpacity: .5
    };
  };

  function chooseColor(depth) {
    if (depth >= 300) {
      return "black";
    } else if (depth >= 70) {
      return "purple";
    } else if (depth >= 40 && depth < 70) {
      return "blue";
    } else if (depth >= 10 && depth < 40) {
    return "green";
    } else {
      return "yellow";
    }
  };

  //create pop up for each feature
  function onEachFeature(feature, layer) {
    let coordinates = feature.geometry.coordinates
    let depth = coordinates[2]  
      
    layer.bindPopup(`<h3>${feature.properties.place.toUpperCase()}</h3>
          <hr><p>Time Occured: ${new Date(feature.properties.time)}</p>
          <p>Magnitude: ${feature.properties.mag}</p>
          <p>Location: ${coordinates[0]}, ${coordinates[1]}</p>
          <p>Depth: ${depth}</p>`);
      
    layer.on({
      'mouseover': function (event) {
          event.target.setStyle({ fillOpacity: 1,
            color: "blue",
            weight: 3
          });
      },
      'mouseout': function (event) {
          event.target.setStyle({ fillOpacity: .8,
            color: "grey",
            weight: 1.5,
          });
      },
      'click': function (event) {
        myMap.fitBounds(event.target.getBounds());
        myMap.setZoom(6);
    }
  });
};

// geoJSON layer

let earthquakes = L.geoJSON(earthquakeData, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, markerStyle(feature));
  },
  onEachFeature: onEachFeature
});

// Send earthquakes layer to the createMap function
createMap(earthquakes);
filterMap(earthquakes);

function createMap(earthquakes) {
  
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  }); 

  let humanitarian = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street": street,
    "Topographic": topo,
    "Humanitarian": humanitarian
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [7.9, 14.4],
    zoom: 2.5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Create legend control
let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var labels = ['<strong>Legend</strong>'];
    var colors = ["black", "purple", "blue", "green", "yellow"];
    var categories = ["300 or higher", "70-299", "40-69", "10-39", "Below 10"];
    
    for (var i = 0; i < categories.length; i++) {
     var label = '<div class="legend-item">' +
                '<div class="legend-color" style="background-color:' + colors[i] + ';"></div>' +
                categories[i] +
                '</div>';
    labels.push(label);
  }
  div.innerHTML = labels.join('');
  return div;
};  
legend.addTo(myMap);
};
};