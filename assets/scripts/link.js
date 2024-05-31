document.addEventListener('DOMContentLoaded', function() {
    refreshGraph('Africa');
});

const width = 800;
const height = 600;
const radius = 200; // Adjusted radius of the circle

// Define categories with positions and colors from colorMapping, including short names
const categories = [
    { name: 'Economic and Infrastructure Development', color: '#d62728', shortName: 'Econ & Infra' },
    { name: 'International Relations and Diplomacy', color: '#7f7f7f', shortName: 'Intl Relations' },
    { name: 'Technological and Scientific Advancements', color: '#9467bd', shortName: 'Tech & Sci' },
    { name: 'Crisis and Emergency Response', color: '#e377c2', shortName: 'Crisis & Response' },
    { name: 'Environmental and Health', color: '#8c564b', shortName: 'Env & Health' },
    { name: 'Military and Conflict', color: '#ff7f0e', shortName: 'Military & Conflict' },
    { name: 'Political Events', color: '#1f77b4', shortName: 'Political' },
    { name: 'Social and Cultural Events', color: '#2ca02c', shortName: 'Social & Cultural' },
    { name: 'Social and Civil Rights', color: '#bcbd22', shortName: 'Civil Rights' },
    { name: 'Legal and Judicial Changes', color: '#bcbd22', shortName: 'Legal & Judicial' },
    { name: 'Historical and Monumental', color: '#17becf', shortName: 'Historical' }
];

// Calculate positions for categories
categories.forEach((category, index) => {
    const angle = (index / categories.length) * 2 * Math.PI;
    category.x = width / 2 + radius * Math.cos(angle);
    category.y = height / 2 + radius * Math.sin(angle);
});

function refreshGraph(continent) {
    d3.csv('data/processed_graph_data.csv').then(function(data) {
        // Filter data for the right continent
        console.log(continent);
        const filteredData = data.filter(d => d.Continent === continent);

        // Process events data
        const events = filteredData.map(event => {
            let parsedCategories;
            try {
                parsedCategories = JSON.parse(event['Representative Categories'].replace(/'/g, '"'));
            } catch (e) {
                console.error("Error parsing categories for event:", event, e);
                parsedCategories = [];
            }

            // Strip whitespace and ensure case consistency
            parsedCategories = parsedCategories.map(cat => cat.trim());

            const description = `
                <strong>Name:</strong> ${event['Name of Incident']}<br>
                <strong>Date:</strong> ${event['Date']} ${event['Month']} ${event['Year']}<br>
                <strong>Impact:</strong> ${event['Impact']}<br>
                <strong>Affected Population:</strong> ${event['Affected Population']}
            `;

            // Log matching process
            const categoryCoords = parsedCategories.map(cat => {
                const matchedCategory = categories.find(c => c.name === cat);
                if (!matchedCategory) {
                    console.warn(`Category ${cat} not found in predefined categories`);
                }
                return matchedCategory;
            }).filter(c => c);

            if (categoryCoords.length === 0) {
                console.warn("No valid categories found for event:", event);
                return null;
            }

            const x = d3.mean(categoryCoords, c => c.x);
            const y = d3.mean(categoryCoords, c => c.y);
            return {
                name: event['Name of Incident'],
                description: description,
                x: x,
                y: y,
                categories: categoryCoords
            };
        }).filter(event => event !== null);

        drawChart(events);
    }).catch(function(error) {
        console.error("Error loading the CSV data:", error);
    });
}

function drawChart(events) {

    // Clear previous chart
    d3.select('#link-viz').selectAll('*').remove();

    // Create SVG container
    const svg = d3.select('#link-viz').append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create category circles
    const categoryGroup = svg.selectAll('g.category')
        .data(categories)
        .enter()
        .append('g')
        .attr('class', 'category')
        .attr('transform', d => `translate(${d.x}, ${d.y})`);

    categoryGroup.append('circle')
        .attr('r', 50)
        .attr('fill', d => d.color);

    categoryGroup.append('text')
        .attr('font-size', '14px') // Increased font size
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('dx', d => {
            const centerX = width / 2;
            const offsetX = d.x - centerX;
            return offsetX * 0.5; // Adjust the multiplier to control the distance
        })
        .attr('dy', d => {
            const centerY = height / 2;
            const offsetY = d.y - centerY;
            return offsetY * 0.35; // Adjust the multiplier to control the distance
        })
        .text(d => d.shortName);

    // Create force simulation with central anchor
    const simulation = d3.forceSimulation(events)
        .force('center', d3.forceCenter(width / 2, height / 2).strength(0.5)) // Increased central anchor strength
        .force('collision', d3.forceCollide().radius(6)) // Smaller radius for closer events
        .force('x', d3.forceX(d => d3.mean(d.categories.map(cat => cat.x))).strength(0.2)) // Increased attraction to categories
        .force('y', d3.forceY(d => d3.mean(d.categories.map(cat => cat.y))).strength(0.2)) // Increased attraction to categories
        .on('tick', ticked);

    // Create event dots
    const eventGroup = svg.selectAll('circle.event')
        .data(events)
        .enter()
        .append('circle')
        .attr('class', 'event')
        .attr('r', 5) // Reduced size of event circles
        .attr('fill', 'gray')
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded)
        );

    // Create edges (initially hidden)
    const linkGroup = svg.append('g').selectAll('line')
        .data(events.flatMap(event => event.categories.map(category => ({ event, category }))))
        .enter()
        .append('line')
        .attr('class', 'edge')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .style('visibility', 'hidden');

    // Add hover interaction to show descriptions
    const tooltip = d3.select('body').append('div')
        .attr('id', 'tooltip')
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('width', 'auto')
        .style('height', 'auto')
        .style('padding', '10px') // Increased padding for better visibility
        .style('font', '14px sans-serif') // Increased font size
        .style('font-weight', 'bold') // Bold text
        .style('background', 'lightsteelblue')
        .style('border', '1px solid #000')
        .style('border-radius', '8px')
        .style('pointer-events', 'none')
        .style('opacity', 0);

    eventGroup.on('mouseover', function(event, d) {
        // Show tooltip
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(d.description)
            .style('left', (event.pageX + 10) + 'px') // Adjusted position for better visibility
            .style('top', (event.pageY - 40) + 'px'); // Adjusted position for better visibility

        // Show edges
        linkGroup
            .filter(edge => edge.event === d)
            .style('visibility', 'visible');
    });

    eventGroup.on('mouseout', function() {
        // Hide tooltip
        tooltip.transition().duration(500).style('opacity', 0);

        // Hide edges
        linkGroup.style('visibility', 'hidden');
    });

    // Update positions on each tick
    function ticked() {
        eventGroup
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

        linkGroup
            .attr('x1', d => d.event.x)
            .attr('y1', d => d.event.y)
            .attr('x2', d => d.category.x)
            .attr('y2', d => d.category.y);
    }

    // Drag event handlers
    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

const buttons_bubble = d3.selectAll('#link_analysis .stadium-button');
buttons_bubble.on('click', function() {
    buttons_bubble.classed('clicked', false);
    d3.select(this).classed('clicked', true);
    let value = d3.select(this).text();
    refreshGraph(value);
});