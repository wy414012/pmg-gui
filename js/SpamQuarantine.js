Ext.define('pmg-spam-archive', {
    extend: 'Ext.data.Model',
    fields: [
	{ type: 'number', name: 'spamavg' },
	{ type: 'integer', name: 'count' },
        { type: 'date', dateFormat: 'timestamp', name: 'day' },
    ],
    proxy: {
        type: 'proxmox',
        url: "/api2/json/quarantine/spam",
    },
    idProperty: 'day',
});

Ext.define('pmg-spam-list', {
    extend: 'Ext.data.Model',
    fields: ['id', 'envelope_sender', 'from', 'sender', 'receiver', 'subject',
	{ type: 'number', name: 'spamlevel' },
	{ type: 'integer', name: 'bytes' },
	{ type: 'date', dateFormat: 'timestamp', name: 'time' },
	{
	    type: 'string',
	    name: 'day',
	    convert: function(v, rec) {
		return Ext.Date.format(rec.get('time'), 'Y-m-d');
	    }, depends: ['time'],
	},
    ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/quarantine/spam",
    },
    idProperty: 'id',
});

Ext.define('PMG.SpamQuarantineController', {
    extend: 'PMG.controller.QuarantineController',
    xtype: 'pmgSpamQuarantineController',
    alias: 'controller.spamquarantine',

    updatePreview: function(raw, rec) {
	let me = this;
	me.lookupReference('spam').setDisabled(false);

	me.callParent(arguments);
    },

    multiSelect: function(selection) {
	let me = this;
	let spam = me.lookupReference('spam');
	spam.setDisabled(true);
	spam.setPressed(false);
	me.lookupReference('spaminfo').setVisible(false);
	me.callParent(arguments);
    },

    toggleSpamInfo: function(btn) {
	var grid = this.lookupReference('spaminfo');
	grid.setVisible(!grid.isVisible());
    },

    openContextMenu: function(table, record, tr, index, event) {
	event.stopEvent();
	let me = this;
	let list = me.lookup('list');
	Ext.create('PMG.menu.SpamContextMenu', {
	    callback: action => me.doAction(action, list.getSelection()),
	}).showAt(event.getXY());
    },

    keyPress: function(table, record, item, index, event) {
	var me = this;
	var list = me.lookup('list');
	var key = event.getKey();
	var action = '';
	switch (key) {
	    case event.DELETE:
	    case 127:
		action = 'delete';
		break;
	    case Ext.event.Event.D:
	    case Ext.event.Event.D + 32:
		action = 'deliver';
		break;
	    case Ext.event.Event.W:
	    case Ext.event.Event.W + 32:
		action = 'whitelist';
		break;
	    case Ext.event.Event.B:
	    case Ext.event.Event.B + 32:
		action = 'blacklist';
		break;
	}

	if (action !== '') {
	    me.doAction(action, list.getSelection());
	}
    },

    init: function(view) {
	this.lookup('list').cselect = view.cselect;
    },

    control: {
	'button[reference=raw]': {
	    click: 'toggleRaw',
	},
	'button[reference=spam]': {
	    click: 'toggleSpamInfo',
	},
	'pmgQuarantineList': {
	    itemkeypress: 'keyPress',
	    rowcontextmenu: 'openContextMenu',
	},
    },
});

Ext.define('PMG.SpamQuarantine', {
    extend: 'Ext.container.Container',
    xtype: 'pmgSpamQuarantine',

    border: false,
    layout: { type: 'border' },

    defaults: { border: false },

    // from mail link
    cselect: undefined,

    viewModel: {
	parent: null,
	data: {
	    mailid: '',
	},
	formulas: {
	    downloadMailURL: get => '/api2/json/quarantine/download?mailid=' + encodeURIComponent(get('mailid')),
	},
    },
    controller: 'spamquarantine',

    items: [
	{
	    title: gettext('Spam Quarantine'),
	    xtype: 'pmgQuarantineList',
	    selModel: 'checkboxmodel',
	    reference: 'list',
	    region: 'west',
	    width: 500,
	    split: true,
	    collapsible: false,
	    store: {
		model: 'pmg-spam-list',
		groupField: 'day',
		groupDir: 'DESC',
		sorters: [{
		    property: 'time',
		    direction: 'DESC',
		}],
	    },

	    columns: [
		{
		    header: gettext('Sender/Subject'),
		    dataIndex: 'subject',
		    renderer: PMG.Utils.render_sender,
		    flex: 1,
		},
		{
		    header: gettext('Score'),
		    dataIndex: 'spamlevel',
		    align: 'right',
		    width: 70,
		},
		{
		    header: gettext('Size') + ' (KB)',
		    renderer: v => Ext.Number.toFixed(v/1024, 0),
		    dataIndex: 'bytes',
		    align: 'right',
		    width: 90,
		},
		{
		    header: gettext('Date'),
		    dataIndex: 'day',
		    hidden: true,
		},
		{
		    xtype: 'datecolumn',
		    header: gettext('Time'),
		    dataIndex: 'time',
		    format: 'H:i:s',
		},
	    ],
	},
	{
	    title: gettext('Selected Mail'),
	    border: false,
	    region: 'center',
	    layout: 'fit',
	    split: true,
	    reference: 'preview',
	    disabled: true,
	    dockedItems: [
		{
		    xtype: 'toolbar',
		    dock: 'top',
		    overflowHandler: 'scroller',
		    style: {
			// docked items have set the bottom with to 0px with '! important'
			// but we still want one here, so we can remove the borders of the grids
			'border-bottom-width': '1px ! important',
		    },
		    items: [
			{
			    xtype: 'button',
			    reference: 'raw',
			    text: gettext('Toggle Raw'),
			    enableToggle: true,
			    iconCls: 'fa fa-file-code-o',
			},
			{
			    xtype: 'button',
			    reference: 'spam',
			    text: gettext('Toggle Spam Info'),
			    enableToggle: true,
			    iconCls: 'fa fa-bullhorn',
			},
			{
			    xtype: 'button',
			    reference: 'themeToggle',
			    text: gettext('Toggle Theme'),
			    enableToggle: true,
			    iconCls: 'fa fa-paint-brush',
			},
			'->',
			{
			    xtype: 'button',
			    reference: 'download',
			    text: gettext('Download'),
			    setDownload: function(id) {
				this.el.dom.download = id + ".eml";
			    },
			    bind: {
				href: '{downloadMailURL}',
				download: '{mailid}',
			    },
			    iconCls: 'fa fa-download',
			},
			'-',
			{
			    reference: 'whitelist',
			    text: gettext('Whitelist'),
			    iconCls: 'fa fa-check',
			    handler: 'btnHandler',
			},
			{
			    reference: 'blacklist',
			    text: gettext('Blacklist'),
			    iconCls: 'fa fa-times',
			    handler: 'btnHandler',
			},
			{
			    reference: 'deliver',
			    text: gettext('Deliver'),
			    iconCls: 'fa fa-paper-plane-o info-blue',
			    handler: 'btnHandler',
			},
			{
			    reference: 'delete',
			    text: gettext('Delete'),
			    iconCls: 'fa fa-trash-o critical',
			    handler: 'btnHandler',
			},
		    ],
		},
		{
		    xtype: 'pmgSpamInfoGrid',
		    reference: 'spaminfo',
		    border: false,
		},
		{
		    xtype: 'pmgMailInfo',
		    hidden: true,
		    reference: 'mailinfo',
		    border: false,
		},
		{
		    xtype: 'pmgAttachmentGrid',
		    reference: 'attachmentlist',
		    showDownloads: false,
		    border: false,
		    dock: 'bottom',
		},
	    ],
	},
    ],
});
