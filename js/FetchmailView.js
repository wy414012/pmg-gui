Ext.define('pmg-fetchmail-users', {
    extend: 'Ext.data.Model',
    fields: [
	'id', 'protocol', 'port', 'server', 'user', 'pass', 'target',
	'ssl', 'keep',
	{ type: 'integer', name: 'interval' },
	{ type: 'boolean', name: 'enable' },
    ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/config/fetchmail"
    },
    idProperty: 'id'
});

Ext.define('PMG.FetchmailView', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgFetchmailView',

    store: {
	autoDestroy: true,
	autoLoad: true,
	model: 'pmg-fetchmail-users'
    },

    controller: {

	xclass: 'Ext.app.ViewController',

	init: function(view) {
	    Proxmox.Utils.monStoreErrors(view, view.store, true);
	}
    },

    listeners: {
	//scope: 'controller',
	//itemdblclick: 'onEdit',
    },

     columns: [
	{
	    header: gettext('Server'),
	    flex: 1,
	    renderer: Ext.String.htmlEncode,
	    dataIndex: 'server'
	},
	{
	    header: gettext('User name'),
	    flex: 1,
	    renderer: Ext.String.htmlEncode,
	    dataIndex: 'user'
	},
	{
	    header: gettext('Deliver to'),
	    flex: 1,
	    renderer: Ext.String.htmlEncode,
	    dataIndex: 'target'
	},
	{
	    header: gettext('Enabled'),
	    sortable: true,
	    renderer: Proxmox.Utils.format_boolean,
	    dataIndex: 'enable'
	},
	{
	    header: gettext('Interval'),
	    dataIndex: 'interval'
	}
     ]
});
