Ext.define('PMG.ContactDetails', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgContactDetails',

    dockedItems: [
	{
	    dock: 'top',
	    xtype: 'panel',
	    itemId: 'info',
	    bodyPadding: 10,
	    html: gettext('Please select a Contact.')
	}
    ],

    disableSelection: true,

    setUrl: function(url, title) {
	var me = this;

	me.store.setUrl(url);
	Proxmox.Utils.setErrorMask(me, false);
	me.store.reload();

	var infopanel = me.getComponent('info');
	if (title) {
	    infopanel.update(title);
	} else {
	    infopanel.update(gettext('Please select a Contact'));
	}
    },

    store: {
	type: 'pmgStatStore',
	autoReload: false,
	remoteSort: true,
	fields: [
	    'sender', 'virusinfo',
	    { type: 'integer', name: 'bytes' },
	    { type: 'boolean', name: 'blocked' },
	    { type: 'integer', name: 'spamlevel' },
            { type: 'date', dateFormat: 'timestamp', name: 'time' }
	],
	proxy: {
	    type: 'proxmox',
	    sortParam: 'orderby'
	},
	sorters: [
	    {
		property: 'time',
		direction: 'ASC'
	    }
	]
    },

    columns: [
	{
	    text: gettext('Sender'),
	    renderer: Ext.htmlEncode,
	    flex: 1,
	    dataIndex: 'sender'
	},
	{
	    header: gettext('Size') + ' (KB)',
	    renderer: function(v) { return Ext.Number.toFixed(v/1024, 0); },
	    dataIndex: 'bytes'
	},
	{
	    xtype: 'datecolumn',
	    header: gettext('Date'),
	    format: 'Y-m-d',
	    dataIndex: 'time'
	},
	{
	    xtype: 'datecolumn',
	    header: gettext('Time'),
	    format: 'H:m:s',
	    dataIndex: 'time'
	},
    ],

    initComponent: function() {
	var me = this;
	me.callParent();

	Proxmox.Utils.monStoreErrors(me, me.store, true);
    }
});

Ext.define('PMG.ContactList', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.pmgContactList',

    title: gettext('Statistics') + ': ' + gettext('Contact'),

    multiColumnSort: true,
    plugins: 'gridfilters',

    emptyText: gettext('No data in database.'),
    viewConfig: {
	deferEmptyText: false
    },

    tbar: [ { xtype: 'pmgStatTimeSelector' } ],

    store: {
	type: 'pmgStatStore',
	staturl: '/api2/json/statistics/contact',
	remoteSort: true,
	remoteFilter: true,
	fields: [
	    'contact',
	    { type: 'integer', name: 'count' },
	    { type: 'integer', name: 'viruscount' },
	    { type: 'integer', name: 'bytes' },
	],
	proxy: {
	    type: 'pmgfilterproxy',
	    sortParam: 'orderby',
	    filterId: 'x-gridfilter-contact'
	},
	sorters: [
	    {
		property: 'count',
		direction: 'DESC'
	    },
	    {
		property: 'bytes',
		direction: 'DESC'
	    },
	    {
		property: 'contact',
		direction: 'ASC'
	    }
	]
    },

    columns: [
	{
	    text: gettext('Contact'),
	    flex: 1,
	    renderer: Ext.htmlEncode,
	    dataIndex: 'contact',
	    filter: {
		type: 'string',
		itemDefaults: {
		    // any Ext.form.field.Text configs accepted
		}
	    }
	},
	{
	    text: gettext('Count'),
	    columns: [
		{
		    text: gettext('Mail'),
		    dataIndex: 'count'
		},
		{
		    header: gettext('Virus'),
		    dataIndex: 'viruscount'
		}
	    ]
	},
	{
	    text: gettext('Size') + ' (KB)',
	    dataIndex: 'bytes',
	    renderer: function(v) {
		return Ext.Number.toFixed(v/1024, 0);
	    }
	}
    ],

    initComponent: function() {
	var me = this;
	me.callParent();

	Proxmox.Utils.monStoreErrors(me, me.store, true);
    }
});

Ext.define('PMG.ContactStatistics', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgContactStatistics',

    layout: 'border',
    border: false,
    defaults: {
	border: false,
    },

    controller: {
	xclass: 'Ext.app.ViewController',

	selectionChange: function(grid, selected, eOpts) {
	    var details =  this.lookupReference('details');
	    if (selected.length > 0) {
		var contact = selected[0].data.contact;
		var url = "/api2/json/statistics/contact/" +
		    encodeURIComponent(contact);
		details.setUrl(url, '<b>' + gettext('Contact') + ':</b> ' + Ext.htmlEncode(contact));
	    } else {
		details.setUrl();
	    }
	}
    },

    items: [
	{
	    xtype: 'pmgContactList',
	    multiColumnSort: true,
	    region: 'center',
	    layout: 'fit',
	    flex: 1,

	    listeners: { selectionchange: 'selectionChange' },
	},
	{
	    xtype: 'pmgContactDetails',
	    region: 'east',
	    reference: 'details',
	    split: true,
	    flex: 1
	}
    ]
});
