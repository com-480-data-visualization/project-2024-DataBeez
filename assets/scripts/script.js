// Initialize global variable to store all data
let allData = [];

// Define a color mapping for event categories
const colorMapping = {
    "Political Events": "#1f77b4",
    "Military and Conflict": "#ff7f0e",
    "Social and Cultural Events": "#2ca02c",
    "Economic and Infrastructure Development": "#d62728",
    "Technological and Scientific Advancements": "#9467bd",
    "Environmental and Health": "#8c564b",
    "Crisis and Emergency Response": "#e377c2",
    "International Relations and Diplomacy": "#7f7f7f",
    "Legal and Judicial Changes": "#bcbd22",
    "Historical and Monumental": "#17becf",
    "Other": "#c49c94"
};

// Function to load and store data
function loadData() {
    d3.csv('data/modified_data.csv').then(function(data) {
        allData = data;
        updateChart('Africa'); // Default to Africa on load
        updateImpactChart('Africa'); // Default to Africa on load
    });
}

// Function to update the chart based on selected continent
function updateChart(continent) {
    const filteredData = allData.filter(d => d.Continent === continent);
    const aggregatedData = d3.rollup(filteredData, v => v.length, d => d['Broad Category']);
    const dataArray = Array.from(aggregatedData, ([category, value]) => ({ category, value }));
    drawBubbleChart(dataArray);
}

// Function to draw the bubble chart
function drawBubbleChart(dataArray) {
    const width = 800;
    const height = 600;
    d3.select('#type_event_continent').selectAll('*').remove(); // Clear previous chart
    const svg = d3.select('#type_event_continent').append('svg')
        .attr('width', width)
        .attr('height', height);

    const scale = d3.scaleSqrt()
        .domain([0, d3.max(dataArray, d => d.value)])
        .range([30, 100]);  // Adjust range based on your visual design needs

    const simulation = d3.forceSimulation(dataArray)
        .force('charge', d3.forceManyBody().strength(15))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => scale(d.value) + 2));

    const node = svg.selectAll('g')
        .data(dataArray)
        .enter().append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    node.append('circle')
        .attr('r', d => scale(d.value))
        .attr('fill', d => colorMapping[d.category] || '#d3d3d3');  // Use color mapping or default color

    node.append('text')
        .style('fill', '#ffffff')
        .style('font-size', d => `${scale(d.value) / 5}px`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .each(function(d) {
            var lines = wrapText(d.category, scale(d.value) * 1.5, `${scale(d.value) / 5}px sans-serif`);
            for (var i = 0; i < lines.length; i++) {
                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('dy', i ? '1.2em' : 0)
                    .text(lines[i]);
            }
            d3.select(this).append('tspan')
                .attr('x', 0)
                .attr('dy', '1.2em')
                .attr('font-weight', 'bold')
                .text(d.value);
        });

    simulation.on('tick', () => {
        node.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
}

// Function to wrap text within bubbles
function wrapText(text, width, font) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = [];
    let lineWidth = 0;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = line.concat(word).join(' ');
        const testLineWidth = getTextWidth(testLine, font);
        if (testLineWidth > width && i > 0) {
            lines.push(line.join(' '));
            line = [word];
        } else {
            line = testLine.split(' ');
        }
    }
    lines.push(line.join(' '));
    return lines;
}

// Function to get text width
function getTextWidth(text, font) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}

// Configuring FullPage.js
new fullpage('#fullpage', {
    autoScrolling: true,
    navigation: true,
    licenseKey: 'gplv3-license',
    afterRender: function() {
        loadData(); // Load data and draw the chart
    }
});

// Select all buttons with the class "stadium-button"
const buttons = d3.selectAll(".stadium-button");

// Add click event listener to each button
buttons.on("click", function() {
    // Remove "clicked" class from all buttons to ensure one button is clicked at a time
    buttons.classed("clicked", false);
    
    // Add "clicked" class to the clicked button
    d3.select(this).classed("clicked", true);
    
    // Get the value of the clicked button
    let value = d3.select(this).text();

    // // Update the charts based on the selected continent
    // updateChart(value);
    // updateImpactChart(value);

    // Select the image element
    const img = d3.select('#map');

    // Change the image source based on the value of the clicked button
    if (value === "Points") {
        img.attr("src", "img/points_map.jpg");
    } else if (value === "Heatmap") {
        img.attr("src", "img/heatmap_map.jpg");
    }
});

const myGlobe = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
  .width(850)
  .height(600)
  .pointAltitude(0.01)
  .pointRadius(0.5)
  .onPointClick(showEventDetails);  // Add click handler for showing details

let allDataGlobe = [];

fetch('data/World Important Dates with Coordinates.csv')
  .then(response => response.text())
  .then(csv => d3.csvParse(csv))
  .then(data => {
    allDataGlobe = data;
    updateGlobeData(21);  // Initialize with data from the 21th century
  });

document.getElementById('yearSlider').addEventListener('input', function() {
    const century = parseInt(this.value);
    document.getElementById('centuryDisplay').textContent = `${century}th`;
    updateGlobeData(century);
});

function updateGlobeData(century) {
    const startYear = (century - 1) * 100 + 1;
    const endYear = century * 100;
    const filteredData = allDataGlobe.filter(d => {
        const year = parseInt(d.Year);
        return year >= startYear && year <= endYear;
    });
    myGlobe.pointsData(filteredData.map(({ latitude, longitude, NameOfIncident, Year, PlaceName, TypeOfEvent, Impact, AffectedPopulation, Outcome }) => ({
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        label: NameOfIncident,
        year: Year,
        placeName: PlaceName,
        typeOfEvent: TypeOfEvent,
        impact: Impact,
        affectedPopulation: AffectedPopulation,
        outcome: Outcome // Ensure this is correctly parsed and matches your expected values
      })))
      .pointColor(d => {
        switch(d.outcome.toLowerCase()) { // Use toLowerCase() to avoid case sensitivity issues
          case 'positive':
            return 'green';
          case 'negative':
            return 'red';
          case 'mixed':
            return 'gold';
          case 'ongoing':
            return 'blue';
          default:
            return 'gray'; // Default color if none of the categories match
        }
      });
      document.getElementById('infoPanel').innerHTML = '<h2><u>Event Details</u></h2>';
}

function showEventDetails(point) {
    const infoPanel = document.getElementById('infoPanel');
    infoPanel.innerHTML = `
        <h2><u>Event Details</u></h2>
        <strong><u>Event:</u></strong> ${point.label}<br/>
        <strong><u>Year:</u></strong> ${point.year}<br/>
        <strong><u>Location:</u></strong> ${point.placeName}<br/>
        <strong><u>Type of Event:</u></strong> ${point.typeOfEvent}<br/>
        <strong><u>Impact:</u></strong> ${point.impact}<br/>
        <strong><u>Affected Population:</u></strong> ${point.affectedPopulation}<br/>
        <strong><u>Outcome:</u></strong> ${point.outcome}
    `;
    myGlobe.pointAltitude(d => d === point ? 0.1 : 0.01);

}

const globeElement = document.getElementById('globeViz');

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

