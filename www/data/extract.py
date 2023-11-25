# This is used to filter the geojson file

import json

# Load the original GeoJSON file
with open('lga_boundary.geojson', 'r') as file:
    data = json.load(file)

# Filter out the MELBOURNE_CITY data
melbourne_city_data = {
    "type": "FeatureCollection",
    "features": [feature for feature in data['features'] if feature['properties']['vic_lga__3'] == 'MELBOURNE']
}

# Save the filtered data to a new GeoJSON file
with open('melbourne_city_data.geojson', 'w') as file:
    json.dump(melbourne_city_data, file, indent=4)

########################################################

# This is used to calculate the pedestrian count

import json
from collections import defaultdict

# Load pedestrian count data with location
with open('total_counts_with_location.json', 'r') as file:
    pedestrian_data = json.load(file)

# Load landmarks data
with open('landmarks-and-places-of-interest-including-schools-theatres-health-services-spor.json', 'r') as file:
    landmarks_data = json.load(file)

# Function for computing the Inverse Distance Weighted (IDW) average
def idw_average(target, sources, attribute):
    numerator = 0
    denominator = 0

    for source in sources:
        if attribute not in source:  # Check if the day exists in the source data
            continue

        lat = source["latitude"]
        lon = source["longitude"]
        value = source[attribute]

        distance = ((target["lat"] - lat) ** 2 + (target["lon"] - lon) ** 2) ** 0.5
        
        # Assuming a power of 2 for the IDW
        weight = 1 / (distance ** 2)

        numerator += weight * value
        denominator += weight

    return numerator / denominator if denominator != 0 else 0

# Compute pedestrian count for each landmark
for landmark in landmarks_data:
    landmark["pedestrian_counts"] = {}
    total = 0
    for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:  
        count = idw_average(landmark["co_ordinates"], list(pedestrian_data.values()), day)
        landmark["pedestrian_counts"][day] = round(count)
        total += count

    # Compute average
    landmark["pedestrian_counts"]["average"] = round(total / 7)  # Divide by 7 to get the average for all days

# Save the updated landmarks data with pedestrian counts to a new JSON file
with open('landmarks_with_pedestrian_counts.json', 'w') as outfile:
    json.dump(landmarks_data, outfile, indent=4)

print("Pedestrian counts saved to 'landmarks_with_pedestrian_counts.json'")


########################################################

# This is used to calculate the closest stop
import json

# Function to extract data from Tram Stops
def extract_tram_data(data):
    tram_stops = []
    for feature in data["features"]:
        tram_stop = {
            "type": "tram stop",
            "STOP_NAME": feature["properties"]["STOP_NAME"],
            "LATITUDE": feature["properties"]["LATITUDE"],
            "LONGITUDE": feature["properties"]["LONGITUDE"]
        }
        tram_stops.append(tram_stop)
    return tram_stops

# Function to extract data from Bus or Train Stops
def extract_bus_train_data(data, stop_type):
    stops = []
    for item in data:
        stop = {
            "type": stop_type,
            "STOP_NAME": item["STOP_NAME"],
            "LATITUDE": item["LATITUDE"],
            "LONGITUDE": item["LONGITUDE"]
        }
        stops.append(stop)
    return stops

# Load Tram Stop Data
with open("PTV_METRO_TRAM_STOP.geojson", "r") as file:
    tram_data = json.load(file)
tram_stops = extract_tram_data(tram_data)

# Load Bus Stop Data
with open("PTV_METRO_BUS_STOP.json", "r") as file:
    bus_data = json.load(file)
bus_stops = extract_bus_train_data(bus_data, "bus stop")

# Load Train Stop Data
with open("PTV_METRO_TRAIN_STATION.json", "r") as file:
    train_data = json.load(file)
train_stops = extract_bus_train_data(train_data, "train stop")

# Combine data
all_stops = tram_stops + bus_stops + train_stops

# Save data to a new JSON file
with open("extracted_stops.json", "w") as file:
    json.dump(all_stops, file, indent=4)

print("Data extraction complete. Saved to 'extracted_stops.json'")

import json
import math

def calculate_distance(lat1, lon1, lat2, lon2):
    # Haversine formula to calculate the distance between two lat-lon points
    R = 6371000  # Earth radius in meters
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat/2) * math.sin(dLat/2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon/2) * math.sin(dLon/2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    return distance

def find_closest_stop(landmark, all_stops):
    min_distance = float('inf')
    closest_stop = None
    for stop in all_stops:
        distance = calculate_distance(landmark["co_ordinates"]["lat"],
                                      landmark["co_ordinates"]["lon"],
                                      stop["LATITUDE"],
                                      stop["LONGITUDE"])
        if distance < min_distance:
            min_distance = distance
            closest_stop = stop
    return closest_stop, min_distance

# Load landmarks data
with open("landmarks_with_pedestrian_counts.json", "r") as file:
    landmarks = json.load(file)

# Load stops data (assuming you've already extracted them to 'extracted_stops.json')
with open("extracted_stops.json", "r") as file:
    all_stops = json.load(file)

# Append closest stop data and distance to each landmark
for landmark in landmarks:
    closest_stop, distance = find_closest_stop(landmark, all_stops)
    landmark["closest_stop"] = closest_stop
    landmark["distance_to_closest_stop_meters"] = distance

# Save the updated landmarks data
with open("landmarks_with_pedestrian_counts_and_stops_and_distance.json", "w") as file:
    json.dump(landmarks, file, indent=4)

print("Updated landmarks data saved to 'landmarks_with_pedestrian_counts_and_stops_and_distance.json'")
