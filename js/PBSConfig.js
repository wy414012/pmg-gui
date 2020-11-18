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
	    text: gettext('Add Remote'),
	    handler: 'newRemote',
	},
	'-',
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Edit'),
	    disabled: true,
	    handler: 'run_editor',
	},
	{
	    xtype: 'proxmoxStdRemoveButton',
	    baseurl: '/config/pbs',
	    callback: 'reload',
	},
	'-',
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Set Schedule'),
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
	    hidden: true, // for now
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
