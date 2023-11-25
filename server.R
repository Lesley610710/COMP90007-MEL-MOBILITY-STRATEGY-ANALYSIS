library(wordcloud)
library(wordcloud2)
server <- function(input, output, session) {
  light <- bs_theme(preset = "morph", PRIMARY = "#0675DD")
  dark <- bs_theme(preset = "morph", bg = "#0b2545", fg = "#eef4ed", primary = "#e63946")
  
  renderBarChart(div_id = "test", grid_left = '1%', direction = "vertical",
                 data = dat)

  observe({
    if (!is.null(input$mode)) {
      mode <- input$mode
      if (mode == "light") {
        session$setCurrentTheme(light)
      } else if (mode == "dark") {
        session$setCurrentTheme(dark)
      }
    }
  })
  
  
  # Echart, could remove afterwards
  observe({
    session$sendCustomMessage(type = 'renderEChart', message = TRUE)
  })
  
  #################
  ### BIKE DOCK ###
  #################
  output$bikeMap <- renderLeaflet({
    # Filter bike data based on the selected capacity range from the slider
    filtered_data <- bike_data[bike_data$capacity >= input$capacitySlider[1] & bike_data$capacity <= input$capacitySlider[2], ]
    # Create a leaflet map with the filtered data and add circle markers for each data point
    m <- leaflet(filtered_data) %>%
      addTiles() %>%
      addCircleMarkers(~lon, ~lat, popup = ~name, radius=3)
    m
  })
  observeEvent(input$bike_dock_analysis, {
    # Display a modal dialog with analysis and strategic suggestions
    showModal(modalDialog(
      title = "Dock Station Strategic Placement: Analysis of Bike Share Dock Locations for optimal accessibility",
      tags$b("Current Observations:"),  
      tags$ul(
        tags$li("Centralized Distribution:", "Docks concentrated around central Melbourne, especially Docklands, Southbank, and CBD, cater to high foot traffic."),
        tags$li("Tourist & Park Proximity:", "Docks strategically placed near tourist spots like Albert Park encourage recreational biking."),
        tags$li("Transit Hub Accessibility:", "Docks near major transit hubs ensure smooth transitions for commuters.")
      ),
      tags$b("Opportunities for Improvement:"),  
      tags$ul(
        tags$li("Residential Coverage:", "Expand docks in suburbs like Prahran, Richmond, and Hawthorn to boost daily commuter usage."),
        tags$li("University Campuses:", "More docks near universities, like the University of Melbourne, can serve the student population."),
        tags$li("River Enhancements:", "Improve the Yarra River bike path and add docks along the scenic route to attract users."),
        tags$li("Eastern Expansion:", "Introduce docks in suburbs like Balwyn and Deepdene to accommodate potential commuter traffic.")
      ),
      tags$b("Strategic Placement Suggestions:"),  
      tags$ul(
        tags$li("Enhance High-Demand Zones:", "Increase bikes or docks in CBD and other high-demand areas."),
        tags$li("Yarra River Path:", "Consider adding docks along the scenic river route, particularly near bridges."),
        tags$li("Shopping Center Accessibility:", "Place docks near shopping centers like South Melbourne Market for weekend users."),
        tags$li("Residential Expansion:", "Extend docks to densely populated suburbs lacking access, ensuring broader accessibility.")
      ),
      easyClose = TRUE, # Allow users to easily close the modal
      footer = tagList(
        modalButton("Close")
      )
    ))
  })
  output$annualBikeMap <- renderLeaflet({
    # Create a leaflet map and add clustered circle markers for each annual bike data point
    m <- leaflet() %>%
      addTiles() %>%
      addCircleMarkers(
        data = annual_bike_data,
        lng = ~longitude, 
        lat = ~latitude,
        popup = ~description, 
        clusterOptions = markerClusterOptions() # Use clustering for markers
      )
    m 
  })
  output$combinedMap <- renderLeaflet({
    # Create a basic leaflet map centered on the given latitude and longitude
    m <- leaflet() %>%
      addTiles() %>%
      setView(lng = 144.9631, lat = -37.8136, zoom = 13)
    # Check if user wants to see "bike_data" on the map
    if("bike_data" %in% input$map_data) { # Note: It should be input$map_data not input$mapData
      # Filter bike data based on the capacity slider's values
      filtered_bike_data <- bike_data[bike_data$capacity >= input$capacitySlider[1] & bike_data$capacity <= input$capacitySlider[2], ]
      # Add bike data as markers on the map
      m <- m %>%
        addMarkers(data = filtered_bike_data, ~lon, ~lat, popup = ~name, icon = bike_dock_icon)
    }
    # Check if user wants to see "annual_bike_data" on the map
    if("annual_bike_data" %in% input$map_data) {
      # Add annual bike data as circle markers on the map with clustering
      m <- m %>%
        addCircleMarkers(data = annual_bike_data, lng = ~longitude, lat = ~latitude, popup = ~description, clusterOptions = markerClusterOptions())
    }
    # Check if user wants to see "bike_plan_data" on the map
    if("bike_plan_data" %in% input$map_data) {
      # Filter bike plan data based on specific conditions and selected unsafe categories
      filtered_bike_plan_data <- dplyr::filter(
        bike_plan_data, 
        `spot_type` == "Unsafe Spot" & 
          `user_perspective` == "cycling" & 
          as.Date(date_created_aest) > as.Date("2020-01-01") & 
          as.Date(date_created_aest) < as.Date("2023-12-31") &
          `unsafe_category` %in% input$unsafe_category_filter
      )
      # Add filtered bike plan data as circle markers on the map with a specific color
      m <- m %>%
        addCircleMarkers(
          data = filtered_bike_plan_data, 
          lng = ~longitude, 
          lat = ~latitude, 
          popup = ~paste("<strong>Spot Name: </strong>", spot_name, "<br><strong>Description: </strong>", description), 
          color = "#c1121f"
        )
    }
    return(m)
  })
  # Define an icon for bike docks to be used on the map
  bike_dock_icon <- makeIcon(
    iconUrl = "www/bike_dock_location.png",
    iconWidth = 20, iconHeight = 20,
    iconAnchorX = 15, iconAnchorY = 15
  )
  ## 2nd graph
  # Calculate yearly average for specified time columns
  avg_data <- annual_bike_data %>%
    group_by(year) %>%
    summarise(across(all_of(time_columns), mean, .groups = 'drop'))
  renderBikeGraph <- function(selected_year) {
    # Filter data for the specified year
    filtered_data <- avg_data %>%
      filter(year == selected_year)
    # Convert data from wide to long format for plotting
    long_data <- tidyr::pivot_longer(filtered_data, -year, names_to = "Time", values_to = "Average")
    # Clean the 'Time' column by removing 'X' prefix
    long_data$Time <- stringr::str_remove(long_data$Time, "^X")
    # Generate and return the plotly bar graph
    plot_ly(long_data, x = ~Time, y = ~Average, type = "bar",
            name = as.character(selected_year), color = ~Time, 
            colors = RColorBrewer::brewer.pal(length(time_columns), "Dark2")) %>%
      layout(title = paste("Average Number of People for Year:", selected_year),
             xaxis = list(title = "Time"), yaxis = list(title = "Average Number of People"),
             barmode = 'group', showlegend = FALSE)
  }
  output$hourlyCountBike <- renderPlotly({ renderBikeGraph(input$yearInput) })
  ## 3rd graph
  # Function to render a polar (radial) bar graph for unsafe categories
  renderUnsafeGraph <- function() {
    # Data pre-processing for plotting (adding empty bars if needed)
    to_add <- matrix(NA, 0, ncol(unsafe_category_data))
    colnames(to_add) <- colnames(unsafe_category_data)
    unsafe_category_data <- rbind(unsafe_category_data, to_add)
    # Assign unique IDs for each row/category
    unsafe_category_data$id <- seq(1, nrow(unsafe_category_data))
    # Logic to adjust label positioning and angle for polar graph
    label_data <- unsafe_category_data
    number_of_bar <- nrow(label_data)
    angle <- 90 - 360 * (label_data$id - 0.5) / number_of_bar
    label_data$hjust <- ifelse(angle < -90, 1, 0)
    label_data$angle <- ifelse(angle < -90, angle + 180, angle)
    # Generate and return the ggplot polar bar graph
    p <- ggplot(unsafe_category_data, aes(x = as.factor(id), y = n, fill = unsafe_category)) +
      geom_bar(stat = "identity") + 
      ylim(-100, 200) +
      theme_minimal() +
      theme(
        axis.text = element_blank(),
        axis.title = element_blank(),
        panel.grid = element_blank(),
        plot.margin = margin(t = 30, r = 10, b = 10, l = 10, unit = "pt")
      ) +
      coord_polar(start = 0) +
      geom_text(data = label_data, aes(x = id, y = n + 10, label = unsafe_category, hjust = hjust),
                color = "black", fontface = "bold", alpha = 0.6, size = 2.5, 
                angle = label_data$angle, inherit.aes = FALSE) +
      geom_text(aes(x = id, y = n/2, label = ifelse(!is.na(n), as.character(n), '')), 
                color = "black", fontface = "italic", size = 2.5) + # This line adds the count numbers
      labs(title = "Number of Unsafe Category")
    return(p)
  }
  # Render the polar bar graph using renderUnsafeGraph function with specified dimensions
  output$unsafeCategory <- renderPlot({ renderUnsafeGraph() }, height = 500, width = 700)

  ###########################
  ### PEDESTRAIN MOVEMENT ###
  ###########################
  # Rendering a Leaflet map for pedestrian data
  output$pedestrian_movement <- renderLeaflet({ 
    # Create an icon for car crashes
    pedestrian_fall_icon <- makeIcon(
      iconUrl = "www/car-crash.png",
      iconWidth = 40, iconHeight = 40,
      iconAnchorX = 15, iconAnchorY = 15
    )
    # Configure and return the Leaflet map
    m <- leaflet(pedestrian_data) %>%
      addTiles() %>% 
      setView(lng = mean(pedestrian_data$Longitude), lat = mean(pedestrian_data$Latitude), zoom = 15.5) %>% 
      addHeatmap(lng = ~Longitude, lat = ~Latitude, intensity = ~1, radius = 4, blur = 4, max = 1, gradient = c("blue", "yellow", "red")) %>%
      addMarkers(data = car_crash_data, lng = ~LONGITUDE, lat = ~LATITUDE, popup = ~paste("<strong>Pedestrian Number: </strong>", PEDESTRIAN, "<br><strong>Speed Zone: </strong>", SPEED_ZONE), icon = pedestrian_fall_icon)
    return(m)
  })
  # Rendering a radar chart using echarts4r for crash data
  output$radarChart <- renderEcharts4r({
    df <- data.frame(
      category = c("30km/h", "40km/h", "50km/h", "60km/h", "70km/h", "80km/h"),
      Number_of_crashes = c(8, 227, 67, 128, 1, 1),
      Fatal = c(0, 2, 2, 2, 0, 1),
      Other = c(3, 135, 35, 60, 0, 0),
      Serious = c(5, 90, 30, 66, 1, 0)
    )
    df %>%
      e_chart(category) %>%
      e_radar(Number_of_crashes, max = 250) %>%
      e_radar(Fatal, max = 5) %>%
      e_radar(Other, max = 140) %>%
      e_radar(Serious, max = 95) %>%
      e_tooltip(trigger = 'item', formatter = "{b} : {c}") %>%
      e_legend(orient = "horizontal", bottom = 0) %>%
      e_title("Crashes in each speed zone")
  })
  # Rendering a word cloud for car crash data
  output$wordcloud <- renderPlot({
    words_data <- car_crash_data %>% 
      select(DAY_OF_WEEK, SEVERITY, SPEED_ZONE, NODE_TYPE, ALCOHOL_RELATED) %>% 
      gather(key = "column", value = "word") %>% 
      count(word, sort = TRUE)
    pal <- brewer.pal(8, "Dark2")
    # Generate and display the word cloud
    wordcloud(words = words_data$word, freq = words_data$n, 
              min.freq = 1, scale=c(3,1),
              max.words = 50, random.order = FALSE, 
              rot.per = 0.25, colors = pal,
              family="Arial Bold")
    title(main = "Wordclouds of Car Crash", cex.main = 2)
  })
  # Rendering a DataTable of word counts from car crash data
  output$wordcount_table <- renderDT({
    words_data <- car_crash_data %>%
      select(DAY_OF_WEEK, SEVERITY, SPEED_ZONE, NODE_TYPE, ALCOHOL_RELATED) %>%
      gather(key = "column", value = "word") %>%
      count(word, sort = TRUE)
    datatable(words_data, options = list(pageLength = 5, autoWidth = TRUE))
  })
  
  
  #########################
  ### Train Utilization ###
  #########################  
  
  # data display - filter data
  filtered_mts_data <- reactive({
    mts_data <- mtsData %>% filter(input$year == Fin_year)
    if (input$timeFilter == "Pax_annual") {
      f_data <- mts_data[order(mts_data$Pax_annual, decreasing = TRUE), ]
      y_label <- "Pax_annual"
    } else if (input$timeFilter == "Pax_weekday") {
      f_data <- mts_data[order(mts_data$Pax_weekday, decreasing = TRUE), ]
      y_label <- "Pax_weekday"
    } else if (input$timeFilter == "Pax_Saturday") {
      f_data <- mts_data[order(mts_data$Pax_Saturday, decreasing = TRUE), ]
      y_label <- "Pax_Saturday"
    } else if (input$timeFilter == "Pax_Sunday") {
      f_data <- mts_data[order(mts_data$Pax_Sunday, decreasing = TRUE), ]
      y_label <- "Pax_Sunday"
    } else if (input$timeFilter == "Pax_norm_weekday") {
      f_data <- mts_data[order(mts_data$Pax_norm_weekday, decreasing = TRUE), ]
      y_label <- "Pax_norm_weekday"
    } else if (input$timeFilter == "Pax_sch_hol_weekday") {
      f_data <- mts_data[order(mts_data$Pax_sch_hol_weekday, decreasing = TRUE), ]
      y_label <- "Pax_sch_hol_weekday"
    } else if (input$timeFilter == "Pax_pre_AM_peak") {
      f_data <- mts_data[order(mts_data$Pax_pre_AM_peak, decreasing = TRUE), ]
      y_label <- "Pax_pre_AM_peak"
    } else if (input$timeFilter == "Pax_AM_peak") {
      f_data <- mts_data[order(mts_data$Pax_AM_peak, decreasing = TRUE), ]
      y_label <- "Pax_AM_peak"
    } else if (input$timeFilter == "Pax_interpeak") {
      f_data <- mts_data[order(mts_data$Pax_interpeak, decreasing = TRUE), ]
      y_label <- "Pax_interpeak"
    } else if (input$timeFilter == "Pax_PM_peak") {
      f_data <- mts_data[order(mts_data$Pax_PM_peak, decreasing = TRUE), ]
      y_label <- "Pax_PM_peak"
    } else if (input$timeFilter == "Pax_PM_late") {
      f_data <- mts_data[order(mts_data$Pax_PM_late, decreasing = TRUE), ]
      y_label <- "Pax_PM_late"
    } 
    f_data <- f_data[1:10, ]
    return(list(data = f_data, y_label = y_label)) 
  })
  
  # data display - plot data
  output$plot_overall_entries <- renderGirafe({
    data <- filtered_mts_data()
    p <- ggplot(data$data) +
      aes(x=Stop_name, y=!!rlang::sym(data$y_label), tooltip=Stop_name, data_id=Stop_name)+
      geom_bar(stat = "identity") +
      scale_x_discrete(labels = function(x) stringr::str_wrap(x, width = 10)) +
      labs(x = data$Stop_name, y = sub("^Pax_", "", data$y_label), title = "Bar chart") +
      geom_bar_interactive(stat = 'identity', width = 0.8, fill = '#8f00b6') +
      theme(panel.background=element_blank(),
            panel.grid.major.y=element_line(color='#e2e2e2'),
            axis.ticks=element_blank()) +
      ggtitle("top 10 train station entries")
    girafe(ggobj = p, height_svg = 6, width_svg = 8)
    
  })
  
  # map distribution - filter data
  filtered_mts_map_data <- reactive({
    mts_data <- mtsData %>% filter(input$mtsMapYear == Fin_year)
    
    if (input$mtsStationName != "Multiple Stations") {
      f_data <- mts_data[mts_data$Stop_name == input$mtsStationName, ]
      y_label <- input$mapDataFilter
    } else{
      if (input$mapDataFilter == "Pax_annual") {
        f_data <- mts_data[order(mts_data$Pax_annual, decreasing = TRUE), ]
        y_label <- "Pax_annual"
      } else if (input$mapDataFilter == "Pax_weekday") {
        f_data <- mts_data[order(mts_data$Pax_weekday, decreasing = TRUE), ]
        y_label <- "Pax_weekday"
      } else if (input$mapDataFilter == "Pax_Saturday") {
        f_data <- mts_data[order(mts_data$Pax_Saturday, decreasing = TRUE), ]
        y_label <- "Pax_Saturday"
      } else if (input$mapDataFilter == "Pax_Sunday") {
        f_data <- mts_data[order(mts_data$Pax_Sunday, decreasing = TRUE), ]
        y_label <- "Pax_Sunday"
      } else if (input$mapDataFilter == "Pax_norm_weekday") {
        f_data <- mts_data[order(mts_data$Pax_norm_weekday, decreasing = TRUE), ]
        y_label <- "Pax_norm_weekday"
      } else if (input$mapDataFilter == "Pax_sch_hol_weekday") {
        f_data <- mts_data[order(mts_data$Pax_sch_hol_weekday, decreasing = TRUE), ]
        y_label <- "Pax_sch_hol_weekday"
      } else if (input$mapDataFilter == "Pax_pre_AM_peak") {
        f_data <- mts_data[order(mts_data$Pax_pre_AM_peak, decreasing = TRUE), ]
        y_label <- "Pax_pre_AM_peak"
      } else if (input$mapDataFilter == "Pax_AM_peak") {
        f_data <- mts_data[order(mts_data$Pax_AM_peak, decreasing = TRUE), ]
        y_label <- "Pax_AM_peak"
      } else if (input$mapDataFilter == "Pax_interpeak") {
        f_data <- mts_data[order(mts_data$Pax_interpeak, decreasing = TRUE), ]
        y_label <- "Pax_interpeak"
      } else if (input$mapDataFilter == "Pax_PM_peak") {
        f_data <- mts_data[order(mts_data$Pax_PM_peak, decreasing = TRUE), ]
        y_label <- "Pax_PM_peak"
      } else if (input$mapDataFilter == "Pax_PM_late") {
        f_data <- mts_data[order(mts_data$Pax_PM_late, decreasing = TRUE), ]
        y_label <- "Pax_PM_late"
      } 
      f_data <- f_data[1:input$mtsCapacitySlider, ]
    }
    return(list(data = f_data, y_label = y_label)) 
  })
  
  # data display - plot map
  output$plot_mts_distribution <- renderLeaflet({
    data <- filtered_mts_map_data()
    label <- data$y_label
    f_data <- data$data
    
    min_value <- min(f_data[[label]])
    max_value <- max(f_data[[label]])

    n_colors <- 100  
    color_palette <- colorRampPalette(c("blue", "red"))(n_colors)
    
    color_pal <- colorNumeric(palette = color_palette, domain = c(min_value, max_value))
    
    
    m <- leaflet() %>%
      addTiles() %>%
      addCircleMarkers(data = f_data, lng = ~Stop_long, lat = ~Stop_lat, 
                       popup = ~paste0("Station Name: ", Stop_name, br(),
                                       "Record time: ", sub('^FY', '20', sub('-', '-20', Fin_year)), br(),
                                       sub('^Pax_', '', label)," count: ", get(label)),
                       radius=8, color = ~color_pal(f_data[[label]]))
    return(m)
  })
  
  # data display - control Tableau tree map by year filter
  observe({
    if(!is.null(input$year)){
      fin_year <- input$year
      runjs(sprintf('
      let viz = document.getElementById("tableauViz");
      let sheet = viz.workbook.activeSheet;
      sheet.applyFilterAsync("Fin_year", ["%s"], FilterUpdateType.Replace);', fin_year)
      )
    }
  })
  
  # data display - control Tableau tree map by data filter
  observe({
    if (!is.null(input$timeFilter)){
      dataType <- input$timeFilter
      session$sendCustomMessage(type='updateParam', message=dataType)
    }
  })
  
  # data display - page switching to map distribution
  observeEvent(input$go_top_map_btn, {
    updateSelectInput(session, "mtsMapYear", selected = input$year)
    updateSelectInput(session, "mapDataFilter", selected=input$timeFilter)
    updateNavbarPage(session, 'mainTabs', selected='Map Distribution')
  })
  
  # data display - page switching to individual analysis
  observeEvent(input$plot_overall_entries_selected, {
    updateTextInput(session, "search_term", value=input$plot_overall_entries_selected)
    session$sendCustomMessage(type='plot_overall_entries_set', message=character(0))
    updateNavbarPage(session, 'mainTabs', selected='Individual Analysis')
  })
  
  # individual analysis - filter data
  filtered_analysis_data <- reactive({
    keyword <- input$search_term
    data <- mtsData
    
    if (is.null(keyword) || keyword == "Not Selected") {
      data <- data[1:20, ]
    } else {
      data <- data[data$Stop_name==keyword, ]
    }
    
    data$Stop_ID <- NULL
    data$Stop_lat <- NULL
    data$Stop_long <- NULL
    
    return(data)
  })
  
  # individual analysis - plot data
  output$selected_data_table <- renderTable({
    limited_data <- head(filtered_analysis_data(), 20)
    return(limited_data)
  })
  
  # individual analysis - update page by click button
  observeEvent(input$analysis_selected_mts_data, {
    data <- head(filtered_analysis_data(), 20)
    unique_stop_names <- unique(data$Stop_name)
    num_unique_stop_names <- length(unique_stop_names)
    
    # hide warning if not select single stop
    if (num_unique_stop_names == 1){
      output$mts_analysing_station_name = renderUI({
        div(h2('You are analysing ', span(style="font-weight:bold;",input$search_term),' Station:'))
      })
      shinyjs::addClass(selector = "#mts_multi_stop_name_exist_warning", class = 'mts_hidden')
      shinyjs::removeClass(selector = "#mts_graph_display_block", class = 'mts_hidden')
      
      # page switching to map distribution
      observeEvent(input$show_in_the_map_btn, {
        updateSelectInput(session, "mtsStationName", selected=unique_stop_names)
        updateNavbarPage(session, 'mainTabs', selected='Map Distribution')
      })
    } else {
      shinyjs::removeClass(selector = "#mts_multi_stop_name_exist_warning", class = 'mts_hidden')
      shinyjs::addClass(selector = "#mts_graph_display_block", class = 'mts_hidden')
    }
    
    # plot 1st chart
    output$plot_weekend_mts <- renderGirafe({
      selected_data <- data[, c("Fin_year", "Pax_Saturday", "Pax_Sunday")]
      mydata1<-melt(selected_data,id.vars="Fin_year",variable.name="Type",value.name="Number")
      
      p <- ggplot(mydata1, aes(Fin_year, Number, fill=Type)) +
        geom_bar_interactive(aes(tooltip = paste("Financial Year:", Fin_year, "<br>Type:", Type, "<br>Number:", Number)), stat="identity", position="dodge") +
        scale_x_discrete(labels = function(x) gsub("FY", "", x)) +
        theme_wsj() +
        scale_fill_wsj("rgby", "") +
        theme(axis.ticks.length=unit(0.5,'cm')) +
        guides(fill=guide_legend(title=NULL)) +
        theme(axis.title = element_blank())
      
      girafe(ggobj = p, height_svg = 6, width_svg = 8, options = opts_tooltip(opacity = 0.8))
    })
    
    # plot 2nd chart
    output$plot_peak_mts <- renderGirafe({
      
      selected_data <- data[, c("Fin_year", "Pax_pre_AM_peak", "Pax_AM_peak",
                                "Pax_interpeak", "Pax_PM_peak", "Pax_PM_late")]
      data_long <- tidyr::gather(selected_data, key = "Peak_Time", value = "Passengers", -Fin_year)
      
      p <- ggplot(data_long, aes(x = factor(Peak_Time, 
                                            levels = c("Pax_pre_AM_peak", "Pax_AM_peak", 
                                                       "Pax_interpeak", "Pax_PM_peak", "Pax_PM_late")),
                                 y = Passengers, color = Fin_year, group = Fin_year)) +
        geom_line(size = 1.2) + 
        scale_color_discrete(name = "") +
        scale_x_discrete(labels = function(x) gsub("Pax_", "", x)) +
        theme_wsj()+
        scale_fill_wsj("rgby", "")+
        theme(axis.ticks.length=unit(0.5,'cm'))+
        guides(fill=guide_legend(title=NULL))+
        theme(axis.title = element_blank())
      
      p <- p + geom_line_interactive(aes(tooltip = paste("Financial Year:", Fin_year, "<br>Peak Time:", gsub("Pax_", "", Peak_Time), "<br>Number of Passengers:", Passengers)))
      
      girafe(ggobj = p, height_svg = 6, width_svg = 8, options = opts_tooltip(opacity = 0.8))
    })
    
    # plot 3rd chart
    output$plot_weekdays_mts <- renderGirafe({
      
      selected_data <- data[, c("Fin_year", "Pax_norm_weekday", "Pax_weekday", "Pax_sch_hol_weekday")]

      mydata<-melt(selected_data,id.vars="Fin_year",variable.name="Type",value.name="Number")
      
      p <- ggplot(mydata, aes(Fin_year, Number, fill=Type)) +
        geom_bar_interactive(aes(tooltip = paste("Financial Year:", Fin_year, "<br>Type:", Type, "<br>Number:", Number)), stat="identity", position="dodge") +
        scale_x_discrete(labels = function(x) gsub("FY", "", x)) +
        theme_wsj() +
        scale_fill_wsj("rgby", "") +
        theme(axis.ticks.length=unit(0.5,'cm')) +
        guides(fill=guide_legend(title=NULL)) +
        theme(axis.title = element_blank())
      
      girafe(ggobj = p, height_svg = 6, width_svg = 8, options = opts_tooltip(opacity = 0.8))
    })
  })
  
  
  
  
  #################
  ###Road Crash  ###
  #################
  
  # Display the map of crashes' location for selected year
  output$OutPutCrashMap <- renderLeaflet({
    selected_year <- switch(input$selected_year,
                            "2015" = melbourne_road_crashes_2015,
                            "2016" = melbourne_road_crashes_2016,
                            "2017" = melbourne_road_crashes_2017,
                            "2018" = melbourne_road_crashes_2018,
                            "2019" = melbourne_road_crashes_2019,
                            "ERROR: Map Error"
    )
    plotCrashMap(selected_year)
  })
  
  
  # Melbourne Crash Map Location
  plotCrashMap <- function(data){
    mapColor <- colorFactor(palette = c("red", "green","blue","black"),
                           domain = c("Fatal accident","Non injury accident","Serious injury accident" ,"Other injury accident"),
                           ordered=FALSE)
    maptext=paste("Date: ", data$ACCIDENT_DATE, "<br/>", "Severity: ", data$SEVERITY,"<br/>",
                 "Persons involved: ", data$TOTAL_PERSONS, "<br/>",
                 "Speed Zone: ", data$SPEED_ZONE,
                 sep="") %>%
      lapply(htmltools::HTML)

    # generate map, adding labels, markers and legends
    getMap <- leaflet(data) %>% 
      addTiles()  %>% 
      setView(lat=-37.8136, lng=144.9631, zoom=12) %>%
      addProviderTiles("Esri.WorldStreetMap", group="Street") %>%
      addCircleMarkers(~data$LONGITUDE, ~data$LATITUDE, 
                       fillColor = ~mapColor(data$SEVERITY), fillOpacity = 0.8, 
                       color= ~mapColor(data$SEVERITY), radius=4, stroke=FALSE,
                       label = maptext,
                       labelOptions = labelOptions( style = 
                                                      list("font-weight" = "normal", padding = "3px 8px"), 
                                                    textsize = "13px", direction = "auto"))%>%
      addLegend(colors=c("red", "green","blue","black"), 
                labels=c("Fatal accident","Non injury accident","Serious injury accident" ,"Other injury accident"), 
                opacity=0.9,title = "Severity", position = "bottomright" )
    
    return(getMap)
  }
  
  
  
  # plot out by different classification Pie Chart
  output$plotRoadType <- renderPlotly({
    selected_plot <- switch(input$road_type,
                            "Road type" = plotRoadTypePieChart(),
                            "Accident type" = plotAccidentTypePieChart(),
                            "Road geometry" = plotRoad_geometryPieChart()
    )
    
  })
  
  # plot out Road type pie chart
  plotRoadTypePieChart <- function(){
    roadType = as.data.frame(table(melbourne_road_crashes$RMA))

    roadTypePlot <- plot_ly(roadType,labels = ~roadType$Var1, values = ~roadType$Freq,
                  text = ~paste(roadType$Var1,roadType$Freq, sep='\n'), 
                  hoverinfo = 'text',
                  textinfo = "label+percent",
                  marker = list(colors = brewer.pal(8, "Accent"),
                                line = list(color = '#FFFFFF', width = 0.1)),
                  textposition = "inside") %>%
      add_pie(hole = 0.6) %>%
      layout(title = "Classify By Different Road Types",  showlegend = T,
             xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
             yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))
    
    return(roadTypePlot)
  }
  
  # plot out  Road geometry pie chart
  plotRoad_geometryPieChart <- function(){
    roadGeometry = as.data.frame(table(melbourne_road_crashes$ROAD_GEOMETRY))
    road_geoPlot <-
      plot_ly(labels = ~roadGeometry$Var1, values = ~roadGeometry$Freq,
              text = ~paste(roadGeometry$Var1,roadGeometry$Freq, sep='\n'), 
              hoverinfo = 'text',
              textinfo = "label+percent",
              marker = list(colors = brewer.pal(9, "Set3"),
                            line = list(color = '#FFFFFF', width = 0.1)),
              textposition = "inside") %>%
      add_pie(hole = 0.6) %>%
      layout(title = "Classify By Different Road geometry",  showlegend = T,
             xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
             yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
             showlegend = TRUE
      )
    
    return(road_geoPlot)
  }
  
  # plot out  Accident type pie chart
  plotAccidentTypePieChart <- function(){
    accidentType = as.data.frame(table(melbourne_road_crashes$DCA_CODE))
    acc_typePlot <- plot_ly(accidentType, labels = ~accidentType$Var1, values = ~accidentType$Freq, 
                  textposition = "inside",
                  textinfo = "percent",
                  marker = list(colors = brewer.pal(12, "Paired"),
                                line = list(color = '#FFFFFF', width = 0.1)),
                  text = ~paste(Var1,Freq, sep='\n'), 
                  hoverinfo = 'text',
                  showlegend = FALSE) %>%
      add_pie(hole = 0.6) %>%
      layout(title = 'Classify By Different Accident Type',
             xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
             yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))
    
    return(acc_typePlot)
  }
  
  observeEvent(input$howToUseButton, {
    showModal(modalDialog(
      title = "How to Use",
      "To begin, select the \"Explore Melbourne\" button located on the map's right-hand side. This action will disable animations and zoom in for a closer look at the City of Melbourne, allowing you to explore in more detail. You have the flexibility to apply filters from the options on the right-hand side and interact with the markers to access additional information. Clicking on a landmark will display a line chart, showcasing weekly pedestrian trends, and you'll also receive information about the closest transportation stop, including its type, name, and proximity.",
      easyClose = TRUE
    ))
  })
  observeEvent(input$howToUseButton2, {
    showModal(modalDialog(
      title = "How to Use",
      "By clicking on entries within the \"Top and Bottom 10 Landmarks by Pedestrian Count\" or \"Average Pedestrian Count vs. Distance to Closest Stop\" charts, you'll be directed to specific data points on the map. The pie chart morphs into a descending order bar chart every 10 seconds to offer a different perspective on the data.",
      easyClose = TRUE
    ))
  })
  

  
  
  

  
  

  
  
  
  
  
}