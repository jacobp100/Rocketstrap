var viewport;
var body;
var viewportOffset;

var activeElem;

var screenSizes = ['xs', 'sm', 'md', 'lg'];
var screenDimensions = [0, 768, 992, 1200];
var screenIndex = 2;

var resizingCol = false;
var offsettingCol = false;

var positioningElement = {
	'active'	: false,
	'element'	: undefined,
	'direction'	: undefined,
	'tag'		: undefined,
	'class'		: undefined
};

var lastCharPosition = -1;

// Last screen always shows desktop as active.

function $$(element) {
	if (typeof element === 'undefined')
		return $$('body');

	return viewport.find(element);
}

function calculateViewPortOffset() {
	viewportOffset = $('#viewport').offset();
}

function calculateScreenSize() {
	var currentWidth = $('#viewport').width();
	var maxWidth = $(window).width() - 560;

	if (currentWidth > maxWidth + 1)	// resizeScreen gives one less than the max boundary
		return resizeScreen(3);

	screenIndex = -1;

	for (var i = 0; i < 4; i++) {
		element = $('#viewsize-' + screenSizes[i])
		element.find('span').removeClass('text-primary');

		if (maxWidth < screenDimensions[i])
			element.addClass('disabled');
		else
			element.removeClass('disabled');

		if (currentWidth <= screenDimensions[i] && 
			screenIndex === -1) {
			screenIndex = i - 1;
			$('#viewsize-' + screenSizes[screenIndex]).find('span').addClass('text-primary');
		}
	}

	if (screenIndex === -1) {
		screenIndex = 3;
		$('#viewsize-lg span').addClass('text-primary');
	}
}

function resizeScreen(size) {
	if (typeof size === 'undefined')
		size = screenIndex;

	var width;

	if (size == 3)
		width = body.width();
	else
		width = screenDimensions[size + 1] - 1;

	$('#viewport').css({
		'width': width,
		'margin-left': - width / 2
	});

	calculateScreenSize();
	calculateViewPortOffset();
}

function selectElement(element) {
	$$('[contenteditable!=""]').each(function() {
		$(this).removeAttr('contenteditable');
	});

	lastCharPosition = -1;

	if (typeof activeElem !== 'undefined') {
		activeElem.bTidy();

		// The following will crash if element is a descendent of the active element
		if (typeof element !== 'undefined' &&
			element.has(activeElem).length)
			activeElem.bRasteriseHtml();
	}

	if (typeof element === 'undefined') {
		activeElem = undefined;
		moveRing();

		$('#viewport').bRasteriseHtml();
		return;
	}
 	
 	activeElem = $$(element);

	redrawUI();
	moveRing();

	activeElem.attr('contenteditable', 'true');
}

function redrawUI() {
	if (typeof activeElem === 'undefined')
		return;

	var args = Array.prototype.slice.call(arguments);
	var args_empty = (arguments.length === 0);

	function redraw(ui) {
		if (args_empty)
			return true;

		return (args.indexOf(ui) !== -1);
	}

	_properties = activeElem.bProperties();

	if (redraw('Alignment')) {
		$('#textAlign button').removeClass('active');
		$('#textAlign' + activeElem.bTextAlignment().toUpperCase()).addClass('active');
	}

	if (_properties.indexOf('text') !== -1) {
		$('#propertiesText').show();

		$('#textStyles li, #textExtras li, #textColours li').removeClass('active').removeClass('disabled');

		if (_properties.indexOf('text-headings') !== -1) {
			$('#textStylesBtn').removeClass('disabled');

			if (activeElem.bType() === 'small')
				$('#textStylesSUBHEADING').addClass('active');
			else
				$('#textStyles' + activeElem.prop('tagName')).addClass('active');
		} else {
			$('#textStylesBtn').addClass('disabled');
		}

		if (_properties.indexOf('text-extras') !== -1) {
			$('#textExtrasBtn').removeClass('disabled');
			$('#textExtras li').addClass('disabled');

			if (_properties.indexOf('text-extras-subheading') !== -1)
				$('#textExtrasSUBHEADING').removeClass('disabled')

			if (_properties.indexOf('text-extras-label') !== -1)
				$('#textExtrasLABEL').removeClass('disabled')

			if (_properties.indexOf('text-extras-badge') !== -1)
				$('#textExtrasBADGE').removeClass('disabled')
		} else {
			$('#textExtrasBtn').addClass('disabled');
		}

		if (_properties.indexOf('text-colour') !== -1) {
			$('#textColoursBtn').removeClass('disabled');
			$('#textColours' + activeElem.bColour().toUpperCase()).addClass('active');
		} else {
			$('#textColoursBtn').addClass('disabled');
		}
	} else {
		$('#propertiesText').hide();
	}

	if (_properties.indexOf('panel') !== -1) {
		$('#propertiesPanel').show();
	} else {
		$('#propertiesPanel').hide()
	}
}

function moveRing() {
	if (typeof activeElem === 'undefined') {
		$('#elementRing, #columnRing, #rowRing').css({
			top: -20,
			height: 0,
			opacity: 0
		});
		return;
	}
	
	var elementPos = activeElem.offset();
	$('#elementRing').css({
		top: elementPos.top + viewportOffset.top - 6,
		left: elementPos.left + viewportOffset.left - 6,
		width: activeElem.outerWidth() + 12,
		height: activeElem.outerHeight() + 12,
		opacity: 1
	}).show();
	
	if (typeof activeElem.bParentCol() !== 'undefined' && typeof activeElem.bParentRow() !== 'undefined') {
		var rowPos = activeElem.bParentRow().offset();
		var colPos = activeElem.bParentCol().offset();
		$('#columnRing').css({
			top: colPos.top + viewportOffset.top - 2,
			left: colPos.left + viewportOffset.left - 2,
			width: activeElem.bParentCol().outerWidth() + 4,
			height: activeElem.bParentCol().outerHeight() + 4,
			opacity: 1
		}).show();
		$('#rowRing').css({
			top: rowPos.top + viewportOffset.top - 4,
			left: rowPos.left + viewportOffset.left - 4,
			width: activeElem.bParentRow().outerWidth() + 8,
			height: activeElem.bParentRow().outerHeight() + 8,
			opacity: 1
		}).show();
	} else {
		$('#rowRing, #columnRing').hide();
	}
}

function skipViewportMouseEvents(skip) {
	var events;

	if (typeof skip === 'undefined' || skip)
		events = 'none';
	else
		events = 'auto';

	$('#viewport').css({
		'pointer-events' : events
	});
}

function elementUnderMouse() {
	element = viewport[0].elementFromPoint(
		viewport.mouseX,
		viewport.mouseY);

	return $(element);
}

function beginResize(dragSide) {
	if (typeof activeElem.bParentCol() === 'undefined')
		return;

	var side = 0;

	switch (dragSide) {
		case 'left':
		default:
			side = 1;
			break;
		case 'right':
			side = -1;
			break;
	}

	if (side === -1 && (activeElem.bParentCol().offset().left < 3 || activeElem.bParentCol().offset() > 0))
		return beginOffset();

	var columnWidth = activeElem.bParentCol().width();
	var columnX = activeElem.bParentCol().offset().left;

	var sizeOfColumn = $$('#editMe').width() / 12;

	var colsIn12 = [];
	var originalColSizes = [];

	var colsInRow = activeElem.bParentRow().bChildrenCol();

	var currentIndex = activeElem.bParentCol().index();

	var sum, editAdjacentNode;

	function recalculateColInfo(appendNodes) {
		colsIn12 = [];
		sum = 12;

		for (var i = 0; i < colsInRow.length; i++) {
			var size = colsInRow[i].bColSize();
			if ((sum -= size) >= 0) {
				if (i > 0 &&
					colsInRow[i].offset().left <= colsIn12[i - 1].offset().left)
					break;
				colsIn12.push(colsInRow[i])
				originalColSizes[i] = size;
			} else {
				break;
			}
		}

		editAdjacentNode = true;
		if ((side === 1 && currentIndex === colsIn12.length - 1) ||
			(side === -1 && currentIndex === 0))
			editAdjacentNode = false;
	}

	recalculateColInfo();

	resizingCol = true;
	viewport[0].body.style.cursor = "col-resize";

	skipViewportMouseEvents()

	body.on('mousemove', function(event) {
		function adjustColSize(direction) {
			var newSize = activeElem.bParentCol().bColSize() + direction;
			
			if (!newSize)
				return;

			activeElem.bParentCol().bColSize(newSize);
			columnWidth += sizeOfColumn * direction;

			if (editAdjacentNode) {
				if (sum) {
					recalculateColInfo();
				} else {
					var newSiblingSize = colsIn12[currentIndex + side].bColSize() - direction;

					if (newSiblingSize === 0) {
						colsIn12[currentIndex + side].bColSize(originalColSizes[currentIndex + side]);
						/*if (side === direction) {
							window.document.title = 'swappin';
							endResize();
							colsIn12[currentIndex + side].size(originalColSizes[currentIndex + side]);
							colsIn12[currentIndex].size(originalColSizes[currentIndex]);
							colsIn12[currentIndex + side].element.after(colsIn12[currentIndex].element);
							return selectElement(colsIn12[currentIndex].element);
						}*/ // TODO: Ctrl for this, only when it moves
						recalculateColInfo();
					} else {
						colsIn12[currentIndex + side].bColSize(newSiblingSize);
					}
				}
			}

			if (side === -1)
				columnX = activeElem.bParentCol().offset().left;

			moveRing();
		}

		if ((side === 1 && event.clientX > columnX + columnWidth + sizeOfColumn + viewportOffset.left) ||
			(side === -1 && event.clientX < columnX - sizeOfColumn + viewportOffset.left))
			adjustColSize(1);
		else if ((side === 1 && event.clientX < columnX + columnWidth + viewportOffset.left) ||
				(side === -1 && event.clientX > columnX + viewportOffset.left))
			adjustColSize(-1);
	});
}

function endResize() {
	resizingCol = false;

	viewport[0].body.style.cursor = "auto";

	skipViewportMouseEvents(false);

	body.off('mousemove');
}

function beginOffset() {
	if (typeof activeElem.bParentCol() === 'undefined')
		return;

	adjustSize = true; // TODO: Ctrl should move elements rather than resize

	var columnX = activeElem.bParentCol().offset().left;

	var sizeOfColumn = $$('#editMe').width() / 12;

	offsettingCol = true;
	viewport[0].body.style.cursor = "col-resize";

	skipViewportMouseEvents()

	body.on('mousemove', function(event) {
		function adjustColOffset(direction) {
			if (adjustSize) {
				var newSize = activeElem.bParentCol().bColSize() - direction;

				if (!newSize)
					return;

				activeElem.bParentCol().bColSize(activeElem.bParentCol().bColSize() - direction);
			}

			activeElem.bParentCol().bColOffset(activeElem.bParentCol().bColOffset() + direction);
			columnX = activeElem.bParentCol().offset().left;
			moveRing();
		}

		if (event.pageX > columnX + viewportOffset.left) {
			if (activeElem.bParentCol().offset().left + activeElem.bParentCol().width() >
				activeElem.bParentRow().offset().left + activeElem.bParentRow().width() - sizeOfColumn)
				return;

			adjustColOffset(1)
		} else if (event.pageX < columnX + viewportOffset.left - sizeOfColumn &&
			event.pageX > !columnX * viewportOffset.left) {
			adjustColOffset(-1);
		}
	});
}

function endOffset() {
	offsettingCol = false;

	activeElem.bParentRow().bRemoveRedundantClasses();

	viewport[0].body.style.cursor = "auto";

	skipViewportMouseEvents(false);

	body.off('mousemove');
}

function beginPositionElement(elementName, className, text) {
	$('#label').html(text).show();

	positioningElement['tag'] = elementName;
	positioningElement['class'] = className;

	positioningElement['active'] = true;

	skipViewportMouseEvents();

	body.on('mousemove', function(event) {
		viewport.mouseX = event.pageX - viewportOffset.left;
		viewport.mouseY = event.pageY - viewportOffset.top;

		$('#label').css({
			left: event.pageX + 5,
			top: event.pageY + 15
		})

		var elem = $$(elementUnderMouse());

		switch (elem.bType()) {
			case 'label':
			case 'badge':
				if (!elem.parent().is('div'))
					return;
			case 'body':
			case 'panel':
			case 'panel-body':
			case 'panel-heading':
			case 'panel-heading-header':
				return;
			case 'column':
				return;	// TODO: Allow
			case 'row':
				return;	// TODO: Allow
			default:
				break;
		}

		positioningElement['element'] = elem;

		var elementPos = positioningElement['element'].offset();

		positioningElement['direction'] = 'after';

		if (viewport.mouseY < elementPos.top + positioningElement['element'].outerHeight() / 2)
			positioningElement['direction'] = 'before';

		if (positioningElement['direction'] === 'after') {
			$('#placementRing').css({
				top: elementPos.top + viewportOffset.top + positioningElement['element'].outerHeight(),
				left: elementPos.left + viewportOffset.left - 6,
				width: positioningElement['element'].outerWidth() + 12,
				height: 6,
				opacity: 1
			}).show();
		} else {
			$('#placementRing').css({
				top: elementPos.top + viewportOffset.top - 6,
				left: elementPos.left + viewportOffset.left - 6,
				width: positioningElement['element'].outerWidth() + 12,
				height: 6,
				opacity: 1
			}).show();
		}
	});
}

function endPositionElement() {
	if (typeof positioningElement['element'] !== 'undefined') {
		var element = $('<' + positioningElement['tag'] + '/>');
		element.html('Edit me');

		if (typeof positioningElement['class'] !== 'undefined')
			element.addClass(positioningElement['class']);

		if (positioningElement['direction'] === 'after')
			positioningElement['element'].after(element);
		else
			positioningElement['element'].before(element);
	}

	$('#placementRing').hide();

	positioningElement['active']	= false;
	positioningElement['element']	= undefined;
	positioningElement['direction']	= undefined;
	positioningElement['class']		= undefined;

	skipViewportMouseEvents(false);

	$('#label').hide();

	body.off('mousemove');
}