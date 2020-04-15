/*global Proxmox*/
/*jslint confusion: true*/
/*format is a string and a function*/
Ext.define('pmg-attachment-list', {
    extend: 'Ext.data.Model',
    fields: [ 'id', 'envelope_sender', 'from', 'sender', 'receiver', 'subject',
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
	url: "/api2/json/quarantine/attachment"
    },
    idProperty: 'id'
});

Ext.define('PMG.AttachmentQuarantine', {
    extend: 'Ext.container.Container',
    xtype: 'pmgAttachmentQuarantine',

    border: false,
    layout: { type: 'border' },

    defaults: { border: false },

    controller: {

	xclass: 'Ext.app.ViewController',

	updatePreview: function(raw, rec) {
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
	    var list = this.lookupReference('list');
	    var rec = list.getSelection()[0] || {};
	    me.lookup('mailinfo').setVisible(me.raw);
	    me.raw = !me.raw;
	    me.updatePreview(me.raw, rec);
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
	    let me = this;
	    let list = me.lookup('list');
	    let rec = list.getSelection()[0] || {};
	    let mailinfo = me.lookup('mailinfo');

	    me.updatePreview(me.raw || false, rec);
	    me.lookup('attachmentlist').setID(rec);
	    mailinfo.setVisible(!!rec.data);
	    mailinfo.update(rec.data);
	},

	control: {
	    'button[reference=raw]': {
		click: 'toggleRaw'
	    },
	    'pmgQuarantineList': {
		selectionChange: 'onSelectMail'
	    }
	}

    },

    items: [
	{
	    title: gettext('Attachment Quarantine'),
	    xtype: 'pmgQuarantineList',
	    emptyText: gettext('No data in database'),
	    emailSelection: false,
	    reference: 'list',
	    region: 'west',
	    width: 500,
	    split: true,
	    collapsible: false,
	    store: {
		model: 'pmg-attachment-list',
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
			'->',
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
		    xtype: 'pmgAttachmentGrid',
		    minHeight: 50,
		    maxHeight: 250,
		    scrollable: true,
		    reference: 'attachmentlist',
		},
		{
		    xtype: 'pmgMailInfo',
		    hidden: true,
		    reference: 'mailinfo',
		},
	    ]
	}
    ]
});
