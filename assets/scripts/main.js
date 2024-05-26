import {loadData} from './bubble.js';

// Configuring FullPage.js
new fullpage('#fullpage', {
    autoScrolling: true,
    navigation: true,
    licenseKey: 'gplv3-license',
    afterRender: function() {
        loadData(); // Load data and draw the bubble chart on page load
    }
});


// Select all buttons with the class "stadium-button"
// const buttons = d3.selectAll(".stadium-button");

// // Add click event listener to each button
// buttons.on("click", function() {
//     // Remove "clicked" class from all buttons to ensure one button is clicked at a time
//     buttons.classed("clicked", false);
    
//     // Add "clicked" class to the clicked button
//     d3.select(this).classed("clicked", true);
    
//     // Get the value of the clicked button
//     let value = d3.select(this).text();

//     // // Update the charts based on the selected continent
//     // updateChart(value);
//     // updateImpactChart(value);

//     // Select the image element
//     const img = d3.select('#map');

//     // Change the image source based on the value of the clicked button
//     if (value === "Points") {
//         img.attr("src", "img/points_map.jpg");
//     } else if (value === "Heatmap") {
//         img.attr("src", "img/heatmap_map.jpg");
//     }
// });



