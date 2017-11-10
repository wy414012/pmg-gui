/*global Proxmox*/
Ext.define('pmg-backup-list', {
    extend: 'Ext.data.Model',
    fields: [
	'filename',
	{ type: 'integer', name: 'size' },
	{ type: 'date', dateFormat: 'timestamp', name: 'timestamp' }

    ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/nodes/" + Proxmox.NodeName + "/backup"
    },
    idProperty: 'filename'
});

Ext.define('PMG.BackupRestore', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgBackupRestore',

    title: gettext('Backup') + '/' + gettext('Restore'),

    controller: {
	xclass: 'Ext.app.ViewController',

	createBackup: function() {
	    var me = this.getView();
	    Proxmox.Utils.API2Request({
		url: "/nodes/" + Proxmox.NodeName + "/backup",
		method: 'POST',
		waitMsgTarget: me,
		failure: function (response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		},
		success: function(response, opts) {
		    var upid = response.result.data;

		    var win = Ext.create('Proxmox.window.TaskViewer', {
			upid: upid
		    });
		    win.show();
		    me.mon(win, 'close', function() { me.store.load(); });
		}
	    });
	},

	onRestore: function() {
	    var me = this.getView();
	    var rec = me.getSelection()[0];

	    if (!(rec && rec.data && rec.data.filename)) return;

	    Proxmox.Utils.API2Request({
		url: "/nodes/" + Proxmox.NodeName + "/backup/" + encodeURIComponent(rec.data.filename),
		method: 'POST',
		waitMsgTarget: me,
		failure: function (response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		},
		success: function(response, opts) {
		    var upid = response.result.data;

		    var win = Ext.create('Proxmox.window.TaskViewer', {
			upid: upid
		    });
		    win.show();
		}
	    });
	},

	onAfterRemove: function(btn, res) {
	    var me = this.getView();
	    me.store.load();
	},

	onFactoryDefaults: function() {
	    var me = this.getView();

	    Ext.Msg.confirm(
		gettext('Confirm'),
		gettext('Reset rule database to factory defaults?'),
		function(button) {
		    if (button !== 'yes') {
			return;
		    }
		    var url = '/config/ruledb';
		    Proxmox.Utils.API2Request({
			url: '/config/ruledb',
			method: 'POST',
			waitMsgTarget: me,
			failure: function (response, opts) {
			    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
			}
		    });
		}
	    );
	}
    },

    tbar: [
	{
	    text: gettext('Backup'),
	    handler: 'createBackup'
	},
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Restore'),
	    handler: 'onRestore',
	    disabled: true
	},
	{
	    xtype: 'proxmoxStdRemoveButton',
	    baseurl: '/nodes/' + Proxmox.NodeName + '/backup',
	    reference: 'removeBtn',
	    callback: 'onAfterRemove',
	    waitMsgTarget: true
	},
	{
	    text: gettext('Factory Defaults'),
	    handler: 'onFactoryDefaults'
	}
    ],

    store: {
	autoLoad: true,
	model: 'pmg-backup-list',
	sorters: [
	    {
		property: 'timestamp',
		direction: 'DESC'
	    }
	]
    },

    columns: [
	{
	    header: gettext('Filename'),
	    width: 300,
	    sortable: true,
	    renderer: function(filename) {
		return "<a href='" +
		    "/api2/json/nodes/" + Proxmox.NodeName + "/backup/" + encodeURIComponent(filename) +
		"'>" + Ext.htmlEncode(filename) + "</a>";
	    },
	    dataIndex: 'filename'
	},
	{
	    xtype: 'datecolumn',
	    header: gettext('Time'),
	    width: 150,
	    format: 'Y-m-d H:i',
	    sortable: true,
	    dataIndex: 'timestamp'
	},
	{
	    header: gettext('Size'),
	    width: 100,
	    sortable: true,
	    renderer: Proxmox.Utils.format_size,
	    dataIndex: 'size'
	}
    ]
});
