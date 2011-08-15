/**
 * Copy With Q
 *
 * Automatic Quotes !
 * Requires jQuery
 * Q2 2011
 *
 * @copyleft   ic (icweb.eu)
 * @license    CC BY (http://creativecommons.org/licenses/by/3.0/)
 * @link       https://github.com/iiic/copywithq
 * @version    0.2
 *
 * Fork me on github @iiic
 */

var CopyWithQ = function(signature) {
	this.signature = signature;
};

CopyWithQ.prototype = {

	settings: // default values
	{
		'id': 'CopyWithQ-id',
		'addLink': true,
		'sourceLinkText': '',
		'minLength': 80,
		'preText': false
	},

	set: function(variables)
	{
		for(i in variables) {
			this.settings[i] = variables[i];
		}
	},

	newSelection: function()
	{
		if('getSelection' in document) { // Chrome, Safari, Firefox
			return this.windowGetSelection();
		} else if ('selection' in document) { // IE
			return this.documentSelection();
		} // 'document.getSelection' for Opera
		return false;
	},

	windowGetSelection: function()
	{
		var selection = window.getSelection();
		if(!selection) {
			return false;
		}
		if(!this.addQ(selection.toString())) {
			return false;
		}
		var element = $('#'+this.settings['id']).get(-1);
		var tempRange = document.createRange();
		var range = selection.getRangeAt(0);
		tempRange.selectNode(element);
		selection.removeAllRanges();
		selection.addRange(tempRange);
		return function() {
			$(element).remove();
			selection.removeAllRanges();
			selection.addRange(range)
		}
	},

	documentSelection: function()
	{
		var range = document.selection.createRange();
		var selectedHTML = range.htmlText;
		if(!this.addQ(selectedHTML)) {
			return false;
		}
		var element = $('#'+this.settings['id']).get(-1);
		var textRange = document.body.createTextRange();
		textRange.moveToElementText(element);
		textRange.select();
		return function () {
			$(element).remove();
			range.select();
		}
	},

	addQ: function(selectedHTML)
	{
		if(selectedHTML.length < this.settings['minLength']) {
			return false;
		}
		if(this.settings['preText']) {
			selectedHTML = '<pre>'+selectedHTML+'</pre>';
		}
		if(this.signature) {
			if(this.settings['addLink']) {
				selectedHTML += '<blockquote> -- '+this.signature+'<br>'+this.settings['sourceLinkText']+'<a href="'+location.href+'">'+location.href+'</a></blockquote>';
			} else {
				selectedHTML += '<blockquote> -- '+this.signature+'</blockquote>';
			}
		} else {
			if(this.settings['addLink']) {
				selectedHTML += '<blockquote style="font-style:italic">'+this.settings['sourceLinkText']+'<a href="'+location.href+'">'+location.href+'</a></blockquote>';
			} else {
				return true;
			}
		}
		$('<div>', {
			id: this.settings['id'],
			style: 'position:absolute;top:-9px;width:0;height:0;overflow:hidden'
		}).appendTo('body');
		$('#'+this.settings['id']).append(selectedHTML);
		return true;
	},

	catchSelection: function(signature)
	{
		this.signature = signature;
		var end = this.newSelection();
		if(end) {
			setTimeout(end, 1);
		}
	},

	run: function()
	{
		sig = this.signature;
		$('body').bind('copy', function() { // NOT working with Opera 11.11
			CopyWithQ.prototype.catchSelection(sig);
		});
	}

};
