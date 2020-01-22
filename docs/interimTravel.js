let width = 1000
let height = 600
let transitionTime = 0000
let myProjection = d3
    .geoEqualEarth()
    .translate([455, 325])
    .scale(200)

let mapData
let tripsData

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
        .attr('id', 'canvas')
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

function drawTrips(data) {
    tripsData = data[1]

    d3.select('div.map svg')
        .selectAll('circle')
        .data(tripsData)
        .enter()
        .append('circle')
        .attr('cx', (d, i) => myProjection([tripsData[i].dest.split(",")[1], tripsData[i].dest.split(",")[0]])[0])
        .attr('cy', (d, i) => myProjection([tripsData[i].dest.split(",")[1], tripsData[i].dest.split(",")[0]])[1])
        .attr('r', 3)
        .style('fill', 'red')
        .style('stroke', 'black')
        .on("mouseover", showInfo)
        .on("mouseleave", hideInfo)
}

function showInfo(d) {
    d3.select('div.map svg')
    .data(tripsData)
    let mouseLoc = d3.mouse(this)
    let info = 'The Destination Country is: ' +
      d.country +
      '. ' +
      '<br />Mouse location is: (' +
      mouseLoc[0] +
      ', ' +
      mouseLoc[1] +
      ').'

    // .html instead of .text() allows us to supply html markup here
    d3.selectAll('.tooltip, .info')
      .html(info)
      .style('visibility', 'visible')
      // left and top only affect .tooltip b/c position = absolute -- see css
      .style('left', mouseLoc[0] + 'px')
      .style('top', mouseLoc[1] + 35 + 'px')
}

function hideInfo(d) {
    d3.selectAll('.tooltip, .info')
        .style('visibility', 'hidden')
}
