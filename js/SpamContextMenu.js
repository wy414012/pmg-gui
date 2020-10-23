Ext.define('PMG.menu.SpamContextMenu', {
    extend: 'Ext.menu.Menu',

    showSeparator: false,

    controller: {
	xclass: 'Ext.app.ViewController',
	callCallback: function(btn) {
	    var me = this.getView();
	    if (Ext.isFunction(me.callback)) {
		me.callback(btn.action);
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
	    handler: 'action',
	},
	{
	    text: gettext('Blacklist'),
	    iconCls: 'fa fa-fw fa-times',
	    action: 'blacklist',
	    handler: 'action',
	},
    ],
});
