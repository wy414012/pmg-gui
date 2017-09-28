/*global Proxmox*/
Ext.define('PMG.RegexTester', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.pmgRegexTester',

    // the field reference which holds the regex value
    // has to be a sibling of the RegexTester component
    regexFieldReference: undefined,

    // if true, wraps the regex with ^ and $
    wholeMatch: false,

    layout: 'hbox',
    submitValue: false,

    items: [{
	xtype: 'textfield',
	submitValue: false,
	name: 'teststring',
	isDirty: function () { return false; },
	reset: Ext.emptyFn
    },{
	margin: '0 0 0 5',
	xtype: 'button',
	text: 'Test',
	handler: function() {
	    var me = this.up();
	    var regexField = me.up().down('field[reference=' + me.regexFieldReference +']');
	    var regex = '';

	    if (me.wholeMatch) {
		regex = '^' + regexField.getValue() + '$';
	    } else {
		regex = regexField.getValue();
	    }

	    Proxmox.Utils.API2Request({
		url: '/api2/extjs/config/regextest',
		waitMsgTarget: me.up('window'),
		params: {
		    regex: regex,
		    text: me.down('textfield[name=teststring]').getValue()
		},
		method: 'POST',
		success: function(response) {
		    Ext.Msg.show({
			title: gettext('Success'),
			message: gettext('OK') +
			    ' (elapsed time: ' +
			    response.result.data + 'ms' + ')',
			buttons: Ext.Msg.OK,
			icon: Ext.MessageBox.INFO
		    });
		},
		failure: function(response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		}
	    });
	}
    }],

    initComponent: function() {
	var me = this;

	if (!me.regexFieldReference) {
	    throw "No regex field reference given";
	}

	me.callParent();

    }
});
