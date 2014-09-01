(function () {
  'use strict';

  var module = angular.module('ui.grid.expandable', ['ui.grid']);

  module.service('uiGridExpandableService', ['gridUtil', function (gridUtil) {
    var service = {
      initializeGrid: function (grid) {
        service.defaultGridOptions(grid.options);
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
                angular.forEach(grid.renderContainers.body.visibleRowCache, function(row) {
                  if (!row.isExpanded) {
                    service.toggleRowExpansion(grid, row);
                  }
                });
              },
              collapseAllRows: function() {
                angular.forEach(grid.renderContainers.body.visibleRowCache, function(row) {
                  if (row.isExpanded) {
                    service.toggleRowExpansion(grid, row);
                  }
                });
              }
            }
          }
        };
        grid.api.registerEventsFromObject(publicApi.events);
        grid.api.registerMethodsFromObject(publicApi.methods);
      },
      toggleRowExpansion: function (grid, row) {
        row.isExpanded = !row.isExpanded;

        //todo: remove hardcode and get row height
        if (row.isExpanded) {
          row.origHeight = row.height;
          row.height = 60;
        }
        else {
          row.height = row.origHeight;
          delete row.origHeight;
        }

        grid.api.expandable.raise.rowExpandedStateChanged(row);
      },
      defaultGridOptions: function (gridOptions) {
        gridUtil.getTemplate(gridOptions.rowExpandableTemplate)
          .then(
          function (template) {
            gridOptions.rowExpandableTemplateHtml = template;
          },
          function (response) {
            throw new Error("Couldn't fetch/use gridOptions.rowExpandableTemplate '" +
              gridOptions.rowExpandableTemplate + "'");
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
      return {
        replace: false,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              if (!gridUtil.isNullOrUndefined($scope.grid.options.rowExpandableTemplateHtml)) {
                gridUtil.getTemplate($scope.grid.options.rowExpandableTemplateHtml).then(function (expandableRowtemplate) {
                  var expandedRowElement = $compile(expandableRowtemplate)($scope);
                  $elm.append(expandedRowElement);
                });
              }
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);

  module.directive('uiGridCell',
    ['uiGridExpandableService', '$timeout', '$log', '$compile', 'uiGridConstants',
      function (uiGridExpandableService, $timeout, $log, $compile, uiGridConstants) {
        return {
          priority: -100,
          restrict: 'A',
          scope: false,
          link: function ($scope, $elm, $attrs) {
            $elm.on('click', function (evt) {
              $timeout(function() {
                uiGridExpandableService.toggleRowExpansion($scope.grid, $scope.row);
              });
              /*$timeout(function () {
                if (!$scope.row.expandedHTMLGenerated) {
                  var rowHtml = "<div ng-if='row.isExpanded' class='test' style='width: 100%;float:left;'>" +
                    $scope.grid.options.rowExpandableTemplateHtml + "</div>";
                  var expandedRowElement = $compile(rowHtml)($scope);
                  $elm.parent().append(expandedRowElement);
                  $scope.row.expandedHTMLGenerated = true;
                }
              });*/
            });

            $scope.$on(uiGridConstants.events.GRID_SCROLL, function (evt, retainFocus) {
              //$scope.row.isExpanded = false;
            });
          }
        };
      }]);

})();
