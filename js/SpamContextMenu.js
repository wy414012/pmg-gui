Ext.define('PMG.menu.SpamContextMenu', {
    extend: 'Ext.menu.Menu',

    showSeparator: false,

    controller: {
	xclass: 'Ext.app.ViewController',
	callCallback: function(btn) {
	    let view = this.getView();
	    if (Ext.isFunction(view.callback)) {
		view.callback(btn.action);
	    }
	},
    },

    items: [
	{
	    text: gettext('Deliver'),
	    iconCls: 'fa fa-fw fa-paper-plane-o',
	    action: 'deliver',
	    handler: 'callCallback',
	},
	{
	    text: gettext('Delete'),
	    iconCls: 'fa fa-fw fa-trash-o',
	    action: 'delete',
	    handler: 'callCallback',
	},
	{ xtype: 'menuseparator' },
	{
	    text: gettext('Whitelist'),
	    iconCls: 'fa fa-fw fa-check',
	    action: 'whitelist',
	    handler: 'callCallback',
	},
	{
	    text: gettext('Blacklist'),
	    iconCls: 'fa fa-fw fa-times',
	    action: 'blacklist',
	    handler: 'callCallback',
	},
    ],
});
