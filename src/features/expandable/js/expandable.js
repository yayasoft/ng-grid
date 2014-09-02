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
                  row.isExpanded = true;
                  grid.api.expandable.raise.rowExpandedStateChanged(row);
                });
              },
              collapseAllRows: function() {
                angular.forEach(grid.renderContainers.body.visibleRowCache, function(row) {
                  row.isExpanded = false;
                  grid.api.expandable.raise.rowExpandedStateChanged(row);
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



})();
