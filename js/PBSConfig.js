Ext.define('PMG.PBSInputPanel', {
    extend: 'Ext.tab.Panel',
    xtype: 'pmgPBSInputPanel',

    bodyPadding: 10,
    remoteId: undefined,

    initComponent: function() {
	let me = this;

	me.items = [
	    {
		title: gettext('Backup Server'),
		xtype: 'inputpanel',
		reference: 'remoteeditpanel',
		onGetValues: function(values) {
		    values.disable = values.enable ? 0 : 1;
		    delete values.enable;

		    return values;
		},

		column1: [
		    {
			xtype: me.isCreate ? 'textfield' : 'displayfield',
			name: 'remote',
			value: me.isCreate ? null : undefined,
			fieldLabel: gettext('ID'),
			allowBlank: false,
		    },
		    {
			xtype: 'proxmoxtextfield',
			name: 'server',
			value: me.isCreate ? null : undefined,
			vtype: 'DnsOrIp',
			fieldLabel: gettext('Server'),
			allowBlank: false,
		    },
		    {
			xtype: 'proxmoxtextfield',
			name: 'datastore',
			value: me.isCreate ? null : undefined,
			fieldLabel: 'Datastore',
			allowBlank: false,
		    },
		],
		column2: [
		    {
			xtype: 'proxmoxtextfield',
			name: 'username',
			value: me.isCreate ? null : undefined,
			emptyText: gettext('Example') + ': admin@pbs',
			fieldLabel: gettext('Username'),
			regex: /\S+@\w+/,
			regexText: gettext('Example') + ': admin@pbs',
			allowBlank: false,
		    },
		    {
			xtype: 'proxmoxtextfield',
			inputType: 'password',
			name: 'password',
			value: me.isCreate ? null : undefined,
			emptyText: me.isCreate ? gettext('None') : '********',
			fieldLabel: gettext('Password'),
			allowBlank: true,
		    },
		    {
			xtype: 'proxmoxcheckbox',
			name: 'enable',
			checked: true,
			uncheckedValue: 0,
			fieldLabel: gettext('Enable'),
		    },
		],
		columnB: [
		    {
			xtype: 'proxmoxtextfield',
			name: 'fingerprint',
			value: me.isCreate ? null : undefined,
			fieldLabel: gettext('Fingerprint'),
			emptyText: gettext('Server certificate SHA-256 fingerprint, required for self-signed certificates'),
			regex: /[A-Fa-f0-9]{2}(:[A-Fa-f0-9]{2}){31}/,
			regexText: gettext('Example') + ': AB:CD:EF:...',
			allowBlank: true,
		    },
		],
	    },
	    {
		title: gettext('Prune Options'),
		xtype: 'inputpanel',
		reference: 'prunepanel',
		column1: [
		    {
			xtype: 'proxmoxintegerfield',
			fieldLabel: gettext('Keep Last'),
			name: 'keep-last',
			cbind: {
			    deleteEmpty: '{!isCreate}',
			},
			minValue: 1,
			allowBlank: true,
		    },
		    {
			xtype: 'proxmoxintegerfield',
			fieldLabel: gettext('Keep Daily'),
			name: 'keep-daily',
			cbind: {
			    deleteEmpty: '{!isCreate}',
			},
			minValue: 1,
			allowBlank: true,
		    },
		    {
			xtype: 'proxmoxintegerfield',
			fieldLabel: gettext('Keep Monthly'),
			name: 'keep-monthly',
			cbind: {
			    deleteEmpty: '{!isCreate}',
			},
			minValue: 1,
			allowBlank: true,
		    },
		],
		column2: [
		    {
			xtype: 'proxmoxintegerfield',
			fieldLabel: gettext('Keep Hourly'),
			name: 'keep-hourly',
			cbind: {
			    deleteEmpty: '{!isCreate}',
			},
			minValue: 1,
			allowBlank: true,
		    },
		    {
			xtype: 'proxmoxintegerfield',
			fieldLabel: gettext('Keep Weekly'),
			name: 'keep-weekly',
			cbind: {
			    deleteEmpty: '{!isCreate}',
			},
			minValue: 1,
			allowBlank: true,
		    },
		    {
			xtype: 'proxmoxintegerfield',
			fieldLabel: gettext('Keep Yearly'),
			name: 'keep-yearly',
			cbind: {
			    deleteEmpty: '{!isCreate}',
			},
			minValue: 1,
			allowBlank: true,
		    },
		],
	    },
	];

	me.callParent();
    },

});

Ext.define('PMG.PBSEdit', {
    extend: 'Proxmox.window.Edit',
    xtype: 'pmgPBSEdit',

    subject: 'Proxmox Backup Server',
    isAdd: true,

    bodyPadding: 0,

    initComponent: function() {
	let me = this;

	me.isCreate = !me.remoteId;

	if (me.isCreate) {
            me.url = '/api2/extjs/config/pbs';
            me.method = 'POST';
	} else {
            me.url = '/api2/extjs/config/pbs/' + me.remoteId;
            me.method = 'PUT';
	}

	let ipanel = Ext.create('PMG.PBSInputPanel', {
	    isCreate: me.isCreate,
	    remoteId: me.remoteId,
	});

	me.items = [ipanel];

	me.fieldDefaults = {
	    labelWidth: 150,
	};

	me.callParent();

	if (!me.isCreate) {
	    me.load({
		success: function(response, options) {
		    let values = response.result.data;

		    values.enable = values.disable ? 0 : 1;
		    me.down('inputpanel[reference=remoteeditpanel]').setValues(values);
		    me.down('inputpanel[reference=prunepanel]').setValues(values);
		},
	    });
	}
    },
});

Ext.define('PMG.PBSScheduleEdit', {
    extend: 'Proxmox.window.Edit',
    xtype: 'pmgPBSScheduleEdit',

    isAdd: true,
    method: 'POST',
    subject: gettext('Scheduled Backup'),
    autoLoad: true,
    items: [
	{
	    xtype: 'proxmoxKVComboBox',
	    name: 'schedule',
	    fieldLabel: gettext('Schedule'),
	    comboItems: [
		['daily', 'daily'],
		['hourly', 'hourly'],
		['weekly', 'weekly'],
		['monthly', 'monthly'],
	    ],
	    editable: true,
	    emptyText: 'Systemd Calender Event',
	},
	{
	    xtype: 'proxmoxKVComboBox',
	    name: 'delay',
	    fieldLabel: gettext('Random Delay'),
	    comboItems: [
		['0s', 'no delay'],
		['15 minutes', '15 Minutes'],
		['6 hours', '6 hours'],
	    ],
	    editable: true,
	    emptyText: 'Systemd TimeSpan',
	},
    ],
    initComponent: function() {
	let me = this;

	me.url = `/nodes/${Proxmox.NodeName}/pbs/${me.remote}/timer`;
	me.callParent();
    },
});

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
		remstore.getProxy().setUrl(`/api2/json/nodes/${Proxmox.NodeName}/pbs/${remote}/snapshot`);
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
		    xtype: 'proxmoxButton',
		    text: gettext('Backup'),
		    handler: 'runBackup',
		    selModel: false,
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
		fields: ['time', 'size', 'ctime', 'encrypted'],
		proxy: { type: 'proxmox' },
		sorters: [
		    {
			property: 'time',
			direction: 'DESC',
		    },
		],
	    },
	    bind: {
		title: Ext.String.format(gettext("Backup snapshots on '{0}'"), '{remote}'),
		hidden: '{!selected}',
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

Ext.define('pmg-pbs-config', {
    extend: 'Ext.data.Model',
    fields: ['remote', 'server', 'datastore', 'username', 'disabled'],
    proxy: {
	type: 'proxmox',
	url: '/api2/json/config/pbs',
    },
    idProperty: 'remote',
});

Ext.define('PMG.PBSConfigGrid', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgPBSConfigGrid',

    controller: {
	xclass: 'Ext.app.ViewController',

	run_editor: function() {
	    let me = this;
	    let view = me.getView();
	    let rec = view.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    let win = Ext.createWidget('pmgPBSEdit', {
		remoteId: rec.data.remote,
	    });
	    win.on('destroy', me.reload, me);
	    win.load();
	    win.show();
	},

	newRemote: function() {
	    let me = this;
	    let win = Ext.createWidget('pmgPBSEdit', {});
	    win.on('destroy', me.reload, me);
	    win.show();
	},

	reload: function() {
	    let me = this;
	    let view = me.getView();
	    view.getStore().load();
	    view.fireEvent('load', view);
	},

	createSchedule: function() {
	    let me = this;
	    let view = me.getView();
	    let rec = view.getSelection()[0];
	    let remotename = rec.data.remote;
	    let win = Ext.createWidget('pmgPBSScheduleEdit', {
		remote: remotename,
	    });
	    win.on('destroy', me.reload, me);
	    win.show();
	},

	init: function(view) {
	    let me = this;
	    Proxmox.Utils.monStoreErrors(view, view.getStore(), true);
	},

    },

    store: {
	model: 'pmg-pbs-config',
	sorters: [{
	    property: 'remote',
	    order: 'DESC',
	}],
    },

    tbar: [
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Edit'),
	    disabled: true,
	    handler: 'run_editor',
	},
	{
	    text: gettext('Create'),
	    handler: 'newRemote',
	},
	{
	    xtype: 'proxmoxStdRemoveButton',
	    baseurl: '/config/pbs',
	    callback: 'reload',
	},
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Schedule'),
	    enableFn: function(rec) {
		return !rec.data.disable;
	    },
	    disabled: true,
	    handler: 'createSchedule',
	},
	{
	    xtype: 'proxmoxStdRemoveButton',
	    baseurl: '/nodes/' + Proxmox.NodeName + '/pbs/',
	    callback: 'reload',
	    text: gettext('Remove Schedule'),
	    confirmMsg: function(rec) {
		let me = this;
		let remote = rec.getId();
		return Ext.String.format(gettext('Are you sure you want to remove the schedule for {0}'), `'${remote}'`);
	    },
	    getUrl: function(rec) {
		let me = this;
		return me.baseurl + '/' + rec.getId() + '/timer';
	    },
	},
    ],

    listeners: {
	itemdblclick: 'run_editor',
	activate: 'reload',
    },

    columns: [
	{
	    header: gettext('Remote'),
	    sortable: true,
	    dataIndex: 'remote',
	    flex: 2,
	},
	{
	    header: gettext('Server'),
	    sortable: true,
	    dataIndex: 'server',
	    flex: 2,
	},
	{
	    header: gettext('Datastore'),
	    sortable: true,
	    dataIndex: 'datastore',
	    flex: 1,
	},
	{
	    header: gettext('User ID'),
	    sortable: true,
	    dataIndex: 'username',
	    flex: 1,
	},
	{
	    header: gettext('Encryption'),
	    width: 80,
	    sortable: true,
	    dataIndex: 'encryption-key',
	    renderer: Proxmox.Utils.format_boolean,
	},
	{
	    header: gettext('Enabled'),
	    width: 80,
	    sortable: true,
	    dataIndex: 'disable',
	    renderer: Proxmox.Utils.format_neg_boolean,
	},
    ],

});

