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
	url: "/api2/json/quarantine/spam",
    },
    idProperty: 'id'
});

Ext.define('PMG.SpamList', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgSpamList',

    title: gettext('Spam List'),

    emptyText: gettext('No E-Mail address selected'),
    viewConfig: {
	deferEmptyText: false
    },

    setUser: function(user) {
	var me = this;
	var params = me.getStore().getProxy().getExtraParams();
	params.pmail = user;
	me.getStore().getProxy().setExtraParams(params);
	me.user = user;
    },

    setFrom: function(from) {
	var me = this;
	var params = me.getStore().getProxy().getExtraParams();
	params.starttime = from;
	me.getStore().getProxy().setExtraParams(params);
    },

    setTo: function(to) {
	var me = this;
	var params = me.getStore().getProxy().getExtraParams();
	params.endtime = to;
	me.getStore().getProxy().setExtraParams(params);
    },

    load: function() {
	var me = this;
	if (me.user || PMG.view === 'quarantine') {
	    // extjs has no method to dynamically change the emptytext on
	    // grids, so we have to do it this way
	    var view = me.getView();
	    view.emptyText = '<div class="x-grid-empty">'+ gettext('No Spam E-Mails found') + '</div>';
	    view.refresh();
	}
	me.getStore().load();
    },

    store: {
	model: 'pmg-spam-list',
	groupField: 'day',
	groupDir: 'DESC',
	sorters: [{
	    property: 'time',
	    direction: 'DESC'
	}]
    },

    features: [
	{
	    ftype: 'grouping',
	    groupHeaderTpl: '{columnName}: {name} ({children.length})'
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
	    hidden: true
	},
	{
	    xtype: 'datecolumn',
	    header: gettext('Time'),
	    dataIndex: 'time',
	    format: 'H:m:s'
	},
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
	    var me = this;
	    var spamlist = me.lookupReference('spamlist');
	    if (PMG.view === 'quarantine') {
		spamlist.down('combobox[name=email]').setVisible(false);
		spamlist.load();
	    }

	    // we to this to trigger the change event of those fields
	    var today = new Date();
	    spamlist.down('datefield[name=from]').setValue(today);
	    spamlist.down('datefield[name=to]').setValue(today);
        },

	changeEmail: function(tb, value) {
	    var spamlist = this.lookupReference('spamlist');
	    spamlist.setUser(value);
	    spamlist.load();
	},

	resetEmail: function() {
	    if (PMG.view !== 'quarantine') {
		var spamlist = this.lookupReference('spamlist');
		spamlist.setUser(undefined);
	    }
	},

	onSelectMail: function() {
	    var me = this;
	    var spamlist = this.lookupReference('spamlist');
	    var rec = spamlist.selModel.getSelection()[0];

	    var preview = this.lookupReference('preview');

	    if (!rec || !rec.data || !rec.data.id)  {
		preview.update('');
		me.lookupReference('preview').setDisabled(true);
		return;
	    }

	    me.lookupReference('preview').setDisabled(false);

	    var raw = me.raw || false;

	    var url = '/api2/htmlmail/quarantine/content?id=' + rec.data.id + ((raw)?'&raw=1':'');
	    preview.update("<iframe frameborder=0 width=100% height=100% sandbox='allow-same-origin' src='" + url +"'></iframe>");
	},

	rawMail: function(button) {
	    var me = this;
	    me.lookupReference('html').setVisible(true);
	    button.setVisible(false);
	    me.raw = true;
	    me.onSelectMail();
	},

	htmlMail: function(button) {
	    var me = this;
	    me.lookupReference('raw').setVisible(true);
	    button.setVisible(false);
	    me.raw = false;
	    me.onSelectMail();
	},

	changeTime: function(field, value) {
	    var me = this;
	    if (!value) {
		return;
	    }
	    var val = value.getTime()/1000;
	    var spamlist = me.lookupReference('spamlist');
	    var combobox = me.lookupReference('email');
	    var params = combobox.getStore().getProxy().getExtraParams();

	    var to = me.lookupReference('to');
	    var from = me.lookupReference('from');

	    if (field.name === 'from') {
		spamlist.setFrom(val);
		params.starttime = val;
		to.setMinValue(value);

	    } else if (field.name === 'to') {
		spamlist.setTo(val + 24*60*60);
		params.endtime = val + 24*60*60;
		from.setMaxValue(value);
	    } else {
		return;
	    }

	    // the combobox does not know anything about the extraparams
	    // so we disable queryCaching until we expand (and query) again
	    combobox.queryCaching = false;
	    combobox.getStore().getProxy().setExtraParams(params);

	    // we are reloading when we already have an email selected,
	    // or are in the user quarantine view
	    if (combobox.getValue() || PMG.view === 'quarantine') {
		spamlist.load();
	    }
	},

	setQueryCaching: function() {
	    this.lookupReference('email').queryCaching = true;
	},

	btnHandler: function(button, e) {
	    var spamlist = this.lookupReference('spamlist');
	    var selected = spamlist.getSelection();
	    if (!selected.length) {
		return;
	    }
	    Proxmox.Utils.API2Request({
		url: '/quarantine/content/',
		params: {
		    action: button.reference,
		    id: selected[0].data.id
		},
		method: 'POST',
		failure: function(response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		},
		success: function(response, opts) {
		    spamlist.load();
		    Ext.Msg.show({
			title: gettext('Info'),
			message: "Action '" + button.reference + ' ' +
				 selected[0].data.id + "' successful",
			buttons: Ext.Msg.OK,
			icon: Ext.MessageBox.INFO
		    });
		}
	    });
	},

	control: {
	    '#':{
		beforedestroy: 'resetEmail'
	    },
	    'button[reference=raw]': {
		click: 'rawMail'
	    },
	    'button[reference=html]': {
		click: 'htmlMail'
	    },
	    'combobox[name=email]': {
		change: {
		    fn: 'changeEmail',
		    buffer: 500
		},
		expand: 'setQueryCaching'
	    },
	    'datefield': {
		change: 'changeTime'
	    },
	    'pmgSpamList':{
		selectionChange: 'onSelectMail'
	    },
	}
    },

    items: [
	{
	    tbar: {
		layout: {
		    type: 'vbox',
		    align: 'stretch'
		},
		defaults: {
		    margin: 2,
		},
		items: [
		    {
			fieldLabel: gettext('From'),
			reference: 'from',
			xtype: 'datefield',
			format: 'Y-m-d',
			name: 'from'
		    },
		    {
			fieldLabel: gettext('To'),
			reference: 'to',
			xtype: 'datefield',
			format: 'Y-m-d',
			name: 'to'
		    },
		    {
			xtype: 'combobox',
			displayField: 'mail',
			valueField: 'mail',
			store: {
			    proxy: {
				type: 'proxmox',
				url: '/api2/json/quarantine/spamusers'
			    }
			},
			queryParam: false,
			queryCaching: false,
			editable: false,
			reference: 'email',
			name: 'email',
			fieldLabel: 'E-Mail',
		    }]
	    },
	    xtype: 'pmgSpamList',
	    reference: 'spamlist',
	    region: 'west',
	    width: 500,
	    split: true,
	    collapsible: false,
	},
	{
	    title: gettext('Selected Mail'),
	    border: 0,
	    region: 'center',
	    split: true,
	    reference: 'preview',
	    disabled: true,
	    tbar: [{
		xtype: 'button',
		reference: 'raw',
		text: gettext('Show Raw'),
		iconCls: 'fa fa-file-code-o'
	    },{
		xtype: 'button',
		reference: 'html',
		hidden: true,
		text: gettext('Show HTML'),
		iconCls: 'fa fa-file-text-o'
	    },'->',{
		reference: 'whitelist',
		text: gettext('Whitelist'),
		iconCls: 'fa fa-check',
		handler: 'btnHandler'
	    },{
		reference: 'blacklist',
		text: gettext('Blacklist'),
		iconCls: 'fa fa-times',
		handler: 'btnHandler'
	    },{
		reference: 'deliver',
		text: gettext('Deliver'),
		iconCls: 'fa fa-paper-plane-o',
		handler: 'btnHandler'
	    },{
		reference: 'delete',
		text: gettext('Delete'),
		iconCls: 'fa fa-trash-o',
		handler: 'btnHandler'
	    },]
	}
    ]
});
