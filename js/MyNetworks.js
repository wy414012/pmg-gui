Ext.define('pmg-mynetworks', {
    extend: 'Ext.data.Model',
    fields: [ 'cidr', 'comment' ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/config/mynetworks"
    },
    idProperty: 'cidr'
});

Ext.define('PMG.MyNetworks', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pmgMyNetworks'],

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pmg-mynetworks',
	    sorters: {
		property: 'cidr',
		order: 'DESC'
	    }
	});

        var reload = function() {
            store.load();
        };

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var remove_btn =  Ext.createWidget('proxmoxStdRemoveButton', {
	    selModel: me.selModel,
	    baseurl: '/config/mynetworks',
	    callback: reload,
	    waitMsgTarget: me
	});

	var run_editor = function() {
	    var rec = me.selModel.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var config = {
		url: "/api2/extjs/config/mynetworks/" + rec.data.cidr,
		method: 'PUT',
		subject: gettext("Trusted Network"),
		items: [
		    {
			xtype: 'displayfield',
			name: 'cidr',
			fieldLabel: 'CIDR'
		    },
		    {
			xtype: 'textfield',
			name: 'comment',
			fieldLabel: gettext("Comment")
		    }
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
			method: 'POST',
			url: "/api2/extjs/config/mynetworks",
			create: true,
			subject: gettext("Trusted Network"),
			items: [
			    {
				xtype: 'proxmoxtextfield',
				name: 'cidr',
				fieldLabel: 'CIDR'
			    },
			    {
				xtype: 'proxmoxtextfield',
				name: 'comment',
				fieldLabel: gettext("Comment")
			    }
			]
		    };

		    var win = Ext.createWidget('proxmoxWindowEdit', config);

		    win.on('destroy', reload);
		    win.show();
		}
            },
	    remove_btn
        ];

	Proxmox.Utils.monStoreErrors(me, store);

	Ext.apply(me, {
	    store: store,
	    tbar: tbar,
	    viewConfig: {
		trackOver: false
	    },
	    columns: [
		{
		    header: gettext('Trusted Netowrk'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'cidr'
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
