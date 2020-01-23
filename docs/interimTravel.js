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

const zoom = d3.zoom()
    .scaleExtent([1, 40])
    .translate([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", onZoom)

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
        .attr('height', height)
        .attr('width', width)
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
    let s = d3.select('#canvas')
        .selectAll('circle')
        .data(tripsData)
        .enter()

        s.append('path')
        .style('fill','transparent')
        .style('stroke','transparent')
        .transition()
        .duration(2000)
        .style('stroke','darkred')
        .style('stroke-width','1.4')
        .attr("d", function(d, i) { //Found: https://stackoverflow.com/questions/17156283/d3-js-drawing-arcs-between-two-points-on-map-from-file?rq=1
            let dest = myProjection([tripsData[i].dest.split(",")[1], tripsData[i].dest.split(",")[0]]);
            let gr = myProjection([-85.5911216,42.9295085]);
            var dx = dest[0] - gr[0],
                dy = dest[1] - gr[1],
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + gr[0] + "," + gr[1] + "A" + dr + "," + dr + " 0 0,1 " + dest[0] + "," + dest[1];
        });
        // s.on("mouseover", showInfo)
        // .on("mouseleave", hideInfo)
        
        s.append('circle')
        .transition()
        .duration(1000)
        .attr('cx', (d, i) => myProjection([tripsData[i].dest.split(",")[1], tripsData[i].dest.split(",")[0]])[0])
        .attr('cy', (d, i) => myProjection([tripsData[i].dest.split(",")[1], tripsData[i].dest.split(",")[0]])[1])
        .attr('r', 4)
        .style('fill', 'red')
        .style('stroke', 'black')

        s.selectAll('circle')
        .on("mouseover", onHover)
        .on("mouseleave", offHover)
        .on("click", onClick)
       
        let g = s.append('g')
}

function onHover(d) {
    d3.select(this)
        .attr('r', 8);
    d3.select('#canvas')
        .data(tripsData)
        let mouseLoc = d3.mouse(this)
        let info = 'The Destination Country is: ' +
        d.country +
        '. ' +
        '<br />Destinatin cordinates are: (' +
        d.dest.split(",")[0] +
        ', ' +
        d.dest.split(",")[1] +
        ').'

        // .html instead of .text() allows us to supply html markup here
        d3.selectAll('.tooltip')
        .html(info)
        .style('visibility', 'visible')
        // left and top only affect .tooltip b/c position = absolute -- see css
        .style('left', mouseLoc[0] - 120 + 'px')
        .style('top', mouseLoc[1] + 35 + 'px')
}

function onClick(d) {
    d3.select('#canvas')
        .data(tripsData)
        let info = 'The Destination Country is: ' +
        d.country +
        '. ' +
        '<br />Destinatin cordinates are: (' +
        d.dest.split(",")[0] +
        ', ' +
        d.dest.split(",")[1] +
        ').'

        // .html instead of .text() allows us to supply html markup here
        d3.selectAll('.info')
        .html(info)
        .style('visibility', 'visible')
}

// function onZoom() {
//     g.attr('transform', d3.event.transform)
// }

function offHover(d) {
    d3.select(this)
        .attr('r', 4);
    d3.selectAll('.tooltip, .info')
        .style('visibility', 'hidden')
}
