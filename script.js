//Configuring FullPage.js
new fullpage('#fullpage', {
    autoScrolling: true,
    navigation: true,
    licenseKey: 'gplv3-license',
    slideNavigation: true,
    navigationTooltips: ['Home', 'About', 'Projects', 'Contact'],
});

// Select all buttons with the class "stadium-button"
const buttons = d3.selectAll(".stadium-button");

// Add click event listener to each button
buttons.on("click", function() {
    // Remove "clicked" class from all buttons to ensure one button is clicked at a time
    buttons.classed("clicked", false);
    
    // Add "clicked" class to the clicked button
    d3.select(this).classed("clicked", true);
    
    let value = d3.select(this).text();
    console.log("Button value:", value);
});

// Get the slider element
const slider = d3.select("sliderMap");

// Output the current value when the slider value changes
slider.oninput = function() {
    console.log(this.value);
};