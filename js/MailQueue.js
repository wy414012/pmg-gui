Ext.define('pmg-mailq', {
    extend: 'Ext.data.Model',
    fields: [
	'queue_id', 'queue_name',
	{ type: 'date',  dateFormat: 'timestamp', name: 'arrival_time'},
	{ type: 'integer', name: 'message_size'},
	'sender', 'receiver', 'reason'
    ],
    idProperty: 'queue_id'
});

Ext.define('pmg-qshape', {
    extend: 'Ext.data.Model',
    fields: [
	'domain',
	{ type: 'integer', name: 'total'},
	{ type: 'integer', name: '5s'},
	{ type: 'integer', name: '10s'},
	{ type: 'integer', name: '20s'},
	{ type: 'integer', name: '40s'},
	{ type: 'integer', name: '80s'},
	{ type: 'integer', name: '160s'},
	{ type: 'integer', name: '320s'},
	{ type: 'integer', name: '640s'},
	{ type: 'integer', name: '1280s'},
	{ type: 'integer', name: '1280s+'}
    ],
    proxy: {
	type: 'proxmox',
	url: "/api2/json/nodes/" + Proxmox.NodeName + "/postfix/qshape"
    },
    idProperty: 'domain'
});

Ext.define('PMG.Postfix.QShape', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.pmgPostfixQShape',

    store: {
	autoLoad: true,
	model: 'pmg-qshape'
    },

    controller: {

	xclass: 'Ext.app.ViewController',

	onFlush: function() {
	    console.log('flush');
	},

	onDeleteAll: function() {
	    console.log('delete all');
	},

	onDiscardVerifyDatabase: function() {
	    console.log('discard verify datatbase');
	}
    },

    tbar: [
        {
	    text: gettext('Flush Queue'),
	    handler: 'onFlush'
	},
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Delete all Messages'),
	    selModel: null,
	    handler: 'onDeleteAll'
	},
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Discard address verification database'),
	    selModel: null,
	    handler: 'onDiscardVerifyDatabase'
	}
    ],

    columns: [
	{
	    header: gettext('Domain'),
	    width: 200,
	    dataIndex: 'domain'
	},
	{
	    header: gettext('Total'),
	    width: 80,
	    dataIndex: 'total'
	},
	{
	    header: '5s',
	    width: 80,
	    dataIndex: '5s'
	},
	{
	    header: '10s',
	    width: 80,
	    dataIndex: '10s'
	},
	{
	    header: '20s',
	    width: 80,
	    dataIndex: '20s'
	},
	{
	    header: '40s',
	    width: 80,
	    dataIndex: '40s'
	},
	{
	    header: '80s',
	    width: 80,
	    dataIndex: '80s'
	},
	{
	    header: '160s',
	    width: 80,
	    dataIndex: '160s'
	},
	{
	    header: '320s',
	    width: 80,
	    dataIndex: '320s'
	},
	{
	    header: '640s',
	    width: 80,
	    dataIndex: '640s'
	},
	{
	    header: '1280s',
	    width: 80,
	    dataIndex: '1280s'
	},
	{
	    header: '1280s+',
	    width: 80,
	    dataIndex: '1280s+'
	}
    ]
});
