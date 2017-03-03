Ext.define('pmg-action-list', {
    extend: 'Ext.data.Model',
    fields: [
	'id', 'name', 'info', 'descr',
	{ name: 'otype', type: 'integer' },
    ],
    idProperty: 'id'
});

Ext.define('PMG.ActionConfiguration', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pmgActionConfiguration'],

    title: PMG.Utils.oclass_text['action'],

    baseurl: '/config/ruledb/action',

    otype_list: [4005],

    initComponent : function() {
	var me = this;

	me.store = new Ext.data.Store({
	    model: 'pmg-action-list',
	    proxy: {
		type: 'proxmox',
		url: "/api2/json" + me.baseurl + '/objects',
	    },
	    sorters: {
		property: 'name',
		order: 'DESC'
	    }
	});

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var reload = function() {
	    me.store.load();
	};

	var run_editor = function() {
	    var rec = me.selModel.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var editor = PMG.Utils.object_editors[rec.data.otype];
	    if (!editor) {
		return;
	    }

	    var config = Ext.apply({ method: 'PUT' }, editor);
	
	    config.url = me.baseurl + '/' + editor.subdir + '/' + rec.data.id;

	    var win = Ext.createWidget('proxmoxWindowEdit', config);

	    win.load();
	    win.on('destroy', reload);
	    win.show();
	};

	var remove_btn = Ext.createWidget('proxmoxButton', {
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: me.selModel,
	    confirmMsg: function (rec) {
		return Ext.String.format(
		    gettext('Are you sure you want to remove entry {0}'),
		    "'" + rec.data.descr + "'");
	    },
	    handler: function(btn, event, rec) {
		Proxmox.Utils.API2Request({
		    url: me.baseurl + '/objects/' + rec.data.id,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: reload,
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	var menu_items = [];

	Ext.Array.each(me.otype_list, function(otype) {

	    var editor = PMG.Utils.object_editors[otype];

	    var config = Ext.apply({ method: 'POST' }, editor);

	    config.create = true,
	    menu_items.push({
		text: config.subject,
		handler: function() {
		    if (me.baseurl == undefined) {
			return;
		    }
		    config.url = me.baseurl + '/' + editor.subdir;
		    var win = Ext.createWidget('proxmoxWindowEdit', config);
		    win.on('destroy', reload);
		    win.show();
		}
	    });
	});

	var tbar = [
	    {
		text: gettext('Add'),
		menu: new Ext.menu.Menu({
		    items: menu_items
		})
	    },
            {
		xtype: 'proxmoxButton',
		text: gettext('Edit'),
		disabled: true,
		selModel: me.selModel,
		handler: run_editor
            },
	    remove_btn
        ];

	Proxmox.Utils.monStoreErrors(me, me.store);

	Ext.apply(me, {
	    tbar: tbar,
	    columns: [
		{
		    header: gettext('Name'),
		    sortable: true,
		    width: 200,
		    dataIndex: 'name',
		    renderer: Ext.String.htmlEncode
		},
		{
		    header: gettext('Description'),
		    sortable: true,
		    width: 300,
		    dataIndex: 'descr',
		    renderer: Ext.String.htmlEncode
		},
		{
		    header: gettext('Comment'),
		    sortable: false,
		    flex: 1,
		    dataIndex: 'info',
		    renderer: Ext.String.htmlEncode
		},
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
