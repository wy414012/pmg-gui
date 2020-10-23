/*jslint confusion: true*/
/*renderer is string and function*/
Ext.define('pmg-users', {
    extend: 'Ext.data.Model',
    fields: [
	'userid', 'firstname', 'lastname', 'email', 'comment',
	'role', 'keys', 'realm',
	{ type: 'boolean', name: 'enable' },
	{ type: 'date', dateFormat: 'timestamp', name: 'expire' },
    ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/access/users",
    },
    idProperty: 'userid',
});

Ext.define('PMG.UserView', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.pmgUserView',

    store: {
	autoLoad: true,
	model: 'pmg-users',
	sorters: [
	    {
		property: 'realm',
		direction: 'ASC',
	    },
	    {
		property: 'userid',
		direction: 'ASC',
	    },
	],
    },

    controller: {

	xclass: 'Ext.app.ViewController',

	init: function(view) {
	    Proxmox.Utils.monStoreErrors(view, view.store);
	},

	renderUsername: function(userid) {
	    return Ext.htmlEncode(userid.match(/^(.+)(@[^@]+)$/)[1]);
	},

	renderFullName: function(firstname, metaData, record) {
	    var first = firstname || '';
	    var last = record.data.lastname || '';
	    return Ext.htmlEncode(first + " " + last);
	},

	onAdd: function() {
	    var view = this.getView();

            var win = Ext.create('PMG.UserEdit', {});
            win.on('destroy', function() { view.reload(); });
            win.show();
	},

	onEdit: function() {
	    var view = this.getView();

	    var rec = view.selModel.getSelection()[0];

            var win = Ext.create('PMG.UserEdit', {
		userid: rec.data.userid,
            });
            win.on('destroy', function() { view.reload(); });
            win.show();
	},

	onPassword: function(btn, event, rec) {
	    var view = this.getView();

	    var win = Ext.create('Proxmox.window.PasswordEdit', {
                userid: rec.data.userid,
	    });
            win.on('destroy', function() { view.reload(); });
	    win.show();
	},

	onAfterRemove: function(btn, res) {
	    var view = this.getView();
	    view.reload();
	},
    },

    listeners: {
	scope: 'controller',
	itemdblclick: 'onEdit',
    },

    tbar: [
        {
	    text: gettext('Add'),
	    reference: 'addBtn',
	    handler: 'onAdd',
	},
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Edit'),
	    disabled: true,
	    handler: 'onEdit',
	},
	{
	    xtype: 'proxmoxStdRemoveButton',
	    baseurl: '/access/users',
	    reference: 'removeBtn',
	    callback: 'onAfterRemove',
	    waitMsgTarget: true,
	},
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Password'),
	    disabled: true,
	    handler: 'onPassword',
	},
    ],

    columns: [
	{
	    header: gettext('User name'),
	    width: 200,
	    sortable: true,
	    renderer: 'renderUsername',
	    dataIndex: 'userid',
	},
	{
	    header: gettext('Realm'),
	    width: 100,
	    sortable: true,
	    dataIndex: 'realm',
	},
	{
	    header: gettext('Role'),
	    width: 150,
	    sortable: true,
	    renderer: PMG.Utils.format_user_role,
	    dataIndex: 'role',
	},
	{
	    header: gettext('Enabled'),
	    width: 80,
	    sortable: true,
	    renderer: Proxmox.Utils.format_boolean,
	    dataIndex: 'enable',
	},
	{
	    header: gettext('Expire'),
	    width: 80,
	    sortable: true,
	    renderer: Proxmox.Utils.format_expire,
	    dataIndex: 'expire',
	},
	{
	    header: gettext('Name'),
	    width: 150,
	    sortable: true,
	    renderer: 'renderFullName',
	    dataIndex: 'firstname',
	},
	{
	    header: gettext('Comment'),
	    sortable: false,
	    renderer: Ext.String.htmlEncode,
	    dataIndex: 'comment',
	    flex: 1,
	},
    ],

    reload: function() {
	var me = this;

	me.store.load();
    },
});
