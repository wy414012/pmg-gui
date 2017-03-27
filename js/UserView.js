Ext.define('pmg-users', {
    extend: 'Ext.data.Model',
    fields: [
	'userid', 'firstname', 'lastname' , 'email', 'comment',
	'role', 'keys',
	{ type: 'boolean', name: 'enable' },
	{ type: 'date', dateFormat: 'timestamp', name: 'expire' }
    ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/access/users"
    },
    idProperty: 'userid'
});

Ext.define('PMG.UserView', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.pmgUserView',

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
 	    model: 'pmg-users',
	    sorters: {
		property: 'userid',
		order: 'DESC'
	    }
	});

	var reload = function() {
	    store.load();
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var remove_btn =  Ext.createWidget('proxmoxStdRemoveButton', {
	    selModel: me.selModel,
	    baseurl: '/access/users',
	    callback: reload,
	    waitMsgTarget: me
	});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];

            var win = Ext.create('PMG.UserEdit', {
                userid: rec.data.userid
            });
            win.on('destroy', reload);
            win.show();
	};

	var edit_btn = new Proxmox.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    handler: run_editor
	});

	var pwchange_btn = new Proxmox.button.Button({
	    text: gettext('Password'),
	    disabled: true,
	    selModel: sm,
	    handler: function(btn, event, rec) {
		var win = Ext.create('Proxmox.window.PasswordEdit',{
                    userid: rec.data.userid
		});
		win.on('destroy', reload);
		win.show();
	    }
	});

        var tbar = [
            {
		text: gettext('Add'),
		handler: function() {
                    var win = Ext.create('PMG.UserEdit', {});
                    win.on('destroy', reload);
                    win.show();
		}
            },
	    edit_btn, remove_btn, pwchange_btn
        ];

	var render_full_name = function(firstname, metaData, record) {
	    var first = firstname || '';
	    var last = record.data.lastname || '';
	    return first + " " + last;
	};

	var render_username = function(userid) {
	    return userid.match(/^(.+)(@[^@]+)$/)[1];
	};

	var render_realm = function(userid) {
	    return userid.match(/@([^@]+)$/)[1];
	};

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    tbar: tbar,
	    viewConfig: {
		trackOver: false
	    },
	    columns: [
		{
		    header: gettext('User name'),
		    width: 200,
		    sortable: true,
		    renderer: render_username,
		    dataIndex: 'userid'
		},
		{
		    header: gettext('Realm'),
		    width: 100,
		    sortable: true,
		    renderer: render_realm,
		    dataIndex: 'userid'
		},
		{
		    header: gettext('Enabled'),
		    width: 80,
		    sortable: true,
		    renderer: Proxmox.Utils.format_boolean,
		    dataIndex: 'enable'
		},
		{
		    header: gettext('Expire'),
		    width: 80,
		    sortable: true,
		    renderer: Proxmox.Utils.format_expire,
		    dataIndex: 'expire'
		},
		{
		    header: gettext('Name'),
		    width: 150,
		    sortable: true,
		    renderer: render_full_name,
		    dataIndex: 'firstname'
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
		activate: reload,
		itemdblclick: run_editor
	    }
	});

	me.callParent();
    }
});
