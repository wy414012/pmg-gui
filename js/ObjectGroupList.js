Ext.define('pmg-object-group', {
    extend: 'Ext.data.Model',
    fields: [ 'id', 'name', 'info' ],
    idProperty: 'cidr'
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

    initComponent : function() {
	var me = this;

	if (!me.ogclass) {
	    throw "ogclass not initialized";
	}

	var baseurl = "/config/ruledb/" + me.ogclass;
	
	var store = new Ext.data.Store({
	    model: 'pmg-object-group',
	    proxy: {
		type: 'proxmox',
		url: "/api2/json" + baseurl,
	    },
	    sorters: {
		property: 'name',
		order: 'DESC'
	    }
	});

        var reload = function() {
	    var rec = me.selModel.getSelection()[0];
            store.load(function() {
		if (rec) {
		    // try to selectprevious selection
		    var nrec = store.findRecord('id', rec.data.id);
		    me.selModel.select(nrec);
		}
	    });
        };

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = Ext.createWidget('proxmoxButton', {
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: me.selModel,
	    confirmMsg: function (rec) {
		return Ext.String.format(
		    gettext('Are you sure you want to remove entry {0}'),
		    "'" + rec.data.name + "'");
	    },
	    handler: function(btn, event, rec) {
		Proxmox.Utils.API2Request({
		    url: baseurl + '/' + rec.data.id,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	var inputItems = [
	    {
		xtype: 'textfield',
		name: 'name',
		fieldLabel: gettext('Name')
	    },
	    {
		xtype: 'textareafield',
		name: 'info',
		fieldLabel: gettext("Description")
	    }
	];

	var run_editor = function() {
	    var rec = me.selModel.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var config = {
		url: "/api2/extjs" + baseurl +'/' + rec.data.id + '/config',
		method: 'PUT',
		subject: me.subject,
		width: 400,
		items: inputItems
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
			url: "/api2/extjs" + baseurl,
			create: true,
			width: 400,
			subject: me.subject,
			items: inputItems
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
		itemdblclick: run_editor,
		activate: reload
	    }
	});

	me.callParent();

	reload(); // initial load
    }
});
