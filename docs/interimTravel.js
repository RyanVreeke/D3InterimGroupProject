let width = d3.select(".map").node().getBoundingClientRect().width
let height = width/2
let transitionTime = 0000
let myProjection = d3
    .geoEqualEarth()
    .translate([width/2.12, width/3.7])
    .scale(width/5.2)
    // console.log(width/2.12)
    // console.log(width/3.7)
    // console.log(width/5.2)

let mapData
let tripsData

Promise.all([
    d3.json('world.json'),
    d3.csv('interimTravel.csv')
]).then(function(d) {
    drawMap(d)
    drawTrips(d)
    drawTravel(d)
})

const zoom = d3.zoom() //Info found: https://bl.ocks.org/piwodlaiwo/c6e2478581d3932f99da781e9dade306
        .scaleExtent([1, 10])
        .translateExtent([[0,0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", onZoom);

function drawMap(data) {
    mapData = data[0]

    let pathGenerator = d3.geoPath().projection(myProjection)
    
    var sel = d3.select('div.map')
        .append('svg')
        .attr('id', 'canvas')
        .attr('width', width)
        .attr('height', height)
        .style('display', 'block')
        .style('background-color','skyblue')

        .call(zoom)
        const g = sel.append("g")
            .attr('id', 'main')

        //Border
    // sel.append('rect')
    //     .attr('height', height)
    //     .attr('width', width)
    //     .attr('position', 'absolute')
    //     .attr('id', 'border')
    //     .style('fill','transparent')
    //     .style('stroke','#350457')
    //     .style('stroke-width','10')

    g.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .style('fill','#2b7325') // color green
        .style('stroke','black')
        .attr('d', pathGenerator)
}

function drawTrips(data) {
    tripsData = data[1]

    g = d3.select('svg#canvas')
        .selectAll('circle')
        .data(tripsData)
        .enter()

    g.select('#main')
        .append('path')
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
    
    g.append('circle')
        .transition()
        .duration(1000)
        .attr('cx', (d, i) => myProjection([tripsData[i].dest.split(",")[1], tripsData[i].dest.split(",")[0]])[0])
        .attr('cy', (d, i) => myProjection([tripsData[i].dest.split(",")[1], tripsData[i].dest.split(",")[0]])[1])
        .attr('r', 4)
        .style('fill', 'red')
        .style('stroke', 'black')

    g.selectAll('circle')
        .on("mouseover", onHover)
        .on("mousemove", onHover)
        .on("mouseleave", offHover)
        .on("click", onClick)
       
}

function drawTravel(data){
    d3.select('button#play-button')
        .on('click',function() {
    g = d3.select('svg#canvas')
    .selectAll('rect')
    .data(tripsData)
    .enter()
    .append('rect')
    .attr('class', 'travel')
    //.selectAll('.travel')
    //.attr('id', (d, i) => tripsData[i].country)
    .attr('x', (d, i) => myProjection([tripsData[i].dec27.split(",")[1], tripsData[i][tripsData.columns[1]].split(",")[0]])[0])
    .attr('y', (d, i) => myProjection([tripsData[i].dec27.split(",")[1], tripsData[i].dec27.split(",")[0]])[1])
    //.attr('r', 4)
    .attr('width', 5)
    .attr('height', 5)
    .style('fill', 'pink')
   
    for(let date = 1; date < 35; date++){
    g = g.transition()
    .duration(1000)
    .attr('x', (d, i) => myProjection([tripsData[i][tripsData.columns[date]].split(",")[1], tripsData[i][tripsData.columns[date]].split(",")[0]])[0])
    .attr('y', (d, i) => myProjection([tripsData[i][tripsData.columns[date]].split(",")[1], tripsData[i][tripsData.columns[date]].split(",")[0]])[1])
    }
    })

    //.text(moving ? 'Pause' : 'Play')
}

function onZoom() {
    d3.select('#main').attr('transform', d3.event.transform)
    //d3.selectAll('svg#canvas path').attr('transform', d3.event.transform)
    d3.selectAll('svg#canvas circle').attr('transform', d3.event.transform)
    d3.selectAll('svg#canvas .travel').attr('transform', d3.event.transform)
}

function onHover(d) {
    d3.select(this)
        .attr('r', 8)
        .attr('width', 10)
        .attr('height', 10)
    d3.select('#canvas')
        .data(tripsData)
        let mouseLoc = d3.mouse(this)
        let info = 'Destination is: ' +
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
        .style('left', mouseLoc[0] + 'px')
        .style('top', mouseLoc[1] + 'px')

    //console.log(mouseLoc)
    console.log(mouseLoc[0])
    console.log(mouseLoc[1])
}

function onClick(d) {
    d3.select('#canvas')
        .data(tripsData)
        let info = 'Destination is: ' +
        d.country +
        '. ' +
        '<br />Destinatin cordinates are: (' +
        d.dest.split(",")[0] +
        ', ' +
        d.dest.split(",")[1] +
        ').'

        // .html instead of .text() allows us to supply html markup here
    d3.selectAll('.travelInfo')
        .append('text')
        .attr('id', 'infoText')
        .attr('x', 0)
        .attr('y', 0)
        .html(info)
}

function offHover(d) {
    d3.select(this)
        .attr('r', 4)
    d3.select('#infoText')
        .remove()
    d3.selectAll('.tooltip')
        .style('visibility', 'hidden')
}
