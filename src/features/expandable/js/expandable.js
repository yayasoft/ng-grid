(function () {
  'use strict';

  var module = angular.module('ui.grid.expandable', ['ui.grid']);

  module.service('uiGridExpandableService', ['gridUtil', '$log', '$compile', function (gridUtil, $log, $compile) {
    var service = {
      initializeGrid: function (grid) {
        service.init(grid);
        var publicApi = {
          events: {
            expandable: {
              rowExpandedStateChanged: function (scope, row) {
              }
            }
          },
          methods: {
            expandable: {
              toggleRowExpansion: function (rowEntity) {
                var row = grid.getRow(rowEntity);
                if (row !== null) {
                  service.toggleRowExpansion(grid, row);
                }
              },
              expandAllRows: function($scope) {
                service.expandAllRows(grid, $scope);
              },
              collapseAllRows: function() {
                service.collapseAllRows(grid);
              }
            }
          }
        };
        grid.api.registerEventsFromObject(publicApi.events);
        grid.api.registerMethodsFromObject(publicApi.methods);
      },
      //TODO: then  function is currently not called by row expanding and collapsing from click of first column, needs to be fixed.
      toggleRowExpansion: function (grid, row) {
        row.isExpanded = !row.isExpanded;
        grid.api.expandable.raise.rowExpandedStateChanged(row);
      },
      expandAllRows: function(grid, $scope) {
        angular.forEach(grid.renderContainers.body.visibleRowCache, function(row) {
          gridUtil.getTemplate(grid.options.rowExpandableTemplate).then(
            function (template) {
              row.renderedExpandableTemplate = template;
              row.isExpanded = true;
              grid.api.expandable.raise.rowExpandedStateChanged(row);
            });
        });
      },
      collapseAllRows: function(grid) {
        angular.forEach(grid.renderContainers.body.visibleRowCache, function(row) {
          row.isExpanded = false;
          grid.api.expandable.raise.rowExpandedStateChanged(row);
        });
      },
      init: function (grid) {
        grid.isScrolling = false;
        gridUtil.getTemplate(grid.options.rowExpandableTemplate)
          .then(
          function (template) {
            //TODO: template to be saved in variable in service and not options.
            //grid.options.rowExpandableTemplateHtml = template;
            grid.options.expandable = {};
            grid.options.expandable.expandableRowHeight = 200;
          },
          function (response) {
            throw new Error("Couldn't fetch/use gridOptions.rowExpandableTemplate '" +
              grid.options.rowExpandableTemplate + "'");
          }
        );
      }
    };
    return service;
  }]);

  module.directive('uiGridExpandable', ['$log', 'uiGridExpandableService',
    function ($log, uiGridExpandableService) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              uiGridExpandableService.initializeGrid(uiGridCtrl.grid);
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);

  module.directive('uiGridExpandableRow',
  ['uiGridExpandableService', '$timeout', '$log', '$compile', 'uiGridConstants','gridUtil','$interval','debounce',
    function (uiGridExpandableService, $timeout, $log, $compile, uiGridConstants, gridUtil, $interval, debounce) {
      function getHeightFromCSSProperty(cssProperty) {
        var height = 0;
        if (cssProperty) {
          height = Number(cssProperty.slice(0, cssProperty.length-2));
        }
        return isNaN(height)? 0: height;
      }
      function buildExpandedRow($elm, $scope, template) {
        var expandedRowElement = $compile(template)($scope);
        $elm.append(expandedRowElement);
      }
      return {
        replace: false,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              /*gridUtil.getTemplate($scope.grid.options.rowExpandableTemplate).then(
                function (template) {
                  buildExpandedRow($elm, $scope, template);
                });*/
              $scope.row.scope = $scope;
              buildExpandedRow($elm, $scope, $scope.row.renderedExpandableTemplate);
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              $scope.$on(uiGridConstants.events.GRID_SCROLL, debounce(function(evt) {
                $scope.grid.isScrolling = false;
              }, 250));

              $scope.$on(uiGridConstants.events.GRID_SCROLL, debounce(function(evt) {
                $scope.grid.isScrolling = true;
              }, 250, true));
            }

          };
        }
      };
    }]);

  module.directive('uiGridViewport',
    ['uiGridExpandableService', '$timeout', '$log', '$compile', 'uiGridConstants', '$interval',
      function (uiGridExpandableService, $timeout, $log, $compile, uiGridConstants, $interval) {
        return {
          priority: -100,
          scope: false,
          link: function ($scope, $elm, $attrs) {

          }
        };
      }
    ]);
})();