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
        d.literacy = parseFloat(d["Literacy (%)"]);
        d.populationDensity = parseFloat(d["Pop. Density (per sq. mi.)"], 10);
        d.birthrate = parseFloat(d["Birthrate"], 10);
        d.deathrate = parseFloat(d["Deathrate"], 10);
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
    var countryDim = ndx.dimension(dc.pluck("Coastline"));
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
    );

    dc.pieChart(element)
        .height(330)
        .radius(100)
        .transitionDuration(1000)
        .dimension(countryDim)
        .group(landlocked)
        .valueAccessor(function(d) {
            return d.value.landlocked + d.value.coast;
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
//First Top 5 Bar Chart - need to add option to choose which piece of data to display
function showTop5PopCountries(ndx, element) {
    var selectBox = document.getElementById("top5Select");
    var selectedValue = selectBox[selectBox.selectedIndex].value;
    
    var countryDim = ndx.dimension(dc.pluck("Country"));
    var popGroup = countryDim.group().reduceSum(dc.pluck(selectedValue));

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
        .yAxisLabel("Population")
        .yAxis().ticks(4);

}
//Second Top 5 Bar Chart - need to add option to choose which piece of data to display
function showTop5RichCountries(ndx, element) {
    var countryDim = ndx.dimension(dc.pluck("Country"));
    var popGroup = countryDim.group().reduceSum(function(d) {
        return d.GDP;
    });

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
        .yAxisLabel("GDP ($ Per Capita)")
        .yAxis().ticks(4);
}
//First Scatter Plot - need to add option to choose which 2 pieces of data to display
function showCorrelationOne(ndx, element) {
    /*var gdpDim = ndx.dimension(function(d) {
        return d.GDP;
    });

    var minGDP = gdpDim.bottom(1)[0].GDP;
    var maxGDP = gdpDim.top(1)[0].GDP;
    var litDim = ndx.dimension(function(d) {
        return [d.GDP, d.literacy];
    });


    var litGroup = litDim.group();*/

    // Code above would not actually provide the max value of the GDP. 

    var litDim = ndx.dimension(function(d) {
        return [Math.floor(d.GDP), Math.floor(d.literacy)];
    });

    var litGroup = litDim.group().reduceCount();

    dc.scatterPlot(element)
        .width(1000)
        .height(400)
        .x(d3.scale.linear().domain([0, 56000]))
        .y(d3.scale.linear().domain([0, 100]))
        .brushOn(false)
        .symbolSize(5)
        .clipPadding(10)
        .yAxisLabel("Literacy %")
        .colors("#31FFAB")
        .dimension(litDim)
        .group(litGroup);
}
//Second Scatter Plot - need to add option to choose which 2 pieces of data to display
function showCorrelationTwo(ndx, element) {
    var popDens = ndx.dimension(function(d) {
        return d.populationDensity;
    });

    var minPopDens = popDens.bottom(1)[0].populationDensity;
    var maxPopDens = popDens.top(1)[0].populationDensity;
    console.log(maxPopDens);
    var litDim = ndx.dimension(function(d) {
        return [d.populationDensity, (d.birthrate - d.deathrate)];
    });

    var litGroup = litDim.group();

    dc.scatterPlot(element)
        .width(1000)
        .height(400)
        .x(d3.scale.linear().domain([minPopDens, maxPopDens]))
        .brushOn(false)
        .symbolSize(5)
        .clipPadding(10)
        .yAxisLabel("")
        .colors("#19A1FB")
        .dimension(litDim)
        .group(litGroup);
}
