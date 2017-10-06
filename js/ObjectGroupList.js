/*global Proxmox*/
Ext.define('pmg-object-group', {
    extend: 'Ext.data.Model',
    fields: [ 'id', 'name', 'info' ],
    idProperty: 'id'
});

Ext.define('pmg-object-list', {
    extend: 'Ext.data.Model',
    fields: [
	'id', 'descr',
	{ name: 'otype', type: 'integer' },
	{ name: 'receivertest', type: 'boolean' }
    ],
    idProperty: 'id'
});


Ext.define('PMG.ObjectGroupList', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pmgObjectGroupList'],

    ogclass: undefined, //  'who', 'when', 'what'

    subject: 'Object Group List', // please overwrite

    baseurl: undefined,

    enableButtons: true,

    inputItems: [
	{
	    xtype: 'textfield',
	    name: 'name',
	    allowBlank: false,
	    fieldLabel: gettext('Name')
	},
	{
	    xtype: 'textareafield',
	    name: 'info',
	    fieldLabel: gettext("Description")
	}
    ],

    reload: function() {
	var me = this;

        me.store.load();
    },

    run_editor: function() {
	var me = this;

	var rec = me.selModel.getSelection()[0];
	if (!rec) {
	    return;
	}

	var config = {
	    url: "/api2/extjs" + me.baseurl +'/' + rec.data.id + '/config',
	    method: 'PUT',
	    subject: me.subject,
	    width: 400,
	    items: me.inputItems
	};

	var win = Ext.createWidget('proxmoxWindowEdit', config);

	win.load();
	win.on('destroy', me.reload, me);
	win.show();
    },

    initComponent : function() {
	var me = this;

	if (!me.ogclass) {
	    throw "ogclass not initialized";
	}

	me.baseurl = "/config/ruledb/" + me.ogclass;

	me.store = new Ext.data.Store({
	    model: 'pmg-object-group',
	    proxy: {
		type: 'proxmox',
		url: "/api2/json" + me.baseurl
	    },
	    sorters: {
		property: 'name',
		order: 'DESC'
	    }
	});

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = Ext.createWidget('proxmoxStdRemoveButton', {
	    selModel: me.selModel,
	    baseurl: me.baseurl,
	    callback: function() { me.reload(); },
	    getRecordName: function(rec) { return rec.data.name; },
	    waitMsgTarget: me
	});

	/*jslint confusion: true*/
	/* create is a boolean below, a function above */
	var tbar = [
            {
		xtype: 'proxmoxButton',
		text: gettext('Edit'),
		disabled: true,
		selModel: me.selModel,
		handler: function() { me.run_editor(); }
            },
            {
		text: gettext('Create'),
		handler: function() {
		    var config = {
			method: 'POST',
			url: "/api2/extjs" + me.baseurl,
			create: true,
			width: 400,
			subject: me.subject,
			items: me.inputItems
		    };

		    var win = Ext.createWidget('proxmoxWindowEdit', config);

		    win.on('destroy', me.reload, me);
		    win.show();
		}
            },
	    remove_btn
        ];
	/*jslint confusion: false*/

	Proxmox.Utils.monStoreErrors(me, me.store, true);

	if (me.enableButtons) {
	    me.tbar = tbar;
	}

	Ext.apply(me, {
	    columns: [
		{
		    header: gettext('Name'),
		    sortable: true,
		    flex: 1,
		    dataIndex: 'name',
		    renderer: Ext.String.htmlEncode
		}
	    ],
	    listeners: {
		itemdblclick: function() {
		    if (me.enableButtons) {
			me.run_editor();
		    }
		},
		activate: function() { me.reload(); }
	    }
	});

	me.callParent();

	me.reload(); // initial load
    }
});
