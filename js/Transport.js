/*global Proxmox*/
Ext.define('pmg-transport', {
    extend: 'Ext.data.Model',
    fields: [ 'domain', 'host', { name: 'port', type: 'integer' },
	      { name: 'use_mx', type: 'boolean' }, 'comment' ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/config/transport"
    },
    idProperty: 'domain'
});

Ext.define('PMG.Transport', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pmgTransport'],

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pmg-transport',
	    sorters: {
		property: 'domain',
		order: 'DESC'
	    }
	});

        var reload = function() {
            store.load();
        };

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var remove_btn =  Ext.createWidget('proxmoxStdRemoveButton', {
	    selModel: me.selModel,
	    baseurl: '/config/transport',
	    callback: reload,
	    waitMsgTarget: me
	});

	var common_properties = [
	    {
		xtype: 'textfield',
		name: 'host',
		fieldLabel: gettext("Host")
	    },
	    {
		xtype: 'proxmoxintegerfield',
		name: 'port',
		value: 25,
		minValue: 1,
		maxValue: 65535,
		fieldLabel: gettext("Port")
	    },
	    {
		xtype: 'proxmoxcheckbox',
		name: 'use_mx',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: gettext("Use MX")
	    },
	    {
		xtype: 'textfield',
		name: 'comment',
		fieldLabel: gettext("Comment")
	    }
	];

	var edit_properties = common_properties.slice();
	edit_properties.unshift({
	    xtype: 'displayfield',
	    name: 'domain',
	    fieldLabel: gettext("Relay Domain")
	});

	var create_properties = common_properties.slice();
	create_properties.unshift({
	    xtype: 'proxmoxtextfield',
	    name: 'domain',
	    fieldLabel: gettext("Relay Domain")
	});

	var run_editor = function() {
	    var rec = me.selModel.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var config = {
		url: "/api2/extjs/config/transport/" + rec.data.domain,
		method: 'PUT',
		subject: gettext("Transport"),
		items: edit_properties
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
			method: 'POST',
			url: "/api2/extjs/config/transport",
			isCreate: true,
			subject: gettext("Transport"),
			items: create_properties
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
		    header: gettext('Relay Domain'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'domain'
		},
		{
		    header: gettext('Host'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'host'
		},
		{
		    header: gettext('Port'),
		    width: 80,
		    sortable: false,
		    dataIndex: 'port'
		},
		{
		    header: gettext('Use MX'),
		    width: 80,
		    renderer: Proxmox.Utils.format_boolean,
		    sortable: false,
		    dataIndex: 'use_mx'
		},
		{
		    header: gettext('Comment'),
		    sortable: false,
		    renderer: Ext.String.htmlEncode,
		    dataIndex: 'comment',
		    flex: 1
		}
	    ],
	    listeners: {
		itemdblclick: run_editor,
		activate: reload
	    }
	});

	me.callParent();
    }
});
