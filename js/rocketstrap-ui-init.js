var editMode = 'designer';
var aceEdit;

function initJStrap() {
	viewport = $('#viewport').contents();
	body = $('body');

	$$('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', 'css/bootstrap.min.css'))
	.append($('<style />').append('* { outline: none; }'));

	aceEdit = ace.edit('sidebarCode');
	aceEdit.setTheme("ace/theme/solarized_light");
	aceEdit.getSession().setMode("ace/mode/html");

	$(window).on('resize', function() {
		calculateScreenSize();

		$('#viewport').css({
			height: $(document).height() - 50
		});

		if (typeof activeElem !== 'undefined')
			moveRing();
	})
	/*.on('beforeunload', function() {
		return 'Are you sure you want to leave?';
	})*/
	.resize();

	resizeScreen(3);

	body.on('mouseup', function(event) {
		if (editMode !== 'designer')
			return;
		
		viewport.mouseX = event.pageX - viewportOffset.left;
		viewport.mouseY = event.pageY - viewportOffset.top;

		if (resizingCol)
			endResize();
		if (offsettingCol)
			endOffset();
		if (positioningElement['active'])
			endPositionElement();
	});

	$$().on('mouseup', function(event) {
		if (editMode !== 'designer')
			return;

		viewport.mouseX = event.pageX;
		viewport.mouseY = event.pageY;

		var element = elementUnderMouse();

		if (element.rocketstrapSelectable())
			selectElement(element);
		else if (element.bType() === 'body')
			selectElement();
	});

	$$().on('keyup', function(event) {
		newPosition = viewport[0].getSelection()['baseOffset'];

		if (event['keyCode'] == 39) {
			if (lastCharPosition == newPosition) {
				elem = activeElem;
				if (!elem.isSmallThing())
					elem = new Content(elem.element.children().last());

				if (elem.isSmallThing()) {
					var textRe = new RegExp(elem.element[0].outerHTML + '(.+)', 'g');
					if (!textRe.test(elem.element.parent().html()))
						elem.element.after(' .');
					selectElement(elem.element.parent());
				}

				var range, selection;
			    if(viewport[0].createRange)
			    {
			        range = viewport[0].createRange();
			        range.selectNodeContents(activeElem.element[0]);
			        range.collapse(false);
			        selection = window.getSelection();
			        selection.removeAllRanges();
			        selection.addRange(range);
			    }
			} else {
				lastCharPosition = newPosition;
			}
		} else {
			lastCharPosition = -1;
		}

		moveRing();
	});
}

function initJStrapUI() {
	$('#resizeRight').on('mousedown', function(event) {
		event.stopPropagation();
		beginResize();
	});

	$('#resizeLeft').on('mousedown', function(event) {
		event.stopPropagation();
		beginResize('right');
	});

	$('#delete').on('click', function(event) {
		event.stopPropagation();
		activeElem.remove();

		activeElem = undefined;
		selectElement();
	})

	$('#screenSizes button').on('click', function() {
		var size = 3;

		if (!($(this).is(':last-child') ||
			$(this).next().is('.disabled')))
			size = $(this).data('screen-size');

		resizeScreen(size);
	});

	$('#editmode-designer').on('click', function() {
		if (editMode === 'designer')
			return;

		editMode = 'designer';

		$('#designerMode span').removeClass('text-primary');
		$('#editmode-designer span').addClass('text-primary');

		$('#sidebarProperties, #sidebarContent').css({
			'margin' : 0
		});
		$('#sidebarCode').css({
			'margin-right' : -560
		});

		$('body').css({
			'margin-left' : 280,
			'margin-right': 280
		});
	});

	$('#editmode-HTML').on('click', function() {
		aceEdit.setValue(formatXml($$().html()));
		aceEdit.clearSelection();

		if (editMode === 'html')
			return;

		editMode = 'html';

		selectElement();

		$('#designerMode span').removeClass('text-primary');
		$('#editmode-HTML span').addClass('text-primary');

		$('#sidebarProperties').css({
			'margin-right' : -280
		});
		$('#sidebarContent').css({
			'margin-left' : -280
		});
		$('#sidebarCode').css({
			'margin-right' : 0
		});
		$('body').css({
			'margin-left' : 0,
			'margin-right': 560
		});
	});

	$('#editmode-preview').on('click', function() {
		if (editMode === 'preview')
			return;

		editMode = 'preview';
		
		selectElement();

		$('#designerMode span').removeClass('text-primary');
		$('#editmode-preview span').addClass('text-primary');

		$('#sidebarProperties').css({
			'margin-right' : -280
		});
		$('#sidebarContent').css({
			'margin-left' : -280
		});
		$('#sidebarCode').css({
			'margin-right' : -560
		});

		$('body').css({
			'margin-left' : 280,
			'margin-right': 280
		});
	});

	$('[data-position-element-name!=""]').mousedown(function(e) {
		if (typeof $(this).data('position-element-name') === 'undefined')
			return;

		e.preventDefault();

		$(this).mouseup();

		beginPositionElement($(this).data('position-element-name'));
	})
	
	$('[data-command!=""]').on('click', function(e) {
		e.preventDefault();
		if (typeof $(this).data('command') === 'undefined')
			return;
		
		viewport[0].execCommand($(this).data('command'), false, $(this).data('command-argument'));
	});
	
	$('[data-change-tag!=""]').on('click', function(e) {
		e.preventDefault();

		var $this = $(this);

		if (typeof $this.data('change-tag') === 'undefined')
			return;
		
		var newElem = activeElem._tag($this.data('change-tag'));
		activeElem = undefined;	// selectElement will try to clean up a non-existent element otherwise

		selectElement(newElem);

		moveRing();
	});
	
	$('[data-add-class!=""], [data-remove-class!=""]').on('click', function(e) {
		e.preventDefault();
		
		if (typeof activeElem === 'undefined')
			return;
		
		if (typeof $(this).data('add-class') !== 'undefined')
			activeElem.addClass($(this).data('add-class'));
		
		if (typeof $(this).data('remove-class') !== 'undefined')
			activeElem.removeClass($(this).data('remove-class'));
		
		if (activeElem[0].className === '')
			activeElem.bTidyClasses();
		
		moveRing();
		redrawUI('Styles');
	});
	
	$('[data-toggle-class!=""]').on('click', function(e) {
		e.preventDefault();
		
		if (typeof activeElem === 'undefined')
			return;
		if (typeof $(this).data('toggle-class') === 'undefined')
			return;
		
		if (activeElem.hasClass($(this).data('toggle-class')))
			activeElem.removeClass($(this).data('toggle-class'));
		else
			activeElem.addClass($(this).data('toggle-class'));
		
		activeElem.bTidyClasses();
		moveRing();
		redrawUI('Styles');
	});
	
	$('[data-wrap!=""]').on('click', function(e) {
		e.preventDefault();
		
		if (typeof activeElem === 'undefined')
			return;
		if (typeof $(this).data('wrap') === 'undefined')
			return;

		var node = $('<' + $(this).data('wrap') + '/>');
		
		if (viewport[0].getSelection().toString().length === 0)
			node.html('Edit me');
		else
			node.html(viewport[0].getSelection().toString());

		node.addClass($(this).data('add-wrap-class'));

		viewport[0].execCommand('insertHTML', false, ' ' + node[0].outerHTML);
	});
	
	$('[data-text-position!=""]').on('click', function(e) {
		e.preventDefault();
		
		if (typeof activeElem === 'undefined')
			return;
		
		var text_position = $(this).data('text-position');
		var target = $(this).data('target');
		
		if (typeof text_position === 'undefined')
			return;
		
		var element;
		
		switch (target) {
			case 'element':
			default:
				activeElem.bTextAlignment(text_position);
				activeElem.bRemoveRedundantClasses();
				break;
			case 'column':
				activeElem.bParentCol().bTextAlignment(text_position);
				activeElem.bParentCol().bRemoveRedundantClasses();
				break;
		}

		activeElem.bParentRow().bRemoveRedundantClasses();
		
		moveRing();
		redrawUI('Alignment');
	});

	$('[data-colour!=""]').on('click', function(e) {
		e.preventDefault();

		if (typeof activeElem === 'undefined')
			return;

		var colour = $(this).data('colour');

		if (typeof colour === 'undefined')
			return;

		activeElem.bColour(colour);

		redrawUI('Styles');		
	});
}