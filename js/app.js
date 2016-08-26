var app = angular.module('palladioEmbedApp', ['ui.codemirror'])
  .controller('EmbedCtrl', ['$scope', function($scope) {
    var components = startPalladio(['palladioTimelineComponent', 'palladioFacetComponent', 'palladioTimespanComponent', 'palladioGraphComponent', 'palladioMapComponent', 'palladioTableComponent', 'palladioCardsComponent']);
    var loadPromise = undefined;
    
    $scope.file = undefined;
    $scope.visualizations = [];
    
    $scope.embedCode = [
      '<meta charset="utf-8">',
      '<link type="text/css" href="bower_components/palladio/palladio.css" rel="stylesheet" />',
      '<link type="text/css" href="bower_components/palladio-timeline-component/dist/palladio-timeline-component.css" rel="stylesheet" />',
      '<link type="text/css" href="bower_components/palladio-facet-component/dist/palladio-facet-component.css" rel="stylesheet" />',
      '<link type="text/css" href="bower_components/palladio-timespan-component/dist/palladio-timespan-component.css" rel="stylesheet" />',
      '<link type="text/css" href="bower_components/palladio-graph-component/dist/palladio-graph-component.css" rel="stylesheet" />',
      '<link type="text/css" href="bower_components/palladio-map-component/dist/palladio-map-component.css" rel="stylesheet" />',
      '<link type="text/css" href="bower_components/palladio-table-component/dist/palladio-table-component.css" rel="stylesheet" />',
      '<link type="text/css" href="bower_components/palladio-cards-component/dist/palladio-cards-component.css" rel="stylesheet" />',
      '<link href="http://netdna.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.css" rel="stylesheet">',
      '<script src="bower_components/palladio/palladio.js"></script>',
      '<script src="bower_components/palladio-timeline-component/dist/palladio-timeline-component.min.js"></script>',
      '<script src="bower_components/palladio-facet-component/dist/palladio-facet-component.min.js"></script>',
      '<script src="bower_components/palladio-timespan-component/dist/palladio-timespan-component.min.js"></script>',
      '<script src="bower_components/palladio-graph-component/dist/palladio-graph-component.min.js"></script>',
      '<script src="bower_components/palladio-map-component/dist/palladio-map-component.min.js"></script>',
      '<script src="bower_components/palladio-table-component/dist/palladio-table-component.min.js"></script>',
      '<script src="bower_components/palladio-cards-component/dist/palladio-cards-component.js"></script>',
      '<div id="mapView-id-here"></div>',
      '<div id="graphView-id-here"></div>',
      '<div id="tableView-id-here"></div>',
      '<div id="listView-id-here"></div><!-- Actually the card view -->',
      '<div id="timeline-id-here"></div>',
      '<div id="timespan-id-here"></div>',
      '<div id="facet-id-here"></div>',
      '<script>',
      "var components = startPalladio(['palladioTimelineComponent', 'palladioFacetComponent', 'palladioTimespanComponent', 'palladioGraphComponent', 'palladioMapComponent', 'palladioTableComponent', 'palladioCardsComponent']);",
      "components.loadData('url-for-your-file.json', function() {",
      "});",
      '</script>'];
    $scope.embedCodeString = $scope.embedCode.join("\n");
    
    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'htmlmixed'
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
          case 'tableView':
            loadTable(visualization);
            embedCodeFromFunction(loadTable, visualization);
            break;
          case 'listView':
            loadCards(visualization);
            embedCodeFromFunction(loadCards, visualization);
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
        opts.group(visualization.importJson.groupProp ? components.dimensionFromKey(visualization.importJson.groupProp) : null);
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
    
    function loadTable(visualization) {
      var newId = appendNewDivWithID(visualization);
      components.promiseAdd('table', newId, {
        height: "300px",
        showSettings: false,
        row: components.dimensionFromKey(visualization.importJson.countDim.key),
        dimensions: components
          .dimensionsFromKeys(visualization.importJson.tableDimensions.map(function(d) { return d.key; }))
      });
    }
    
    function loadCards(visualization) {
      var newId = appendNewDivWithID(visualization);
      components.promiseAdd('cards', newId, {
        height: "300px",
        showSettings: false,
        titleDim: components.dimensionFromKey(visualization.importJson.titleDim),
        subtitleDim: components.dimensionFromKey(visualization.importJson.subtitleDim),
        textDim: components.dimensionFromKey(visualization.importJson.textDim),
        linkDim: components.dimensionFromKey(visualization.importJson.linkDim),
        imgUrlDim: components.dimensionFromKey(visualization.importJson.imgurlDim),
        sortDim: components.dimensionFromKey(visualization.importJson.sortDim)
      });
    }
    
    function loadFacet(visualization) {
      var newId = appendNewDivWithID(visualization);
      console.log(visualization.importJson.dimKeys);
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
        'visualization.importJson.tooltipLabelDim': JSON.stringify(vis.importJson.tooltipLabelDim),
        'visualization.importJson.countDim.key': vis.importJson.countDim ? JSON.stringify(vis.importJson.countDim.key) : "",
        'visualization.importJson.tableDimensions.map\\(function\\(d\\) { return d.key; }\\)': vis.importJson.tableDimensions ? JSON.stringify(vis.importJson.tableDimensions.map(function(d) { return d.key; })) : "",
        'visualization.importJson.titleDim': JSON.stringify(vis.importJson.titleDim),
        'visualization.importJson.subtitleDim': JSON.stringify(vis.importJson.subtitleDim),
        'visualization.importJson.textDim': JSON.stringify(vis.importJson.textDim),
        'visualization.importJson.linkDim': JSON.stringify(vis.importJson.linkDim),
        'visualization.importJson.imgurlDim': JSON.stringify(vis.importJson.imgurlDim),
        'visualization.importJson.sortDim': JSON.stringify(vis.importJson.sortDim)
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
          if(filters) {
            filters.importJson.facets.forEach(function(f) {
              s.visualizations.push({type: "facet", description: "Facet Filter", importJson: f});
            });
            filters.importJson.timelines.forEach(function(f) {
              s.visualizations.push({type: "timeline", description: "Timeline", importJson: f});
            });
            filters.importJson.partimes.forEach(function(f) {
              s.visualizations.push({type: "timespan", description: "Timespan", importJson: f});
            }); 
          }
          
          var mapView = s.file.vis.filter(function(v) { return v.type === "mapView"; })[0];
          if(mapView) {
            mapView.description = "Map";
            s.visualizations.push(mapView); 
          }
          
          var graphView = s.file.vis.filter(function(v) { return v.type === "graphView"; })[0];
          if(graphView) {
            graphView.description = "Graph";
            s.visualizations.push(graphView); 
          }
          
          var tableView = s.file.vis.filter(function(v) { return v.type === 'tableView'; })[0];
          if(tableView) {
            tableView.description = "Table";
            s.visualizations.push(tableView); 
          }
          
          var cardView = s.file.vis.filter(function(v) { return v.type === 'listView'; })[0];
          if(cardView) {
            cardView.description = "Cards";
            s.visualizations.push(cardView); 
          }
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