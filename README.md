# velocity-raptor-js
A lightweight framework for modular website development for single page applications (SPA) that allows for the developers to use remotely hosted components (plugins). The primary focus is to create a framework that does not need to be "compiled" or hacked into working: velocity-raptor-js is intended to work out of the box with no intermediary steps.

## External dependencies (for now)
- dustjs
- jquery

## How does it work?

Simply add the following scripts in your website header:

### Javascript Includes
```html
<script src="js/velocity-raptor-app.js"></script>
<script src="js/velocity-raptor-loader.js"></script>
```

### Framework Initialization
```javascript
var app = new App();

$(document).ready(function () {
    var components = [
        { key:'navbar', tag: 'x-navbar', templateUrl: 'partials/navbar.html', eagerLoad: true, dataUrl: null },
        { key:'custom_component', targetElement: "#custom-component", templateUrl: 'partials/custom.html', eagerLoad: true, dataUrl: null },
        { key:'maptest', tag: 'x-maptest', templateUrl: 'partials/maptest.html', eagerLoad: false, dataUrl: null, 
            scripts : [
                    {url: 'http://code.highcharts.com/maps/highmaps.js', postLoad: false, unload: false},
                    {url: 'http://code.highcharts.com/mapdata/countries/us/us-all.js', postLoad: false, unload: false},
                    {url: 'partials/maptest.js', postLoad: true, unload: true}
                ] 
        }
    ];                    

    app.onInit = function () {
       console.log('app.onInit = function() called');
       app.load([
            'navbar',
            'custom_compnent',
            'maptest'
            ]);
        console.log('app.load([]) = function() called');
    };

    app.onLoaded = function () { 
        applyJsBehaviors(); // apply templateJsBehaviors   
        console.log('app.onLoaded = function() called');
    }; 

    app.onPreLoad = function(){
        applyJsBehaviors(); // apply templateJsBehaviors   
        console.log('app.onPreLoad = function() called');
    }

    app.onUnloaded = function(){
        //applyJsBehaviors(); // apply templateJsBehaviors   
        console.log('app.onUnloaded = function() called');
    }

    // convert json data array into component objects
    var bootstrapper = new Bootstrapper(components);
    bootstrapper.init(app);
});
```

### HTML References
You can use custom tags or specify by element name. Examples to follow.

```html
<body>
    <x-navbar></x-navbar>
    <x-map></x-map>
    <div id="custom-component"></div>
</body>
