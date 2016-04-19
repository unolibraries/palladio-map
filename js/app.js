var app = angular.module('palladioEmbedApp', ['ui.codemirror'])
  .controller('EmbedCtrl', ['$scope', function($scope) {
    var components = startPalladio(['palladioTimelineComponent', 'palladioFacetComponent', 'palladioTimespanComponent', 'palladioGraphComponent', 'palladioMapComponent']);
    var loadPromise = undefined;
    
    $scope.file = undefined;
    $scope.visualizations = [];
    
    $scope.embedCode = [
      '<meta charset="utf-8">',
      '<link type="text/css" href="bower_components/palladio/palladio.css" rel="stylesheet" />',
      '<link href="http://netdna.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.css" rel="stylesheet">',
      '<script src="bower_components/palladio/palladio.js"></script>',
      '<script>',
      "var components = startPalladio();",
      "components.loadData('url-for-your-file.json', function() {",
      "});",
      '</script>'];
    $scope.embedCodeString = $scope.embedCode.join("\n");
    
    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'html',
    };
    
    $scope.addVisualization = function(visualization) {
      
      // Remove the visualization from the available list
      $scope.visualizations.splice($scope.visualizations.indexOf(visualization), 1);
      
      loadPromise.then(function() {
        switch(visualization.type) {
          case 'timeline':
            loadTimeline(visualization);
            embedCodeFromFunction(loadTimeline, visualization);
            break;
          case 'mapView':
            loadMap(visualization);
            embedCodeFromFunction(loadMap, visualization);
            break;
          case 'graphView':
            loadGraph(visualization);
            embedCodeFromFunction(loadGraph, visualization);
            break;
          case 'facet':
            loadFacet(visualization);
            embedCodeFromFunction(loadFacet, visualization);
            break;
          case 'timespan':
            loadTimespan(visualization);
            embedCodeFromFunction(loadTimespan, visualization);
            break;
        }
      });
    }
    
    function loadTimeline(visualization) {
      var newId = appendNewDivWithID(visualization);
      var timeline = components.promiseAdd('timeline', newId, {
        showControls: false,
        showSettings: false,
        showAccordion: false,
        height: 300
      }).then(function(opts) {
        opts.date(components.dimensionFromKey(visualization.importJson.dateProp));
        opts.group(components.dimensionFromKey(visualization.importJson.groupProp));
      });
    }
    
    function loadTimespan(visualization) {
      var newId = appendNewDivWithID(visualization);
      components.promiseAdd('timespan', newId, {
        showControls: false,
        showSettings: false,
        showAccordion: false,
        height: 300
      }).then(function(opts) {
        opts.startDimension(components.dimensionFromKey(visualization.importJson.dateStartDim));
        opts.endDimension(components.dimensionFromKey(visualization.importJson.dateEndDim));
        opts.tooltipDimension(components.dimensionFromKey(visualization.importJson.tooltipLabelDim));
        // Group dimension is currently not saved in file
        // opts.groupDimension(components.dimensionFromKey(visualization.importJson.groupDim));
      });
    }
    
    function loadMap(visualization) {
      var newId = appendNewDivWithID(visualization);
      var map = components.promiseAdd('map', newId, {
        height: "300px",
        showSettings: false
      }).then(function(opts) {
        opts.importState(visualization.importJson );
      });
    }
    
    function loadGraph(visualization) {
      var newId = appendNewDivWithID(visualization);
      var graph = components.promiseAdd('graph', newId, {
        height: "300px",
        showSettings: false
      }).then(function(opts) {
        opts.source(components.dimensionFromKey(visualization.importJson.sourceDimension));
        opts.target(components.dimensionFromKey(visualization.importJson.targetDimension));
        opts.nodeSize(visualization.importJson.nodeSize);
      });
    }
    
    function loadFacet(visualization) {
      var newId = appendNewDivWithID(visualization);
      components.promiseAdd('facet', newId, {
        height: "300px",
        showControls: false,
        showSettings: false,
        showAccordion: false,
        showDropArea: false,
        dimensions: components.dimensionsFromKeys(visualization.importJson.dimKeys)
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
    
    function embedCodeFromFunction(func, vis) {
      var replacements = {
        'var timeline = ': '',
        'var map = ': '',
        'var graph = ': '',
        'newId': '\'#' + vis.type + '-id-here\'',
        'visualization.importJson.dateProp': JSON.stringify(vis.importJson.dateProp),
        'visualization.importJson.groupProp': JSON.stringify(vis.importJson.groupProp),
        'visualization.importJson.dimKeys': JSON.stringify(vis.importJson.dimKeys),
        'visualization.importJson ': JSON.stringify(vis.importJson),
        'visualization.importJson.sourceDimension': JSON.stringify(vis.importJson.sourceDimension),
        'visualization.importJson.targetDimension': JSON.stringify(vis.importJson.targetDimension),
        'visualization.importJson.nodeSize': JSON.stringify(vis.importJson.nodeSize),
        'visualization.importJson.dateStartDim': JSON.stringify(vis.importJson.dateStartDim),
        'visualization.importJson.dateEndDim': JSON.stringify(vis.importJson.dateEndDim),
        'visualization.importJson.tooltipLabelDim': JSON.stringify(vis.importJson.tooltipLabelDim)
      }
      var str = func.toString();
      for(var r in replacements) {
        str = str.replace(new RegExp(r, 'g'), replacements[r]);
      }
      var a = str.split("\n");
      a.pop();
      a.shift();
      a.shift();
      for(var i=0; i < a.length; i++) {
        $scope.embedCode.splice($scope.embedCode.length-2, 0, a[i]); 
      }
      $scope.embedCodeString = $scope.embedCode.join("\n");
      $scope.$digest();
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
            s.visualizations.push({type: "timespan", description: "Timespan", importJson: f});
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