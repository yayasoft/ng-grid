angular.module('ui.grid').directive('uiGridRowHeaderColumn', ['$compile', '$log', '$parse', 'gridUtil', 'uiGridConstants', function ($compile, $log, $parse, gridUtil, uiGridConstants) {
  var defaultCheckboxTemplate = 'ui-grid/uiGridRowHeaderColumnCheckbox';
  var defaultButtonTemplate = 'ui-grid/uiGridRowHeaderColumnButton';
  var defaultColumnTemplate = 'ui-grid/uiGridRowHeaderColumn';
  var isExpanded = false;
  var uiGridRowHeaderColumn = {
    restrict: 'EA',
    replace: true,
    require: '?^uiGrid',
    scope: {
      row: '='
    },
    compile: function() {
      return {
        pre: function($scope, $elm, $attrs, uiGridCtrl) {
          var showCheckbox = false;
          var showButton = false;
          function getColumnType (types) {
            if (types instanceof Array) {

              angular.forEach(types, function(type) {
                if (type === 'checkbox') {
                  showCheckbox = true;
                } else if (type === 'rowIndex') {
                  $scope.showIndex = true;
                } else if (type === 'button') {
                  showButton = true;
                }
              });
            }
            else if (typeof(types) === 'string') {

              if (types === 'checkbox') {
                showCheckbox = true;
              } else if (types === 'rowIndex') {
                $scope.showIndex = true;
              } else if (types === 'button') {
                showButton = true;
              }
            } else {
              $log.info('Row header Undefined type');
            }
          }

          $scope.grid = uiGridCtrl.grid;
          $scope.columnType = $scope.grid.options.rowHeaderColumnType;
          
          getColumnType($scope.columnType);
          
          var rowHeaderCellTemplate = ($scope.grid.options.rowHeaderCellTemplate) ? $scope.grid.options.rowHeaderCellTemplate : defaultCheckboxTemplate;
          var rowHeaderButtonTemplate = ($scope.grid.options.rowHeaderButtonTemplate) ? $scope.grid.options.rowHeaderButtonTemplate : defaultButtonTemplate;
          
          var template;

          if (showCheckbox && showButton){
            template = defaultColumnTemplate;
          } else if (showButton) {
            template = rowHeaderButtonTemplate;
          } else if (showCheckbox) {
            template = rowHeaderCellTemplate;
          } else {
            if ($scope.grid.options.rowHeaderCustomTemplate) {
              template = $scope.grid.options.rowHeaderCustomTemplate;  
            } else {
              template = rowHeaderCellTemplate;
            }
          }
          gridUtil.getTemplate(template)
            .then(function (contents){
              var template = angular.element(contents);

              var newElm = $compile(template)($scope);
              $elm.append(newElm);
              $elm.width($scope.grid.options.rowHeaderWidth ? $scope.grid.options.rowHeaderWidth : 30);
            });
        },
        post: function($scope, $elm, $attrs) {
          $elm.on('click', function (){
            $log.info("Row " + $scope.row.index + " was clicked");
            isExpanded = !isExpanded;
          });
        }
      };
    }
  };

  return uiGridRowHeaderColumn;
}]);

