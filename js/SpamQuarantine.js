/*global Proxmox*/
/*jslint confusion: true*/
/*format is a string and a function*/
Ext.define('pmg-spam-archive', {
    extend: 'Ext.data.Model',
    fields: [
	{ type: 'number', name: 'spamavg' },
	{ type: 'integer', name: 'count' },
        { type: 'date', dateFormat: 'timestamp', name: 'day' }
    ],
    proxy: {
        type: 'proxmox',
        url: "/api2/json/quarantine/spam"
    },
    idProperty: 'day'
});

Ext.define('pmg-spam-list', {
    extend: 'Ext.data.Model',
    fields: [ 'id', 'envelope_sender', 'from', 'sender', 'receiver', 'subject',
	{ type: 'number', name: 'spamlevel' },
	{ type: 'integer', name: 'bytes' },
	{ type: 'date', dateFormat: 'timestamp', name: 'time' },
	{
	    type: 'string',
	    name: 'day',
	    convert: function(v, rec) {
		return Ext.Date.format(rec.get('time'), 'Y-m-d');
	    }, depends: ['time']
	}
    ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/quarantine/spam"
    },
    idProperty: 'id'
});

Ext.define('PMG.SpamQuarantine', {
    extend: 'Ext.container.Container',
    xtype: 'pmgSpamQuarantine',

    border: false,
    layout: { type: 'border' },

    defaults: { border: false },

    // from mail link
    cselect: undefined,

    controller: {

	xclass: 'Ext.app.ViewController',

	updatePreview: function(raw, rec) {
	    var list = this.lookupReference('list');
	    var rec = list.selModel.getSelection()[0];
	    var preview = this.lookupReference('preview');

	    if (!rec || !rec.data || !rec.data.id)  {
		preview.update('');
		preview.setDisabled(true);
		return;
	    }

	    var url = '/api2/htmlmail/quarantine/content?id=' + rec.data.id + ((raw)?'&raw=1':'');
	    preview.setDisabled(false);
	    preview.update("<iframe frameborder=0 width=100% height=100% sandbox='allow-same-origin' src='" + url +"'></iframe>");
	},

	toggleRaw: function(button) {
	    var me = this;
	    me.raw = !me.raw;
	    me.updatePreview(me.raw);
	},

	btnHandler: function(button, e) {
	    var list = this.lookupReference('list');
	    var selected = list.getSelection();
	    if (!selected.length) {
		return;
	    }

	    var action = button.reference;

	    PMG.Utils.doQuarantineAction(action, selected[0].data.id, function() {
		list.getController().load();
	    });
	},

	onSelectMail: function() {
	    var me = this;
	    var list = this.lookupReference('list');
	    var rec = list.selModel.getSelection()[0];

	    me.updatePreview(me.raw || false, rec);
	    me.lookupReference('spaminfo').setID(rec);
	},

	toggleSpamInfo: function(btn) {
	    var grid = this.lookupReference('spaminfo');
	    grid.setVisible(!grid.isVisible());
	},

	init: function(view) {
	    this.lookup('list').cselect = view.cselect;
	},

	control: {
	    'button[reference=raw]': {
		click: 'toggleRaw'
	    },
	    'button[reference=spam]': {
		click: 'toggleSpamInfo'
	    },
	    'pmgQuarantineList': {
		selectionChange: 'onSelectMail'
	    }
	}
    },

    items: [
	{
	    title: gettext('Spam Quarantine'),
	    xtype: 'pmgQuarantineList',
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
		    direction: 'DESC'
		}]
	    },

	    columns: [
		{
		    header: gettext('Sender/Subject'),
		    dataIndex: 'subject',
		    renderer: PMG.Utils.sender_renderer,
		    flex: 1
		},
		{
		    header: gettext('Score'),
		    dataIndex: 'spamlevel',
		    align: 'right',
		    width: 70
		},
		{
		    header: gettext('Size') + ' (KB)',
		    renderer: function(v) { return Ext.Number.toFixed(v/1024, 0); },
		    dataIndex: 'bytes',
		    align: 'right',
		    width: 90
		},
		{
		    header: gettext('Date'),
		    dataIndex: 'day',
		    hidden: true
		},
		{
		    xtype: 'datecolumn',
		    header: gettext('Time'),
		    dataIndex: 'time',
		    format: 'H:i:s'
		}
	    ]
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
			    iconCls: 'fa fa-file-code-o'
			},
			{
			    xtype: 'button',
			    reference: 'spam',
			    text: gettext('Toggle Spam Info'),
			    enableToggle: true,
			    iconCls: 'fa fa-bullhorn'
			},
			'->',
			{
			    reference: 'whitelist',
			    text: gettext('Whitelist'),
			    iconCls: 'fa fa-check',
			    handler: 'btnHandler'
			},
			{
			    reference: 'blacklist',
			    text: gettext('Blacklist'),
			    iconCls: 'fa fa-times',
			    handler: 'btnHandler'
			},
			{
			    reference: 'deliver',
			    text: gettext('Deliver'),
			    iconCls: 'fa fa-paper-plane-o',
			    handler: 'btnHandler'
			},
			{
			    reference: 'delete',
			    text: gettext('Delete'),
			    iconCls: 'fa fa-trash-o',
			    handler: 'btnHandler'
			}
		    ]
		},
		{
		    xtype: 'pmgSpamInfoGrid',
		    border: false,
		    reference: 'spaminfo'
		}
	    ]
	}
    ]
});
