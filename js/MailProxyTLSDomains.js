/*global Proxmox*/
Ext.define('pmg-tls-policy', {
    extend: 'Ext.data.Model',
    fields: [ 'domain', 'policy' ],
    idProperty: 'domain',
    proxy: {
	type: 'proxmox',
	url: '/api2/json/config/tlspolicy'
    },
    sorters: {
	property: 'domain',
	order: 'DESC'
    }
});

Ext.define('PMG.TLSDomainEdit', {
    extend: 'Proxmox.window.Edit',
    xtype: 'pmgTLSDomainEdit',
    onlineHelp: 'pmgconfig_mailproxy_tls',

    subject: gettext('TLS Policy'),
    initComponent : function() {
	var me = this;

	var isCreate = ! Ext.isDefined(me.domain);

	var url = '/api2/extjs/config/tlspolicy' + (isCreate ? '' : '/' + me.domain);
	var method = isCreate ? 'POST' : 'PUT';
	var text = isCreate ? 'Create' : 'Edit';

	var items = [
	    {
		xtype: isCreate ? 'proxmoxtextfield' : 'displayfield',
		name: 'domain',
		fieldLabel: gettext('Domain')
	    },
	    {
		xtype: 'proxmoxKVComboBox',
		name: 'policy',
		fieldLabel: gettext('Policy'),
		deleteEmpty: false,
		comboItems: [
		    [ 'none', 'none' ],
		    [ 'may', 'may' ],
		    [ 'encrypt', 'encrypt' ],
		    [ 'dane', 'dane' ],
		    [ 'dane-only', 'dane-only' ],
		    [ 'fingerprint', 'fingerprint' ],
		    [ 'verify', 'verify' ],
		    [ 'secure', 'secure' ]
		],
		allowBlank: true,
		value: 'encrypt'
	    }
	];

	Ext.apply(me, {
	    url: url,
	    method: method,
	    items: items,
	    text: text
	});

	me.callParent();
    }
});

Ext.define('PMG.MailProxyTLSDomains', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pmgMailProxyTLSDomains'],

    viewConfig: {
	trackOver: false
    },
    columns: [
	{
	    header: gettext('Domain'),
	    width: 200,
	    sortable: true,
	    dataIndex: 'domain'
	},
	{
	    header: gettext('Policy'),
	    sortable: false,
	    dataIndex: 'policy',
	    flex: 1
	}
    ],

    initComponent : function() {
	var me = this;

	var rstore = Ext.create('Proxmox.data.UpdateStore', {
	    model: 'pmg-tls-policy',
	    storeid: 'pmg-mailproxy-tls-store-' + (++Ext.idSeed)
	});

	var store = Ext.create('Proxmox.data.DiffStore', { rstore: rstore});

        var reload = function() {
            rstore.load();
        };

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = me.selModel.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var win = Ext.createWidget('pmgTLSDomainEdit', {
		domain: rec.data.domain
	    });

	    win.load();
	    win.on('destroy', reload);
	    win.show();
	};

	var tbar = [
            {
		xtype: 'proxmoxButton',
		disabled: true,
		text: gettext('Edit'),
		handler: run_editor
            },
	    {
		text: gettext('Create'),
		handler: function() {
		    var win = Ext.createWidget('pmgTLSDomainEdit');

		    win.load();
		    win.on('destroy', reload);
		    win.show();
		}
            },
	    {
		xtype: 'proxmoxStdRemoveButton',
		baseurl: '/config/tlspolicy',
		callback: reload,
		waitMsgTarget: me
	    }
        ];

	Proxmox.Utils.monStoreErrors(me, store, true);

	Ext.apply(me, {
	    store: store,
	    tbar: tbar,
	    run_editor: run_editor,
	    listeners: {
		itemdblclick: run_editor,
		activate: reload
	    }
	});

	me.on('activate', rstore.startUpdate);
	me.on('destroy', rstore.stopUpdate);
	me.on('deactivate', rstore.stopUpdate);
	me.callParent();
    }
});
