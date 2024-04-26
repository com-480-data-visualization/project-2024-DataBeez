//Configuring FullPage.js
new fullpage('#fullpage', {
    autoScrolling: true,
    navigation: true,
    licenseKey: 'gplv3-license',
    sectionsColor: ['#f2f2f2', '#ffcbc4', '#ffcbc4', '#c4d9ff', '#c4d9ff', '#c5ffc4', '#c5ffc4', '#ddc4ff', '#ddc4ff', '#f2f2f2'], 
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

    // Select the image element
    const img = d3.select('#map');

    // Change the image source based on the value of the clicked button
    if (value === "Points") {
        img.attr("src", "img/points_map.jpg");
    }
    else if (value === "Heatmap") {
        img.attr("src", "img/heatmap_map.jpg");
    }
});

// Get the slider element
const slider = d3.select("sliderMap");

// Output the current value when the slider value changes
slider.oninput = function() {
    console.log(this.value);
};
