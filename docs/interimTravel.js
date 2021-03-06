//let width = d3.select(".map").node().getBoundingClientRect().width
let width = 1130;
let height = width/2
let transitionTime = 0000
let myProjection = d3
    .geoEqualEarth()
    .translate([width/2.12, width/3.7])
    .scale(width/5.2)

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
        .style('background', 'linear-gradient(90deg, rgba(0,191,230,1) 0%, rgba(1,110,250,1) 67%, rgba(0,191,230,1) 100%)')

        .call(zoom)
        const g = sel.append("g")
            .attr('id', 'main')

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

    sel = d3.select('svg#canvas')
        .selectAll('circle')
        .data(tripsData)
        .enter()

    sel.select('#main')
        .append('path')
        .attr('id', (d, i) => tripsData[i].country.split(' ').join(''))
        .attr('class','flight')
        .style('fill','transparent')
        .style('stroke','transparent')
        .transition()
        .duration(1000)
        .style('stroke','#ff7722')
        .style('stroke-width','1.4')
        .attr("d", function(d, i) { //Found: https://stackoverflow.com/questions/17156283/d3-js-drawing-arcs-between-two-points-on-map-from-file?rq=1
            let dest = myProjection([tripsData[i].dest.split(",")[1], tripsData[i].dest.split(",")[0]]);
            let gr = myProjection([-85.5911216,42.9295085]);
            var dx = dest[0] - gr[0],
                dy = dest[1] - gr[1],
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + gr[0] + "," + gr[1] + "A" + dr + "," + dr + " 0 0,1 " + dest[0] + "," + dest[1];
        });
    
    sel.append('circle')
        .transition()
        .duration(1000)
        .attr('id', (d, i) => tripsData[i].country.split(' ').join(''))
        .attr('class', 'destination')
        .attr('cx', (d, i) => myProjection([tripsData[i].dest.split(",")[1], tripsData[i].dest.split(",")[0]])[0])
        .attr('cy', (d, i) => myProjection([tripsData[i].dest.split(",")[1], tripsData[i].dest.split(",")[0]])[1])
        .attr('r', 4)
        .style('fill', 'orange')
        .style('stroke', 'black')

    sel.selectAll('circle')
        .on("mouseover", onCircleHover)
        .on("mousemove", onCircleHover)
        .on("mouseleave", offCircleHover)
        .on("click", onCircleClick)     
}

function drawTravel(data){
    let moving = false
    d3.select('button#play-button')
        .on('click',function() {
            moving = true
            let self = d3.select(this)
            self.text(moving ? 'Replay' : 'Play')
            d3.select('svg#canvas')
                .selectAll('circle.travel')
                .remove()
            sel = d3.select('svg#canvas')
                .selectAll('circle.travel')
                .data(tripsData)
                .enter()
                .append('circle')
                .attr('class', 'travel')
                .attr('cx', (d, i) => myProjection([tripsData[i].dec27.split(",")[1], tripsData[i][tripsData.columns[1]].split(",")[0]])[0])
                .attr('cy', (d, i) => myProjection([tripsData[i].dec27.split(",")[1], tripsData[i].dec27.split(",")[0]])[1])
                .attr('r', 3)
                .style('fill', 'pink')
                .style('stroke', 'black')
            
            let t = d3.select('.textDate')
        
            for(let date = 1; date < 35; date++){
                sel = sel.transition()
                    .duration(1000)
                    .attr('cx', (d, i) => myProjection([tripsData[i][tripsData.columns[date]].split(",")[1], tripsData[i][tripsData.columns[date]].split(",")[0]])[0])
                    .attr('cy', (d, i) => myProjection([tripsData[i][tripsData.columns[date]].split(",")[1], tripsData[i][tripsData.columns[date]].split(",")[0]])[1])
            
                var str = tripsData.columns[date]
                var matches = str.match(/(\d+)/)
                var month = tripsData.columns[date].split("", 3)
            
                t = t
                    .transition()
                    .duration(1000)
                    .text(function(d) {return 'Date of travel being viewed: ' + month[0].toUpperCase() + month[1] + month[2] + ' ' + matches[0]})
            }
        })
}

function onZoom() {
    d3.select('#main').attr('transform', d3.event.transform)
    d3.selectAll('svg#canvas circle').attr('transform', d3.event.transform)
    d3.selectAll('svg#canvas .travel').attr('transform', d3.event.transform)
}

function onCircleHover(d) {
    d3.select(this)
        .attr('r', 8)
    d3.select('#canvas')
        .data(tripsData)
        let mouseLoc = d3.mouse(this)
        let info = 'Destination: ' +
        d.country
    
    // .html instead of .text() allows us to supply html markup here
    d3.selectAll('.tooltip')
        .html(info)
        .style('visibility', 'visible')
        // left and top only affect .tooltip b/c position = absolute -- see css
        .style('right', mouseLoc[0] - 'px')
        .style('botttom', mouseLoc[1] - 'px')
}

let clicked = false;
function onCircleClick(d) {
    d3.select('#canvas')
        .data(tripsData)
        let info = 'Destination: ' +
        d.country +
        '. ' +
        '<br />Professor(s): ' + 
        d.prof +
        '. ' +
        '<br />Leave Date: ' +
        d.leaveDate +
        '. ' +
        '<br />Return Date: ' +
        d.returnDate +
        '. '

    if (!clicked) {
        clicked = true;

        // .html instead of .text() allows us to supply html markup here
        d3.selectAll('.travelInfo')
            .append('text')
            .attr('id', 'infoText')
            .html(info)
    }
    //Draws the arc green
    onListHover(d.country.split(' ').join(''))  
}

function offCircleHover(d) {
    d3.select(this)
        .attr('r', 4)
    d3.selectAll('#infoText')
        .remove()
        clicked = false;
    d3.selectAll('.tooltip')
        .style('visibility', 'hidden')
}

function onListHover(trip) {
    //Resetting all to default
    d3.selectAll('li.tripListElement')
        .style('background-color','#bf6b2d')

    d3.selectAll('#canvas circle.destination')
        .attr('r', 4)
        .style('fill', 'orange')
        .style('stroke-width', 1)
    
    d3.select('svg#canvas')
        .selectAll('circle#' + trip)
        .attr('r', 8)
        .style('fill', '#00cf4c')
        .style('stroke-width', 3)

    //Setting specific to selected
    d3.selectAll('li#' + trip)
        .style('background-color','#837b79')

    d3.selectAll('g#main path.flight')
        .style('stroke','#ff7722')
        .style('stroke-width','1.4')

    d3.select('g#main')
        .selectAll('path#' + trip)
        .style('stroke', '#00cf4c')
        .style('stroke-width', '5')

    d3.selectAll('circle#' + trip)
        .dispatch('mouseover')
}

function onListClick(trip) {
    d3.selectAll('#infoText')
        .remove()
        clicked = false;
    d3.selectAll('circle#' + trip)
        .dispatch('click')
}

function offListHover() {

}