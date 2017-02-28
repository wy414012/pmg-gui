Ext.define('pmg-object-list', {
    extend: 'Ext.data.Model',
    fields: [
	'id', 'descr', 'otype_text',
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
	    dataIndex: 'otype_text'
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

	var editors = {
	    1000: {
		subdir: 'regex',
		subject: gettext("Regular Expression"),
		items: [
		    {
			xtype: 'textfield',
			name: 'regex',
			fieldLabel: gettext("Regular Expression")
		    }
		]
	    },
	    1009: {
		subdir: 'receiver_regex',
		subject: gettext("Regular Expression"),
		items: [
		    {
			xtype: 'textfield',
			name: 'regex',
			fieldLabel: gettext("Regular Expression")
		    }
		]
	    },
	    1001: {
		subdir: 'email',
		subject: gettext("Email"),
		items: [
		    {
			xtype: 'textfield',
			name: 'email',
			fieldLabel: gettext("Email")
		    }
		]
	    },
	    1007: {
		subdir: 'receiver',
		subject: gettext("Email"),
		items: [
		    {
			xtype: 'textfield',
			name: 'email',
			fieldLabel: gettext("Email")
		    }
		]
	    },
	    1002: {
		subdir: 'domain',
		subject: gettext("Domain"),
		items: [
		    {
			xtype: 'textfield',
			name: 'domain',
			fieldLabel: gettext("Domain")
		    }
		]
	    },
	    1008: {
		subdir: 'receiver_domain',
		subject: gettext("Domain"),
		items: [
		    {
			xtype: 'textfield',
			name: 'domain',
			fieldLabel: gettext("Domain")
		    }
		]
	    },
	    1003: {
		subdir: 'ip',
		subject: gettext("IP Address"),
		items: [
		    {
			xtype: 'textfield',
			name: 'ip',
			fieldLabel: gettext("IP Address")
		    }
		]
	    },
	    1004: {
		subdir: 'network',
		subject: gettext("IP Network"),
		items: [
		    {
			xtype: 'textfield',
			name: 'cidr',
			fieldLabel: gettext("IP Network")
		    }
		]
	    }
	};
	
	var run_editor = function() {
	    var rec = me.selModel.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var editor = editors[rec.data.otype];
	    if (!editor) {
		return;
	    }

	    var direction = rec.data.receivertest ?
		PMG.Utils.receiverText : PMG.Utils.senderText;

	    var config = Ext.apply({ method: 'PUT' }, editor);
	    config.subject = editor.subject + ' (' + direction + ')'; 
	    
	    config.url = "/config/whitelist/" + editor.subdir +
		'/' + rec.data.id,

	    var win = Ext.createWidget('proxmoxWindowEdit', config);

	    win.load();
	    win.on('destroy', reload);
	    win.show();
	};
	
	me.tbar = [
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
