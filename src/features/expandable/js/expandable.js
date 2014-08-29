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
              }
            }
          }
        };
        grid.api.registerEventsFromObject(publicApi.events);
        grid.api.registerMethodsFromObject(publicApi.methods);
      },
      toggleRowExpansion: function (grid, row) {
        row.isExpanded = !row.isExpanded;
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

  module.directive('uiGridCell',
    ['uiGridExpandableService', '$timeout', '$log', '$compile',
      function (uiGridExpandableService, $timeout, $log, $compile) {
        return {
          priority: -100,
          restrict: 'A',
          scope: false,
          link: function ($scope, $elm, $attrs) {
            $elm.on('click', function (evt) {
              uiGridExpandableService.toggleRowExpansion($scope.grid, $scope.row);
              $timeout(function () {
                if (!$scope.row.expandedViewGenerated) {
                  var rowHtml = "<div ng-if='row.isExpanded' style='width: 100%;float:left;'>" +
                    $scope.grid.options.rowExpandableTemplateHtml + "</div>";
                  var expandedRow = $compile(rowHtml)($scope);
                  $elm.parent().append(expandedRow);
                  $scope.row.expandedViewGenerated = true;
                }
              });
            });
          }
        };
      }]);

})();
