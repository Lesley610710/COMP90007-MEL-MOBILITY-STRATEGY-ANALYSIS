import {
    addTramStopsToMap,
    addTrainStationsToMap,
    addBusStationsToMap,
    addPublicToiletsToMap,
    addLandmarksToMap,
    addTaxiRanksToMap,
    showPopupForLandmark
} from './mapFunctions.js';


document.addEventListener("DOMContentLoaded", function() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaWFueXl5IiwiYSI6ImNsbnBsbzhqZjBsNHcyanB0czFveng5cWgifQ.o_45o0Z7LD0svlNjYwN8ow';

    var tramMap = new mapboxgl.Map({
        container: 'tramRouteMapDiv',
        // style: 'mapbox://styles/mapbox/dark-v11',
        style: 'mapbox://styles/ianyyy/clny6jnem003i01r89dcc6heo',
        center: [144.9631, -37.8136],
        zoom: 11
    });

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    // Create a filter container for the map controls
    var filterContainer = document.createElement('nav');
    filterContainer.className = 'mapboxgl-ctrl filter-group';

    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    });
    tramMap.addControl(geocoder, 'top-left');

    // Create Tram Checkbox and Label
    var tramCheckbox = document.createElement('input');
    tramCheckbox.type = 'checkbox';
    tramCheckbox.id = 'tramCheckbox';
    tramCheckbox.checked = true;  
    tramCheckbox.addEventListener('change', function() {
        console.log('Tram Checkbox:', this.checked ? 'Checked' : 'Unchecked');
        
        const visibility = this.checked ? 'visible' : 'none';
        
        // Set visibility for tram routes and tram animation layers
        tramMap.setLayoutProperty('tramRoutes', 'visibility', visibility);
        if(allowAnimations){
            tramLayers.forEach(layerId => tramMap.setLayoutProperty(layerId, 'visibility', visibility));
        }
    
        // if (this.checked) {
        //     // If checked, restart animations
        //     allowAnimations = true;
        //     // Restart the animations
        // } else {
        //     // If unchecked, disable animations
        //     // allowAnimations = false;
        // }
    });
    filterContainer.appendChild(tramCheckbox);

    // Flag to disable animation
    let allowAnimations = true;

    var tramLabel = document.createElement('label');
    tramLabel.htmlFor = 'tramCheckbox';
    tramLabel.textContent = 'Tram';
    filterContainer.appendChild(tramLabel);

    // Create Train Checkbox and Label
    var trainCheckbox = document.createElement('input');
    trainCheckbox.type = 'checkbox';
    trainCheckbox.id = 'trainCheckbox';
    trainCheckbox.checked = true;
    trainCheckbox.addEventListener('change', function() {
        console.log('Train Checkbox:', this.checked ? 'Checked' : 'Unchecked');
        
        const visibility = this.checked ? 'visible' : 'none';
        
        // Set visibility for train routes and train animation layers
        tramMap.setLayoutProperty('trainRoutes', 'visibility', visibility);
        if(allowAnimations){
            trainLayers.forEach(layerId => tramMap.setLayoutProperty(layerId, 'visibility', visibility));
        }
    });
    filterContainer.appendChild(trainCheckbox);

    var trainLabel = document.createElement('label');
    trainLabel.htmlFor = 'trainCheckbox';
    trainLabel.textContent = 'Train';
    filterContainer.appendChild(trainLabel);

    // Create Bus Checkbox and Label
    var busCheckbox = document.createElement('input');
    busCheckbox.type = 'checkbox';
    busCheckbox.id = 'busCheckbox';
    busCheckbox.checked = true;
    busCheckbox.addEventListener('change', function() {
        console.log('Bus Checkbox:', this.checked ? 'Checked' : 'Unchecked');
        
        const visibility = this.checked ? 'visible' : 'none';
        
        // Set visibility for bus routes and bus animation layers
        tramMap.setLayoutProperty('busRoutes', 'visibility', visibility);
        if(allowAnimations){
            busLayers.forEach(layerId => tramMap.setLayoutProperty(layerId, 'visibility', visibility));
        }
    });
    filterContainer.appendChild(busCheckbox);

    var busLabel = document.createElement('label');
    busLabel.htmlFor = 'busCheckbox';
    busLabel.textContent = 'Bus';
    filterContainer.appendChild(busLabel);

    tramLabel.className = 'tram';
    trainLabel.className = 'train';
    busLabel.className = 'bus';

    let melbourneCityData;
    fetch('data/melbourne_city_data.geojson')
        .then(response => response.json())
        .then(data => {
            melbourneCityData = data;
        });

    function removeMelbourneLgaBoundary() {
        if (tramMap.getLayer('melbourneLgaBoundary')) {
            tramMap.removeLayer('melbourneLgaBoundary');
        }
        if (tramMap.getLayer('melbourneLgaBoundaryFill')) {
            tramMap.removeLayer('melbourneLgaBoundaryFill');
        }
        if (tramMap.getSource('melbourneLgaBoundary')) {
            tramMap.removeSource('melbourneLgaBoundary');
        }
    }    
    function createFilterButtons() {
        const filterButtonsContainer = document.createElement('div');
        filterButtonsContainer.id = 'filterButtonsContainer';
        filterButtonsContainer.className = 'button-filter-group';
    
        // Mapping between filter names and layer IDs
        const filterToLayerIDMap = {
            'Tram Stop': 'tram-stop-iconMarkers',
            'Train Stop': 'train-stop-iconMarkers',
            'Bus Stop': 'bus-stop-iconMarkers',
            'Taxi Rank': 'taxiRankMarkers',
            'Landmarks': 'landmarkMarkers',
            'Toilets': 'toiletMarkers'
        };
    
        const filters = ['Tram Stop', 'Train Stop', 'Bus Stop', 'Taxi Rank', 'Landmarks', 'Toilets'];
        filters.forEach(filter => {
            const filterItem = document.createElement('div'); 
            filterItem.className = 'filter-item';
    
            // Create the custom radio checkbox container for this filter
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'checkbox-wrapper-14';
    
            // Create the checkbox input for this filter
            const filterRadio = document.createElement('input');
            filterRadio.setAttribute('type', 'checkbox'); 
            filterRadio.setAttribute('name', 'map-filter');
            filterRadio.setAttribute('checked', 'true'); // set checkbox as checked by default
            filterRadio.className = 'switch filter-radio'; 
            filterRadio.id = 'filter-' + filter.replace(/ /g, '-').toLowerCase(); // unique ID
            checkboxWrapper.appendChild(filterRadio);
    
            const filterLabel = document.createElement('label');
            filterLabel.setAttribute('for', filterRadio.id); 
            filterLabel.textContent = filter;
            checkboxWrapper.appendChild(filterLabel);
    
            // Logic for showing/hiding layers on checkbox change
            filterRadio.addEventListener('change', function() {
                if (filterRadio.checked) {
                    // Show selected layer
                    tramMap.setLayoutProperty(filterToLayerIDMap[filter], 'visibility', 'visible');
                } else {
                    // Hide selected layer if unchecked
                    tramMap.setLayoutProperty(filterToLayerIDMap[filter], 'visibility', 'none');
                }
            });
    
            filterItem.appendChild(checkboxWrapper);
            filterButtonsContainer.appendChild(filterItem);
        });
    
        filterContainer.appendChild(filterButtonsContainer);
    }
    
    var hasExplored = false;

    // Create a custom button
    var customButton = document.createElement('button');
    customButton.id = 'customButton';
    customButton.textContent = 'Explore Melbourne';
    customButton.addEventListener('click', function() {
        console.log('Explore Button was clickeddd!');
    
        // Create a popup
        var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        })

        
        .setLngLat([144.9631, -37.8136]) // Coordinates for Melbourne
        .setHTML(`
        <p>Do you want to explore Melbourne?</p>
        <div style="display: flex; justify-content: space-between;">
            <button id="confirmExplore">Yes</button>
            <button id="declineExplore">No</button>
        </div>
        `)
        .addTo(tramMap);

        if (!tramMap.getSource('melbourneLgaBoundary')) {
            tramMap.addSource('melbourneLgaBoundary', {
                'type': 'geojson',
                'data': melbourneCityData
            });
            // Layer for filling the interior of the boundary
            tramMap.addLayer({
                'id': 'melbourneLgaBoundaryFill',
                'type': 'fill',
                'source': 'melbourneLgaBoundary',
                'layout': {},
                'paint': {
                    'fill-color': '#FFC3A0',  
                    'fill-opacity': 0.7  
                }
            });
        }
    
        // Add an event listener to the "Yes" button in the popup
        document.getElementById('confirmExplore').addEventListener('click', function() {
            console.log('Explore confirmed!');
            removeMelbourneLgaBoundary();
            customButton.disabled = true;
            hasExplored = true;
            tramMap.setPaintProperty('tramRoutes', 'line-width', hasExplored ? 2 : 4);
            tramMap.setPaintProperty('busRoutes', 'line-width', hasExplored ? 2 : 4);
            tramMap.setPaintProperty('trainRoutes', 'line-width', hasExplored ? 2 : 4);
            
            // Disable animations
            allowAnimations = false;
            tramLayers.forEach(layerId => tramMap.setLayoutProperty(layerId, 'visibility', 'none'));
            trainLayers.forEach(layerId => tramMap.setLayoutProperty(layerId, 'visibility', 'none'));
            busLayers.forEach(layerId => tramMap.setLayoutProperty(layerId, 'visibility', 'none'));
        
            // Add Melbourne LGA boundary to the map if not already added
            if (!tramMap.getSource('melbourneLgaBoundary')) {
                tramMap.addSource('melbourneLgaBoundary', {
                    'type': 'geojson',
                    'data': melbourneCityData
                });

                // Layer for boundary lines
                tramMap.addLayer({
                    'id': 'melbourneLgaBoundary',
                    'type': 'line',
                    'source': 'melbourneLgaBoundary',
                    'layout': {},
                    'paint': {
                        'line-color': '#45474B',
                        'line-width': 7.5
                    }
                });
                // Layer for filling the interior of the boundary
                // tramMap.addLayer({
                //     'id': 'melbourneLgaBoundaryFill',
                //     'type': 'fill',
                //     'source': 'melbourneLgaBoundary',
                //     'layout': {},
                //     'paint': {
                //         'fill-color': '#555843',  
                //         'fill-opacity': 0.1  // Adjust the opacity as desired
                //     }
                // });
                Promise.all([
                    addTramStopsToMap(tramMap),
                    addPublicToiletsToMap(tramMap),
                    addTrainStationsToMap(tramMap),
                    addBusStationsToMap(tramMap),
                    addLandmarksToMap(tramMap),
                    addTaxiRanksToMap(tramMap)
                ]).then(() => {
                    console.log('release');
                    // console.log(tramMap.getStyle().layers);
                    createFilterButtons();
                }).catch(error => {
                    console.error("Error adding layers to the map:", error);
                });
                
            }

        
            // // Calculate the bounding box of the Melbourne LGA boundary
            // var bounds = turf.bbox(melbourneCityData);
        
            // // Use the bounding box to fit the map to the Melbourne LGA boundary
            // tramMap.fitBounds([
            //     [bounds[0], bounds[1]],  // Southwest coordinates
            //     [bounds[2], bounds[3]]   // Northeast coordinates
            // ]);
            tramMap.flyTo({
                center: [144.9631, -37.8136],  // Coordinates for Melbourne
                zoom: 16  // Adjust to desired zoom level
            });     
            
        
            popup.remove();
        });        
    
        // Add an event listener to the "No" button in the popup to simply close it
        document.getElementById('declineExplore').addEventListener('click', function() {
            console.log('Explore declined!');
            removeMelbourneLgaBoundary();
            popup.remove();
        });
    
    });
    filterContainer.appendChild(customButton);
    
    

    // Add the filter container to the map as a control
    tramMap.addControl(new mapboxgl.NavigationControl(), 'top-left');
    // Add a scale control to the map
    tramMap.addControl(new mapboxgl.ScaleControl());
    tramMap.addControl({
        onAdd: function() {
            return filterContainer;
        },
        getDefaultPosition: function() {
            return 'top-right';
        }
    });
    

    // Function to generate the color based on tram/train/bus
    function getRandomColorFor(method) {
        let hue;
        switch (method) {
            case 'bus':
                hue = 0; // red hues
                break;
            case 'train':
                hue = 120; // green hues
                break;
            case 'tram':
                hue = 240; // blue hues
                break;
            default:
                hue = Math.floor(Math.random() * 360); // for any other method or fallback
                break;
        }
        
        const saturation = Math.floor(Math.random() * 50) + 50; // 50% to 100%
        const lightness = Math.floor(Math.random() * 20) + 40; // 40% to 60%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }


    const animationStates = {};

    function lerp(start, end, t) {
        return [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t];
    }

    function computeDistance(pointA, pointB) {
        const dx = pointA[0] - pointB[0];
        const dy = pointA[1] - pointB[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    function animateTramGroup(routeCoordinatesGroup, sourceId, color, startingState = null) {
        let groupCounter = startingState ? startingState.groupCounter : 0;
        let counter = startingState ? startingState.counter : 0;
        const desiredSpeed = 0.0002;  // Desired speed in units per frame

        let t = 0;

        function moveTram() {
            if (!allowAnimations) {
                animationStates[sourceId] = { groupCounter, counter, t };
                return;
            }

            let currentPoint = routeCoordinatesGroup[groupCounter][counter];
            let nextPoint = routeCoordinatesGroup[groupCounter][(counter + 1) % routeCoordinatesGroup[groupCounter].length];
            
            let segmentDistance = computeDistance(currentPoint, nextPoint);
            let deltaT = desiredSpeed / segmentDistance;  // Calculate the change in t for the desired speed
            
            t += deltaT;

            let interpolatedPoint = lerp(currentPoint, nextPoint, t);

            tramMap.getSource(sourceId).setData({
                type: 'Point',
                coordinates: interpolatedPoint
            });

            if (t >= 1) {
                t = 0;
                counter += 1;
                if (counter >= routeCoordinatesGroup[groupCounter].length - 1) {
                    counter = 0;
                    groupCounter = (groupCounter + 1) % routeCoordinatesGroup.length;
                }
            }

            requestAnimationFrame(moveTram);
        }

        moveTram();
    }

    let tramLayers = [];
    let trainLayers = [];
    let busLayers = [];
    
        // TRAM
        fetch("/data/PTV_METRO_TRAM_ROUTE.geojson")
            .then(response => response.json())
            .then(data => {
                const colorMap = {};
                const groupedByRouteId = {};
                const routeKmMap = {};
        
                // Find the longest ROUTE_KM for each ROUTELONGN
                data.features.forEach(feature => {
                    const routeLongName = feature.properties.ROUTELONGN;
                    const routeKm = parseFloat(feature.properties.ROUTE_KM);
        
                    if (!routeKmMap[routeLongName] || routeKm > routeKmMap[routeLongName]) {
                        routeKmMap[routeLongName] = routeKm;
                    }
                });
        
                // Assign a color for each ROUTELONGN based on its longest ROUTE_KM
                for (const routeLongName in routeKmMap) {
                    colorMap[routeLongName] = getRandomColorFor('tram');
                }
        
                data.features.forEach(feature => {
                    const routeId = feature.properties.ROUTE_ID;
        
                    if (!groupedByRouteId[routeId]) {
                        groupedByRouteId[routeId] = [];
                    }
        
                    groupedByRouteId[routeId].push(feature.geometry.coordinates);
                });
        
                tramMap.on('load', function() {
                    tramMap.loadImage('/tram.png', (error, image) => {
                        if (error) throw error;
                        tramMap.addImage('tram-icon', image, { sdf: true });
        
                        tramMap.addSource('tramRoutes', {
                            'type': 'geojson',
                            'data': data
                        });
        
                        tramMap.addLayer({
                            'id': 'tramRoutes',
                            'type': 'line',
                            'source': 'tramRoutes',
                            'layout': {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            'paint': {
                                'line-color': [
                                    'match',
                                    ['get', 'ROUTELONGN'],
                                    ...[].concat(...Object.entries(colorMap).flat()),
                                    'rgba(0,0,0,0.5)'
                                ],
                                'line-width': hasExplored ? 2 : 4
                            }
                        });
        
                        Object.entries(groupedByRouteId).forEach(([routeId, coordinatesGroup], index) => {
                            const sourceId = `tramAnimation${index}`;
                            const layerId = `tramLayer${index}`;
                            // Assuming tramLayers has been initialized earlier
                            tramLayers.push(layerId);
        
                            const correspondingRouteLongName = data.features.find(feature => feature.properties.ROUTE_ID === routeId).properties.ROUTELONGN;
        
                            tramMap.addSource(sourceId, {
                                'type': 'geojson',
                                'data': {
                                    'type': 'Point',
                                    'coordinates': [0, 0]
                                }
                            });
        
                            tramMap.addLayer({
                                'id': layerId,
                                'type': 'symbol',
                                'source': sourceId,
                                'layout': {
                                    'icon-image': 'tram-icon',
                                    'icon-size': 1.5
                                },
                                'paint': {
                                    'icon-color': colorMap[correspondingRouteLongName]
                                }
                            });
        
                            // Assuming animateTramGroup has been defined earlier
                            animateTramGroup(coordinatesGroup, sourceId, colorMap[correspondingRouteLongName]);
                        });
        
                        tramMap.on('mousemove', 'tramRoutes', function(e) {
                            if (e.features.length > 0) {
                                const hoveredRouteLongName = e.features[0].properties.ROUTELONGN;
        
                                tramMap.setPaintProperty('tramRoutes', 'line-color',
                                    ['case',
                                        ['==', ['get', 'ROUTELONGN'], hoveredRouteLongName], 'grey',
                                        ['match', ['get', 'ROUTELONGN'], ...[].concat(...Object.entries(colorMap).flat()), 'rgba(0,0,0,0.5)']
                                    ]);
        
                                const popupText = `Type: Tram<br>Route: ${hoveredRouteLongName}`;
                                // Assuming popup has been initialized earlier
                                popup.setLngLat(e.lngLat)
                                    .setHTML(popupText)
                                    .addTo(tramMap);
                            }
                        });
        
                        tramMap.on('mouseleave', 'tramRoutes', function() {
                            tramMap.setPaintProperty('tramRoutes', 'line-color',
                                ['match',
                                    ['get', 'ROUTELONGN'],
                                    ...[].concat(...Object.entries(colorMap).flat()),
                                    'rgba(0,0,0,0.5)'
                                ]
                            );
                            popup.remove();
                        });
        
                        tramMap.resize();
                    });
                });
            });
    

        // Fetch Train Data
        fetch("/data/PTV_TRAIN_CORRIDOR_CENTRELINE.geojson")
        .then(response => response.json())
        .then(data => {
            const tripColorMap = {};
            const groupedBySegment = {};

            data.features.forEach(feature => {
                const segment = feature.properties.SEGMENT;

                if (!tripColorMap[segment]) {
                    tripColorMap[segment] = getRandomColorFor('train').replace('#00', '#F0'); // New color strategy for trains
                }

                if (!groupedBySegment[segment]) {
                    groupedBySegment[segment] = [];
                }

                groupedBySegment[segment].push(feature.geometry.coordinates);
            });

            tramMap.on('load', function() {
                tramMap.loadImage('/train.png', (error, image) => {
                    if (error) throw error;
                    tramMap.addImage('train-icon', image, { sdf: true });
                    console.log("added")

                    
                    tramMap.addSource('trainRoutes', {
                        'type': 'geojson',
                        'data': data
                    });

                    tramMap.addLayer({
                        'id': 'trainRoutes',
                        'type': 'line',
                        'source': 'trainRoutes',
                        'layout': {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        'paint': {
                            'line-color': [
                                'match',
                                ['get', 'SEGMENT'],
                                ...[].concat(...Object.entries(tripColorMap).flat()),
                                'rgba(0,0,0,0.5)'
                            ],
                            'line-width': hasExplored ? 2 : 4
                        }
                    });

                    Object.entries(groupedBySegment).forEach(([segment, coordinatesGroup], index) => {
                        const sourceId = `trainAnimation${index}`;
                        const layerId = `trainLayer${index}`;
                        trainLayers.push(layerId);  // Store the layer ID

                        tramMap.addSource(sourceId, {
                            'type': 'geojson',
                            'data': {
                                'type': 'Point',
                                'coordinates': [0, 0]
                            }
                        });

                        // Deprecate as it doesn't appear favorable: use sprite
                        // Use rectangle for train animation instead of circle
                        tramMap.addLayer({
                            'id': `trainLayer${index}`,
                            'type': 'symbol',
                            'source': sourceId,
                            'layout': {
                                'icon-image': 'train-icon', 
                                'icon-size': 1.5
                            },
                            'paint': {
                                'icon-color': tripColorMap[segment]
                            }
                        });
                        // tramMap.addLayer({
                        //     'id': `trainLayer${index}`,
                        //     'type': 'circle',
                        //     'source': sourceId,
                        //     'paint': {
                        //         'circle-radius': 8,  // Different radius than the tram for differentiation
                        //         'circle-color': tripColorMap[segment]
                        //     }
                        // });

                        animateTramGroup(coordinatesGroup, sourceId, tripColorMap[segment]);
                    });

                    tramMap.on('mousemove', 'trainRoutes', function(e) {
                        if (e.features.length > 0) {
                            const hoveredSegment = e.features[0].properties.SEGMENT;

                            tramMap.setPaintProperty('trainRoutes', 'line-color',
                                ['case',
                                    ['==', ['get', 'SEGMENT'], hoveredSegment], 'grey',
                                    ['match', ['get', 'SEGMENT'], ...[].concat(...Object.entries(tripColorMap).flat()), 'rgba(0,0,0,0.5)']
                                ]);

                            const popupText = `Type: Train<br>Segment: ${hoveredSegment}`;
                            popup.setLngLat(e.lngLat)
                                .setHTML(popupText)
                                .addTo(tramMap);
                        }
                    });

                    tramMap.on('mouseleave', 'trainRoutes', function() {
                        tramMap.setPaintProperty('trainRoutes', 'line-color',
                            ['match',
                                ['get', 'SEGMENT'],
                                ...[].concat(...Object.entries(tripColorMap).flat()),
                                'rgba(0,0,0,0.5)'
                            ]
                        );
                        popup.remove();
                    });
                });
            });
            // End of Train


    // Fetch Bus Data
    fetch("/data/PTV_METRO_BUS_ROUTE.geojson")
        .then(response => response.json())
        .then(data => {
            const busColorMap = {};
            const groupedByBusRouteId = {};

            data.features.forEach(feature => {
                const routeLongName = feature.properties.ROUTELONGN;  // Change here
                const routeId = feature.properties.ROUTE_ID;

                if (!busColorMap[routeLongName]) {  // Change here
                    busColorMap[routeLongName] = getRandomColorFor('bus');  // Change here
                }

                if (!groupedByBusRouteId[routeId]) {
                    groupedByBusRouteId[routeId] = [];
                }

                groupedByBusRouteId[routeId].push(feature.geometry.coordinates);
            });

            tramMap.on('load', function() {
                tramMap.loadImage('/bus1.png', (error, image) => {
                    if (error) throw error;
                    tramMap.addImage('bus-icon', image, { sdf: true });
                    console.log("added");

                    // Adding bus data to the map
                    tramMap.addSource('busRoutes', {
                        'type': 'geojson',
                        'data': data
                    });

                    tramMap.addLayer({
                        'id': 'busRoutes',
                        'type': 'line',
                        'source': 'busRoutes',
                        'layout': {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        'paint': {
                            'line-color': [
                                'match',
                                ['get', 'ROUTELONGN'],  
                                ...[].concat(...Object.entries(busColorMap).flat()),
                                'rgba(0,0,0,0.5)'
                            ],
                            'line-width': hasExplored ? 2 : 4
                        }
                    });

                    Object.entries(groupedByBusRouteId).forEach(([routeId, coordinatesGroup], index) => {
                        const sourceId = `busAnimation${index}`;
                        const layerId = `busLayer${index}`;
                        busLayers.push(layerId);  // Store the layer ID

                        const correspondingRouteLongName = data.features.find(feature => feature.properties.ROUTE_ID === routeId).properties.ROUTELONGN;  

                        tramMap.addSource(sourceId, {
                            'type': 'geojson',
                            'data': {
                                'type': 'Point',
                                'coordinates': [0, 0]
                            }
                        });

                        tramMap.addLayer({
                            'id': `busLayer${index}`,
                            'type': 'symbol',
                            'source': sourceId,
                            'layout': {
                                'icon-image': 'bus-icon', 
                                'icon-size': 1.5
                            },
                            'paint': {
                                'icon-color': busColorMap[correspondingRouteLongName]  
                            }
                        });

                        animateTramGroup(coordinatesGroup, sourceId, busColorMap[correspondingRouteLongName]); 
                    });

                    tramMap.on('mousemove', 'busRoutes', function(e) {
                        if (e.features.length > 0) {
                            const hoveredRouteLongName = e.features[0].properties.ROUTELONGN;  e

                            tramMap.setPaintProperty('busRoutes', 'line-color',
                                ['case',
                                    ['==', ['get', 'ROUTELONGN'], hoveredRouteLongName], 'grey',  
                                    ['match', ['get', 'ROUTELONGN'], ...[].concat(...Object.entries(busColorMap).flat()), 'rgba(0,0,0,0.5)']  // Change here
                                ]);

                            const popupText = `Type: Bus<br>Route: ${hoveredRouteLongName}`;  
                            popup.setLngLat(e.lngLat)
                                .setHTML(popupText)
                                .addTo(tramMap);
                        }
                    });

                    tramMap.on('mouseleave', 'busRoutes', function() {
                        tramMap.setPaintProperty('busRoutes', 'line-color',
                            ['match',
                                ['get', 'ROUTELONGN'], 
                                ...[].concat(...Object.entries(busColorMap).flat()),
                                'rgba(0,0,0,0.5)'
                            ]
                        );
                        popup.remove();
                    });
                });
            });
        });
        // End of Bus


    });
    
    // Add CSS to the head
    var styleEl = document.createElement('style');
    styleEl.innerHTML = `
        .filter-group {
            font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
            font-weight: 600;
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1;
            border-radius: 6px;
            width: 140px;
            color: #fff;
        }
        
        .filter-group input[type='checkbox']:first-child + label {
            border-radius: 3px 3px 0 0;
        }
        
        .filter-group label:last-child {
            border-radius: 0 0 3px 3px;
            border: none;
        }
        
        .filter-group input[type='checkbox'] {
            display: none;
        }
        
        .filter-group input[type='checkbox'] + label {
            display: block;
            cursor: pointer;
            padding: 10px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.25);
            text-transform: capitalize;
        }
        
        .filter-group input[type='checkbox']:checked + label:before {
            content: '\u2714';
            margin-right: 5px;
        }
        
        /* Hover & Checked colors */
        .filter-group .tram:hover,
        .filter-group input[type='checkbox']:checked + .tram {
            background-color: #3386c0;  /* Highlighted color for checked/hover tram */
        }
        .filter-group input[type='checkbox']:not(:checked) + .tram {
            background-color: #8ECDDD;  /* Highlighted color for unchecked/hover tram */
        }
        
        .filter-group .train:hover,
        .filter-group input[type='checkbox']:checked + .train {
            background-color: #96C291;  /* Highlighted color for checked/hover train */
        }
        .filter-group input[type='checkbox']:not(:checked) + .train {
            background-color: #B5CB99;  /* Highlighted color for unchecked/hover train */
        }
        
        .filter-group .bus:hover,
        .filter-group input[type='checkbox']:checked + .bus {
            background-color: #D80032;  /* Highlighted color for checked/hover bus */
        }
        .filter-group input[type='checkbox']:not(:checked) + .bus {
            background-color: #FF6969;  /* Highlighted color for unchecked/hover bus */
        }
        
        /* Styling for the filter button container */
        .filterButtonsContainer {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            background-color: #333;
            border-radius: 6px;
            padding: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
            position: absolute;
            top: 50px;
            right: 10px;
            z-index: 1;
        }


        @supports (-webkit-appearance: none) or (-moz-appearance: none) {
            .checkbox-wrapper-14 {
                display: flex;
                align-items: center;
                width: 100%; /* Make sure this takes up the full width available */
            }
            .checkbox-wrapper-14 input[type=checkbox] {
            --active: #275EFE;
            --active-inner: #fff;
            --focus: 2px rgba(39, 94, 254, .3);
            --border: #BBC1E1;
            --border-hover: #275EFE;
            --background: #fff;
            --disabled: #F6F8FF;
            --disabled-inner: #E1E6F9;
            -webkit-appearance: none;
            -moz-appearance: none;
            height: 21px;
            outline: none;
            display: inline-block;
            vertical-align: top;
            position: relative;
            margin: 0;
            cursor: pointer;
            border: 1px solid var(--bc, var(--border));
            background: var(--b, var(--background));
            transition: background 0.3s, border-color 0.3s, box-shadow 0.2s;
            }
            .checkbox-wrapper-14 input[type=checkbox]:after {
            content: "";
            display: block;
            left: 0;
            top: 0;
            position: absolute;
            transition: transform var(--d-t, 0.3s) var(--d-t-e, ease), opacity var(--d-o, 0.2s);
            }
            .checkbox-wrapper-14 input[type=checkbox]:checked {
            --b: var(--active);
            --bc: var(--active);
            --d-o: .3s;
            --d-t: .6s;
            --d-t-e: cubic-bezier(.2, .85, .32, 1.2);
            }
            .checkbox-wrapper-14 input[type=checkbox]:disabled {
            --b: var(--disabled);
            cursor: not-allowed;
            opacity: 0.9;
            }
            .checkbox-wrapper-14 input[type=checkbox]:disabled:checked {
            --b: var(--disabled-inner);
            --bc: var(--border);
            }
            .checkbox-wrapper-14 input[type=checkbox]:disabled + label {
            cursor: not-allowed;
            }
            .checkbox-wrapper-14 input[type=checkbox]:hover:not(:checked):not(:disabled) {
            --bc: var(--border-hover);
            }
            .checkbox-wrapper-14 input[type=checkbox]:focus {
            box-shadow: 0 0 0 var(--focus);
            }
            .checkbox-wrapper-14 input[type=checkbox]:not(.switch) {
            width: 21px;
            }
            .checkbox-wrapper-14 input[type=checkbox]:not(.switch):after {
            opacity: var(--o, 0);
            }
            .checkbox-wrapper-14 input[type=checkbox]:not(.switch):checked {
            --o: 1;
            }
            .checkbox-wrapper-14 input[type=checkbox] + label {
                display: flex; /* This will make it flexible */
                align-items: center;
                flex-grow: 1; /* This ensures that the label will take up the remaining space after the checkbox */
                vertical-align: middle;
                cursor: pointer;
                margin-left: 4px;
                background-color: #80B3FF;
                padding: 2px 10px;
                border-radius: 4px;
                text-align: left; /* To make sure text is left-aligned within the available space */
            }
            
            .checkbox-wrapper-14 input[type=checkbox]:not(.switch) {
            border-radius: 7px;
            }
            .checkbox-wrapper-14 input[type=checkbox]:not(.switch):after {
            width: 5px;
            height: 9px;
            border: 2px solid var(--active-inner);
            border-top: 0;
            border-left: 0;
            left: 7px;
            top: 4px;
            transform: rotate(var(--r, 20deg));
            }
            .checkbox-wrapper-14 input[type=checkbox]:not(.switch):checked {
            --r: 43deg;
            }
            .checkbox-wrapper-14 input[type=checkbox].switch {
            width: 38px;
            border-radius: 11px;
            }
            .checkbox-wrapper-14 input[type=checkbox].switch:after {
            left: 2px;
            top: 2px;
            border-radius: 50%;
            width: 17px;
            height: 17px;
            background: var(--ab, var(--border));
            transform: translateX(var(--x, 0));
            }
            .checkbox-wrapper-14 input[type=checkbox].switch:checked {
            --ab: var(--active-inner);
            --x: 17px;
            }
            .checkbox-wrapper-14 input[type=checkbox].switch:disabled:not(:checked):after {
            opacity: 0.6;
            }
            .checkbox-wrapper-14 * {
                box-sizing: inherit;
            }
            .checkbox-wrapper-14 *:before,
            .checkbox-wrapper-14 *:after {
                box-sizing: inherit;
            }
            
            .filter-radio {
                display: none;
            }
        }


        /* CSS for custom button */
        #customButton {
            display: block;
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            margin-bottom: 5px;
            cursor: pointer;
            border: none;
            border-radius: 10px;
            background-color: #DAA520;  
            color: #fff;
            font-weight: bold;
            text-align: center;
        }

        #customButton:hover {
            background-color: #F9B572;  
        }

    `;
    document.head.appendChild(styleEl);
    Shiny.addCustomMessageHandler("renderEChart", function(message) {
        if (message) {
            // Fetch the JSON data with landmark locations
      fetch('data/landmarks_with_pedestrian_counts_and_stops_and_distance.json')
      .then(response => response.json())
      .then(landmarkData => {
          // Sort by average pedestrian count
          landmarkData.sort((a, b) => b.pedestrian_counts.average - a.pedestrian_counts.average);
          
          // Extract top 5 and bottom 5 landmarks
          const top10 = landmarkData.slice(0, 10);
          const bottom10 = landmarkData.slice(-10);
          const filteredLandmarks = top10.concat(bottom10);
      
          var names = filteredLandmarks.map(landmark => landmark.feature_name);
          var averages = filteredLandmarks.map(landmark => landmark.pedestrian_counts.average);
          // // Set chart height based on the number of landmarks
          // var chartHeight = 100 * names.length; 
          // document.getElementById('mainChart').style.height = `${chartHeight}px`;
      
          // Construct the ECharts option using the extracted data
          var option = {
            title: {
                text: 'Top and Bottom 10 Landmarks by Pedestrian Count',
                left: 'center'
            },
              grid: { containLabel: true },
              xAxis: { name: 'Average Count' },
              yAxis: {
                  type: 'category',
                  data: names,
                  axisLabel: {
                      interval: 0,
                      rotate: 45  // Rotate for long names
                  }
              },
              visualMap: {
                  orient: 'horizontal',
                  left: 'center',
                  min: Math.min(...averages),
                  max: Math.max(...averages),
                  text: ['High Average', 'Low Average'],
                  dimension: 0,
                  inRange: {
                      color: ['#65B581', '#FFCE34', '#FD665F']
                  }
              },
              series: [
                  {
                      name: 'Average Count',
                      type: 'bar',
                      data: averages
                  }
              ]
          };
        // Process data to get counts for each theme
        var themeCounts = {};
        landmarkData.forEach(function(landmark) {
            if (!themeCounts[landmark.theme]) {
                themeCounts[landmark.theme] = 0;
            }
            themeCounts[landmark.theme]++;
        });

        // Convert processed data to format required for pie chart
        var pieChartData = [];
        for (var theme in themeCounts) {
            pieChartData.push({
                value: themeCounts[theme],
                name: theme
            });
        }

        // Sort data in descending order for the bar chart
        pieChartData.sort((a, b) => b.value - a.value);

        // Pie chart options
        var pieChartOptions = {
            title: {
                text: 'Distribution of Landmark Types in Melbourne',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    return '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + params.color + '"></span>' + 
                           params.name + ': ' + params.value + ' (' + params.percent.toFixed(2) + '%)'; 
                }
            },
            
            legend: {
                top: '10%',
                left: 'center',
                data: pieChartData.map(item => item.name)
            },
            series: [
                {
                    name: 'Landmark Types in Melbourne',
                    type: 'pie',
                    radius: ['30%', '60%'],
                    center: ['50%', '60%'], 
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 20,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 20,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: pieChartData
                }
            ]
        };

        // Bar chart options
        var barChartOptions = {
            title: {
                text: 'Distribution of Landmark Types in Melbourne',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    return '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + params[0].color + '"></span>' + 
                           params[0].name + ': ' + params[0].value;
                }
            },
            xAxis: {
                type: 'category',
                data: pieChartData.map(item => item.name)
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    type: 'bar',
                    data: pieChartData.map(item => item.value),
                    itemStyle: {
                        color: function(params) {
                            const color = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC', '#D37295', '#FABFD2', '#67D5B5', '#E8A87C', '#C38D9E', '#41A7B7']; 
                            return color[params.value[0] % color.length];  // Fetching color from colors array
                        },
                        borderRadius: [10, 10, 0, 0]  // Rounded top corners for the bars
                    }
                }
            ]
        };


        // Initialize the pie chart
        var landmarkChartElement = document.getElementById('secondChart');
        var chartInstance = echarts.init(landmarkChartElement);
        chartInstance.setOption(pieChartOptions);  

        // Switch between chart types
        var currentOption = pieChartOptions;
        setInterval(function () {
            if (currentOption === pieChartOptions) {
                currentOption = barChartOptions;
            } else {
                currentOption = pieChartOptions;
            }
            chartInstance.setOption(currentOption, true);
        }, 10000);  // Switches every 2 seconds


      
        // Initialize the chart
        var mainElement = document.getElementById('mainChart');
        var myChart = echarts.init(mainElement);
        myChart.setOption(option);
    
        // Add event listener to chart bars
        myChart.on('click', function(params) {
            var clickedLandmarkName = params.name;  // Name of the clicked landmark
            var landmark = landmarkData.find(l => l.feature_name === clickedLandmarkName);  // Find the landmark in the dataset
            if (landmark) {
                var coordinates = [landmark.co_ordinates.lon, landmark.co_ordinates.lat];
                tramMap.flyTo({
                    center: coordinates,
                    zoom: 16
                });
                // Show the popup for the clicked landmark
                showPopupForLandmark(landmark, tramMap);
            }
        });
        // Extract distances to the closest stops
        var distances = landmarkData.map(landmark => Math.round(landmark.distance_to_closest_stop_meters));

        /// Function to bin the data
        function createBins(data, binSize) {
            let min = Math.min(...data);
            let max = Math.max(...data);
            let bins = [];
            for (let i = min; i <= max; i += binSize) {
                bins.push({
                    range: [i, i + binSize],
                    count: data.filter(value => value >= i && value < i + binSize).length
                });
            }
            return bins;
        }

        // Create bins with a desired bin size (e.g., 50 meters)
        var binSize = 50;
        var binnedData = createBins(distances, binSize);

        var dataAxis = binnedData.map(bin => `${bin.range[0]}-${bin.range[1]}`);
        var data = binnedData.map(bin => bin.count);
                // Histogram chart options
                var histogramChartOptions = {
                    title: {
                        text: 'Distribution of Distances to Closest Stop',
                        subtext: 'Accessibility of Landmarks'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: function(params) {
                            return `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color}"></span>Distance Range: ${params.name} meters<br>Count: ${params.value}`;
                        }
                    },
                    xAxis: {
                        data: dataAxis,
                        axisLabel: {
                            inside: true,
                            color: '#fff'
                        },
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            show: false
                        },
                        z: 10
                    },
                    yAxis: {
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            color: '#999'
                        }
                    },
                    dataZoom: [
                        {
                            type: 'inside'
                        }
                    ],
                    visualMap: {
                        type: 'continuous',
                        orient: 'vertical',
                        min: Math.min(...data),
                        max: Math.max(...data),
                        inRange: {
                            color: ['#83bff6', '#188df0']
                        },
                        calculable: true,
                        show: true
                    },
                    series: [
                        {
                            type: 'bar',
                            data: data
                        }
                    ]
                };
                

        // Enable data zoom when user clicks bar.
        const zoomSize = 6;

        // Initialize the histogram
        var accessibilityChartElement = document.getElementById('accessibilityChart');
        var accessibilityHistogram = echarts.init(accessibilityChartElement);
        accessibilityHistogram.setOption(histogramChartOptions);

        accessibilityHistogram.on('click', function (params) {
            accessibilityHistogram.dispatchAction({
                type: 'dataZoom',
                startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
                endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
            });
        });

        // Prepare data for the scatter plot
        var full_names = landmarkData.map(landmark => landmark.feature_name);
        var full_averages = landmarkData.map(landmark => landmark.pedestrian_counts.average);
        var scatterData = full_names.map((name, index) => {
            return {
                name: name,
                value: [distances[index], full_averages[index]]
            };
        });


        // Scatter plot options
        var scatterPlotOption2 = {
            title: {
                text: 'Average Pedestrian Count vs. Distance to Closest Stop',
                subtext: 'Landmarks Analysis',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    var landmarkName = full_names[params.dataIndex];
                    return `<strong>${landmarkName}</strong><br>Distance: ${params.value[0]} meters<br>Average Pedestrian Count: ${params.value[1]}`;
                }
            },
            xAxis: {
                name: 'Distance to Closest Stop (meters)',
                type: 'value',
                scale: true
            },
            yAxis: {
                name: 'Average Pedestrian Count',
                type: 'value',
                scale: true
            },
            visualMap: {
                type: 'continuous',
                dimension: 1,
                min: Math.min(...full_averages),
                max: Math.max(...full_averages),
                text: ['High', 'Low'],
                calculable: true,
                inRange: {
                    color: ['#50a3ba', '#eac736', '#d94e5d']
                }
            },
            series: [
                {
                    type: 'effectScatter',
                    symbolSize: 20,
                    data: [scatterData[0], scatterData[scatterData.length - 1]]
                },
                {
                    type: 'scatter',
                    data: scatterData
                }
            ]
        };

        // Initialize the scatter plot
        var scatterChartElement2 = document.getElementById('scatterChart');
        var scatterPlotInstance2 = echarts.init(scatterChartElement2);
        scatterPlotInstance2.setOption(scatterPlotOption2);
        // Add event listener to chart bars
        scatterPlotInstance2.on('click', function(params) {
            var clickedLandmarkName = params.name;  // Name of the clicked landmark
            console.log(clickedLandmarkName)
            var landmark = landmarkData.find(l => l.feature_name === clickedLandmarkName);  // Find the landmark in the dataset
            if (landmark) {
                var coordinates = [landmark.co_ordinates.lon, landmark.co_ordinates.lat];
                tramMap.flyTo({
                    center: coordinates,
                    zoom: 16
                });
                // Show the popup for the clicked landmark
                showPopupForLandmark(landmark, tramMap);
            }
        });

      });

      
        }
      });
      
      // Trigger the custom message handler to render the chart
      //Shiny.onInputChange("renderEChartTrigger", Math.random());
});

  
