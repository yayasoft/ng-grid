
(function() {
  'use strict';
  
  var module = angular.module('ui.grid.infinite.scroll', ['ui.grid']);

  module.service('uiGridInfiniteScrollService', ['gridUtil', '$log', '$compile', '$timeout', function (gridUtil, $log, $compile, $timeout) {
    var timeout = false;
    var service = {
      initializeGrid: function(grid) {
        var publicApi = {
          events: {
            infiniteScroll: {
              needLoadMoreData: function ($scope, fn) {
              }
            }
          },
          methods: {
            infiniteScroll: {
              loadData: function () {
              },
              checkScroll: function(scrollTop, scrollHeight) {
                service.checkScroll(grid, scrollTop, scrollHeight);
              }
            }
          }
        };
        grid.api.registerEventsFromObject(publicApi.events);
        grid.api.registerMethodsFromObject(publicApi.methods);
      },
      loadData: function (grid) {
          grid.api.infiniteScroll.raise.needLoadMoreData();
      },
      checkScroll: function(grid, scrollTop, scrollHeight) {
        var position = 100 - (scrollTop * 100 / scrollHeight) ;
        $log.info('position: ' + position);
        if (!timeout && position <= grid.options.infiniteScroll) {
          this.loadData(grid);
          timeout = true;
        }
        if (timeout) { // !!! Don't think this is the best solution, but i need to have a delay for loading data
          $timeout(function(){
            timeout = false;
          }, 1000);
        }
      }
    };
    return service;
  }]);
  module.directive('uiGridInfiniteScroll', ['$log', 'uiGridInfiniteScrollService',
    function ($log, uiGridInfiniteScrollService) {
      return {
        priority: -200,
        scope: false,
        require: '^uiGrid',
        compile: function($scope, $elm, $attr){
          return { 
            pre: function($scope, $elm, $attr, uiGridCtrl) {
              $log.info('initializing infinite scroll');
              uiGridInfiniteScrollService.initializeGrid(uiGridCtrl.grid);
            },
            post: function($scope, $elm, $attr) {

            }
          };
        }
      };
    }]);
  module.directive('uiGridViewport',
    ['$compile', '$log', 'uiGridInfiniteScrollService', 
      function ($compile, $log, uiGridInfiniteScrollService) {
        return {
          priority: -200,
          scope: false,
          link: function ($scope, $elm, $attr){
            $log.info($scope.grid.options.infiniteScroll);
            $elm.on('scroll', function (evt) {
              $log.info($elm[0].scrollTop);
              $log.info($scope.rowContainer.getCanvasHeight());
              uiGridInfiniteScrollService.checkScroll($scope.grid, $elm[0].scrollTop, $scope.rowContainer.getCanvasHeight());
            });
          }
        };

      }]);
})();