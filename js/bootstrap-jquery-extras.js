jQuery.fn.extend({
	bType : function() {
		// Cached type
		if (typeof this._bType !== 'undefined')
			return this._bType;

		var elements = [];
		var $this = this;

		console.log($this);

		$.each(uiElementFactory, function(elem, data) {
			var tag = $this.prop('tagName').toLowerCase();

			if ((tag === data['tag'] ||
				('extra-tags' in data && data['extra-tags'].indexOf(tag) >= 0)) &&
				(!('classes' in data) || $this.hasClass(data['classes']))) {
				
				var attributes_match = true;

				if ('attributes' in data) {

					$.each(data['attributes'], function(attribute, value) {
						if ($this.attr(attribute) !== value)
							attributes_match = false
					});
				}

				if (attributes_match)
					elements.push(elem);
			}
		});

		if (elements === 0)
			return undefined;

		if (elements.length > 1)
			console.log('conflict');

		return elements[0];
	},
	rocketstrapSelectable : function() {
		switch (this.bType()) {
			case 'body':
			case 'container':
				return false;
			default:
				return true;
		}
	},
	bTextAlignment : function(new_alignment) {
		if (typeof new_alignment !== 'undefined')
			return this.removeClass('text-left text-right text-center text-justify').addClass('text-' + new_alignment);

		_element = this;

		while (!_element.is('body')) {
			var alignment = _element[0].className.match(/text-(center|left|right|justify)/);
			
			if (alignment)
				return alignment[1];
			
			_element = _element.parent();
		}

		return 'left';
	},
	bTidyClasses : function() {
		if (this[0].className === '')
			this.removeAttr('class');
	},
	bTidy : function() {
		if (!this.html().length)
			return this.remove();

		this.bRemoveRedundantClasses();
	},
	bRemoveRedundantClasses : function() {
		function checkAlignment(_element) {
			var par = _element.parent();
			var alignment = _element.bTextAlignment();

			if (par.bTextAlignment() == alignment)
				_element.removeClass('text-' + alignment);

			_element.children().each(function() {
				checkAlignment($(this));
			});
		}

		checkAlignment(this);

		for (var i = 0; i < screenSizes.length - 1; i++) {
			var smallestColSizeRe = new RegExp('col-' + screenSizes[i] + '-(\d{1,2})', 'g');
			var smallestColSizeMatch = smallestColSizeRe.exec(this[0].className);

			if (smallestColSizeMatch)
				smallestColSizeMatch = smallestColSizeMatch[1]
			else
				continue;

			for (var j = i + 1; j < screenSizes.length; i++) {
				var currentColSizeRe = new RegExp('col-' + screenSizes[j] + '-(\d{1,2})', 'g');
				var currentColSizeMatch = currentColSizeRe.match(this[0].className)

				if (!currentColSizeMatch)
					continue;

				currentColSizeMatch = currentColSizeMatch[1];

				if (currentColSizeMatch === smallestColSizeMatch)
					removeclass('col-' + screenSizes[j] + '-' + currentColSizeMatch);
				else
					break;	// Don't permiate this
			}
		}

		this.removeClass('col-xs-offset-0');
		
		this.find('*').each(function() {
			$(this).bTidyClasses();
		});
	},
	bRasteriseHtml : function() {
		// Contenteditable has its issues...
		this.html(this.html());
	},
	bParentCol : function() {
		if (this.bType() === 'column')
			return this;

		if (typeof this._bParentCol !== 'undefined')
			return this._bParentCol;

		this._bParentCol = this;
		
		while (!this._bParentCol.parent().is('.row')) {
			this._bParentCol = this._bParentCol.parent();
			if (this._bParentCol.is('body')){
				this._bParentCol = undefined;
				break;
			}
		}
		
		return this._bParentCol;
	},
	bParentRow : function() {
		if (this.bType() === 'row')
			return this;

		if (typeof this._bParentRow !== 'undefined')
			return this._bParentRow;

		this._bParentRow = this.bParentCol();

		if (typeof this._bParentRow !== 'undefined')
			this._bParentRow = this._bParentRow.parent();

		return this._bParentRow;
	},
	bChildrenCol : function() {
		var child = [];

		this.children().each(function() {
			var $this = $(this);

			if ($this.bType() === 'column');
				child.push($this);
		});

		return child;
	},
	bColSize : function(size) {
		if (this.bType() !== 'column')
			return undefined;

		if (typeof size === 'undefined') {
			var match, colRe;

			for (var i = screenIndex; i >= 0; i--) {
				colRe = new RegExp('col-' + screenSizes[i] + '-(\\d{1,2})', 'g');

				if ((match = colRe.exec(this[0].className))) {
					return parseInt(match[1]);
				}
			}

			return 12;
		}

		if (parseInt(size) > 12)
			size = 12;
		else if (parseInt(size) <= 0)
			size = 6;
		
		var colRe = new RegExp('(col-' + screenSizes[screenIndex] + '-)(\\d{1,2})', 'g');
		
		if (colRe.test(this[0].className)) {
			this[0].className = this[0].className.replace(colRe, '$1' + size);
		} else {
			this.addClass('col-' + screenSizes[screenIndex] + '-' + size);
		}
	},
	bColOffset : function(offset) {
		if (this.bType() !== 'column')
			return undefined;

		if (typeof offset === 'undefined') {
			var match, colRe;

			for (var i = screenIndex; i >= 0; i--) {
				colRe = new RegExp('col-' + screenSizes[i] + '-offset-(\\d{1,2})', 'g');

				if ((match = colRe.exec(this[0].className))) {
					return parseInt(match[1]);
				}
			}

			return 0;
		}

		if (parseInt(offset) > 12)
			offset = 12;
		else if (parseInt(offset) < 0)
			offset = 0;

		var colRe = new RegExp('(col-' + screenSizes[screenIndex] + '-offset-)(\\d{1,2})', 'g');
		
		if (colRe.test(this[0].className)) {
			this[0].className = this[0].className.replace(colRe, '$1' + offset);
		} else {
			this.addClass('col-' + screenSizes[screenIndex] + '-offset-' + offset);
		}
	},
	bColour : function(new_colour) {
		var colourRe = /(text|label|badge)-(default|muted|primary|success|info|warning|danger)/g;
		var colourMatch = colourRe.exec(this[0].className);	

		if (typeof new_colour === 'undefined') {
			if (!colourMatch)
				return 'default'
			return colourMatch[2];
		}

		if (colourMatch) {
			this[0].className = this[0].className.replace(colourRe, '');
			this.addClass(colourMatch[1] + '-' + new_colour);
		} else {
			this.addClass('text-' + new_colour);
		}

		this[0].className = this[0].className.replace('  ', ' ');
	},
	_tag : function(tag) {
		if (typeof tag === 'undefined')
			return this.prop('tagName');

		var newNode;

		// Preserve classes, IDs, data-types etc.
		var newNode = $('<' + tag + '/>');
		$.each(this.get(0).attributes, function(i, attrib) {
			$(newNode).attr(attrib.name, attrib.value);
		});
		newNode.html(this.html());

		this.replaceWith(newNode);
		
		return newNode;
	}
});