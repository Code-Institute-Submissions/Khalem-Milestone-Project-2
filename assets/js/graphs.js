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
        d.birthrate = parseFloat(d["Birthrate"], 10);
        d.deathrate = parseFloat(d["Deathrate"], 10);
        d.industry = parseFloat(d["Industry"]);
        d.service = parseFloat(d["Service"]);
        d.agriculture = parseFloat(d["Agriculture"]);
        d.popDensity = parseFloat(d.popDensity);
        d.netMigration = parseFloat(d.netMigration);
        d.phones = parseFloat(d.phones);
        d.area = parseInt(d["Area (sq. mi.)"]);
        if (isNaN(d.literacy) == true) {
            d.literacy = 0;
        }
    });

    showRegionSelector(ndx, "#region-selector");
    showPopPercent(ndx, "#pop-percent", colorScale);
    showLandLockedPercent(ndx, "#landlocked-percent", colorScale);
    showTop5PopCountries(ndx, "#most-pop-countries");
    showTop5RichCountries(ndx, "#most-rich-countries");
    showCorrelationOne(ndx, "#show-correlation-one");
    showCorrelationTwo(ndx, "#show-correlation-two");

    dc.renderAll();
    $("#chartOneSelect").change(function() {
        showTop5PopCountries(ndx, "#most-pop-countries");
        dc.renderAll();
        console.log("TESTEST");
    });
    $("#chartTwoSelect").change(function() {
        showTop5RichCountries(ndx, "#most-rich-countries");
        dc.renderAll();
        console.log("TESTEST");
    });
    $("#scatterOne").click(function() {
        showCorrelationOne(ndx, "#show-correlation-one");
        dc.renderAll();
    });
    $("#scatterTwo").click(function() {
        showCorrelationTwo(ndx, "#show-correlation-two");
        dc.renderAll();
    });
}

//Region Selector
function showRegionSelector(ndx, element) {
    dim = ndx.dimension(dc.pluck("Region"));
    group = dim.group();

    dc.selectMenu(element)
        .dimension(dim)
        .group(group);
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
    /*    var countryDim = ndx.dimension(dc.pluck("Coastline"));
        //Creating custome reduce to display which countries are landlocked
        var landlocked = countryDim.group().reduce(
            function(p, v) {
                if (v.Coastline == "0,00") {
                    p.landlocked++;
                    return p;
                }
                else {
                    p.coast++;
                    return p;
                }
            },
            function(p, v) {
                if (v.Coastline == "0,00") {
                    p.landlocked--;
                    return p;
                }
                else {
                    p.coast--;
                    return p;
                }
            },
            function() {
                return { landlocked: 0, coast: 0 };
            }
        );*/
    var countryDim = ndx.dimension(dc.pluck("Climate"));
    var climate = countryDim.group().reduce(
        function(p, v) {
            p.count++;
            if(v.Climate == 1 || v.Climate == 1,5){
                p.climateOne++;
                return p;
            } else if(v.Climate == 2 || v.Climate == 2,5){
                p.climateTwo++;
                return p;
            } else if(v.Climate == 3 || v.Climate == 3,5){
                p.climateThree++;
                return p;
            } else if(v.Climate == 4 || v.Climate == 4,5){
                p.climateFour++;
                return p;
            }
        },
        function(p, v) {
            p.count--;
            if(v.Climate == 1 || v.Climate == 1,5){
                p.climateOne--;
                return p;
            } else if(v.Climate == 2 || v.Climate == 2,5){
                p.climateTwo--;
                return p;
            } else if(v.Climate == 3 || v.Climate == 3,5){
                p.climateThree--;
                return p;
            } else if(v.Climate == 4 || v.Climate == 4,5){
                p.climateFour--;
                return p;
            }
        },
        function() {
            return { climateOne: 0, climateTwo: 0, climateThree: 0, climateFour: 0, count: 0};
        }


    );
    dc.pieChart(element)
        .height(330)
        .radius(100)
        .transitionDuration(1000)
        .dimension(countryDim)
        .group(climate)
        .valueAccessor(function(d){
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

//Create function to display correct y-axis label
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
    else if (selectorValue == "infantMortality") {
        return "Infanty Mortality Per 1000";
    }
    else if (selectorValue == "literacy") {
        return "Literacy";
    }
}
function getXAxisLabel(selectorValueTwo){
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
        return "Literacy";
    }
}
//First Top 5 Bar Chart
function showTop5PopCountries(ndx, element) {
    var selector = document.getElementById("chartOneSelect");
    var selectorValue = selector.options[selector.selectedIndex].value;
    console.log(selectorValue);
    var countryDim = ndx.dimension(dc.pluck("Country"));
    var popGroup = countryDim.group().reduceSum(dc.pluck(selectorValue));

    var fakeGroup = getTops(popGroup);

    var barChartOne = dc.barChart(element)
        .width(500)
        .height(500)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
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

//Second Top 5 Bar Chart - need to add option to choose which piece of data to display
function showTop5RichCountries(ndx, element) {
    var selector = document.getElementById("chartTwoSelect");
    var selectorValue = selector.options[selector.selectedIndex].value;

    var countryDim = ndx.dimension(dc.pluck("Country"));
    var popGroup = countryDim.group().reduceSum(dc.pluck(selectorValue));

    var fakeGroup = getTops(popGroup);

    dc.barChart(element)
        .width(500)
        .height(500)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
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
function showCorrelationOne(ndx, element) {
    var selectorOne = document.getElementById("scatterOneFirstSelect");
    var selectorValue = selectorOne.options[selectorOne.selectedIndex].value;

    var selectorTwo = document.getElementById("scatterOneSecondSelect");
    var selectorValueTwo = selectorTwo.options[selectorTwo.selectedIndex].value;

    console.log(typeof selectorValueOne);
    //Create array with all values, then get min and max values.
    var valueArrayOne = [];
    var valueArrayTwo = [];
    var litDim = ndx.dimension(function(d) {
        valueArrayOne.push(Math.floor(d[selectorValue]));
        valueArrayTwo.push(Math.floor(d[selectorValueTwo]));
        return [Math.floor(d[selectorValue]), Math.floor(d[selectorValueTwo])];
    });
    valueArrayOne = valueArrayOne.filter(Boolean);
    valueArrayTwo = valueArrayTwo.filter(Boolean);
    var minValueOne = Math.min(...valueArrayOne);
    var maxValueOne = Math.max(...valueArrayOne);
    var minValueTwo = Math.min(...valueArrayTwo);
    var maxValueTwo = Math.max(...valueArrayTwo);

    var litGroup = litDim.group().reduceCount();

    dc.scatterPlot(element)
        .width(1000)
        .height(400)
        .x(d3.scale.linear().domain([minValueOne, maxValueOne]))
        .y(d3.scale.linear().domain([minValueTwo, maxValueTwo]))
        .brushOn(false)
        .symbolSize(5)
        .clipPadding(10)
        .xAxisLabel(getXAxisLabel(selectorValueTwo))
        .yAxisLabel(getYAxisLabel(selectorValue))
        .colors("#31FFAB")
        .dimension(litDim)
        .group(litGroup);
}
//Second Scatter Plot
function showCorrelationTwo(ndx, element) {
    var selectorOne = document.getElementById("scatterTwoFirstSelect");
    var selectorValue = selectorOne.options[selectorOne.selectedIndex].value;

    var selectorTwo = document.getElementById("scatterTwoSecondSelect");
    var selectorValueTwo = selectorTwo.options[selectorTwo.selectedIndex].value;
    console.log(selectorValue);
    //Create array with all values, then get min and max values.
    var valueArrayOne = [];
    var valueArrayTwo = [];
    var litDim = ndx.dimension(function(d) {
        valueArrayOne.push(Math.floor(d[selectorValue] * 100) / 100);  //Get values to 2 decimal places
        valueArrayTwo.push(Math.floor(d[selectorValueTwo] * 100) / 100); //Get values to 2 decimal places
        return [Math.floor(d[selectorValue] * 100)/ 100, Math.floor(d[selectorValueTwo] * 100)/ 100]; // Do the same so when in group will produce correct values.
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


    var litGroup = litDim.group().reduceCount();
    //Draw chart
    dc.scatterPlot(element)
        .width(1000)
        .height(400)
        .x(d3.scale.linear().domain([minValueOne, maxValueOne]))
        .y(d3.scale.linear().domain([minValueTwo, maxValueTwo]))
        .brushOn(false)
        .symbolSize(5)
        .clipPadding(10)
        .xAxisLabel(getXAxisLabel(selectorValueTwo))
        .yAxisLabel(getYAxisLabel(selectorValue))
        .colors("#31FFAB")
        .dimension(litDim)
        .group(litGroup);
}
