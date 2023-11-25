# Integrated Urban Mobility in Melbourne: A Strategic Analysis

> **Note:** For the best experience and to utilize all features, we recommend opening the Shiny App directly in your default browser. For the txt format, please refer to the README.txt.

## How to Use the App:

1. Start the R project and click 'run app' in global.r.
2. Click the 'open in browser' if the app is not shown in the browser.
3. Select different themes to change the app's appearance.
4. Explore different modules to see different types of data visualizations and analyses.
5. Use interactive tooltips and sliders to view and filter data.

This is an interactive data visualization application built using Shiny and R.

## Overview Tab:

### Features:

- **Mapbox and JavaScript Integration:** The core visualization is provided by a Mapbox-integrated map with JavaScript-powered interactive components.
- **Custom Animations:** Depict routes for trams, trains, and buses in Melbourne.
- **Interactive Markers & Popups:** 
  - Click on markers representing entities like tram stops, public toilets, and landmarks to see detailed data.
  - Landmark popups display weekly average pedestrian counts and details about the nearest transportation stop, emphasizing its accessibility.
- **Dynamic Data Visualizations:** 
  - **Landmark Pedestrian Counts**: Bar chart of top and bottom 10 landmarks by pedestrian counts. Click to view the landmark on the map.
  - **Landmark Categories**: Dynamic chart alternating between pie and bar formats showing landmark categories.
  - **Proximity to Transportation**: Histogram showing landmarks' distances to the closest transportation stop.
  - **Pedestrian Count vs. Proximity**: Scatter plot of pedestrian count versus distance to the nearest transportation stop. Click to view the landmark on the map.

## Modules:

- **Custom Themes:** Toggle between "light" and "dark" themes.
- **Train Utilization:** Analyze train station utilization.
- **Bike Dock Map:** Visualize bike docking stations and their capacities.
- **Annual Bike Event Map:** View annual bike event distributions.
- **Combined Map:** Multiple data layers include bike and annual bike data.
- **Hourly Bike Counts:** See hourly counts for selected years.
- **Unsafe Category:** Understand unsafe biking locations.
- **Pedestrian Movement:** View pedestrian trajectories and car crash events.
- **Pedestrian-Related Car Crash in Speed Zones:** A chart showing the number of pedestrian-related car crashes of different severity levels within each speed zone.
- **Word Cloud of Pedestrian-Related Car Crashes:** A visual representation showcasing the most common categories or reasons for pedestrian-related car crashes.
- **Road Crash Map:** Explore road crash maps based on the selected year.
- **Pie Chart Analyses for Road Crashes:** View distributions of road types, accident types, and road geometry types involved in crashes.

## Data Analysis:

- **Data Filtering:** Dive deep into data for specific stations.
- **Weekend Train Utilization:** Analyze weekend train utilization.
- **Peak Hour Train Utilization:** Understand peak hour train station utilization.
- **Weekday Train Utilization:** Analyze train station utilization on weekdays.

