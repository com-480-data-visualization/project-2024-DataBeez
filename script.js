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

    // simulation.on('tick', () => {
    //     node.attr('transform', d => `translate(${d.x}, ${d.y})`);
    // });
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
    sectionsColor: ['#f2f2f2', '#ffcbc4', '#ffcbc4', '#c4d9ff', '#c4d9ff', '#c5ffc4', '#c5ffc4', '#ddc4ff', '#ddc4ff', '#f2f2f2'],
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

    // Update the charts based on the selected continent
    updateChart(value);
    updateImpactChart(value);

    // Select the image element
    const img = d3.select('#map');

    // Change the image source based on the value of the clicked button
    if (value === "Points") {
        img.attr("src", "img/points_map.jpg");
    } else if (value === "Heatmap") {
        img.attr("src", "img/heatmap_map.jpg");
    }
});
