angular.module('ui.grid').directive('uiGridRowHeaderColumn', ['$compile', '$log', '$parse', 'gridUtil', 'uiGridConstants', 'uiGridExpandableService', '$timeout', function ($compile, $log, $parse, gridUtil, uiGridConstants, uiGridExpandableService, $timeout) {
  var defaultCheckboxTemplate = 'ui-grid/uiGridRowHeaderColumnCheckbox';
  var defaultButtonTemplate = 'ui-grid/uiGridRowHeaderColumnButton';
  var defaultColumnTemplate = 'ui-grid/uiGridRowHeaderColumn';
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
          var showCheckbox = false;
          var showButton = false;
          var scrollLeft = 0;
          function getColumnType (types) {
            if (types instanceof Array) {

              angular.forEach(types, function(type) {
                if (type === uiGridConstants.rowHeaderTypes.CHECKBOX) {
                  showCheckbox = true;
                } else if (type === uiGridConstants.rowHeaderTypes.ROW_INDEX) {
                  $scope.showIndex = true;
                } else if (type === uiGridConstants.rowHeaderTypes.BUTTON) {
                  showButton = true;
                }
              });
            }
            else if (typeof(types) === 'string') {

              if (types === uiGridConstants.rowHeaderTypes.CHECKBOX) {
                showCheckbox = true;
              } else if (types === uiGridConstants.rowHeaderTypes.ROW_INDEX) {
                $scope.showIndex = true;
              } else if (types === uiGridConstants.rowHeaderTypes.BUTTON) {
                showButton = true;
              }
            } else {
              $log.info('Row header Undefined type');
            }
          }

          $scope.grid = uiGridCtrl.grid;
          $scope.columnType = $scope.grid.options.rowHeader.rowHeaderColumnType;
          
          getColumnType($scope.columnType);
          
          var rowHeaderCellTemplate = ($scope.grid.options.rowHeader.rowHeaderCellTemplate) ? $scope.grid.options.rowHeader.rowHeaderCellTemplate : defaultCheckboxTemplate;
          var rowHeaderButtonTemplate = ($scope.grid.options.rowHeader.rowHeaderButtonTemplate) ? $scope.grid.options.rowHeader.rowHeaderButtonTemplate : defaultButtonTemplate;
          
          var template;

          if (showCheckbox && showButton){
            template = defaultColumnTemplate;
          } else if (showButton) {
            template = rowHeaderButtonTemplate;
          } else if (showCheckbox) {
            template = rowHeaderCellTemplate;
          } else {
            if ($scope.grid.options.rowHeader.rowHeaderCustomTemplate) {
              template = $scope.grid.options.rowHeader.rowHeaderCustomTemplate;  
            } else {
              template = rowHeaderCellTemplate;
              $scope.rowIndexOnly = true;
            }
          }
          gridUtil.getTemplate(template)
            .then(function (contents){
              var template = angular.element(contents);

              var newElm = $compile(template)($scope);
              $elm.append(newElm);
              $elm.width($scope.grid.options.rowHeader.rowHeaderWidth ? $scope.grid.options.rowHeader.rowHeaderWidth : 30);
            });
        },
        post: function($scope, $elm, $attrs) {
          $scope.expand = function(button) {
            if ($scope.grid.options.rowExpandableTemplateHtml) {
              $timeout(function() {
                uiGridExpandableService.toggleRowExpansion($scope.grid, $scope.row);
                $scope.grid.refresh();
              });
              if (button) {
                $scope.expanded = !$scope.expanded;
              }
            }
          };
        }
      };
    }
  };

  return uiGridRowHeaderColumn;
}]);

