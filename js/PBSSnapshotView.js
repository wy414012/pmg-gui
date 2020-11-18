Ext.define('PMG.PBSConfig', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgPBSConfig',

    controller: {
	xclass: 'Ext.app.ViewController',

	callRestore: function(grid, record) {
	    let remote = this.getViewModel().get('remote');
	    Ext.create('PMG.RestoreWindow', {
		remote: remote,
		backup_id: record.data['backup-id'],
		backup_time: record.data['backup-time'],
	    }).show();
	},

	restoreSnapshot: function(button) {
	    let me = this;
	    let view = me.lookup('pbsremotegrid');
	    let record = view.getSelection()[0];
	    me.callRestore(view, record);
	},

	runBackup: function(button) {
	    let me = this;
	    let view = me.lookup('pbsremotegrid');
	    let remote = me.getViewModel().get('remote');
	    Proxmox.Utils.API2Request({
		url: `/nodes/${Proxmox.NodeName}/pbs/${remote}/snapshot`,
		method: 'POST',
		waitMsgTarget: view,
		failure: function(response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		},
		success: function(response, opts) {
		    let upid = response.result.data;

		    let win = Ext.create('Proxmox.window.TaskViewer', {
			upid: upid,
		    });
		    win.show();
		    me.mon(win, 'close', function() { view.getStore().load(); });
		},
	    });
	},

	reload: function(grid) {
	    let me = this;
	    let selection = grid.getSelection();
	    me.showInfo(grid, selection);
	},

	showInfo: function(grid, selected) {
	    let me = this;
	    let viewModel = me.getViewModel();
	    if (selected[0]) {
		let remote = selected[0].data.remote;
		viewModel.set('selected', true);
		viewModel.set('remote', remote);

		// set grid stores and load them
		let remstore = me.lookup('pbsremotegrid').getStore();
		remstore
		    .getProxy()
		    .setUrl(`/api2/json/nodes/${Proxmox.NodeName}/pbs/${remote}/snapshot`);
		remstore.load();
	    } else {
		viewModel.set('selected', false);
	    }
	},
	reloadSnapshots: function() {
	    let me = this;
	    let grid = me.lookup('grid');
	    let selection = grid.getSelection();
	    me.showInfo(grid, selection);
	},
	init: function(view) {
	    let me = this;
	    me.lookup('grid').relayEvents(view, ['activate']);
	    let pbsremotegrid = me.lookup('pbsremotegrid');

	    Proxmox.Utils.monStoreErrors(pbsremotegrid, pbsremotegrid.getStore(), true);
	},

	control: {
	    'grid[reference=grid]': {
		selectionchange: 'showInfo',
		load: 'reload',
	    },
	    'grid[reference=pbsremotegrid]': {
		itemdblclick: 'restoreSnapshot',
	    },
	},
    },

    viewModel: {
	data: {
	    remote: '',
	    selected: false,
	},
    },

    layout: 'border',

    items: [
	{
	    region: 'center',
	    reference: 'grid',
	    xtype: 'pmgPBSConfigGrid',
	    border: false,
	},
	{
	    xtype: 'grid',
	    region: 'south',
	    reference: 'pbsremotegrid',
	    hidden: true,
	    height: '70%',
	    border: false,
	    split: true,
	    emptyText: gettext('No backups on remote'),
	    tbar: [
		{
		    text: gettext('Backup'),
		    handler: 'runBackup',
		},
		{
		    xtype: 'proxmoxButton',
		    text: gettext('Restore'),
		    handler: 'restoreSnapshot',
		    disabled: true,
		},
		{
		    xtype: 'proxmoxStdRemoveButton',
		    text: gettext('Forget Snapshot'),
		    disabled: true,
		    getUrl: function(rec) {
			let me = this;
			let remote = me.lookupViewModel().get('remote');
			let snapshot = `${rec.data['backup-id']}/${rec.data['backup-time']}`;
			return `/nodes/${Proxmox.NodeName}/pbs/${remote}/snapshot/${snapshot}`;
		    },
		    confirmMsg: function(rec) {
			let me = this;
			let snapshot = `${rec.data['backup-id']}/${rec.data['backup-time']}`;
			return Ext.String.format(
			    gettext('Are you sure you want to forget snapshot {0}'),
			    `'${snapshot}'`,
			);
		    },
		    callback: 'reloadSnapshots',
		},
	    ],
	    store: {
		fields: ['backup-id', 'backup-time', 'size', 'ctime', 'encrypted'],
		proxy: { type: 'proxmox' },
		sorters: [
		    {
			property: 'backup-time',
			direction: 'DESC',
		    },
		],
	    },
	    bind: {
		title: Ext.String.format(
		    gettext("Backup snapshots on '{0}'"),
		    '{remote}',
		),
	    },
	    columns: [
		{
		    text: 'Group ID',
		    dataIndex: 'backup-id',
		    flex: 1,
		},
		{
		    text: 'Time',
		    dataIndex: 'backup-time',
		    width: 180,
		},
		{
		    text: 'Size',
		    dataIndex: 'size',
		    renderer: Proxmox.Utils.format_size,
		    flex: 1,
		},
		{
		    text: 'Encrypted',
		    dataIndex: 'encrypted',
		    hidden: true, // FIXME: actually return from API
		    renderer: Proxmox.Utils.format_boolean,
		    flex: 1,
		},
	    ],
	},
    ],

});
