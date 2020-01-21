let width = 1000
let height = 600
let transitionTime = 0000
let myProjection = d3
    .geoEqualEarth() // places Alaska and Hawaii closer to continental US
    .translate([455, 325])
    .scale(200)

let mapData

Promise.all([
    d3.json('world.json'),
    d3.csv('interimTravel.csv')
]).then(function(d) {
    drawMap(d)
    drawTrips(d)
})

function drawMap(data) {
    mapData = data[0]

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
}

function drawTrips(trips) {
    d3.select('div.map svg')
        .selectAll('circle')
        .data(trips)
        .enter()
        .append('circle')
        .attr('cx', d => myProjection([trips[1][1].Dec27.split(",")[1], trips[1][1].Dec27.split(",")[0]])[0])
        .attr('cy', d => myProjection([trips[1][1].Dec27.split(",")[1], trips[1][1].Dec27.split(",")[0]])[1])
        .attr('r', 3)
        .style('fill', 'red')
        //console.log(trips[1][1].Dec27.split(",")[0])

}