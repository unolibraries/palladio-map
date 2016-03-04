var app = angular.module('palladioEmbedApp', [])
  .controller('EmbedCtrl', ['$scope', function($scope) {
    var components = startPalladio();
    var loadPromise = undefined;
    
    $scope.file = undefined;
    $scope.visualizations = [];
    
    $scope.addVisualization = function(visualization) {
      console.log("Adding");
      console.log(visualization);
      
      // Remove the visualization from the available list
      $scope.visualizations.splice($scope.visualizations.indexOf(visualization), 1);
      
      loadPromise.then(function() {
        switch(visualization.type) {
          case 'timeline':
            loadTimeline(visualization);
            break;
          case 'mapView':
            loadMap(visualization);
            break;
          case 'graphView':
            loadGraph(visualization);
            break;
          case 'facet':
            loadFacet(visualization);
            break;
        }
      });
    }
    
    function loadTimeline(visualization) {
      var newId = appendNewDivWithID(visualization);
      
      var timeline = components.add('timeline', newId, {
        showControls: false,
        showSettings: false,
        showAccordion: false,
        height: 300
      });
      
      var timelineFunc = function () {
        timeline.getOptions().date(components.dimensions().filter(function(d) {
          return d.key === visualization.importJson.dateProp;
        })[0]);
        
        timeline.getOptions().group(components.dimensions().filter(function(d) {
          return d.key === visualization.importJson.groupProp;
        })[0]);
      };
      window.setTimeout(timelineFunc);
    }
    
    function loadMap(visualization) {
      var newId = appendNewDivWithID(visualization);
      
      var map = components.add('map', newId, {
        height: "300px",
        showSettings: false
      });
      
      window.setTimeout(function() { map.getOptions().importState(visualization.importJson)});
    }
    
    function loadGraph(visualization) {
      var newId = appendNewDivWithID(visualization);
      
      var graph = components.add('graph', newId, {
        height: "300px",
        showSettings: false
      });
      
      window.setTimeout(function() {
        var graphOpts = graph.getOptions();
        graphOpts.source(components.dimensions().filter(function(d) {
          return d.key === visualization.importJson.sourceDimension; })[0]);
        graphOpts.target(components.dimensions().filter(function(d) {
          return d.key === visualization.importJson.targetDimension; })[0]);
        graphOpts.nodeSize(visualization.importJson.nodeSize);
      });
    }
    
    function loadFacet(visualization) {
      var newId = appendNewDivWithID(visualization);
      components.add('facet', newId, {
        height: "300px",
        showControls: false,
        showSettings: false,
        showAccordion: false,
        showDropArea: false,
        dimensions: components.dimensions()
          .filter(function(d) { return visualization.importJson.dimKeys.indexOf(d.key) !== -1; })
      });
    }
    
    function appendNewDivWithID(visualization) {
      var newDiv = document.createElement('div');
      var newId = visualization.type + Math.round(Math.random()*10000);
      newDiv.setAttribute('id', newId)
      document.getElementById('components').appendChild(newDiv)
      newId = "#" + newId;
      return newId;
    }
    
    $scope.triggerDataModelSelector = function () {
      $('#dataModelSelector').click();
    };
    
    $scope.loadDataModel = function(input) {
      var reader = new FileReader();
      reader.onload = function() {
        $scope.$apply(function(s) {
          s.file = JSON.parse(reader.result);
          
          loadPromise = components.loadJson(s.file);
          
          // Transform into individual component visualizations
          var filters = s.file.vis.filter(function(v) { return v.type === "palladioFilters"; })[0];
          filters.importJson.facets.forEach(function(f) {
            s.visualizations.push({type: "facet", description: "Facet Filter", importJson: f});
          });
          filters.importJson.timelines.forEach(function(f) {
            s.visualizations.push({type: "timeline", description: "Timeline", importJson: f});
          });
          filters.importJson.partimes.forEach(function(f) {
            s.visualizations.push({type: "partime", description: "Timespan", importJson: f});
          });
          
          var mapView = s.file.vis.filter(function(v) { return v.type === "mapView"; })[0];
          mapView.description = "Map";
          s.visualizations.push(mapView);
          
          var graphView = s.file.vis.filter(function(v) { return v.type === "graphView"; })[0];
          graphView.description = "Graph";
          s.visualizations.push(graphView);
        });
      };
      reader.readAsText(input.files[0]);
      // We need to clear the input so that we pick up future uploads. This is *not*
      // cross-browser-compatible.
      input.value = null;
    };
    
    $scope.startOver = function () {
      document.location.reload(true);
    }
  }]);