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


