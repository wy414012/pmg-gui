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


Ext.define('PMG.SpamArchive', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgSpamArchive',

    controller: {

        xclass: 'Ext.app.ViewController',

	init: function(view) {
	    view.store.load({
		callback: function() {
		    view.getSelectionModel().select(0);
		}
	    });
	}
    },

    store: {
        model: 'pmg-spam-archive'
    },

    columns: [
        {
	    xtype: 'datecolumn',
            header: gettext('Date'),
	    format: 'Y-m-d',
            dataIndex: 'day',
	    flex: 1
        },
	{
	    header: gettext('Count'),
	    dataIndex: 'count',
	    flex: 1
	},
	{
	    header: gettext('Spam level'),
	    dataIndex: 'spamavg',
	    flex: 1
	}
    ]
});

Ext.define('pmg-spam-list', {
    extend: 'Ext.data.Model',
    fields: [ 'id', 'envelope_sender', 'from', 'sender', 'receiver', 'subject',
	{ type: 'number', name: 'spamlevel' },
	{ type: 'integer', name: 'bytes' },
        { type: 'date', dateFormat: 'timestamp', name: 'time' }
    ],
    proxy: {
        type: 'proxmox',
    },
    idProperty: 'id'
});

Ext.define('PMG.SpamList', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgSpamList',

    setDay: function(day) {
	var me = this;

	me.setTitle(Ext.Date.format(day, "F j Y"));
	me.store.load({
            url: "/api2/json/quarantine/spam/" + (day.getTime() / 1000)
	});
    },

    store: {
	model: 'pmg-spam-list',
    },

    tbar: [
	{
	    text: gettext('Whitelist')
	},
	{
	    text: gettext('Blacklist')
	},
	{
	    text: gettext('Deliver')
	},
	{
	    text: gettext('Delete')
	}
    ],

    columns: [
        {
            header: gettext('Sender/Subject'),
            dataIndex: 'subject',
	    renderer: function(value, metaData, rec) {
		var subject = Ext.htmlEncode(value);
		var from = Ext.htmlEncode(rec.data.from);
		var sender = Ext.htmlEncode(rec.data.sender);
		if (sender) {
		    from = Ext.String.format(gettext("{0} on behalf of {1}"),
					     sender, from);
		}
		return '<small>' + from + '</small><br>' + subject;
	    },
	    flex: 1
        },
	{
	    header: gettext('Level'),
	    dataIndex: 'spamlevel'
	},
	{
	    header: gettext('Size (KB)'),
	    renderer: function(v) { return Ext.Number.toFixed(v/1024, 0); },
	    dataIndex: 'bytes'
	},
	{
	    xtype: 'datecolumn',
	    header: gettext('Arrival Time'),
	    dataIndex: 'time',
	    format: 'H:m:s'
	}
    ]
});

Ext.define('PMG.SpamQuarantine', {
    extend: 'Ext.container.Container',
    xtype: 'pmgSpamQuarantine',

    border: false,
    layout: 'border',

    defaults: { border: false },

    controller: {

        xclass: 'Ext.app.ViewController',

        init: function(view) {
        },

	onSelectDay: function() {
            var view = this.getView();

	    var grid = this.lookupReference('archive');
	    var rec = grid.selModel.getSelection()[0];

	    if (!rec || !rec.data || !rec.data.day) return;

	    var spamlist = this.lookupReference('spamlist');
	    spamlist.setDay(rec.data.day);
	},

	onSelectMail: function() {
	    var spamlist = this.lookupReference('spamlist');
	    var rec = spamlist.selModel.getSelection()[0];

	    var preview = this.lookupReference('preview');

	    if (!rec || !rec.data || !rec.data.id)  {
		preview.update('');
		return;
	    }

	    var url = '/api2/htmlmail/quarantine/content?id=' + rec.data.id;
	    preview.update("<iframe frameborder=0 width=100% height=100% src='" + url +"'></iframe>");
	},
    },

    items: [
	{
	    xtype: 'pmgSpamArchive',
	    reference: 'archive',
	    region: 'west',
	    width: 320,
	    split: true,

	    listeners: {
		selectionChange: 'onSelectDay'
	    }
	},
	{
	    xtype: 'panel',
	    region: 'center',
	    layout: { type: 'vbox', align: 'stretch' },
	    items: [
		{
		    xtype: 'pmgSpamList',
		    reference: 'spamlist',
		    height: 300,
		    listeners: {
			selectionChange: 'onSelectMail'
		    }
		},
		{
		    xtype: 'splitter'
		},
		{
		    flex: 1,
		    reference: 'preview',
		}
	    ]
	}
    ]
});
