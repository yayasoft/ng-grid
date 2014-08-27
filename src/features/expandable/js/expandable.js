(function () {
  'use strict';
  var module = angular.module('ui.grid.expandable', ['ui.grid']);

  module.service('uiGridExpandableService', ['$log', '$templateCache', 'gridUtil',
    function($log,$templateCache,gridUtil) {
      var service = {
        initializeGrid: function (grid) {
          var publicApi = {
            events: {
              expandable: {
                rowExpensionStateChanged: function (scope,row) {

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
        toggleRowExpansion: function(grid, row) {
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


  module.directive('uiGridExpandableRow', ['$log', 'uiGridExpandableService',
    function ($log, uiGridExpandableService) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        template: '<div ng-if="row.isExpanded"></div>',
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);

  module.directive('uiGridCell',
    ['$compile', 'uiGridConstants', '$log', '$parse', 'uiGridExpandableService','$timeout',
      function ($compile, uiGridConstants, $log, $parse, uiGridExpandableService, $timeout) {
        return {
          priority: -200, // run after default uiGridCell directive
          restrict: 'A',
          scope: false,
          link: function ($scope, $elm, $attrs) {
            $elm.on('click',function(evt) {
              console.log('here!!!');
              $timeout(function() {
                uiGridExpandableService.toggleRowExpansion($scope.grid, $scope.row);
              });
            });
          }
        };
      }]);

})();
