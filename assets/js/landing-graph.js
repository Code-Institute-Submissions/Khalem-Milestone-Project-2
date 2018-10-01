queue()
    .defer(d3.csv, "data/country-data.csv")
    .await(makeLandingGraph);

function makeLandingGraph(error, countryData) {
    var ndx = crossfilter(countryData);

    countryData.forEach(function(d) {
        
        d.Industry = d.Industry.replace(",", ".");
        d.Birthrate = d.Birthrate.replace(",", ".");
        d.Deathrate = d.Deathrate.replace(",", ".");
        d.Service = d.Service.replace(",", ".");
        d.Agriculture = d.Agriculture.replace(",", ".");
        
        d.birthrate = parseFloat(d["Birthrate"]);
        d.deathrate = parseFloat(d["Deathrate"]);
        d.industry = parseFloat(d["Industry"]);
        d.service = parseFloat(d["Service"]);
        d.agriculture = parseFloat(d["Agriculture"]);
    });

    showCountrySelector(ndx, "#country-selector");
    showLandingGraph(ndx, "#landing-graph");
}

function showCountrySelector(ndx, element) {
    dim = ndx.dimension(dc.pluck("Region"));
    group = dim.group();

    dc.selectMenu(element)
        .dimension(dim)
        .group(group);
}

function showLandingGraph(ndx, element) {
    var countryDim = ndx.dimension(dc.pluck("birthrate", "deathrate"));
    var birthGroup = countryDim.group().reduceSum(function(d) {
        return d.Country;
    });
    
    
    dc.barChart(element)
        .width(1280)
        .height(500)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(countryDim)
        .group(birthGroup)
        .transitionDuration(1000)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel("Birthrate")
        .yAxis().ticks(4);
}
