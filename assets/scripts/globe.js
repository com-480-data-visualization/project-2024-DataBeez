
// Initialize the globe with default settings
const myGlobe = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
  .width(850)
  .height(600)
  .pointAltitude(0.01)
  .pointRadius(0.5)
  .onPointClick(showEventDetails);  // Add click handler for showing details

// Load data from CSV file and update the globe
let allDataGlobe = [];
fetch('data/World Important Dates with Coordinates.csv')
  .then(response => response.text())
  .then(csv => d3.csvParse(csv))
  .then(data => {
    allDataGlobe = data;
    updateGlobeData(21);  // Initialize with data from the 21th century
  });

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
    const filteredData = allDataGlobe.filter(d => {
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
                return 'green';
            case 'negative':
                return 'red';
            case 'mixed':
                return 'gold';
            case 'ongoing':
                return 'blue';
            default:
                return 'gray';
        }
    });

    // Clear or update the info panel whenever data is updated on the globe
    document.getElementById('infoPanel').innerHTML = '<h2><u>Event Details</u></h2>';
}

// Function to show event details in the info panel
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

    // Highlight the selected point
    myGlobe.pointAltitude(d => d === point ? 0.07 : 0.01);

}

//Code to enable zooming into the globe when the mouse is over the globe container
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

// Update the globe data based on the selected century when the slider changes
document.getElementById('yearSlider').addEventListener('input', function() {
    const century = parseInt(this.value);
    document.getElementById('centuryDisplay').textContent = `${century}th`;
    updateGlobeData(century);
});

// Update the globe data based on the selected outcomes when checkboxes change
document.querySelectorAll('#checkboxes input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => updateGlobeData(parseInt(document.getElementById('yearSlider').value)));
});