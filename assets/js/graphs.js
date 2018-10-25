queue()
    .defer(d3.csv, "data/country-data.csv")
    .await(makeGraphs);

//Call all graph functions
function makeGraphs(error, countryData) {
    var ndx = crossfilter(countryData);
    //Declaring color scale to be used in all charts
    var colorScale = d3.scale.ordinal().range(["#31FFAB", "#19A1FB", "#5863F7", "#9326FF", "#EC58F7", "#FF4383", "#43FFEC"]);
    //Some data values result in no value, replace to 0 to stop graphing issues
    countryData.forEach(function(d) {
        //Replacing commas for decimals
        d.Industry = d.Industry.replace(",", ".");
        d.Birthrate = d.Birthrate.replace(",", ".");
        d.Deathrate = d.Deathrate.replace(",", ".");
        d.Service = d.Service.replace(",", ".");
        d.Agriculture = d.Agriculture.replace(",", ".");
        d.popDensity = d["Pop. Density (per sq. mi.)"].replace(",", ".");
        d.netMigration = d["Net migration"].replace(",", ".");
        d.phones = d["Phones (per 1000)"].replace(",", ".");

        //Parse to make variable easier to use
        d.literacy = parseFloat(d["Literacy (%)"]);
        d.populationDensity = parseFloat(d["Pop. Density (per sq. mi.)"], 10);
        d.birthrate = parseFloat(d.Birthrate, 10);
        d.deathrate = parseFloat(d.Deathrate, 10);
        d.industry = parseFloat(d.Industry, 10);
        d.service = parseFloat(d.Service, 10);
        d.agriculture = parseFloat(d.Agriculture, 10);
        d.popDensity = parseFloat(d.popDensity, 10);
        d.netMigration = parseFloat(d.netMigration, 10);
        d.phones = parseFloat(d.phones, 10);
        d.area = parseInt(d["Area (sq. mi.)"], 10);
        //Data cleaning - getting rid of invalid values
        if (!d.literacy) {
            d.literacy = 0;
        } else if(!d.populationDensity){
            d.populationDensity = 0;
        } else if(!d.birthrate){
            d.birthrate = 0;
        } else if(!d.deathrate){
            d.deathrate = 0;
        } else if(!d.industry){
            d.industry = 0;
        } else if(!d.service){
            d.service = 0;
        } else if(!d.agriculture){
            d.agriculture = 0;
        } else if(!d.popDensity){
            d.popDensity = 0;
        } else if(!d.netMigration){
            d.netMigration = 0;
        } else if(!d.phones){
            d.phones = 0;
        } 
        //If there is no value for Climate, or if value was invalid - change to 5.
        if(isNaN(d.Climate) == true){
            d.Climate = 5;
        } else if(!d.Climate){
            d.Climate = 5;
        }
    });
    //Get height and width of window
    var width = $(window).width();
    var height = $(window).height();
    
    // Render graphs
    showLandingGraph(ndx, "#landing-graph", width, height);
    showPopPercent(ndx, "#pop-percent", colorScale);
    showLandLockedPercent(ndx, "#landlocked-percent", colorScale);
    showTop5PopCountries(ndx, "#most-pop-countries", width, height);
    showTop5RichCountries(ndx, "#most-rich-countries", width, height);
    showCorrelationOne(ndx, "#show-correlation-one", width, height);
    showCorrelationTwo(ndx, "#show-correlation-two", width, height);

    dc.renderAll();
    
    //Each time a select is changed, graphs will re-render displaying new info
    $("#landingSelect").change(function() {
        showLandingGraph(ndx, "#landing-graph", width, height);
        dc.renderAll();
    });
    $("#chartOneSelect").change(function() {
        showTop5PopCountries(ndx, "#most-pop-countries", width, height);
        dc.renderAll();
    });
    $("#chartTwoSelect").change(function() {
        showTop5RichCountries(ndx, "#most-rich-countries", width, height);
        dc.renderAll();
    });
    $("#scatterOne").click(function() {
        showCorrelationOne(ndx, "#show-correlation-one", width, height);
        dc.renderAll();
    });
    $("#scatterTwo").click(function() {
        showCorrelationTwo(ndx, "#show-correlation-two", width, height);
        dc.renderAll();
    });
}
//Creating landing graph that will act as a region selector also.
function showLandingGraph(ndx, element, width, height) {
    var selector = document.getElementById("landingSelect");
    var selectorValue = selector.options[selector.selectedIndex].value;

    var regionDim = ndx.dimension(dc.pluck("Region"));
    var landingSelection = regionDim.group().reduceSum(dc.pluck(selectorValue));
    //Making chart responsive for table/mobile users
    var newWidth;
    var newHeight;
    //If height is larger than width it must scale differently
    if(height > width){
        newHeight = height / 2.3;
        newWidth = width / 1.05;
    } else {
        //Keeping same size for laptop and desktop
        newWidth = 800;
        newHeight = 500;
    }
    dc.barChart(element)
        .width(newWidth)
        .height(newHeight)
        .margins({ top: 10, right: 50, bottom: 100, left: 80 })
        .dimension(regionDim)
        .group(landingSelection)
        .transitionDuration(1000)
        .ordinalColors(["#31FFAB"])
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel(getYAxisLabel(selectorValue))
        .yAxis().ticks(4);
}

//Show Pop Percent - Pie Chart
function showPopPercent(ndx, element, colorScale) {
    var countryDim = ndx.dimension(dc.pluck("Country"));
    var population = countryDim.group().reduceSum(dc.pluck("Population"));
    dc.pieChart(element)
        .height(330)
        .radius(100)
        .transitionDuration(1000)
        .dimension(countryDim)
        .group(population)
        .colors(colorScale);
}
//Land Locked Percentages - Pie Chart
function showLandLockedPercent(ndx, element, colorScale) {
    //Creating custom reduce to display climates.
    var countryDim = ndx.dimension(dc.pluck("Climate"));
    var climate = countryDim.group().reduce(
        function(p, v) {
            p.count++;
            if (v.Climate == 1 || v.Climate == 1, 5) {
                p.climateOne++;
                return p;
            }
            else if (v.Climate == 2 || v.Climate == 2, 5) {
                p.climateTwo++;
                return p;
            }
            else if (v.Climate == 3 || v.Climate == 3, 5) {
                p.climateThree++;
                return p;
            }
            else if (v.Climate == 4 || v.Climate == 4, 5) {
                p.climateFour++;
                return p;
            }
        },
        function(p, v) {
            p.count--;
            if (v.Climate == 1 || v.Climate == 1, 5) {
                p.climateOne--;
                return p;
            }
            else if (v.Climate == 2 || v.Climate == 2, 5) {
                p.climateTwo--;
                return p;
            }
            else if (v.Climate == 3 || v.Climate == 3, 5) {
                p.climateThree--;
                return p;
            }
            else if (v.Climate == 4 || v.Climate == 4, 5) {
                p.climateFour--;
                return p;
            }
        },
        function() {
            return { climateOne: 0, climateTwo: 0, climateThree: 0, climateFour: 0, count: 0 };
        }


    );
    dc.pieChart(element)
        .height(330)
        .radius(100)
        .transitionDuration(1000)
        .dimension(countryDim)
        .group(climate)
        .valueAccessor(function(d) {
            return d.value.climateOne;
        })
        .colors(colorScale);
}
//Filter top 5 of data
function getTops(data) {
    return {
        all: function() {
            return data.top(5);
        }
    };
}

//Get dynamic Y-Axis labels
function getYAxisLabel(selectorValue) {
    if (selectorValue == "GDP") {
        return "GDP ($ per capita)";
    }
    else if (selectorValue == "Population") {
        return "Population";
    }
    else if (selectorValue == "area") {
        return "Area (sq. mi.)";
    }
    else if (selectorValue == "popDensity") {
        return "Pop. Density (per sq. mi.)";
    }
    else if (selectorValue == "netMigration") {
        return "Net migration";
    }
    else if (selectorValue == "phones") {
        return "Phones (per 1000)"
    }
    else if (selectorValue == "Birthrate") {
        return "Birthrate";
    }
    else if (selectorValue == "Deathrate") {
        return "Deathrate";
    }
    else if (selectorValue == "Agriculture") {
        return "Agriculture";
    }
    else if (selectorValue == "Industry") {
        return "Industry";
    }
    else if (selectorValue == "literacy") {
        return "Literacy%";
    }
}
//Get dynamic X-Axis labels
function getXAxisLabel(selectorValueTwo) {
    if (selectorValueTwo == "GDP") {
        return "GDP ($ per capita)";
    }
    else if (selectorValueTwo == "Population") {
        return "Population";
    }
    else if (selectorValueTwo == "area") {
        return "Area (sq. mi.)";
    }
    else if (selectorValueTwo == "popDensity") {
        return "Pop. Density (per sq. mi.)";
    }
    else if (selectorValueTwo == "netMigration") {
        return "Net migration";
    }
    else if (selectorValueTwo == "phones") {
        return "Phones (per 1000)"
    }
    else if (selectorValueTwo == "Birthrate") {
        return "Birthrate";
    }
    else if (selectorValueTwo == "Deathrate") {
        return "Deathrate";
    }
    else if (selectorValueTwo == "Agriculture") {
        return "Agriculture";
    }
    else if (selectorValueTwo == "Industry") {
        return "Industry";
    }
    else if (selectorValueTwo == "infantMortality") {
        return "Infanty Mortality Per 1000";
    }
    else if (selectorValueTwo == "literacy") {
        return "Literacy %";
    }
}
//First Top 5 Bar Chart
function showTop5PopCountries(ndx, element, width, height) {
    //Get value from select to then group
    var selector = document.getElementById("chartOneSelect");
    var selectorValue = selector.options[selector.selectedIndex].value;
    var countryDim = ndx.dimension(dc.pluck("Country"));
    var popGroup = countryDim.group().reduceSum(dc.pluck(selectorValue));
    var fakeGroup = getTops(popGroup);
    //Getting charts to scale
    var newWidth;
    var newHeight;
    //If height is larger than width it must scale differently
    if(height > width){
        newHeight = height / 3;
        newWidth = width / 1.2;
    } else {
        newWidth = width / 3.84;
        newHeight = height / 1.938;
    }

    var barChartOne = dc.barChart(element)
        .width(newWidth)
        .height(newHeight)
        .margins({ top: 10, right: 50, bottom: 80, left: 80 })
        .dimension(countryDim)
        .group(fakeGroup)
        .transitionDuration(1000)
        .ordinalColors(["#31FFAB"])
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel(getYAxisLabel(selectorValue))
        .yAxis().ticks(4);
}

//Second Top 5 Bar Chart
function showTop5RichCountries(ndx, element, width, height) {
    //Get value from select to then group
    var selector = document.getElementById("chartTwoSelect");
    var selectorValue = selector.options[selector.selectedIndex].value;

    var countryDim = ndx.dimension(dc.pluck("Country"));
    var popGroup = countryDim.group().reduceSum(dc.pluck(selectorValue));

    var fakeGroup = getTops(popGroup);
    //Getting charts to scale
    var newWidth;
    var newHeight;
    //If height is larger than width it must scale differently
    if(height > width){
        newHeight = height / 3;
        newWidth = width / 1.2;
    } else {
        newWidth = width / 3.84;
        newHeight = height / 1.938;
    }
    
    dc.barChart(element)
        .width(newWidth)
        .height(newHeight)
        .margins({ top: 10, right: 50, bottom: 80, left: 80 })
        .dimension(countryDim)
        .group(fakeGroup)
        .transitionDuration(1000)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .ordinalColors(["#31FFAB"])
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel(getYAxisLabel(selectorValue))
        .yAxis().ticks(4);
}

//First Scatter Plot
function showCorrelationOne(ndx, element, width, height) {
    //Get values from 2 selects to plot
    var selectorOne = document.getElementById("scatterOneFirstSelect");
    var selectorValue = selectorOne.options[selectorOne.selectedIndex].value;

    var selectorTwo = document.getElementById("scatterOneSecondSelect");
    var selectorValueTwo = selectorTwo.options[selectorTwo.selectedIndex].value;

    //Create array with all values, then get min and max values.
    var valueArrayOne = [];
    var valueArrayTwo = [];
    var litDim = ndx.dimension(function(d) {
        valueArrayOne.push(Math.floor(d[selectorValue] * 100) / 100); //Get values to 2 decimal places
        valueArrayTwo.push(Math.floor(d[selectorValueTwo] * 100) / 100); //Get values to 2 decimal places
        return [Math.floor(d[selectorValue] * 100) / 100, Math.floor(d[selectorValueTwo] * 100) / 100]; // Do the same so when in group will produce correct values.
    });
    valueArrayOne = valueArrayOne.filter(Boolean);
    valueArrayTwo = valueArrayTwo.filter(Boolean);
    var minValueOne = Math.min(...valueArrayOne);
    var maxValueOne = Math.max(...valueArrayOne);
    var minValueTwo = Math.min(...valueArrayTwo);
    var maxValueTwo = Math.max(...valueArrayTwo);

    var litGroup = litDim.group().reduceCount();
    
    //Creating custom width to scale for different devices
    var newWidth;
    var newHeight;
    
    if(height > width){
        newWidth = width / 1.15;
        newHeight = height / 3.5;
    } else {
        newWidth = width / 1.27;
        newHeight = height / 2;
    }
    
    dc.scatterPlot(element)
        .width(newWidth)
        .height(newHeight)
        .margins({ top: 10, right: 50, bottom: 80, left: 80 })
        .x(d3.scale.linear().domain([minValueOne, maxValueOne]))
        .y(d3.scale.linear().domain([minValueTwo, maxValueTwo]))
        .brushOn(false)
        .symbolSize(7)
        .clipPadding(10)
        .xAxisLabel(getXAxisLabel(selectorValue))
        .yAxisLabel(getYAxisLabel(selectorValueTwo))
        .colors("#31FFAB")
        .dimension(litDim)
        .group(litGroup);
}
//Second Scatter Plot
function showCorrelationTwo(ndx, element, width, height) {
    //Get values from 2 selects to plot
    var selectorOne = document.getElementById("scatterTwoFirstSelect");
    var selectorValue = selectorOne.options[selectorOne.selectedIndex].value;

    var selectorTwo = document.getElementById("scatterTwoSecondSelect");
    var selectorValueTwo = selectorTwo.options[selectorTwo.selectedIndex].value;
    console.log(selectorValue);
    //Create array with all values, then get min and max values.
    var valueArrayOne = [];
    var valueArrayTwo = [];
    var litDim = ndx.dimension(function(d) {
        valueArrayOne.push(Math.floor(d[selectorValue] * 100) / 100); //Get values to 2 decimal places
        valueArrayTwo.push(Math.floor(d[selectorValueTwo] * 100) / 100); //Get values to 2 decimal places
        return [Math.floor(d[selectorValue] * 100) / 100, Math.floor(d[selectorValueTwo] * 100) / 100]; // Do the same so when in group will produce correct values.
    });
    //Filtering out countries with no value
    valueArrayOne = valueArrayOne.filter(Boolean);
    valueArrayTwo = valueArrayTwo.filter(Boolean);
    console.log(valueArrayOne);
    //Get min and max values
    var minValueOne = Math.min(...valueArrayOne);
    var maxValueOne = Math.max(...valueArrayOne);
    var minValueTwo = Math.min(...valueArrayTwo);
    var maxValueTwo = Math.max(...valueArrayTwo);
    
    //Creating custom width to scale for different devices
    var newWidth;
    var newHeight;
    
    if(height > width){
        newWidth = width / 1.15;
        newHeight = height / 3.5;
    } else {
        newWidth = width / 1.27;
        newHeight = height / 2;
    }

    var litGroup = litDim.group().reduceCount();
    //Draw chart
    dc.scatterPlot(element)
        .width(newWidth)
        .height(newHeight)
        .margins({ top: 10, right: 50, bottom: 80, left: 80 })
        .x(d3.scale.linear().domain([minValueOne, maxValueOne]))
        .y(d3.scale.linear().domain([minValueTwo, maxValueTwo]))
        .brushOn(false)
        .symbolSize(7)
        .clipPadding(10)
        .xAxisLabel(getXAxisLabel(selectorValue))
        .yAxisLabel(getYAxisLabel(selectorValueTwo))
        .colors("#4596FF")
        .dimension(litDim)
        .group(litGroup);
}
