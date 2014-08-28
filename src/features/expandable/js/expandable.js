(function () {
  'use strict';

  var module = angular.module('ui.grid.expandable', ['ui.grid']);

  module.service('uiGridExpandableService', [ function () {
      var service = {
        initializeGrid: function (grid) {
          var publicApi = {
            events: {
              expandable: {
                rowExpensionStateChanged: function (scope, row) {
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
          grid.api.expandable.raise.rowExpensionStateChanged(row);
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

  /*
  the existing uiGridRow directive as specified in ui-grid-row.js is replaced while compiling this I am not able to use it here
  I have used class="ui-grid-row" (check uiGridViewPort.html) to implement expansion feature
  some better solution can be thought about
   */
  module.directive('uiGridRow',
    ['uiGridExpandableService', '$timeout', '$log', '$compile',
      function (uiGridExpandableService, $timeout, $log, $compile) {
        return {
          require: '^uiGrid',
          restrict: 'C',
          scope: false,
          link: function ($scope, $elm, $attrs, uiGridCtrl) {
            var expendedRowAppended = false;
            $scope.grid = uiGridCtrl.grid;
            $elm.on('click', function (evt) {
              $timeout(function () {
                uiGridExpandableService.toggleRowExpansion($scope.grid, $scope.row);
                if ($scope.row.isExpanded && !expendedRowAppended) {
                  /*this html will be read from template file to show hide it I have currently used ng-if
                   but something else can also be thought about using ng-if would require to enclose template
                   in something like <div ng-if="row.isExpanded"></div>
                   */
                  var rowHtml = "<div ng-if='row.isExpanded' style='height: 80px;width: 100%;float:left;padding-left: 10px;" +
                    "background-color: #ffffff;'>test</div>";
                  var expandedRow = $compile(rowHtml)($scope);
                  $elm.append(expandedRow);
                  expendedRowAppended = true;
                }
              });
            });
          }
        };
      }]);

})();
