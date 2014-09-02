(function () {
  'use strict';

  var module = angular.module('ui.grid.expandable', ['ui.grid']);

  module.service('uiGridExpandableService', ['gridUtil', '$log', function (gridUtil, $log) {
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
              expandAllRows: function() {
                grid.options.allRowsExpanded = true;
                service.collapseAllRows(grid);
                service.expandAllRenderedRows(grid);
              },
              collapseAllRows: function() {
                grid.options.allRowsExpanded = false;
                service.collapseAllRows(grid);
              }
            }
          }
        };
        grid.api.registerEventsFromObject(publicApi.events);
        grid.api.registerMethodsFromObject(publicApi.methods);
      },
      toggleRowExpansion: function (grid, row) {
        row.isExpanded = !row.isExpanded;

        if (!row.isExpanded && row.origHeight) {
          row.height = row.origHeight;
          delete row.origHeight;
        }

        grid.api.expandable.raise.rowExpandedStateChanged(row);
      },
      expandAllRenderedRows: function(grid) {
        angular.forEach(grid.renderContainers.body.renderedRows, function(row) {
          if (!row.isExpanded) {
            service.toggleRowExpansion(grid, row);
          }
        });
      },
      collapseAllRows: function(grid) {
        angular.forEach(grid.renderContainers.body.visibleRowCache, function(row) {
          if (row.isExpanded) {
            service.toggleRowExpansion(grid, row);
          }
        });
      },
      init: function (grid) {
        gridUtil.getTemplate(grid.options.rowExpandableTemplate)
          .then(
          function (template) {
            //TODO: template to be saved in variable in service and not options.
            grid.options.rowExpandableTemplateHtml = template;
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
  ['uiGridExpandableService', '$timeout', '$log', '$compile', 'uiGridConstants','gridUtil',
    function (uiGridExpandableService, $timeout, $log, $compile, uiGridConstants, gridUtil) {
      function buildExpandedRow($elm, $scope, template) {
        var expandedRowElement = $compile($scope.grid.options.rowExpandableTemplateHtml)($scope);
        $elm.append(expandedRowElement);
        $scope.row.origHeight = $scope.row.height;
        // TODO: height should include top and bottom margins and padding also.
        $scope.row.height = $scope.row.height + $elm.css("height")?Number($elm.css("height").slice(0, $elm.css("height").length-2)):0;
      }
      return {
        replace: false,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              $scope.row.expandedRowHeight = 0;
              if (!$scope.grid.options.rowExpandableTemplateHtml) {
                gridUtil.getTemplate($scope.grid.options.rowExpandableTemplateHtml).then(
                  function (template) {
                    $scope.grid.options.rowExpandableTemplateHtml = template;
                    buildExpandedRow($elm, $scope);
                });
              }
              else {
                buildExpandedRow($elm, $scope);
              }
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);

  module.directive('uiGridViewport',
    ['uiGridExpandableService', '$timeout', '$log', '$compile', 'uiGridConstants',
      function (uiGridExpandableService, $timeout, $log, $compile, uiGridConstants) {
      return {
        priority: -100,
        scope: false,
        link: function ($scope, $elm, $attrs) {
          $scope.$on(uiGridConstants.events.GRID_SCROLL, function () {
            if ($scope.grid.options.allRowsExpanded) {
              uiGridExpandableService.expandAllRenderedRows($scope.grid);
            }
          });
        }
      };
    }
  ]);

})();
