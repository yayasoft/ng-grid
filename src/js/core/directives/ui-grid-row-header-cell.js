angular.module('ui.grid').directive('uiGridRowHeaderCell', ['$compile', '$log', '$parse', 'gridUtil', 'uiGridConstants', function ($compile, $log, $parse, gridUtil, uiGridConstants) {
  var defaultTemplate = 'ui-grid/uiGridRowHeaderCell';
  var isExpanded = false;
  var uiGridRowHeaderCell = {
    restrict: 'EA',
    replace: true,
    require: '?^uiGrid',
    compile: function() {
      return {
        pre: function($scope, $elm, $attrs, uiGridCtrl) {

          $scope.grid = uiGridCtrl.grid;

          var rowHeaderCellTemplate = ($scope.grid.options.rowHeaderCellTemplate) ? $scope.grid.options.rowHeaderCellTemplate : defaultTemplate;
          
          gridUtil.getTemplate(rowHeaderCellTemplate)
            .then(function (contents){
              var template = angular.element(contents);

              var newElm = $compile(template)($scope);

              $elm.append(newElm);
            });
        },
        post: function($scope, $elm, $attrs) {
          $elm.on('click', function (){
            $log.info("Clicked");
            isExpanded = !isExpanded;
          });
        }
      };
    }
  };

  return uiGridRowHeaderCell;
}]);

