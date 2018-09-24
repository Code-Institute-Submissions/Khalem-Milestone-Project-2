queue()
    .defer(d3.csv, "data/country-data.csv")
    .await(makeGraphs);

//Call all graph functions
function makeGraphs(error, countryData) {
    var ndx = crossfilter(countryData);
    //Declaring color scale to be used in all charts
    var colorScale = d3.scale.ordinal().range(["#31FFAB", "#19A1FB", "#5863F7", "#9326FF", "#EC58F7", "#FF4383", "#43FFEC"]);
    
    countryData.forEach(function(d){
       d.literacy = parseInt(d["Literacy (%)"], 10) 
    });
    
    showRegionSelector(ndx, "#country-selector");
    showPopPercent(ndx, "#pop-percent", colorScale);
    showLandLockedPercent(ndx, "#landlocked-percent", colorScale);
    showTop5PopCountries(ndx, "#most-pop-countries");
    showTop5RichCountries(ndx, "#most-rich-countries");
    showCorrelationOne(ndx, "#show-correlation-one");
    //showCorrelationTwo(ndx, "#show-correlation-two");

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

function getTops(data) {
        return {
            all: function() {
                return data.top(5);
            }
        };
    }

function showTop5PopCountries(ndx, element) {
    var countryDim = ndx.dimension(dc.pluck("Country"));
    var popGroup = countryDim.group().reduceSum(function(d) {
        return d.Population;
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
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel("Population")
        .yAxis().ticks(4);
}

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
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel("GDP ($ Per Capita)")
        .yAxis().ticks(4);
}

function showCorrelationOne(ndx, element){
    var gdpDim = ndx.dimension(function(d){
       return d.GDP; 
    });
    var minGDP = gdpDim.bottom(1)[0].GDP;
    var maxGDP = gdpDim.top(1)[0].GDP;
    var litDim = ndx.dimension(function(d){
       return [d.GDP, d.literacy]; 
    });
    
    var litGroup = litDim.group();
    console.log(litGroup.all());

    dc.scatterPlot(element)
        .width(800)
        .height(400)
        .x(d3.scale.linear().domain([minGDP, maxGDP]))
        .brushOn(false)
        .symbolSize(5)
        .clipPadding(10)
        .yAxisLabel("Literacy %")
        .dimension(litDim)
        .group(litGroup);
}

/*function showCorrelationTwo(ndx, element){
    var gdpDim = ndx.dimension(function(d){
       return d.GDP; 
    });
    
    var minGDP = gdpDim.bottom(1)[0].GDP;
    var maxGDP = gdpDim.top(1)[0].GDP;
    console.log(maxGDP);
    var litDim = ndx.dimension(function(d){
       return [d.GDP, d.literacy]; 
    });
    
    var litGroup = litDim.group();
    
    dc.scatterPlot(element)
        .width(800)
        .height(400)
        .x(d3.scale.linear().domain([minGDP, maxGDP]))
        .brushOn(false)
        .symbolSize(5)
        .clipPadding(10)
        .yAxisLabel("")
        .dimension(litDim)
        .group(litGroup);
}*/