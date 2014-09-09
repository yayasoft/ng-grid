(function(){
	angular.module('ui.grid')
	.factory('GridRowHeaderColumn', ['gridUtil', 'uiGridConstants', function(gridUtil, uiGridConstants) {

		/**
		* @ngdoc function
		* @name ui.grid.class:GridRowHeaderColumn
		* @description Represents the viewModel for each row header cell.  Any state or methods needed for a Grid HeaderRowCell
		* are defined on this prototype
		* @param {rowInde} index of the row where cell is positioned
		* @param {Grid} grid reference to the grid
		* @param {checkboxTemplate} checkbox template 
		* @param {buttonTemplate} button template
		*
		* * Might need to add additional properties*
		*
		*/
		function GridRowHeaderColumn(grid, rowHeaderCellType, checkboxTemplate, buttonTemplate, colDef, index) {
			var self = this;
			self.grid = grid;
			self.rowHeaderCellType = rowHeaderCellType;
			self.templates = {
				checkboxTemplate: checkboxTemplate,
				buttonTemplate: buttonTemplate
			};
			self.colDef = colDef;
			self.index = index;
		}

		/**
     * @ngdoc function
     * @name getRowIndex
     * @methodOf ui.grid.class:GridRowHeaderColumn
     * @description Returns index of the row
     */
		GridRowHeaderColumn.prototype.getRowIndex = function() {
			var self = this;

			return self.rowIndex;
		};

		/**
     * @ngdoc function
     * @name setRowIndex
     * @methodOf ui.grid.class:GridRowHeaderColumn
     * @description Sets row index property
     */
		GridRowHeaderColumn.prototype.setRowIndex = function(rowIndex) {
			var self = this;

			self.rowIndex = rowIndex;
		};

		/**
     * @ngdoc function
     * @name isRowHeader
     * @methodOf ui.grid.class:GridRowHeaderColumn
     * @description Returns true if column is row header
     */
		GridRowHeaderColumn.prototype.isRowHeader = function() {
			return true;
		};

		/**
     * @ngdoc function
     * @name getColClassDefinition
     * @methodOf ui.grid.class:GridRowHeaderColumn
     * @description Returns the class definition for th column
     */
    GridRowHeaderColumn.prototype.getColClassDefinition = function () {
      return ' .grid' + this.grid.id + ' ' + this.getColClass(true) + ' { width: ' + this.drawnWidth + 'px; }';
    };

    /**
     * @ngdoc function
     * @name getColClass
     * @methodOf ui.grid.class:GridRowHeaderColumn
     * @description Returns the class name for the column
     * @param {bool} prefixDot  if true, will return .className instead of className
     */
    GridRowHeaderColumn.prototype.getColClass = function (prefixDot) {
      var cls = uiGridConstants.COL_CLASS_PREFIX + this.index;

      return prefixDot ? '.' + cls : cls;
    };

		GridRowHeaderColumn.prototype.updateColumnDef = function(colDef, index) {
			var self = this;

			self.colDef = colDef;

			//position of column
			self.index = (typeof(index) === 'undefined') ? colDef.index : index;

			if (colDef.name === undefined) {
				throw new Error('colDef.name is required for column at index ' + self.index);
			}

			var parseErrorMsg = "Cannot parse column width '" + colDef.width + "' for column named '" + colDef.name + "'";

			// If width is not defined, set it to a single star
			if (gridUtil.isNullOrUndefined(colDef.width)) {
				self.width = '*';
			}
			else {
				// If the width is not a number
				if (!angular.isNumber(colDef.width)) {
					// See if it ends with a percent
					if (gridUtil.endsWith(colDef.width, '%')) {
						// If so we should be able to parse the non-percent-sign part to a number
						var percentStr = colDef.width.replace(/%/g, '');
						var percent = parseInt(percentStr, 10);
						if (isNaN(percent)) {
							throw new Error(parseErrorMsg);
						}
						self.width = colDef.width;
					}
					// And see if it's a number string
					else if (colDef.width.match(/^(\d+)$/)) {
						self.width = parseInt(colDef.width.match(/^(\d+)$/)[1], 10);
					}
					// Otherwise it should be a string of asterisks
					else if (!colDef.width.match(/^\*+$/)) {
						throw new Error(parseErrorMsg);
					}
				}
				// Is a number, use it as the width
				else {
					self.width = colDef.width;
				}
			}
		};

		return GridRowHeaderColumn;
	}]);
})();