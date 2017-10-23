/*global Proxmox*/
Ext.define('PMG.ViewMailHeaders', {
    extend: 'Ext.window.Window',
    alias: 'widget.pmgViewMailHeaders',

    url: undefined,

    width: 600,

    height: 400,

    bodyPadding: 10,

    modal: true,

    layout: {
	type: 'vbox',
	align: 'stretch'
    },

    controller: {

	xclass: 'Ext.app.ViewController',

	init: function(view) {

	    var panel = view.lookupReference('contentPanel');
	    var fromField =
	    Proxmox.Utils.API2Request({
		url: view.url,
		waitMsgTarget: view,
		method: 'GET',
		waitMsgTarget: view,
		success: function(response, opts) {
		    var data = response.result.data;
		    var from = data.match(/^FROM:\s*(.*\S)\s*$/mi);
		    if (from) {
			view.lookupReference('fromField').setValue(from[1]);
		    }
		    var to = data.match(/^TO:\s*(.*\S)\s*$/mi);
		    if (to) {
			view.lookupReference('toField').setValue(to[1]);
		    }
		    var subject = data.match(/^SUBJECT:\s*(.*\S)\s*$/mi);
		    if (subject) {
			view.lookupReference('subjectField').setValue(subject[1]);
		    }
		    panel.update(Ext.String.htmlEncode(data));
		},
		failure: function (response, opts) {
		    view.destroy();
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		}
	    });

	}
    },

    items: [
	{
	    xtype: 'textfield',
	    fieldLabel: gettext('From'),
	    reference: 'fromField',
	    focusable: false,
	    exitable: false
	},
	{
	    xtype: 'textfield',
	    fieldLabel: gettext('To'),
	    reference: 'toField',
	    focusable: false,
	    exitable: false
	},
	{
	    xtype: 'textfield',
	    fieldLabel: gettext('Subject'),
	    reference: 'subjectField',
	    focusable: false,
	    exitable: false
	},
	{
	    xtype: 'displayfield',
	    fieldLabel: gettext('Header')
	},
	{
	    xtype: 'panel',
	    bodyPadding: 5,
	    reference: 'contentPanel',
	    flex: 1,
	    autoScroll: true,
	    bodyStyle: 'white-space:pre'
	}
    ]
});
