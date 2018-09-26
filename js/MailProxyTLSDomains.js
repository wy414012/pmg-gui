/*global Proxmox*/
Ext.define('pmg-tls-policy', {
    extend: 'Ext.data.Model',
    fields: [ 'domain', 'policy' ],
    idProperty: 'domain'
});

Ext.define('PMG.MailProxyTLSDomains', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pmgMailProxyTLSDomains'],

    initComponent : function() {
	var me = this;

	var baseurl = '/config/tlspolicy';
	var rstore = Ext.create('Proxmox.data.UpdateStore', {
	    model: 'pmg-tls-policy',
	    storeid: 'pmg-mailproxy-tls-store-' + (++Ext.idSeed),
	    proxy: {
		type: 'proxmox',
		url: '/api2/json' + baseurl
	    },
	    sorters: {
		property: 'domain',
		order: 'DESC'
	    }
	});

	var store = Ext.create('Proxmox.data.DiffStore', { rstore: rstore});

        var reload = function() {
            store.load();
        };

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = Ext.createWidget('proxmoxStdRemoveButton', {
	    selModel: me.selModel,
	    baseurl: baseurl,
	    callback: reload,
	    waitMsgTarget: me
	});

	var policy_selector_properties = {
	    xtype: 'proxmoxKVComboBox',
	    name: 'policy',
	    fieldLabel: 'Policy',
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
	};

	var run_editor = function() {
	    var rec = me.selModel.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var config = {
		url: '/api2/extjs' + baseurl + '/' + rec.data.domain,
		method: 'PUT',
		subject: gettext('TLS Policy'),
		items: [
		    {
			xtype: 'displayfield',
			name: 'domain',
			fieldLabel: gettext('Domain')
		    },
		    policy_selector_properties
		]
	    };

	    var win = Ext.createWidget('proxmoxWindowEdit', config);

	    win.load();
	    win.on('destroy', reload);
	    win.show();
	};

	var tbar = [
            {
		xtype: 'proxmoxButton',
		text: gettext('Edit'),
		disabled: true,
		selModel: me.selModel,
		handler: run_editor
            },
	    {
		text: gettext('Create'),
		handler: function() {
		    var config = {
			url: '/api2/extjs' + baseurl,
			method: 'POST',
			subject: gettext('TLS Policy'),
			isCreate: true,
			items: [
			    {
				xtype: 'proxmoxtextfield',
				name: 'domain',
				fieldLabel: gettext('Domain')
			    }, policy_selector_properties
			]
		    };

		    var win = Ext.createWidget('proxmoxWindowEdit', config);

		    win.on('destroy', reload);
		    win.show();
		}
            },
	    remove_btn
        ];

	Proxmox.Utils.monStoreErrors(me, store, true);

	Ext.apply(me, {
	    store: store,
	    tbar: tbar,
	    run_editor: run_editor,
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
