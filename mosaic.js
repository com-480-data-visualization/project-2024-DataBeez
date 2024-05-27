const PACKING_ELEMENT_ID = "bubble_zoom";
const PACKING_TEXT_ELEMENT_ID = "circle-packing-text";

const LIGHT_BLUE_COLOR = '#cceeff'; // Light blue color to match the background
const GREEN_COLOR = '#2e5d52';
const BLACK_COLOR = '#000000';

const CIRCLE_PADDING = 10;

const MIN_FONT_SIZE = 5;
const MAX_FONT_SIZE = 50;

const DEFAULT_PACKING_TEXT = 'Click on each circle to zoom in and explore the different types of events.';
const PACKING_TEXT = {
    // Add relevant text descriptions here
};

const width = 1000; // Adjust the width for better centering
const height = 800; // Adjust the height for better centering

d3.csv('data/modified_data.csv').then(function(data) {
    const filteredData = data.filter(d => d.Outcome !== "Ongoing" && d['Broad Category'] !== "unknown");
    const root = d3.hierarchy({ children: groupData(filteredData) })
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    initPacking(root);
});

function groupData(data) {
    const groupedData = d3.group(data, d => d.Outcome);
    return Array.from(groupedData, ([outcome, values]) => ({
        name: outcome,
        children: Array.from(d3.group(values, d => d.Continent), ([continent, values]) => ({
            name: continent,
            children: Array.from(d3.group(values, d => d['Broad Category']), ([category, values]) => ({
                name: category,
                value: values.length
            }))
        }))
    }));
}

function initPacking(root) {
    const pack = d3.pack()
        .size([width, height])
        .padding(CIRCLE_PADDING);

    const nodes = pack(root).descendants();
    let focus = root;

    const colorScale = d3.scaleLinear()
        .domain([0, 2])
        .range([LIGHT_BLUE_COLOR, GREEN_COLOR]);

    const fontSizeScale = d3.scaleSqrt()
        .domain([d3.min(nodes, d => d.r), d3.max(nodes, d => d.r)])
        .range([MIN_FONT_SIZE, MAX_FONT_SIZE]);

    const svg = d3.select(`#${PACKING_ELEMENT_ID}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`) // Adjust the viewBox for better centering
        .attr("preserveAspectRatio", "xMidYMid meet") // Ensure the SVG is centered
        .style("display", "block")
        .style("background", colorScale(0))
        .style("cursor", "pointer")
        .on("click", (event) => zoom(event, root));

    const node = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`) // Center the group within the SVG
        .selectAll("circle")
        .data(nodes.slice(1))
        .join("circle")
        .attr("fill", d => d.children ? colorScale(d.depth) : LIGHT_BLUE_COLOR)
        .attr("pointer-events", d => !d.children ? "none" : null)
        .on("mouseover", function() { d3.select(this).attr("stroke", BLACK_COLOR); })
        .on("mouseout", function() { d3.select(this).attr("stroke", null); })
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

    const label = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`) // Center the group within the SVG
        .style("font-family", "'Comic Sans MS', 'Comic Sans', 'Chalkboard', 'Marker Felt', sans-serif") // Bubbly and fat font
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("dy", "0.3em")
        .style("font-size", d => `${Math.min(2 * d.r / 3, (2 * d.r - 8) / getTextWidth(d.data.name, `${d.r}px 'Comic Sans MS', 'Comic Sans', 'Chalkboard', 'Marker Felt', sans-serif`))}px`) // Adjust font size to fit within bubbles
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(d => d.data.name);

    let view;
    const zoomTo = (v) => {
        const k = Math.min(width, height) / v[2];

        view = v;

        label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("r", d => d.r * k);
    };

    zoomTo([root.x, root.y, root.r * 2]);

    function zoom(event, d) {
        const packingText = document.getElementById(PACKING_TEXT_ELEMENT_ID);
        if (packingText) {
            const p = packingText.getElementsByTagName("p")[0];
            const packingStr = PACKING_TEXT[d.data.name] || DEFAULT_PACKING_TEXT;
            p.innerHTML = packingStr;
        }

        focus = d;

        const transition = svg.transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", () => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return t => zoomTo(i(t));
            });

        label
            .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .transition(transition)
            .style("fill-opacity", d => d.parent === focus ? 1 : 0)
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
    }
}

// Utility function to measure text width
function getTextWidth(text, font) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}

















