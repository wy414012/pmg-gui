Ext.define('pmg-object-list', {
    extend: 'Ext.data.Model',
    fields: [
	'id', 'descr',
	{ name: 'otype', type: 'integer' },
	{ name: 'receivertest', type: 'boolean' }
    ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/config/whitelist/objects"
    },
    idProperty: 'id'
});

Ext.define('PMG.SMTPWhitelist', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pmgSMTPWhitelist'],


    columns: [
	{
	    header: gettext('Type'),
	    dataIndex: 'otype',
	    renderer: PMG.Utils.format_otype,
	    width: 200
	},
	{
	    header: gettext('Direction'),
	    dataIndex: 'receivertest',
	    renderer: function(value) {
		return value ? PMG.Utils.receiverText : PMG.Utils.senderText;
	    }
	},
	{
	    header: gettext('Value'),
	    dataIndex: 'descr',
	    renderer: Ext.String.htmlEncode,
	    flex: 1
	}
    ],

    viewConfig: {
	trackOver: false
    },

    initComponent : function() {
	var me = this;

	me.store = new Ext.data.Store({
	    model: 'pmg-object-list',
	    sorters: [
		{
		    property : 'receivertest',
		},
		{
		    property : 'otype',
		    direction: 'ASC'
		}
	    ]
	});

	var reload = function() {
            me.store.load();
        };

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = Ext.createWidget('proxmoxButton', {
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: me.selModel,
	    confirmMsg: function (rec) {
		return Ext.String.format(
		    gettext('Are you sure you want to remove entry {0}'),
		    "'" +  rec.data.otype_text + ': ' + rec.data.descr + "'");
	    },
	    handler: function(btn, event, rec) {
		Proxmox.Utils.API2Request({
		    url: '/config/whitelist/objects/' + rec.data.id,
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

	var run_editor = function() {
	    var rec = me.selModel.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var editor = PMG.Utils.object_editors[rec.data.otype];
	    if (!editor) {
		return;
	    }

	    var direction = rec.data.receivertest ?
		PMG.Utils.receiverText : PMG.Utils.senderText;

	    var config = Ext.apply({ method: 'PUT' }, editor);
	    config.subject = editor.subject + ' (' + direction + ')';

	    config.url = "/config/whitelist/" + editor.subdir +
		'/' + rec.data.id;

	    var win = Ext.createWidget('proxmoxWindowEdit', config);

	    win.load();
	    win.on('destroy', reload);
	    win.show();
	};

	var menu_items = [];

	Ext.Array.each([1000, 1009, 1001, 1007, 1002, 1008, 1003, 1004], function(otype) {

	    var editor = PMG.Utils.object_editors[otype];

	    var direction = editor.receivertest ?
		PMG.Utils.receiverText : PMG.Utils.senderText;

	    var config = Ext.apply({ method: 'POST' }, editor);
	    config.subject = editor.subject + ' (' + direction + ')';

	    config.url = "/config/whitelist/" + editor.subdir;
	    menu_items.push({
		text: config.subject,
		handler: function() {
		    var win = Ext.createWidget('proxmoxWindowEdit', config);
		    win.on('destroy', reload);
		    win.show();
		}
	    });
	});

	me.tbar = [
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
	    listeners: {
		itemdblclick: run_editor,
		activate: reload
	    }
	});

	me.callParent();
    }
});
