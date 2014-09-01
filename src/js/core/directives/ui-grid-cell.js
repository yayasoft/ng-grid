angular.module('ui.grid').directive('uiGridCell', ['$compile', '$log', '$parse', 'gridUtil', 'uiGridConstants', function ($compile, $log, $parse, gridUtil, uiGridConstants) {
  var uiGridCell = {
    priority: 0,
    scope: false,
    require: '?^uiGrid',
    compile: function() {
      return {
        pre: function($scope, $elm, $attrs, uiGridCtrl) {
          function compileTemplate() {
            if ($scope.col.index === 0 && !gridUtil.isNullOrUndefined($scope.col.grid.options.rowHeader)) {
              return;
            }
            var compiledElementFn = $scope.col.compiledElementFn;

            compiledElementFn($scope, function(clonedElement, scope) {
              $elm.append(clonedElement);
            });
          }

          // If the grid controller is present, use it to get the compiled cell template function
          if (uiGridCtrl) {
            if ($scope.col.index === 0 && $scope.grid.options.showRowHeader) {
              return;
            }
            $scope.getCellValue = uiGridCtrl.getCellValue;

            compileTemplate();
          }
          // No controller, compile the element manually
          else {
            var html = $scope.col.cellTemplate
              .replace(uiGridConstants.COL_FIELD, 'getCellValue(row, col)');
            var cellElement = $compile(html)($scope);
            $elm.append(cellElement);
          }
        },
        post: function($scope, $elm, $attrs) {
          $elm.addClass($scope.col.getColClass(false));
        }
      };
    }
  };

  return uiGridCell;
}]);

