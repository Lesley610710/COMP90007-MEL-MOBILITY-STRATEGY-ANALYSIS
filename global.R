options(shiny.launch.browser = TRUE)
library(shiny)
library(bslib)
library(fontawesome)
library(shinyjs)
library(leaflet)
library(shinyWidgets)
library(ECharts2Shiny)
library(jsonlite)
library(sf)
library(dplyr)
library(leaflet.extras)
library(plotly)
library(RColorBrewer)
library(ggplot2)
library(ggiraph)
library(reshape2)
library(ggthemes)
library(grid)
library(tidyverse)
library(jsonlite)
library(shinycssloaders)
library(htmltools)
library(echarts4r)
library(DT)
library(wordcloud2)
library(wordcloud)
library(RColorBrewer)
source("tableau-in-shiny-v1.0.R")
#################
### BIKE DOCK ###
#################
bike_data <- read.csv("data/bike-share-dock-locations.csv")
bike_data$lat <- as.numeric(bike_data$lat)
bike_data$lon <- as.numeric(bike_data$lon)

annual_bike_data <- read.csv("data/annual-bike-counts-super-tuesday.csv")
annual_bike_data$lat <- as.numeric(annual_bike_data$lat)
annual_bike_data$lon <- as.numeric(annual_bike_data$lon)
annual_bike_data$year <- as.numeric(as.character(annual_bike_data$year))
annual_bike_filtered <- annual_bike_data %>%
  filter(year %in% c(2017, 2018, 2019))
time_columns <- c("X7.00.AM", "X7.15.AM", "X7.30.AM", "X7.45.AM", 
                  "X8.00.AM", "X8.15.AM", "X8.30.AM", "X8.45.AM")
bike_plan_data <- read.csv("data/bikespot2020_final_carto_1.csv")
bike_plan_data$lat <- as.numeric(bike_plan_data$latitude)
bike_plan_data$lon <- as.numeric(bike_plan_data$longitude)

unsafe_category_data <- data.frame(
  unsafe_category = c("Car dooring", "Cycle lane blocked", "Cycle lane ends", 
                      "Dangerous intersection", "Narrow", "No bicycle lanes", "Other",
                      "Poor driver behaviour", "Poor surface", "Too much vehicle traffic",
                      "Traffic speed", "Unsafe bicycle lanes"),
  n = c(29, 28, 93, 129, 79, 173, 74, 78, 86, 33, 18, 84)
)

unsafe_category_count <- tibble(
  unsafe_category = c("Car dooring", "Cycle lane blocked", "Cycle lane ends", 
                      "Dangerous intersection", "Narrow", "No bicycle lanes", "Other",
                      "Poor driver behaviour", "Poor surface", "Too much vehicle traffic",
                      "Traffic speed", "Unsafe bicycle lanes"),
  n = c(29, 28, 93, 129, 79, 173, 74, 78, 86, 33, 18, 84)
)
###########################
### PEDESTRIAN MOVEMENT ###
###########################
pedestrian_data <- read.csv("data/pedestrian-network.csv")
pedestrian_data$Latitude <- as.numeric(sapply(strsplit(as.character(pedestrian_data$GeoPoint), ","), "[", 1))
pedestrian_data$Longitude <- as.numeric(sapply(strsplit(as.character(pedestrian_data$GeoPoint), ","), "[", 2))
car_crash_data <- read.csv("data/Road_Crashes.csv")
car_crash_data$lat <- as.numeric(car_crash_data$LATITUDE)
car_crash_data$lon <- as.numeric(car_crash_data$LONGITUDE)
car_crash_data$PEDESTRIAN <- as.character(car_crash_data$PEDESTRIAN)

###
dat <- data.frame(c(1, 2, 3),
                  c(2, 4, 6))
names(dat) <- c("Type-A", "Type-B")
row.names(dat) <- c("Time-1", "Time-2", "Time-3")

#########################
### Train Utilization ###
#########################

mtsData <- data.frame()

mts_file_list <- c("data/Annual metropolitan train station entries 2018-19.csv",
                   "data/Annual metropolitan train station entries 2019-20.csv",
                   "data/Annual metropolitan train station entries 2020-21.csv",
                   "data/Annual metropolitan train station entries 2021-22.csv",
                   "data/Annual metropolitan train station entries 2022-23.csv")

for (file in mts_file_list) {
  current_data <- readr::read_csv(file)
  mtsData <- bind_rows(mtsData, current_data)
  
}

#################
### Road Crash ###
#################
road_crashes <- read.csv("data/Filtered_Road_Crashes_Melbourne.csv")
melbourne_road_crashes <- subset(road_crashes, LGA_NAME == "MELBOURNE")
melbourne_road_crashes$ACCIDENT_DATE <- as.Date(melbourne_road_crashes$ACCIDENT_DATE)
# Data preprocessing
melbourne_road_crashes_2015 <- subset(melbourne_road_crashes, format(ACCIDENT_DATE, "%Y") == "2015")
melbourne_road_crashes_2016 <- subset(melbourne_road_crashes, format(ACCIDENT_DATE, "%Y") == "2016")
melbourne_road_crashes_2017 <- subset(melbourne_road_crashes, format(ACCIDENT_DATE, "%Y") == "2017")
melbourne_road_crashes_2018 <- subset(melbourne_road_crashes, format(ACCIDENT_DATE, "%Y") == "2018")
melbourne_road_crashes_2019 <- subset(melbourne_road_crashes, format(ACCIDENT_DATE, "%Y") == "2019")

