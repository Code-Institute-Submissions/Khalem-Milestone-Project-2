queue()
    .defer(d3.csv, "data/country-data.csv")
    .await(makeGraphs);

function makeGraphs(countryData){
    var ndx = crossfilter(countryData);
    
    showGeneralData(ndx, "#general-data");
}
