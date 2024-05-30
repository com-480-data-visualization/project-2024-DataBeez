// Define the colors for different event types
const eventColors = {
    'Positive': 'green',
    'Negative': 'red',
    'Mixed': 'yellow'
};

// Load the CSV file
d3.csv('data/modified_data.csv').then(function(data) {
    // Filter out invalid data and future years
    data = data.filter(d => {
        const year = parseInt(d.Year);
        return year && year <=  2023 && year >= 700;
    });

    // Get the minimum and maximum years from the data
    const years = data.map(d => parseInt(d.Year));
    const minYear = d3.min(years);
    const maxYear = 2023;

    // Set the slider's min and max values based on the data range
    const slider = document.getElementById('yearRangeSlider');
    slider.min = minYear;
    slider.max = maxYear;
    slider.value = maxYear;
    document.getElementById('rangeDisplay').innerText = `${maxYear - 100} - ${maxYear}`;

    // Aggregate data by year and count the occurrences of each type
    const countsByYear = d3.rollups(data, v => v.length, d => d.Year, d => d.Outcome);

    // Transform the data into a structure suitable for visualization
    const yearData = countsByYear.map(([year, outcomes]) => {
        const yearObj = { year: parseInt(year) };
        outcomes.forEach(([outcome, count]) => {
            yearObj[outcome] = count;
        });
        return yearObj;
    });

    // Sort data by year to ensure correct plotting
    yearData.sort((a, b) => a.year - b.year);

    // Set up the SVG
    const svg = d3.select("#impact_analysis").attr("width", 600).attr("height", 400);
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the scales
    let x = d3.scaleLinear().domain([maxYear - 100, maxYear]).range([0, width]);
    let y = d3.scaleLinear().domain([0, d3.max(yearData, d => Math.max(d.Positive || 0, d.Negative || 0, d.Mixed || 0))]).range([height, 0]);

    // Draw axes
    const xAxis = g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
    const yAxis = g.append("g").call(d3.axisLeft(y));

    // Function to draw lines
    function drawLines(data) {
        const lineGenerator = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        Object.keys(eventColors).forEach(type => {
            const filteredData = data.map(d => ({ year: d.year, value: d[type] || 0 }));
            g.selectAll(`.line-${type}`)
                .data([filteredData])
                .join(
                    enter => enter.append("path")
                        .attr("class", `line-${type}`)
                        .attr("d", lineGenerator)
                        .attr("stroke", eventColors[type])
                        .attr("fill", "none"),
                    update => update.attr("d", lineGenerator),
                    exit => exit.remove()
                );
        });
    }

    // Initial draw
    drawLines(yearData);

    // Slider event listener
    slider.addEventListener('input', function() {
        const maxYear = +this.value;
        const minYear = maxYear - 100;
        x.domain([minYear, maxYear]);
        xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));
        const filteredData = yearData.filter(d => d.year >= minYear && d.year <= maxYear);
        drawLines(filteredData);
        document.getElementById('rangeDisplay').innerText = `${minYear} - ${maxYear}`;
    });
}).catch(function(error) {
    console.error("Error loading or processing data:", error);
});


