Ext.define('pmg-sa-custom', {
    extend: 'Ext.data.Model',
    fields: ['name', 'score', 'comment', 'digest'],
    idProperty: 'name',
});

Ext.define('PMG.SpamDetectorCustomScores', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgSpamDetectorCustomScores',

    layout: 'border',

    viewModel: {
	data: {
	    applied: true,
	    changetext: '',
	    digest: null,
	},
    },

    controller: {
	xclass: 'Ext.app.ViewController',

	reload: function() {
	    let me = this;
	    let vm = me.getViewModel();
	    let grid = me.lookup('grid');

	    Proxmox.Utils.API2Request({
		url: '/config/customscores',
		failure: function(response, opts) {
		    grid.getStore().loadData({});
		    Proxmox.Utils.setErrorMask(grid, response.htmlStatus);
		    vm.set('digest', null);
		    vm.set('applied', true);
		    vm.set('changetext', '');
		},
		success: function(response, opts) {
		    let data = response.result.data;
		    let digestel = data.pop(); // last element is digest
		    let changes = response.result.changes;
		    grid.getStore().loadData(data);

		    vm.set('digest', digestel.digest);
		    vm.set('applied', !changes);
		    vm.set('changetext', `<pre>${changes || ''}</pre>`);
		},
	    });
	},

	revert: function() {
	    let me = this;
	    let vm = me.getViewModel();
	    let grid = me.lookup('grid');

	    Proxmox.Utils.API2Request({
		url: '/config/customscores',
		method: 'DELETE',
		param: {
		    digest: vm.get('digest'),
		},
		failure: function(response, opts) {
		    grid.getStore().loadData({});
		    Proxmox.Utils.setErrorMask(grid, response.htmlStatus);
		    vm.set('digest', null);
		    vm.set('applied', true);
		    vm.set('changetext', '');
		},
		success: () => { me.reload(); },
	    });
	},

	restart: function() {
	    var me = this;
	    var vm = this.getViewModel();

	    Ext.createWidget('proxmoxWindowEdit', {
		method: 'PUT',
		url: "/api2/extjs/config/customscores",
		isCreate: true,
		submitText: gettext('Apply'),
		showProgress: true,
		taskDone: () => { me.reload(); },

		title: gettext("Apply Custom Scores"),
		onlineHelp: 'pmgconfig_spamdetector_customscores',

		items: [
		    {
			xtype: 'proxmoxcheckbox',
			name: 'restart-daemon',
			fieldLabel: gettext('Restart pmg-smtp-filter'),
			labelWidth: 150,
			checked: true,
		    },
		    {
			xtype: 'hiddenfield',
			name: 'digest',
			value: vm.get('digest'),
		    },
		],
	    }).show();
	},

	create_custom: function() {
	    var me = this;
	    var vm = this.getViewModel();

	    var win = Ext.createWidget('proxmoxWindowEdit', {
		method: 'POST',
		url: "/api2/extjs/config/customscores",
		isCreate: true,
		subject: gettext("Custom Rule Score"),
		onlineHelp: 'pmgconfig_spamdetector_customscores',
		items: [
		    {
			xtype: 'proxmoxtextfield',
			name: 'name',
			allowBlank: false,
			fieldLabel: gettext('Name'),
		    },
		    {
			xtype: 'numberfield',
			name: 'score',
			allowBlank: false,
			fieldLabel: gettext('Score'),
		    },

		    {
			xtype: 'proxmoxtextfield',
			name: 'comment',
			fieldLabel: gettext("Comment"),
		    },
		    {
			xtype: 'hiddenfield',
			name: 'digest',
			value: vm.get('digest'),
		    },
		],
	    });

	    win.on('destroy', me.reload, me);
	    win.show();
	},

	run_editor: function() {
	    var me = this;
	    var vm = this.getViewModel();
	    var grid = me.lookup('grid');
	    var rec = grid.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var win = Ext.createWidget('proxmoxWindowEdit', {
		url: "/api2/extjs/config/customscores/" + rec.data.name,
		method: 'PUT',
		subject: gettext("Custom Rule Score"),
		onlineHelp: 'pmgconfig_spamdetector_customscores',
		items: [
		    {
			xtype: 'displayfield',
			name: 'name',
			fieldLabel: gettext('Name'),
		    },
		    {
			xtype: 'numberfield',
			name: 'score',
			allowBlank: false,
			fieldLabel: gettext('Score'),
		    },

		    {
			xtype: 'proxmoxtextfield',
			name: 'comment',
			fieldLabel: gettext("Comment"),
		    },
		    {
			xtype: 'hiddenfield',
			name: 'digest',
			value: vm.get('digest'),
		    },
		],
	    });

	    win.load();
	    win.on('destroy', me.reload, me);
	    win.show();
	},
    },

    listeners: {
	activate: 'reload',
    },

    defaults: {
	border: 0,
    },

    items: [
	{
	    xtype: 'gridpanel',
	    region: 'center',
	    reference: 'grid',

	    store: {
		model: 'pmg-sa-custom',
		proxy: {
		    type: 'proxmox',
		    url: "/api2/json/config/customscores",
		},
		sorters: {
		    property: 'name',
		},
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
		    handler: 'create_custom',
		},
		{
		    xtype: 'proxmoxStdRemoveButton',
		    getUrl: function(rec) {
			let digest = this.up('grid').digest;
			let url = `/config/customscores/${rec.getId()}`;
			if (digest) {
			    url += `?digest=${digest}`;
			}
			return url;
		    },
		    callback: 'reload',
		},
		' ',
		{
		    text: gettext('Revert'),
		    reference: 'revert_btn',
		    handler: 'revert',
		    disabled: true,
		    bind: {
			disabled: '{applied}',
		    },
		},
		'-',
		{
		    text: gettext('Apply Custom Scores'),
		    reference: 'restart_btn',
		    disabled: true,
		    bind: {
			disabled: '{applied}',
		    },
		    handler: 'restart',
		},
	    ],

	    viewConfig: {
		trackOver: false,
	    },

	    columns: [
		{
		    header: gettext('Name'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'name',
		},
		{
		    header: gettext('Score'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'score',
		},
		{
		    header: gettext('Comment'),
		    sortable: false,
		    renderer: Ext.String.htmlEncode,
		    dataIndex: 'comment',
		    flex: 1,
		},
	    ],

	    listeners: {
		itemdblclick: 'run_editor',
	    },
	},
	{
	    xtype: 'panel',
	    bodyPadding: 5,
	    region: 'south',
	    autoScroll: true,
	    flex: 0.5,
	    hidden: true,
	    bind: {
		hidden: '{applied}',
		html: '{changetext}',
	    },
	    reference: 'changes',
	    tbar: [
		gettext('Pending changes') + ' (' +
		gettext('Please restart pmg-smtp-filter to activate changes') + ')',
	    ],
	    split: true,
	},
    ],

});
