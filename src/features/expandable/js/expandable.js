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
              expandAllRows: function() {
                service.expandAllRows(grid);
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
      toggleRowExpansion: function (grid, row) {
        row.isExpanded = !row.isExpanded;

        if (row.isExpanded) {
          row.height = row.grid.options.rowHeight + grid.options.expandable.expandableRowHeight;
        }
        else {
          row.height = row.grid.options.rowHeight;
        }

        grid.api.expandable.raise.rowExpandedStateChanged(row);
      },
      expandAllRows: function(grid, $scope) {
        angular.forEach(grid.renderContainers.body.visibleRowCache, function(row) {
          if (!row.isExpanded) {
            service.toggleRowExpansion(grid, row);
          }
        });
        grid.refresh();
      },
      collapseAllRows: function(grid) {
        angular.forEach(grid.renderContainers.body.visibleRowCache, function(row) {
          if (row.isExpanded) {
            service.toggleRowExpansion(grid, row);
          }
        });
        grid.refresh();
      },
      init: function (grid) {
        grid.options.expandable = {};
        grid.options.expandable.expandableRowHeight = 150;
        grid.isExpandable = true;
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
              gridUtil.getTemplate($scope.grid.options.rowExpandableTemplate).then(
                function (template) {
                  buildExpandedRow($elm, $scope, template);
                });
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }

          };
        }
      };
    }]);

  module.directive('uiGridViewport',
    ['$compile', '$log', '$templateCache',
      function ($compile, $log, $templateCache) {
        return {
          priority: -200,
          scope: false,
          compile: function ($elm, $attrs) {
            var rowRepeatDiv = angular.element($elm.children().children()[0]);
            var expandable = $templateCache.get('ui-grid/expandable');
            rowRepeatDiv.append(expandable);
            var expandedRowFillerElement = $templateCache.get('ui-grid/expandableScrollFiller');
            var expandedRowElement = $templateCache.get('ui-grid/expandableRow');
            rowRepeatDiv.append(expandedRowElement);
            rowRepeatDiv.append(expandedRowFillerElement);
            return {
              pre: function ($scope, $elm, $attrs, controllers) {
              },
              post: function ($scope, $elm, $attrs, controllers) {
              }
            };
          }
        };
      }]);

})();
