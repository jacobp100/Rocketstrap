uiElementFactory = {
	"body": {
		"tag": "body"
	},
	"container": {
		"classes": "container-fluid",
		"tag": "div"
	},
	"header": {
		"content": "Edit me",
		"extra-tags": [
			"h2",
			"h3",
			"h4",
			"h5",
			"h6"
		],
		"tag": "h1"
	},
	"jumbotron": {
		"classes": "jumbotron",
		"elements": [
			"header",
			"paragraph"
		],
		"tag": "div"
	},
	"label": {
		"classes": "label label-default",
		"content": "Edit me",
		"tag": "span"
	},
	"link": {
		"content": "Link",
		"default-attributes": {
			"href": "#"
		},
		"tag": "a"
	},
	"navigation": {
		"attributes": {
			"role": "navigation"
		},
		"classes": "navbar navbar-inverse",
		"elements": [
			"navigation-header",
			"navigation-collapse"
		],
		"tag": "div"
	},
	"navigation-brand": {
		"attributes": {
			"href": "#"
		},
		"classes": "navbar-brand",
		"content": "Your Website",
		"parent": "navigation-header",
		"tag": "a"
	},
	"navigation-collapse": {
		"classes": "navbar-collapse collapse",
		"elements": [
			"navigation-list"
		],
		"parent": "navigation",
		"tag": "div"
	},
	"navigation-header": {
		"classes": "navbar-header",
		"elements": [
			"navigation-brand"
		],
		"parent": "navigation",
		"tag": "div"
	},
	"navigation-list": {
		"classes": "nav navbar-nav",
		"elements": [
			"navigation-list-item",
			"navigation-list-item",
			"navigation-list-item",
			"navigation-list-item"
		],
		"parent": "navigation-collapse",
		"tag": "ul"
	},
	"navigation-list-item": {
		"elements": [
			"link"
		],
		"parent": "navigation-list",
		"tag": "li"
	},
	"panel": {
		"classes": "panel",
		"default-classes": "panel-default",
		"elements": [
			"panel-heading",
			"panel-body"
		],
		"tag": "div"
	},
	"panel-body": {
		"classes": "panel-body",
		"elements": [
			"paragraph"
		],
		"parent": "panel",
		"tag": "div"
	},
	"panel-footer": {
		"classes": "panel-footer",
		"content": "Edit me",
		"parent": "panel",
		"tag": "div"
	},
	"panel-heading": {
		"classes": "panel-heading",
		"content": "Edit me",
		"parent": "panel",
		"tag": "div"
	},
	"paragraph": {
		"content": "Edit me",
		"tag": "p"
	},
	"small": {
		"classes": "small",
		"content": "Edit me",
		"tag": "p"
	}
}

function generateElement(name, container) {
	if (!(name in uiElementFactory))
		return undefined;

	if (typeof container === 'undefined')
		container = false;

	var data = uiElementFactory[name];

	var element = $('<' + data['tag'] + '/>');
	var containerElement;

	if (container)
		containerElement = generateElement('container');
	else
		containerElement = element;

	if ('classes' in data)
		element.addClass(data['classes'])

	if ('default-classes' in data)
		element.addClass(data['default-classes'])

	if ('attributes' in data) {
		$.each(data['attributes'], function(key, value) {
			element.attr(key, value);
		});
	}

	if ('default-attributes' in data) {
		$.each(data['default-attributes'], function(key, value) {
			element.attr(key, value);
		});
	}

	if ('elements' in data) {
		$.each(data['elements'], function(index, element) {
			containerElement.append(generateElement(element));
		});
	} else if ('content' in data) {
		containerElement.html(data['content']);
	}

	if (container) {
		element.append(containerElement);
		return element;
	}

	return element;
}