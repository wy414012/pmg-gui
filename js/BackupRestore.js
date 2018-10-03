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

Ext.define('PMG.RestoreWindow', {
    extend: 'Proxmox.window.Edit',
    xtype: 'pmgRestoreWindow',
    onlineHelp: 'chapter_pmgbackup',

    showProgress: true,
    title: gettext('Restore'),
    isCreate: true,
    method: 'POST',
    submitText: gettext('Restore'),
    fieldDefaults: {
	labelWidth: 150
    },
    items: [
	{
	    xtype: 'proxmoxcheckbox',
	    name: 'config',
	    fieldLabel: gettext('System Configuration')
	},
	{
	    xtype: 'proxmoxcheckbox',
	    name: 'database',
	    value: 1,
	    uncheckedValue: 0,
	    fieldLabel: gettext('Rule Database'),
	    listeners: {
		change: function(cb, value) {
		    var me = this;
		    me.up().down('field[name=statistic]').setDisabled(!value);
		}
	    }
	},
	{
	    xtype: 'proxmoxcheckbox',
	    name: 'statistic',
	    fieldLabel: gettext('Statistic')
	}
    ],

    initComponent: function() {
	var me = this;

	if (!me.filename) {
	    throw "no filename given";
	}

	me.url = "/nodes/" + Proxmox.NodeName + "/backup/" + encodeURIComponent(me.filename);

	me.callParent();
    }
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

	    if (!(rec && rec.data && rec.data.filename)) {
		return;
	    }

	    Ext.create('PMG.RestoreWindow', {
		filename: rec.data.filename
	    }).show();
	},

	onAfterRemove: function(btn, res) {
	    var me = this.getView();
	    me.store.load();
	}
    },

    tbar: [
	{
	    text: gettext('Backup'),
	    handler: 'createBackup'
	},
	'-',
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
	    renderer: Ext.htmlEncode,
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
	},
	{
	    header: gettext('Download'),
	    renderer: function(filename) {
		return "<a class='download' href='" +
		    "/api2/json/nodes/" + Proxmox.NodeName + "/backup/" + encodeURIComponent(filename) +
		"'><i class='fa fa-fw fa-download'</i></a>";
	    },
	    dataIndex: 'filename'
	}
    ]
});
