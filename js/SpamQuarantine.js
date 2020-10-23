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
    controller: {

	xclass: 'Ext.app.ViewController',

	updatePreview: function(raw, rec) {
	    var preview = this.lookupReference('preview');

	    if (!rec || !rec.data || !rec.data.id) {
		preview.update('');
		preview.setDisabled(true);
		return;
	    }

	    var url = '/api2/htmlmail/quarantine/content?id=' + rec.data.id + (raw?'&raw=1':'');
	    preview.setDisabled(false);
	    this.lookupReference('raw').setDisabled(false);
	    this.lookupReference('spam').setDisabled(false);
	    this.lookupReference('download').setDisabled(false);
	    preview.update("<iframe frameborder=0 width=100% height=100% sandbox='allow-same-origin' src='" + url +"'></iframe>");
	},

	multiSelect: function(selection) {
	    var preview = this.lookupReference('preview');
	    var raw = this.lookupReference('raw');
	    var spam = this.lookupReference('spam');
	    var spaminfo = this.lookupReference('spaminfo');
	    var mailinfo = this.lookupReference('mailinfo');
	    var download = this.lookupReference('download');

	    preview.setDisabled(false);
	    preview.update(`<h3 style="padding-left:5px;">${gettext('Multiple E-Mails selected')} (${selection.length})</h3>`);
	    raw.setDisabled(true);
	    spam.setDisabled(true);
	    spam.setPressed(false);
	    spaminfo.setVisible(false);
	    mailinfo.setVisible(false);
	    download.setDisabled(true);
	},

	toggleRaw: function(button) {
	    var me = this;
	    var list = me.lookupReference('list');
	    var rec = list.selModel.getSelection()[0];
	    me.lookupReference('mailinfo').setVisible(me.raw);
	    me.raw = !me.raw;
	    me.updatePreview(me.raw, rec);
	},

	btnHandler: function(button, e) {
	    var me = this;
	    var action = button.reference;
	    var list = this.lookupReference('list');
	    var selected = list.getSelection();
	    me.doAction(action, selected);
	},

	doAction: function(action, selected) {
	    if (!selected.length) {
		return;
	    }

	    var list = this.lookupReference('list');

	    if (selected.length > 1) {
		var idlist = [];
		selected.forEach(function(item) {
		    idlist.push(item.data.id);
		});
		Ext.Msg.confirm(
		    gettext('Confirm'),
		    Ext.String.format(
			gettext("Action '{0}' for '{1}' items"),
			action, selected.length,
		    ),
		    function(button) {
			if (button !== 'yes') {
			    return;
			}

			PMG.Utils.doQuarantineAction(action, idlist.join(';'), function() {
			    list.getController().load();
			});
		    },
		);
		return;
	    }

	    PMG.Utils.doQuarantineAction(action, selected[0].data.id, function() {
		list.getController().load();
	    });
	},

	onSelectMail: function() {
	    var me = this;
	    var list = this.lookupReference('list');
	    var selection = list.selModel.getSelection();
	    if (selection.length > 1) {
		me.multiSelect(selection);
		return;
	    }

	    var rec = selection[0] || {};

	    me.getViewModel().set('mailid', rec.data ? rec.data.id : '');
	    me.updatePreview(me.raw || false, rec);
	    me.lookupReference('spaminfo').setID(rec);
	    me.lookupReference('mailinfo').setVisible(!!rec.data && !me.raw);
	    me.lookupReference('mailinfo').update(rec.data);
	},

	toggleSpamInfo: function(btn) {
	    var grid = this.lookupReference('spaminfo');
	    grid.setVisible(!grid.isVisible());
	},

	openContextMenu: function(table, record, tr, index, event) {
	    event.stopEvent();
	    var me = this;
	    var list = me.lookup('list');
	    var menu = Ext.create('PMG.menu.SpamContextMenu', {
		callback: function(action) {
		    me.doAction(action, list.getSelection());
		},
	    });

	    menu.showAt(event.getXY());
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
		selectionChange: 'onSelectMail',
		itemkeypress: 'keyPress',
		rowcontextmenu: 'openContextMenu',
	    },
	},
    },

    items: [
	{
	    title: gettext('Spam Quarantine'),
	    xtype: 'pmgQuarantineList',
	    selModel: 'checkboxmodel',
	    emailSelection: true,
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
		    renderer: PMG.Utils.sender_renderer,
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
		    renderer: function(v) { return Ext.Number.toFixed(v/1024, 0); },
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
	    split: true,
	    reference: 'preview',
	    disabled: true,
	    dockedItems: [
		{
		    xtype: 'toolbar',
		    dock: 'top',
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
			    iconCls: 'fa fa-paper-plane-o',
			    handler: 'btnHandler',
			},
			{
			    reference: 'delete',
			    text: gettext('Delete'),
			    iconCls: 'fa fa-trash-o',
			    handler: 'btnHandler',
			},
		    ],
		},
		{
		    xtype: 'pmgSpamInfoGrid',
		    border: false,
		    reference: 'spaminfo',
		},
		{
		    xtype: 'pmgMailInfo',
		    hidden: true,
		    reference: 'mailinfo',
		},
	    ],
	},
    ],
});
