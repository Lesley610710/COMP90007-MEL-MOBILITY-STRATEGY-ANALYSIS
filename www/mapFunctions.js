// TODO: Remove explore button after clicking yes,
// image for landmark, different icon for landmark?
// visitor flow rate for landmark?
// visitor flow rate by 24 hours/ 7 days
// landmark accessibility

function addGenericStopsToMap(map, geojsonData, iconName, iconPath, categoryTitle) {
    return new Promise((resolve, reject) => {
        map.loadImage(iconPath, (error, image) => {
            if (error) {
                reject(error);
                return;
            }

            map.addImage(iconName, image);

            map.addSource(iconName + 'Locations', {
                'type': 'geojson',
                'data': geojsonData
            });

            map.addLayer({
                'id': iconName + 'Markers',
                'type': 'symbol',
                'source': iconName + 'Locations',
                'layout': {
                    'icon-image': iconName,
                    'icon-size': 0.25,
                    'icon-anchor': 'center',
                    'visibility': 'visible'
                }
            });

            map.on('click', iconName + 'Markers', (e) => {
                const properties = e.features[0].properties;
                removeHighlightedArea(map);

                const popupContent = `
                    <h5><b>${categoryTitle}</b></h5>
                    <h6>${properties.STOP_NAME}</h6>
                    <p>Stop ID: ${properties.STOP_ID}</p>
                    <p>Latitude: ${properties.LATITUDE}</p>
                    <p>Longitude: ${properties.LONGITUDE}</p>
                    <p>Ticket Zone: ${properties.TICKETZONE}</p>
                    <p>Routes: ${properties.ROUTEUSSP}</p>
                `;

                new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(popupContent)
                    .addTo(map);
            });

            resolve();
        });
    });
}

function addTramStopsToMap(map) {
    return fetch('data/PTV_METRO_TRAM_STOP.geojson')
        .then(response => response.json())
        .then(data => {
            addGenericStopsToMap(map, data, 'tram-stop-icon', '/tram-stop.png', 'Tram Stop');
        })
        .catch(error => {
            console.error("Error fetching tram stop data:", error);
        });
}

function addTrainStationsToMap(map) {
    return fetch('data/PTV_METRO_TRAIN_STATION.json')
        .then(response => response.json())
        .then(data => {
            const geojsonData = {
                type: 'FeatureCollection',
                features: data.map(station => ({
                    type: 'Feature',
                    properties: station,
                    geometry: {
                        type: 'Point',
                        coordinates: [station.LONGITUDE, station.LATITUDE]
                    }
                }))
            };
            addGenericStopsToMap(map, geojsonData, 'train-stop-icon', '/train-stop.png', 'Train Station');
        })
        .catch(error => {
            console.error("Error fetching train station data:", error);
        });
}

function addBusStationsToMap(map) {
    return fetch('data/PTV_METRO_BUS_STOP.json')
        .then(response => response.json())
        .then(data => {
            console.log(`Number of bus stations: ${data.length}`);
            const geojsonData = {
                type: 'FeatureCollection',
                features: data.map(station => ({
                    type: 'Feature',
                    properties: station,
                    geometry: {
                        type: 'Point',
                        coordinates: [station.LONGITUDE, station.LATITUDE]
                    }
                }))
            };
            addGenericStopsToMap(map, geojsonData, 'bus-stop-icon', '/bus-stop.png', 'Bus Station');
        })
        .catch(error => {
            console.error("Error fetching bus station data:", error);
        });
}


function addPublicToiletsToMap(tramMap) {
    // Fetch the JSON data with toilet locations
    return fetch('data/public-toilets.json')
        .then(response => response.json())
        .then(toiletData => {
            const geojsonData = {
                type: 'FeatureCollection',
                features: toiletData.map(toilet => ({
                    type: 'Feature',
                    properties: {
                        name: toilet.name,
                        female: toilet.female,
                        male: toilet.male,
                        wheelchair: toilet.wheelchair,
                        operator: toilet.operator,
                        baby_facil: toilet.baby_facil
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [toilet.lon, toilet.lat]
                    }
                }))
            };

            tramMap.loadImage('/public-toilet.png', (error, image) => {
                if (error) throw error;

                tramMap.addImage('toilet-icon', image);

                tramMap.addSource('toiletLocations', {
                    'type': 'geojson',
                    'data': geojsonData
                });

                tramMap.addLayer({
                    'id': 'toiletMarkers',
                    'type': 'symbol',
                    'source': 'toiletLocations',
                    'layout': {
                        'icon-image': 'toilet-icon',
                        'icon-size': 0.25,  // adjust the size as needed
                        'icon-anchor': 'center',
                        'visibility': 'visible'
                    }
                });

                tramMap.on('click', 'toiletMarkers', (e) => {
                    const properties = e.features[0].properties;
                    removeHighlightedArea(tramMap);

                    const popupContent = `
                        <h5><b>Public Toilet</b></h5>
                        <h6>${properties.name}</h6>
                        <p>Female: ${properties.female}</p>
                        <p>Male: ${properties.male}</p>
                        <p>Wheelchair Accessible: ${properties.wheelchair}</p>
                        <p>Operator: ${properties.operator}</p>
                        <p>Baby Facilities: ${properties.baby_facil}</p>
                    `;

                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(popupContent)
                        .addTo(tramMap);
                });
            });
        })
        .catch(error => {
            console.error("Error fetching toilet data:", error);
        });
}

function addLandmarksToMap(tramMap) {
    // Fetch the JSON data with landmark locations
    return fetch('data/landmarks_with_pedestrian_counts_and_stops_and_distance.json')
        .then(response => response.json())
        .then(landmarkData => {
            const geojsonData = {
                type: 'FeatureCollection',
                features: landmarkData.map(landmark => ({
                    type: 'Feature',
                    properties: landmark,
                    geometry: {
                        type: 'Point',
                        coordinates: [landmark.co_ordinates.lon, landmark.co_ordinates.lat]
                    }
                }))
            };

            tramMap.loadImage('destination.png', (error, image) => {
                if (error) throw error;

                tramMap.addImage('landmark-icon', image);
                tramMap.addSource('landmarkLocations', {
                    'type': 'geojson',
                    'data': geojsonData
                });
                tramMap.addLayer({
                    'id': 'landmarkMarkers',
                    'type': 'symbol',
                    'source': 'landmarkLocations',
                    'layout': {
                        'icon-image': 'landmark-icon',
                        'icon-size': 0.25,
                        'icon-anchor': 'center',
                        'visibility': 'visible'
                    }
                });

                tramMap.on('click', 'landmarkMarkers', (e) => {
                    const properties = e.features[0].properties;
                    highlightSurroundingArea(e.lngLat, tramMap);
                
                    const pedestrianCounts = JSON.parse(properties.pedestrian_counts);
                    const averageCount = pedestrianCounts.average;

                    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                    const counts = days.map(day => {
                        if (pedestrianCounts[day] === undefined) {
                            console.error(`Missing data for ${day}`);
                            return 0;  // Return a default value (e.g., 0) if the data is missing
                        }
                        return pedestrianCounts[day];
                    });
                    
                    const closestStopData = JSON.parse(properties.closest_stop);
                
                    const popupContent = `
                        <h5><b>Landmark</b></h5>
                        <h6>${properties.feature_name}</h6>
                        <p>Theme: ${properties.theme}</p>
                        <p>Sub-Theme: ${properties.sub_theme}</p>
                        <p>Average Pedestrian Count: ${averageCount}</p>
                        <h6><b>Closest Stop</b></h5>
                        <p>Type: ${closestStopData.type}</p>
                        <p>Name: ${closestStopData.STOP_NAME}</p>
                        <p>Distance: ${Math.round(properties.distance_to_closest_stop_meters)} meters</p>
                        <canvas id="chart" style="height: 250px; width: 100%;" height="250"></canvas>
                    `;
                
                    const popup = new mapboxgl.Popup({
                        maxWidth: '450px' 
                    })
                    .setLngLat(e.lngLat)
                    .setHTML(popupContent)
                    .addTo(tramMap);
                    
                    // Render the chart directly after the popup's content is set
                    new Chart(document.getElementById("chart"), {
                        type: 'line',
                        data: {
                            labels: days,
                            datasets: [{
                                label: 'Pedestrian Counts',
                                data: counts,
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                });
                
            });
        })
        .catch(error => {
            console.error("Error fetching landmark data:", error);
        });
}

// Function to show a popup for a given landmark on the map
function showPopupForLandmark(landmark, tramMap) {
    removeHighlightedArea(tramMap);
    const pedestrianCounts = landmark.pedestrian_counts;
    const averageCount = pedestrianCounts.average;

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const counts = days.map(day => pedestrianCounts[day] || 0);

    const closestStopData = landmark.closest_stop;

    const popupContent = `
        <h5><b>Landmark</b></h5>
        <h6>${landmark.feature_name}</h6>
        <p>Theme: ${landmark.theme}</p>
        <p>Sub-Theme: ${landmark.sub_theme}</p>
        <p>Average Pedestrian Count: ${averageCount}</p>
        <h6><b>Closest Stop</b></h6>
        <p>Type: ${closestStopData.type}</p>
        <p>Name: ${closestStopData.STOP_NAME}</p>
        <p>Distance: ${Math.round(landmark.distance_to_closest_stop_meters)} meters</p>
        <canvas id="chart" style="height: 250px; width: 100%;" height="250"></canvas>
    `;

    const popup = new mapboxgl.Popup({ maxWidth: '450px' })
        .setLngLat([landmark.co_ordinates.lon, landmark.co_ordinates.lat])
        .setHTML(popupContent)
        .addTo(tramMap);

    // Render the chart directly after the popup's content is set
    new Chart(document.getElementById("chart"), {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Pedestrian Counts',
                data: counts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function addTaxiRanksToMap(tramMap) {
    // Fetch the JSON data with taxi rank locations
    return fetch('data/taxi-ranks.json')
        .then(response => response.json())
        .then(taxiRankData => {
            const geojsonData = {
                type: 'FeatureCollection',
                features: taxiRankData.map(rank => ({
                    type: 'Feature',
                    properties: {
                        loc_desc: rank.loc_desc,
                        night_only: rank.night_only,
                        ref: rank.ref,
                        num_spaces: rank.num_spaces,
                        safe_city: rank.safe_city
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [rank.geo_point_2d.lon, rank.geo_point_2d.lat]
                    }
                }))
            };

            tramMap.loadImage('taxi.png', (error, image) => {
                if (error) throw error;

                tramMap.addImage('taxi-icon', image);

                tramMap.addSource('taxiRankLocations', {
                    'type': 'geojson',
                    'data': geojsonData
                });

                tramMap.addLayer({
                    'id': 'taxiRankMarkers',
                    'type': 'symbol',
                    'source': 'taxiRankLocations',
                    'layout': {
                        'icon-image': 'taxi-icon',
                        'icon-size': 0.25,  // adjust the size as needed
                        'icon-anchor': 'center',
                        'visibility': 'visible'
                    }
                });

                tramMap.on('click', 'taxiRankMarkers', (e) => {
                    const properties = e.features[0].properties;
                    removeHighlightedArea(tramMap);

                    const popupContent = `
                        <h5><b>Taxi Rank</b></h5>
                        <h6>Location: ${properties.loc_desc}</h6>
                        <p>Night Only: ${properties.night_only}</p>
                        <p>Reference: ${properties.ref}</p>
                        <p>Number of Spaces: ${properties.num_spaces}</p>
                        <p>Safe City: ${properties.safe_city}</p>
                    `;

                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(popupContent)
                        .addTo(tramMap);
                });
            });
        })
        .catch(error => {
            console.error("Error fetching taxi rank data:", error);
        });
}

function removeHighlightedArea(tramMap) {
    if (tramMap.getLayer('highlight-circle')) {
        tramMap.removeLayer('highlight-circle');
        tramMap.removeSource('highlight-circle-source');
    }
}

// function zoomToRadius(zoomLevel) {
//     // This function converts the zoom level to a circle radius.
//     console.log(zoomLevel);

//     return 0.5 * Math.pow(5, (16 - zoomLevel));
// }

function highlightSurroundingArea(lngLat, tramMap) {
    // const currentZoom = tramMap.getZoom();
    // const radius = zoomToRadius(currentZoom); // Calculate radius based on current zoom level
    const radius = 0.2;

    const circleGeoJSON = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    turf.circle([lngLat.lng, lngLat.lat], radius).geometry.coordinates[0]
                ]
            }
        }]
    };

    // Check if a highlighting layer already exists and remove it
    if (tramMap.getLayer('highlight-circle')) {
        tramMap.removeLayer('highlight-circle');
        tramMap.removeSource('highlight-circle-source');
    }

    tramMap.addSource('highlight-circle-source', {
        'type': 'geojson',
        'data': circleGeoJSON
    });

    tramMap.addLayer({
        'id': 'highlight-circle',
        'type': 'fill',
        'source': 'highlight-circle-source',
        'layout': {},
        'paint': {
            'fill-color': '#f08',
            'fill-opacity': 0.4
        }
    });
}


export {
    addTramStopsToMap,
    addTrainStationsToMap,
    addBusStationsToMap,
    addPublicToiletsToMap,
    addLandmarksToMap,
    addTaxiRanksToMap,
    showPopupForLandmark
};
