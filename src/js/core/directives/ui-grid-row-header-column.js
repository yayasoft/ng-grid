angular.module('ui.grid').directive('uiGridRowHeaderColumn', ['$compile', '$log', '$parse', 'gridUtil', 'uiGridConstants', 'uiGridExpandableService', '$timeout', function ($compile, $log, $parse, gridUtil, uiGridConstants, uiGridExpandableService, $timeout) {
  var defaultTemplate = 'ui-grid/uiGridRowHeaderColumn';
  var isExpanded = false;
  var uiGridRowHeaderColumn = {
    restrict: 'EA',
    replace: true,
    require: '?^uiGrid',
    scope: {
      row: '=',
      scroll: '='
    },
    compile: function() {
      return {
        pre: function($scope, $elm, $attrs, uiGridCtrl) {
          $scope.grid = uiGridCtrl.grid;
          $scope.showIndex = $scope.grid.options.rowHeader.rowIndex;
          
          var lastIndex = $scope.grid.renderContainers.body.renderedRows[$scope.grid.renderContainers.body.renderedRows.length-1].index + 1;
          var digits = lastIndex.toString().length;

          function rowHeaderWidth(digits) {
            var step = 5,
              standard = 50;
            if (digits === 2) {
              return standard;
            } else {
              return step * (digits - 2) + 50;
            }
          }

          gridUtil.getTemplate(defaultTemplate)
            .then(function (contents){
              var template = angular.element(contents);

              var newElm = $compile(template)($scope);
              $elm.append(newElm);

              // Dynamic width change here
              $elm.width(rowHeaderWidth(digits));
              $scope.grid.columns[0].width = rowHeaderWidth(digits);
              $scope.grid.refreshCanvas(true);
              $log.info($scope.grid);
            });
        },
        post: function($scope, $elm, $attrs) {

          $elm.on('click', function() {
            if ($scope.grid.options.rowExpandableTemplateHtml) {
              $timeout(function() {
                uiGridExpandableService.toggleRowExpansion($scope.grid, $scope.row);
                $scope.grid.refresh();
              });
            }
          });
        }
      };
    }
  };

  return uiGridRowHeaderColumn;
}]);

