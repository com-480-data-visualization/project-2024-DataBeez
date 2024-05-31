
// Initialize the globe with default settings
const myGlobe = Globe()(document.getElementById('globe'))
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
  .width(850)
  .height(600)



// Load data from CSV file and update the globe
let allDataGlobe = [];
fetch('data/World Important Dates with Coordinates.csv')
  .then(response => response.text())
  .then(csv => d3.csvParse(csv))
  .then(data => {
    allDataGlobe = data;
    updateGlobeData(21);  // Initialize with data from the 21th century
  });

//Load the heatmap data from geojson file
let dataHeatmap = [];
fetch('data/countries.geojson')
    .then(res => res.json())
    .then(ctry => {
        colorScale.domain([0, Math.max(...ctry.features.map(d => d.properties.Frequency))]);
        dataHeatmap = ctry;
    });

// Color scale for heatmap
const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);

let filteredData = []; // Initialize filtered data for the globe



// Function to update the globe data based on the selected century and outcomes
function updateGlobeData(century) {

    // Get the selected outcomes from checkboxes
    const selectedOutcomes = new Set();
    document.querySelectorAll('#checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
        selectedOutcomes.add(checkbox.value.toLowerCase());
    });

    // Define the year range for the century
    const startYear = (century - 1) * 100 + 1;
    const endYear = century * 100;

    // Filter data based on century and selected outcomes
    filteredData = allDataGlobe.filter(d => {
        const year = parseInt(d.Year);
        return year >= startYear && year <= endYear && selectedOutcomes.has(d.Outcome.toLowerCase());
    });

    // Update the globe with the filtered data
    myGlobe.pointsData(filteredData.map(d => ({
        lat: parseFloat(d.latitude),
        lng: parseFloat(d.longitude),
        label: d.NameOfIncident,
        year: d.Year,
        placeName: d.PlaceName,
        typeOfEvent: d.TypeOfEvent,
        impact: d.Impact,
        affectedPopulation: d.AffectedPopulation,
        outcome: d.Outcome
    })))
    .pointColor(d => { // Set point color based on outcome
        switch(d.outcome.toLowerCase()) {
            case 'positive':
                return '#228B22';
            case 'negative':
                return 'red';
            case 'mixed':
                return 'gold';
            case 'ongoing':
                return 'blue';
            default:
                return 'gray';
        }
    })
    .pointAltitude(0.01)
    .pointRadius(0.7)
    .onPointClick(showEventDetails) // Add click handler for showing details;
    .polygonsData([]);  // Clear polygons data

    // Clear or update the info panel whenever data is updated on the globe
    document.getElementById('infoPanel').innerHTML = `<h2><u>Event Details</u></h2>
                                                      <p>In our database we have <strong>${filteredData.length}</strong> 
                                                      event(s) for the <strong>
                                                      ${century < 0 ? `${Math.abs(century)}th BC` : `${century.toString()}th`}
                                                      </strong> century</p>
                                                      <p>Click on a point to view event details</p>`;
}

// Function to show event details in the info panel
function showEventDetails(point) {
    const infoPanel = document.getElementById('infoPanel');
    infoPanel.innerHTML = `
        <h2><u>Event Details</u></h2>
        <strong><u>Event:</u></strong> ${point.label}<br/>
        <strong><u>Year:</u></strong> ${point.year < 0 ? `${Math.abs(point.year)} BC` : point.year.toString()}<br/>
        <strong><u>Location:</u></strong> ${point.placeName}<br/>
        <strong><u>Type of Event:</u></strong> ${point.typeOfEvent}<br/>
        <strong><u>Impact:</u></strong> ${point.impact}<br/>
        <strong><u>Affected Population:</u></strong> ${point.affectedPopulation}<br/>
        <strong><u>Outcome:</u></strong> ${point.outcome}
    `;

    // Highlight the selected point
    myGlobe.pointAltitude(d => d === point ? 0.07 : 0.01);

}

// Update the globe data based on the selected century when the slider changes
document.getElementById('yearSlider').addEventListener('input', function() {
    const century = parseInt(this.value);
    document.getElementById('centuryDisplay').textContent = `${century < 0 ? `${Math.abs(century)}th BC` : `${century.toString()}th`}`;
    updateGlobeData(century);
});

// Update the globe data based on the selected outcomes when checkboxes change
document.querySelectorAll('#checkboxes input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => updateGlobeData(parseInt(document.getElementById('yearSlider').value)));
});



// Function to update the globe to show the interactive heatmap
function showHeatmap() {

    myGlobe
    .lineHoverPrecision(0)
    .polygonsData(dataHeatmap.features)
    .polygonAltitude(0.06)
    .polygonCapColor(feat => colorScale(feat.properties.Frequency))
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
    .polygonStrokeColor(() => '#111')
    .polygonLabel(({ properties: d }) => `
      <b style="color: #39FF14; text-shadow: 1px 1px 2px #000;">${d.ADMIN}:</b> <br/>
      <span style="color: #39FF14; text-shadow: 1px 1px 2px #000;"> Number of Events: ${d.Frequency}</span><br/>
    `)
    .onPolygonHover(hoverD => myGlobe
      .polygonAltitude(d => d === hoverD ? 0.12 : 0.06)
      .polygonCapColor(d => d === hoverD ? 'steelblue' : colorScale(d.properties.Frequency))
    )
    .polygonsTransitionDuration(300)
    .pointsData([]);  // Clear points data
}

// Function to update the globe to show points
function showPoints() {
    updateGlobeData(parseInt(document.getElementById('yearSlider').value)); // Re-filter and display points
}



// Function to update the info panel content based on view mode
function updateInfoPanel(mode) {

    // Getting every DOM element that needs to be updated
    const checkboxContainer = document.getElementById('checkboxes');
    const infoPanel = document.getElementById('infoPanel');
    const controls = document.getElementById('controls');
    const slider = document.getElementById('yearSlider');

    if (mode === 'points') {
        checkboxContainer.style.display = 'block'; // Show checkboxes for outcomes
        controls.style.display = 'block'; // Show slider for selecting century
        const century = parseInt(slider.value);
        // Display the number of events for the selected century
        infoPanel.innerHTML = `<h2><u>Event Details</u></h2>
                               <p>In our database we have <strong>${filteredData.length}</strong> 
                               event(s) for the <strong>
                               ${century < 0 ? `${Math.abs(century)}th BC` : `${century.toString()}th`}
                               </strong> century</p>
                               <p>Click on a point to view event details</p>`;

    } else if (mode === 'heatmap') {
        checkboxContainer.style.display = 'none'; // Hide checkboxes for outcomes
        // Display the heatmap color legend and instructions
        infoPanel.innerHTML = '<h2><u>Heatmap Color Legend</u></h2>'
            + '<div id="legend"></div>'
            + '<p>Hover over a country to view the number of events</p>';
        
        // Create SVG for the legend
        const svgLegend = d3.select('#legend').append('svg')
        .attr('width', 100)  
        .attr('height', 300) 
        .style('background', 'none')  
        .style('overflow', 'visible');

        // Create a vertical linear gradient for the color scale
        const linearGradient = svgLegend.append('defs')
            .append('linearGradient')
            .attr('id', 'linear-gradient')
            .attr('x1', '0%')
            .attr('x2', '0%')
            .attr('y1', '100%')
            .attr('y2', '0%'); // Coordinates flipped for vertical gradient

        // Create a color range with 10 stops
        const numStops = 10;
        const colorRange = d3.range(0, 1, 1.0 / (numStops - 1)).map(d => colorScale(d*50));

        // Add color stops to the gradient
        linearGradient.selectAll('stop')
            .data(colorRange)
            .enter().append('stop')
            .attr('offset', (d, i) => i / (numStops - 1))
            .attr('stop-color', d => d);

        // Add color bar with rounded ends (stadium shape)
        svgLegend.append('rect')
            .attr('x', 20)  
            .attr('y', 0)  
            .attr('width', 50) 
            .attr('height', 300)  
            .attr('rx', 30)  // Radius for x-axis to create rounded corners
            .attr('ry', 30)  // Radius for y-axis to create rounded corners
            .style('fill', 'url(#linear-gradient)');

        // Add text labels for min and max of the color scale
        svgLegend.append('text')
            .attr('x', 38)  
            .attr('y', 325)  
            .style('text-anchor', 'start')
            .text(`${colorScale.domain()[0]}`);

        svgLegend.append('text')
            .attr('x', 33)  
            .attr('y', -15)  
            .style('text-anchor', 'start')
            .text(`${colorScale.domain()[1]}`);

        controls.style.display = 'none'; // Hide slider for selecting century
    }
}

// Function to update the globe based on the selected view mode
const globe_buttons = d3.selectAll("#globe_section .stadium-button");

globe_buttons.on("click", function() {

    globe_buttons.classed("clicked", false);
    d3.select(this).classed("clicked", true);
    let value = d3.select(this).text();

    if (value === "Points") {
        showPoints();
        updateInfoPanel('points');
    } else if (value === "Heatmap") {
        showHeatmap();
        updateInfoPanel('heatmap');
    }
});


//Code to enable zooming into the globe when the mouse is over the globe container
const globeElement = document.getElementById('globe');

// Disable fullPage.js auto-scrolling when the mouse enters the globe container
globeElement.addEventListener('mouseenter', function() {
    fullpage_api.setAllowScrolling(false);
    fullpage_api.setKeyboardScrolling(false);
});

// Re-enable fullPage.js auto-scrolling when the mouse leaves the globe container
globeElement.addEventListener('mouseleave', function() {
    fullpage_api.setAllowScrolling(true);
    fullpage_api.setKeyboardScrolling(true);
});
