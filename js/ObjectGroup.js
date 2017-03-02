Ext.define('PMG.ObjectGroup', {
    extend: 'Ext.grid.GridPanel',

    baseurl: undefined,
    
    otype_list: [],

    columns: [
	{
	    header: gettext('Type'),
	    dataIndex: 'otype',
	    renderer: PMG.Utils.format_otype,
	    width: 200
	},
	{
	    header: gettext('Value'),
	    dataIndex: 'descr',
	    renderer: Ext.String.htmlEncode,
	    flex: 1
	}
    ],

    setBaseUrl: function(baseurl) {
	var me = this;

	me.baseurl = baseurl;

	me.store.setProxy({
	    type: 'proxmox',
	    url: '/api2/json' + me.baseurl + '/objects'
	});

	me.store.load(function() {
	    me.down('#addMenuButton').setDisabled(false);

	});
    },

    setObjectInfo: function(name, info) {
	var me = this;

	var html = '<b>' + Ext.String.htmlEncode(name) + '</b>';
	html += "<br><br>";
	html += Ext.String.htmlEncode(Ext.String.trim(info));

	me.down('#oginfo').update(html);
	me.down('#ogdata').setHidden(false);
    },
    
    initComponent : function() {
	var me = this;

	me.store = new Ext.data.Store({
	    model: 'pmg-object-list',
	    sorters: [
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
		    "'" +  PMG.Utils.format_otype(rec.data.otype) +
			': ' + rec.data.descr + "'");
	    },
	    handler: function(btn, event, rec) {
		Proxmox.Utils.API2Request({
		    url: me.baseurl + '/objects/'+ rec.data.id,
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

	    var config = Ext.apply({ method: 'PUT' }, editor);

	    config.url = me.baseurl + '/' + editor.subdir + '/' + rec.data.id;

	    var win = Ext.createWidget('proxmoxWindowEdit', config);

	    win.load();
	    win.on('destroy', reload);
	    win.show();
	};

	var menu_items = [];

	Ext.Array.each(me.otype_list, function(otype) {

	    var editor = PMG.Utils.object_editors[otype];

	    var config = Ext.apply({ method: 'POST' }, editor);

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

	me.dockedItems = [];
	
	me.dockedItems.push({
	    xtype: 'toolbar',
	    dock: 'top',
	    items: [
		{
		    text: gettext('Add'),
		    disabled: true,
		    itemId: 'addMenuButton',
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
	    ]
	});
	
	me.dockedItems.push({
	    dock: 'top',
	    border: 1,
	    layout: 'anchor',
	    //hidden: true,
	    itemId: 'ogdata',
	    items: [
		{
		    xtype: 'component',
		    anchor: '100%',
		    itemId: 'oginfo',
		    style: { 'white-space': 'pre' },
		    padding: 10,
		    html: gettext('Please select an object.')
		}
	    ]
	});
    

	Ext.apply(me, {
	    listeners: {
		itemdblclick: run_editor,
		activate: reload
	    }
	});

	me.callParent();
    }
});
