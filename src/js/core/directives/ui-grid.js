(function () {
  'use strict';

  angular.module('ui.grid').controller('uiGridController', ['$scope', '$element', '$attrs', '$log', 'gridUtil', '$q', 'uiGridConstants',
                    '$templateCache', 'gridClassFactory', '$timeout', '$parse', '$compile',
    function ($scope, $elm, $attrs, $log, gridUtil, $q, uiGridConstants,
              $templateCache, gridClassFactory, $timeout, $parse, $compile) {
      $log.debug('ui-grid controller');

      var self = this;

      // Extend options with ui-grid attribute reference
      self.grid = gridClassFactory.createGrid($scope.uiGrid);
      $elm.addClass('grid' + self.grid.id);

      //add optional reference to externalScopes function to controller
      //so it can be retrieved in lower elements that have isolate scope
      self.getExternalScopes = $scope.getExternalScopes;

      // angular.extend(self.grid.options, );

      //all properties of grid are available on scope
      $scope.grid = self.grid;
      // Function to pre-compile all the cell templates when the column definitions change
      function preCompileCellTemplates(columns) {
        $log.info('pre-compiling cell templates');
        columns.forEach(function (col, index) {
          // Avoid compiling element if it is a row header cell
          if (!gridUtil.isNullOrUndefined(self.grid.options.rowHeader) && index === 0) {
            return;
          }
          var html = col.cellTemplate.replace(uiGridConstants.COL_FIELD, 'getCellValue(row, col)');

          var compiledElementFn = $compile(html);
          col.compiledElementFn = compiledElementFn;
        });
      }

      //TODO: Move this.
      $scope.groupings = [];


      if ($attrs.uiGridColumns) {
        $attrs.$observe('uiGridColumns', function(value) {
          self.grid.options.columnDefs = value;
          self.grid.buildColumns()
            .then(function(){
              self.grid.preCompileCellTemplates();

              self.refreshCanvas(true);
            });
        });
      }
      else {
        if (self.grid.options.columnDefs.length > 0) {
        //   self.grid.buildColumns();
        }
      }


      var dataWatchCollectionDereg;
      if (angular.isString($scope.uiGrid.data)) {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection($scope.uiGrid.data, dataWatchFunction);
      }
      else {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.data; }, dataWatchFunction);
      }

      var columnDefWatchCollectionDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.columnDefs; }, columnDefsWatchFunction);

      function columnDefsWatchFunction(n, o) {
        if (n && n !== o) {
          self.grid.options.columnDefs = n;
          self.grid.buildColumns()
            .then(function(){

              self.grid.preCompileCellTemplates();

              self.refreshCanvas(true);
            });
        }
      }

      function dataWatchFunction(n) {
        // $log.debug('dataWatch fired');
        var promises = [];

        if (n) {
          if (self.grid.columns.length === 0) {
            $log.debug('loading cols in dataWatchFunction');
            if (!$attrs.uiGridColumns && self.grid.options.columnDefs.length === 0) {
              self.grid.buildColumnDefsFromData(n);
            }
            promises.push(self.grid.buildColumns()
              .then(function() {
                self.grid.preCompileCellTemplates();}
            ));
          }
          $q.all(promises).then(function() {
            self.grid.modifyRows(n)
              .then(function () {
                // if (self.viewport) {
                  self.redrawInPlace();
                // }

                $scope.$evalAsync(function() {
                  self.refreshCanvas(true);
                });
              });
          });
        }
      }


      $scope.$on('$destroy', function() {
        dataWatchCollectionDereg();
        columnDefWatchCollectionDereg();
      });

      // TODO(c0bra): Do we need to destroy this watch on $destroy?
      $scope.$watch(function () { return self.grid.styleComputations; }, function() {
        self.refreshCanvas(true);
      });

      // Refresh the canvas drawable size
      $scope.grid.refreshCanvas = self.refreshCanvas = function(buildStyles) {
        if (buildStyles) {
          self.grid.buildStyles($scope);
        }

        var p = $q.defer();

        // Get all the header heights
        var containerHeadersToRecalc = [];
        for (var containerId in self.grid.renderContainers) {
          if (self.grid.renderContainers.hasOwnProperty(containerId)) {
            var container = self.grid.renderContainers[containerId];

            if (container.header) {
              containerHeadersToRecalc.push(container);
            }
          }
        }

        if (containerHeadersToRecalc.length > 0) {
          // Putting in a timeout as it's not calculating after the grid element is rendered and filled out
          $timeout(function() {
            // var oldHeaderHeight = self.grid.headerHeight;
            // self.grid.headerHeight = gridUtil.outerElementHeight(self.header);

            var rebuildStyles = false;

            // Get all the header heights
            for (var i = 0; i < containerHeadersToRecalc.length; i++) {
              var container = containerHeadersToRecalc[i];

              if (container.header) {
                var oldHeaderHeight = container.headerHeight;
                var headerHeight = gridUtil.outerElementHeight(container.header);
                container.headerHeight = headerHeight;

                if (oldHeaderHeight !== headerHeight) {
                  rebuildStyles = true;
                }
              }
            }

            // Rebuild styles if the header height has changed
            //   The header height is used in body/viewport calculations and those are then used in other styles so we need it to be available
            if (buildStyles && rebuildStyles) {
              self.grid.buildStyles($scope);
            }

            p.resolve();
          });
        }
        else {
          // Timeout still needs to be here to trigger digest after styles have been rebuilt
          $timeout(function() {
            p.resolve();
          });
        }
        self.grid.ready = p.promise;
        return p.promise;
      };

      $scope.grid.queueRefresh = self.queueRefresh = function queueRefresh() {
        if (self.refreshCanceler) {
          $timeout.cancel(self.refreshCanceler);
        }

        self.refreshCanceler = $timeout(function () {
          self.refreshCanvas(true);
        });

        self.refreshCanceler.then(function () {
          self.refreshCanceler = null;
        });
      };

      self.getCellValue = function(row, col) {
        return $scope.grid.getCellValue(row, col);
      };

      // provided only for backward compatibility, moved to grid and ideally would be removed from here
      self.refreshRows = function refreshRows() {
        return $scope.grid.refreshRows();
      };

      // provided only for backward compatibility, moved to grid and ideally would be removed from here
      self.refresh = function refresh() {
        $scope.grid.refresh();
      };

      // provided only for backward compatibility, moved to grid and ideally would be removed from here
      self.redrawInPlace = function redrawInPlace() {
        $scope.grid.redrawInPlace();
      };

      /* Sorting Methods */


      /* Event Methods */

      //todo: throttle this event?
      self.fireScrollingEvent = function(args) {
        $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);
      };

      self.fireEvent = function(eventName, args) {
        // Add the grid to the event arguments if it's not there
        if (typeof(args) === 'undefined' || args === undefined) {
          args = {};
        }

        if (typeof(args.grid) === 'undefined' || args.grid === undefined) {
          args.grid = self.grid;
        }

        $scope.$broadcast(eventName, args);
      };

      self.innerCompile = function innerCompile(elm) {
        $compile(elm)($scope);
      };

      $scope.grid.isRTL = self.isRTL = function isRTL() {
        return $elm.css('direction') === 'rtl';
      };
    }]);

/**
 *  @ngdoc directive
 *  @name ui.grid.directive:uiGrid
 *  @element div
 *  @restrict EA
 *  @param {Object} uiGrid Options for the grid to use
 *  @param {Object=} external-scopes Add external-scopes='someScopeObjectYouNeed' attribute so you can access
 *            your scopes from within any custom templatedirective.  You access by $scope.getExternalScopes() function
 *
 *  @description Create a very basic grid.
 *
 *  @example
    <example module="app">
      <file name="app.js">
        var app = angular.module('app', ['ui.grid']);

        app.controller('MainCtrl', ['$scope', function ($scope) {
          $scope.data = [
            { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
          ];
        }]);
      </file>
      <file name="index.html">
        <div ng-controller="MainCtrl">
          <div ui-grid="{ data: data }"></div>
        </div>
      </file>
    </example>
 */
angular.module('ui.grid').directive('uiGrid',
  [
    '$log',
    '$compile',
    '$templateCache',
    'gridUtil',
    '$window',
    function(
      $log,
      $compile,
      $templateCache,
      gridUtil,
      $window
      ) {
      return {
        templateUrl: 'ui-grid/ui-grid',
        scope: {
          uiGrid: '=',
          getExternalScopes: '&?externalScopes' //optional functionwrapper around any needed external scope instances
        },
        replace: true,
        transclude: true,
        controller: 'uiGridController',
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              $log.debug('ui-grid postlink');

              var grid = uiGridCtrl.grid;

              // Initialize scrollbars (TODO: move to controller??)
              uiGridCtrl.scrollbars = [];

              //todo: assume it is ok to communicate that rendering is complete??
              grid.renderingComplete();

              grid.element = $elm;

              grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);

              // Default canvasWidth to the grid width, in case we don't get any column definitions to calculate it from
              grid.canvasWidth = uiGridCtrl.grid.gridWidth;

              grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

              // If the grid isn't tall enough to fit a single row, it's kind of useless. Resize it to fit a minimum number of rows
              if (grid.gridHeight < grid.options.rowHeight) {
                // Figure out the new height
                var newHeight = grid.options.minRowsToShow * grid.options.rowHeight;

                $elm.css('height', newHeight + 'px');

                grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);
              }

              // Run initial canvas refresh
              uiGridCtrl.refreshCanvas();

              // Resize the grid on window resize events
              function gridResize($event) {
                grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);
                grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

                uiGridCtrl.queueRefresh();
              }

              angular.element($window).on('resize', gridResize);

              // Unbind from window resize events when the grid is destroyed
              $elm.on('$destroy', function () {
                angular.element($window).off('resize', gridResize);
              });
            }
          };
        }
      };
    }
  ]);

})();
