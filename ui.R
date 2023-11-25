library(wordcloud)
library(wordcloud2)
# Themes for light and dark modes
light <- bs_theme(preset = "morph",PRIMARY = "#0675DD")
dark <- bs_theme(preset = "morph", bg = "#0b2545", fg = "#eef4ed", primary = "#e63946")


#########################
### SIDEBAR ACCORDION ###
#########################
# melbourne_accordion <- accordion(
#   id = "mainAccordion",
#   open = c(1,2,3,4),
#   accordion_panel(
#     "Overview",
#     id = "Overview",
#     icon = fontawesome::fa("eye"),
#   ),
#   accordion_panel(
#     "Train Transit Infrastructure & Utilization",
#     id = "TrainUtilization",
#     icon = fontawesome::fa("train"),
#   ),
#   accordion_panel(
#     "Bicycling Infrastructure & Potential Expansion",
#     id = "BikeExpansion",
#   ),
#   accordion_panel(
#     "Urban Development & Transit-Centric Planning",
#     id = "TransitPlanning",
#     icon = fontawesome::fa("magnifying-glass-chart"),
#   )
# )

ui <- page_navbar(
  loadEChartsLibrary(),
  id = "navbarID",
  useShinyjs(),
  nav_spacer(),
  theme = light,
  lang = "en",
  header=setUpTableauInShiny(),
  title = tags$span(
    tags$img(
      src = "logo.png",
      width = "46px",
      height = "auto",
      class = "me-3",
      alt = "Shiny hex logo"
    ),
    "Integrated Urban Mobility in Melbourne: A Strategic Analysis"
  ),
  tags$style(HTML("
    .modal-backdrop {
      opacity: 0.85 !important;
    }
    .modal-content {
      background-color: rgba(255, 255, 255, 0.95); 
    }
  ")),
  tags$head(
    tags$link(href = "https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css", rel = "stylesheet"),
    tags$script(src = "https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js"),
    tags$link(href = "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css", rel = "stylesheet"),
    tags$script(src = "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js"),
    tags$script(src = "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"),
    tags$script(src = "https://cdn.jsdelivr.net/npm/@turf/turf/turf.min.js"),
    tags$script(src = "https://cdn.jsdelivr.net/npm/chart.js"),
    tags$link(rel = "stylesheet", type = "text/css", href = "map_styles.css"),
    tags$link(rel = "stylesheet", type = "text/css", href = "mtsCss.css"),
    tags$script(src = "mapScript.js", type="module"),
    tags$script(src = "mtsScript.js"),
    tags$script(src = "mapFunctions.js", type="module"),
    
  ),
  # sidebar = sidebar(width = 275, melbourne_accordion),
  # infographic: https://codepen.io/Madbones3/pen/KKgvROX
  tags$style(HTML("
          #bike_dock_analysis {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 999; 
            padding: 8px 8px;
            font-size: 12px;
            background-color: #ffafcc;
            color: white;
          }
          #map_data .btn-group-vertical > .btn {
            padding: 8px 8px;
            font-size: 10px;
            border-radius: 1px;
            background-color: #cdb4db;
          }
          #map_data {
            position: absolute;
            top: 50px;
            right: 10px;
            z-index: 999; 
            background-color: #cdb4db;
            color: white;
            border-radius: 1px;
          }
          .btn {
            padding: 8px 8px;
            font-size: 12px;
            background-color: #cdb4db;
          }
        ")),
  nav_spacer(),
  nav_panel(
    "Overview",
    id = "OverviewTab",
    tags$head(tags$link(rel = "stylesheet", type = "text/css", href = "infographic.css")),
    HTML('
    <div class="graphic-container">
      
      <div class="center-circles-container">
        
    <!--  single    -->
        <div class="single">
          <div class="circle one">
            <div class="dot"></div>
            <div class="icon">
              <i class="far fa-building">1</i>
            </div>
            <div class="content-container">
              <div class="line"></div>
              <h2>1 City</h2>
              <div class="content">
                <h3>City of Melbourne</h3>
                <p>A bustling metropolis known for its culture, coffee, and commerce.</p>
              </div>
            </div>
          </div>
        </div>
    <!--   double   -->
        <div class="double">
          <div class="circle two">
            <div class="icon">
              <i class="fas fa-child">2</i>
            </div>
            <div class="content-container">
              <div class="line"></div>
              <h2>2 Population</h2>
              <div class="content">
                <h3>Resident Population</h3>
                <p>At 30 June 2022, an estimated <b>159,810</b> people were living in our city.</p>
              </div>
            </div>
            </div>
          <div class="circle three">
            <div class="icon">
              <i class="far fa-id-badge">3</i>
            </div>
            <div class="content-container">
              <div class="line"></div>
              <h2>3 Work</h2>
              <div class="content">
                <h3>Total Employment</h3>
                <p><b>90,345</b> people in the City of Melbourne were employed in 2021, with 59% working full-time and 34% part-time.</p>
              </div>
            </div>
            </div>
        </div>
    <!--   double   -->
        <div class="double">
          <div class="circle four">
            <div class="dot"></div>
            <div class="icon">
              <i class="fas fa-bus">4</i>
            </div>
            <div class="content-container">
              <div class="line"></div>
              <h2>4 Transport</h2>
              <div class="content">
                <h3>Preferred Mode of Travel</h3>
                <p><b>56%</b> of people choose public transport as their primary mode of travel in the City of Melbourne.</p>
              </div>
            </div>
            </div>
          <div class="circle five">
            <div class="icon">
              <i class="fas fa-walking">5</i>
            </div>
            <div class="content-container">
              <div class="line"></div>
              <h2>5 Walking</h2>
              <div class="content">
                <h3>Pedestrian Count</h3>
                <p><b>6%</b> of people prefer walking to their destinations in the City of Melbourne.</p>
              </div>
            </div>
            </div>
        </div>
    <!--  single    -->
        <div class="single">
          <div class="circle six">
            <div class="dot"></div>
            <div class="icon">
              <i class="fas fa-bicycle">6</i>
            </div>
            <div class="content-container">
              <div class="line"></div>
              <h2>6 Bicycle</h2>
              <div class="content">
                <h3>Cycling Trends</h3>
                <p><b>4%</b> of the population opts for bicycles for commuting within the City of Melbourne.</p>
              </div>
            </div>
            </div>
        </div>
        
      </div>
      
    </div>
  '),
    tags$p("The rapid urbanization and population growth of the City of Melbourne demands a holistic approach to transportation solutions. As a progressive city, Melbourne should aim not only for the functionality of its transportation systems but also for sustainability and inclusivity. "),
    tags$h2("Public Transport Overview"),
    # tags$p("Welcome to the City of Melbourne Dashboard! Here you'll get insights into various transportation modes in the city."),
    
    # Cards Row
    fluidRow(
      column(3, div(class="card mb-3", style="background-color:#91C8E4;border-radius: 10px;width:100%;", 
                    div(class="card-body",
                        shiny::icon("tram", lib = "font-awesome"),  # icon for tram stops
                        div(class="d-flex align-items-baseline", 
                            h3("297", class="card-title"),
                            p("Tram Stops", class="small-text mb-0")
                        ),
                        p("Various tram stops across the city.", class="card-text")
                    ))),
      
      column(3, div(class="card mb-3", style="background-color:#B0D9B1;border-radius: 10px;width:100%;", 
                    div(class="card-body",
                        shiny::icon("train", lib = "font-awesome"),  # icon for train stations
                        div(class="d-flex align-items-baseline", 
                            h3("12", class="card-title"),
                            p("Train Stations", class="small-text mb-0")
                        ),
                        p("Main train stations in Melbourne.", class="card-text")
                    ))),
      
      column(3, div(class="card mb-3", style="background-color:#FBA1B7;border-radius: 10px;width:100%;", 
                    div(class="card-body",
                        shiny::icon("bus", lib = "font-awesome"),  # icon for bus stations
                        div(class="d-flex align-items-baseline", 
                            h3("258", class="card-title"),
                            p("Bus Stations", class="small-text mb-0")
                        ),
                        p("Bus stations facilitating daily commutes.", class="card-text")
                    ))),
      
      column(3, div(class="card mb-3", style="background-color:#FFD9B7;border-radius: 10px;width:100%;", 
                    div(class="card-body",
                        shiny::icon("taxi", lib = "font-awesome"),  # icon for taxi ranks
                        div(class="d-flex align-items-baseline", 
                            h3("77", class="card-title"),
                            p("Taxi Ranks", class="small-text mb-0")
                        ),
                        p("Designated areas for taxi pick-ups.", class="card-text")
                    )))
    ), 
    tags$div(
      style = "display: flex; justify-content: space-between; align-items: center; padding: 10px 0;",
      
      # Adding a How to Use button
      actionButton("howToUseButton", "How to Use", style = "padding: 8px 18px; font-size: 16px; cursor: pointer;")
      
    ),
    tags$div(id="tramRouteMapDiv", style="width:100%;height:800px;"),
    tags$div(
      style = "display: flex; justify-content: space-between; align-items: center; padding: 10px 0;",
      
      # Adding a title
      tags$h3("Landmark Accessibility and Pedestrian Flow Analysis"),
      
      # Adding a How to Use button
      actionButton("howToUseButton2", "How to Use", style = "padding: 8px 18px; font-size: 16px; cursor: pointer;")
      
    ),
    tags$div(
      style = "display: flex; width: 100%; height: 600px;",  # Flex container
      
      tags$div(
        id = "mainChart",
        style = "width: 60%; height: 100%; visibility:visible;"  # Adjusted height to 100% of parent
      ),
      
      tags$div(
        id = "secondChart",  
        style = "width: 40%; height: 100%; visibility:visible;"  # Adjusted height to 100% of parent
      )
    ),
    tags$div(
      style = "display: flex; width: 100%; height: 600px;",  # Flex container
      
      tags$div(
        id = "scatterChart",
        style = "width: 60%; height: 100%; visibility:visible;"  # Adjusted height to 100% of parent
      ),
      
      tags$div(
        id = "accessibilityChart",  
        style = "width: 40%; height: 100%; visibility:visible;"  # Adjusted height to 100% of parent
      )
    ),
    
  ),
  nav_panel(
    "Train Utilization",
    id = "TrainUtilizationTab",
    icon = fontawesome::fa("train"),
    tags$h1("Train Transit Infrastructure & Utilization"),
    # three sub panels
    tabsetPanel(
      id = "mainTabs",
      tabPanel(
        id='mstDatatab',
        style = "margin-top: 30px;",
        title ="Data Display",
        h4('Numbers of Train station entries'),
        # selector area
        div(
          style = 'display: flex; align-items: center;',
          selectInput(
            inputId='timeFilter',
            label='Data Filter',
            choices=c('Annual'='Pax_annual', 'Weekday'='Pax_weekday',
                      'Normal Weekday'='Pax_norm_weekday', 
                      'School Holiday Weekday'='Pax_sch_hol_weekday',
                      'Saturday'='Pax_Saturday', 'Sunday'='Pax_Sunday',
                      'Before AM Peak'='Pax_pre_AM_peak', 'AM Peak'='Pax_AM_peak',
                      'Inter Peak'='Pax_interpeak', 'PM Peak'='Pax_PM_peak',
                      'After PM Peak'='Pax_PM_late'),
            selected='Pax_annual'
          ),
          selectInput(
            inputId='year',
            label='Year',
            choices=c('18-19'='FY18-19', '19-20'='FY19-20', '20-21'='FY20-21',
                     '21-22'='FY21-22', '22-23'='FY22-23'),
            selected='FY18-19'
          ),
        ),
        # plot area: including bar chart and a Tableau tree map
        div(
          style = 'display: flex; align-items: stretch; height: 600px; width: 100%',
          div(
            style = "width: 800px; display: flex; flex-direction: column; 
            justify-content: space-between; align-items: center;",
            girafeOutput('plot_overall_entries'),
            # button to switch to tab 2
            actionButton('go_top_map_btn', 'Find them in the Map'),
            div(
              style = "height: 0px; width: 600px"
            )
          ),
          div(
            style = "width: 800px;", 
            tableauPublicViz(
              id='tableauViz',
              url='https://public.tableau.com/views/Book1_16972778636090/Top10StationsTreeMap?:language=zh-CN&:display_count=n&:origin=viz_share_link'
            )
          )
          
        ),
      ),
      tabPanel(
        id='mstMapTab',
        style = "margin-top: 30px;",
        title="Map Distribution",
        h4('Metropolitan train stations distribution'),
        # selectors for multiple stations search
        div(
          style = 'display: flex; align-items: center;',
          selectInput(
            inputId='mapDataFilter',
            label='Data Filter',
            choices=c('Annual'='Pax_annual', 'Weekday'='Pax_weekday',
                      'Normal Weekday'='Pax_norm_weekday', 
                      'School Holiday Weekday'='Pax_sch_hol_weekday',
                      'Saturday'='Pax_Saturday', 'Sunday'='Pax_Sunday',
                      'Before AM Peak'='Pax_pre_AM_peak', 'AM Peak'='Pax_AM_peak',
                      'Inter Peak'='Pax_interpeak', 'PM Peak'='Pax_PM_peak',
                      'After PM Peak'='Pax_PM_late'),
            selected='Pax_annual'
          ),
          selectInput(
            inputId='mtsMapYear',
            label='Year',
            choices=c('18-19'='FY18-19', '19-20'='FY19-20', '20-21'='FY20-21',
                      '21-22'='FY21-22', '22-23'='FY22-23'),
            selected='FY18-19'
          ),
          sliderInput(
            "mtsCapacitySlider", 
            "Filter Stations Capacity:", 
            min(10), 
            max(222), 
            value=c(10), 
            step = 1
          )
        ),
        # selector for specific search
        div(
          selectInput(
            inputId='mtsStationName',
            label='Select Station Specific',
            choices=c('Multiple Stations', unique(mtsData$Stop_name)),
            selected='Multiple Stations'
          )
        ),
        div(
          shinycssloaders::withSpinner(leafletOutput('plot_mts_distribution', height="600px"))
        )
      ),
      tabPanel(
        id='mstAnalysisTab',style = "margin-top: 30px;",
        title="Individual Analysis",
        div(
          style = 'width: 400px; display: flex; align-items: center; justify-content: space-between;',
          selectInput(
            inputId='search_term',
            label='Select Station Specific',
            choices=c('Not Selected', unique(mtsData$Stop_name)),
            selected='Not Selected'
          ),
          # button for update page
          actionButton("analysis_selected_mts_data", "Analyse Data")
        ),
        h4('Data filtered'),
        tableOutput("selected_data_table"),
        # updated area: shows graphs or warnings according to stations selected
        div(
          id = "mts_analysis_block",
          # warnings
          div(
            id='mts_multi_stop_name_exist_warning',
            h3(
              'Please Find the exact Station Name in the Filter.'
            )
          ),
          # three graphs
          div(
            id='mts_graph_display_block',
            class='mts_hidden',
            uiOutput("mts_analysing_station_name"),
            div(
              style='display: flex; justify-content: space-between;',
              div(
                style='width: 30%; margin: 10px 15px;',
                p('Entries on weekend'),
                shinycssloaders::withSpinner(girafeOutput("plot_weekend_mts"))
              ),
              div(
                style='width: 30%; margin: 10px 15px;',
                p('Entries changes in one day'),
                shinycssloaders::withSpinner(girafeOutput("plot_peak_mts"))
              ),
              div(
                style='width: 30%; margin: 10px 15px;',
                p('Entries on weekdays'),
                shinycssloaders::withSpinner(girafeOutput("plot_weekdays_mts"))
              ),
            ),
            # button to switch to tab 2
            actionButton('show_in_the_map_btn', 'Find it in the Map'),
          )
        )
      )
    ),
  ),
  nav_panel(
    "Bike Expansion",
    id = "BikeExpansionTab",
    icon = fontawesome::fa("bicycle"),
    tags$h1("Bicycling Infrastructure & Potential Expansion"),
    tags$style(HTML("
    .btn-group .btn {
      background-color: lightblue !important;
    }
    .irs-bar {
      background-color: #f8ad9d !important;
    }
    .irs-line {
      background-color: #f8ad9d !important;
    }
    .irs-slider {
      background-color: #f8ad9d !important;
    ")),
    fluidRow(
      column(4,
             sliderInput("capacitySlider", 
                         "Filter Share Dock Capacity:", 
                         min(bike_data$capacity), 
                         max(bike_data$capacity), 
                         value=c(min(bike_data$capacity), max(bike_data$capacity)), 
                         step = 1),
      ),
      column(4,
             checkboxGroupButtons(
               inputId = "unsafe_category_filter",
               label = "Filter Unsafe Spot Category:",
               choices = c("Car dooring", "Cycle lane blocked", "Cycle lane ends", 
                           "Dangerous intersection", "Narrow", "No bicycle lanes", "Other", "Poor driver behaviour", 
                           "Poor surface", "Too much vehicle traffic", "Traffic speed",
                           "Unsafe bicycle lanes"),
               selected = c("Car dooring", "Cycle lane blocked", "Cycle lane ends", 
                            "Dangerous intersection", "Narrow", "No bicycle lanes", "Other", "Poor driver behaviour", 
                            "Poor surface", "Too much vehicle traffic", "Traffic speed",
                            "Unsafe bicycle lanes"),
               direction = "horizontal",
               status = "primary"
             ),
      )
    ),
    div(style = "position:relative;", 
        shinycssloaders::withSpinner(leafletOutput("combinedMap", height = "600px")),
        actionButton("bike_dock_analysis", "Shared Dock Analysis"),
        checkboxGroupButtons(
          inputId = "map_data",
          choices = c("Shared Dock Location" = "bike_data", 
                      "Bike Count" = "annual_bike_data", 
                      "Unsafe Bike Spot" = "bike_plan_data"),
          selected = c("bike_data", "annual_bike_data", "bike_plan_data"),
          direction = "vertical",
          status = "primary"),
    ),
    fluidRow(
      column(6,
             sliderInput("yearInput", "Select Year", 
                         min = 2017, max = 2019, value = 2017, ticks = TRUE, sep = ""),
             shinycssloaders::withSpinner(plotlyOutput("hourlyCountBike",  width = "100%"))
      ),
      column(6,
             shinycssloaders::withSpinner(plotOutput("unsafeCategory"))
      )
    ),
  ),
  nav_panel(
    "Pedestrian Movement",
    id = "TransitPlanningTab",
    icon = fontawesome::fa("person-walking"),
    tags$h1("Pedestrian Dynamics & Vehicular Incidents"),
    div(
      shinycssloaders::withSpinner(leafletOutput('pedestrian_movement', height="600px"))
    ),
    fluidRow(
      column(4,
             shinycssloaders::withSpinner(echarts4rOutput("radarChart", width = "100%", height = "400px"))
      ),
      column(4,
             shinycssloaders::withSpinner(plotOutput("wordcloud", width = "100%", height = "400px"))
      ),
      column(4,
             shinycssloaders::withSpinner(DTOutput("wordcount_table", width = "100%", height = "400px"))
      )
    ),
  ),
  #tab5 panel for Road Crash Analysis
  nav_panel(
    "Road Crash Analysis",
    id = "RoadCrashTab",
    icon = fontawesome::fa("car"),
    tabsetPanel(
      id = "RoadCrashAnalysisTabs",
      tabPanel("Location of accidents", 
               h4("Location of crashes in Melbourne"),
               # select input for identify specific year
               selectInput("selected_year", "Select the year:",
                           choices = c(
                             "2015" = "2015",
                             "2016" = "2016",
                             "2017" = "2017",
                             "2018" = "2018",
                             "2019" = "2019"
                           ),
                           selected = "2019"
               ),
               #output the map
               shinycssloaders::withSpinner(leafletOutput("OutPutCrashMap"))
      ),
      #pie chart analysis
       tabPanel("Different Road Type Accident",
                #classifier choosen
                radioButtons("road_type", "Please select the classification: ", 
                             choices = c("Road type",
                                         "Accident type",
                                         "Road geometry")),
                #output the pir chart
                shinycssloaders::withSpinner(plotlyOutput("plotRoadType",height = "600px")),
               )
      )
),
  # Dark and light mode
  nav_menu(
    "Mode",
    nav_item(
      tags$a(
        fontawesome::fa("sun"),
        "Light",
        onclick = "Shiny.setInputValue('mode', 'light'); return false;",
        target = "_blank"
      )
    ),
    nav_item(
      tags$a(
        fontawesome::fa("moon"),
        "Dark",
        onclick = "Shiny.setInputValue('mode', 'dark'); return false;",
        target = "_blank"
      )
    )
  )
)
