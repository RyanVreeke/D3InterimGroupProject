let width = 1000
let height = 600
let transitionTime = 0000
let myProjection = d3
    .geoEqualEarth() // places Alaska and Hawaii closer to continental US
    .translate([455, 325])
    .scale(200)

let facts = { population: {}, area: {}, density: {} }
let mapData
let factsData

Promise.all([
    d3.json('world.json'),
]).then(function(d) {
    drawMap(d)
    updateMap()
})
function drawMap(data) {
    mapData = data[0]
    //factsData = data[1]

    // we create three objects that serve as "associative arrays" or "hashes"
    // we will be able to use facts["population"]["Michigan"], for exmample,
    // to get the population of a state. this is a handy trick for accessing
    // information based on a key that is bound to svg elements

    // for (i in factsData) {
    //   facts.population[factsData[i].state] = +factsData[i].population
    //   facts.area[factsData[i].state] = +factsData[i].area
    //   facts.density[factsData[i].state] = +factsData[i].density
    // }

    let pathGenerator = d3.geoPath().projection(myProjection)

    d3.select('div.map')
        .style('background-color','lightblue')
        .style('width', width + 'px')
        .style('height', height + 'px')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('rect')
        .attr('height',600)
        .attr('width',1000)
        .style('fill','transparent')
        .style('stroke','purple')
        .style('stroke-width','10')
    d3.select('div.map')
        .select('svg')
        .attr('class', 'map')
        .selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .style('fill','#2b7325')
        .style('stroke','black')
        .attr('d', pathGenerator)

    // identify Calvin University.  note use of projection! it takes
    // two coordinates in and returns x and y values in SVG coordinates
    d3.select('div.map svg')
        .selectAll('circle')
        .data([{ lat: 42.9295124, lon: -85.5911216 }])
        .enter()
        .append('circle')
        .attr('cx', d => myProjection([d.lon, d.lat])[0])
        .attr('cy', d => myProjection([d.lon, d.lat])[1])
        .attr('r', 3)
        .style('fill', 'red')
}