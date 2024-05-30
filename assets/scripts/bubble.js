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
export function loadData() {
    d3.csv('data/modified_data.csv').then(function(data) {
        allData = data;
        updateChart('Africa'); // Default to Africa on load
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
    // Set up the SVG container
    const bubbleChartWidth = 800;  // Renamed from width to bubbleChartWidth
    const bubbleChartHeight = 600; // Renamed from height to bubbleChartHeight
    d3.select('#type_event_continent').selectAll('*').remove(); // Clear previous chart
    const svg = d3.select('#type_event_continent').append('svg')
        .attr('width', bubbleChartWidth)
        .attr('height', bubbleChartHeight);

    // Set up the simulation with forces to make bubbles collide
    const scale = d3.scaleSqrt()
        .domain([0, d3.max(dataArray, d => d.value)])
        .range([30, 100]); // Radius range for bubbles

    const simulation = d3.forceSimulation(dataArray)
        .force('charge', d3.forceManyBody().strength(15))
        .force('center', d3.forceCenter(bubbleChartWidth / 2, bubbleChartHeight / 2))
        .force('collision', d3.forceCollide().radius(d => scale(d.value) + 2));

    // Draw the bubbles
    const node = svg.selectAll('g')
        .data(dataArray)
        .enter().append('g')
        .attr('transform', `translate(${bubbleChartWidth / 2}, ${bubbleChartHeight / 2})`); // Center the bubbles

    node.append('circle')
        .attr('r', d => scale(d.value))
        .attr('fill', d => colorMapping[d.category] || '#d3d3d3');  // Use color mapping or default color

    // Add text to the bubbles
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
    
    // Update the bubbles on each tick
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

// Function to update the chart based on selected continent
const buttons_bubble = d3.selectAll('#type_of_events .stadium-button');
buttons_bubble.on('click', function() {
    buttons_bubble.classed('clicked', false);
    d3.select(this).classed('clicked', true);
    let value = d3.select(this).text();
    updateChart(value);
});


