Ext.define('pmg-virus-list', {
    extend: 'Ext.data.Model',
    fields: ['id', 'envelope_sender', 'from', 'sender', 'receiver', 'subject',
	{ type: 'integer', name: 'bytes' },
	{ type: 'string', name: 'virusname' },
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
	url: "/api2/json/quarantine/virus",
    },
    idProperty: 'id',
});

Ext.define('PMG.VirusQuarantine', {
    extend: 'Ext.container.Container',
    xtype: 'pmgVirusQuarantine',

    border: false,
    layout: { type: 'border' },

    defaults: { border: false },

    controller: {

	xclass: 'Ext.app.ViewController',

	updatePreview: function(raw) {
	    var list = this.lookupReference('list');
	    var rec = list.selModel.getSelection()[0];
	    var preview = this.lookupReference('preview');

	    if (!rec || !rec.data || !rec.data.id) {
		preview.update('');
		preview.setDisabled(true);
		return;
	    }

	    let url = `/api2/htmlmail/quarantine/content?id=${rec.data.id}`;
	    if (raw) {
		url += '&raw=1';
	    }
	    preview.setDisabled(false);
	    preview.update("<iframe frameborder=0 width=100% height=100% sandbox='allow-same-origin' src='" + url +"'></iframe>");
	},

	toggleRaw: function(button) {
	    var me = this;
	    me.lookup('mailinfo').setVisible(me.raw);
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
	    me.updatePreview(me.raw || false);
	    let mailinfo = me.lookup('mailinfo');
	    let list = me.lookup('list');
	    let selection = list.getSelection();
	    if (selection.length < 1) {
		mailinfo.setVisible(false);
		return;
	    }
	    mailinfo.setVisible(!me.raw);
	    mailinfo.update(selection[0].data);
	},

	control: {
	    'button[reference=raw]': {
		click: 'toggleRaw',
	    },
	    'pmgQuarantineList': {
		selectionChange: 'onSelectMail',
	    },
	},

    },

    items: [
	{
	    title: gettext('Virus Quarantine'),
	    xtype: 'pmgQuarantineList',
	    emptyText: gettext('No data in database'),
	    emailSelection: false,
	    reference: 'list',
	    region: 'west',
	    width: 500,
	    split: true,
	    collapsible: false,
	    store: {
		model: 'pmg-virus-list',
		groupField: 'day',
		groupDir: 'DESC',
		sorters: [{
		    property: 'time',
		    direction: 'DESC',
		}],
	    },

	    columns: [
		{
		    header: `${gettext('Sender')}/${gettext('Receiver')}/${gettext('Subject')}`,
		    dataIndex: 'subject',
		    renderer: PMG.Utils.render_sender_receiver,
		    flex: 1,
		},
		{
		    header: gettext('Virus'),
		    dataIndex: 'virusname',
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
		    items: [
			{
			    xtype: 'button',
			    reference: 'raw',
			    text: gettext('Toggle Raw'),
			    enableToggle: true,
			    iconCls: 'fa fa-file-code-o',
			},
			'->',
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
		    xtype: 'pmgMailInfo',
		    hidden: true,
		    reference: 'mailinfo',
		},
	    ],
	},
    ],
});
