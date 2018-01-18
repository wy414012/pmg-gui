/*global Proxmox*/
Ext.define('pmg-mail-tracker', {
    extend: 'Ext.data.Model',
    fields: [
	'id' , 'from', 'to', 'dstatus', 'rstatus', 'qid', 'msgid', 'client',
	{ type: 'number', name: 'size' },
	{ type: 'date', dateFormat: 'timestamp', name: 'time' }
    ],
    proxy: {
	type: 'proxmox'
    },
    // do not use field 'id', because "id/to" is the unique Id
    // this way we display an entry for each receiver
    idProperty: 'none'
});


Ext.define('PMG.MailTrackerFilter', {
    extend: 'Ext.container.Container',
    xtype: 'pmgMailTrackerFilter',

    layout: {
	type: 'hbox'
    },

    controller: {

        xclass: 'Ext.app.ViewController',

	onFilterChange: function() {
	    var view = this.getView();
	    view.fireEvent('filterChanged');
	},

	onSpecialKey: function(field, e) {
	    if (e.getKey() == e.ENTER) {
		this.onFilterChange();
	    }
	}
    },

    getFilterParams: function() {
	var me = this;
	var param = {};

	var names = ['from', 'target', 'xfilter', 'starttime', 'endtime', 'ndr', 'greylist'];
	Ext.Array.each(names, function(name) {
	    var value = me.lookupReference(name).getSubmitValue();
	    if (value) { param[name] = value; }
	});

	return param;
    },

    items: [
	{
	    width: 400,
	    border: false,
	    padding: 10,
	    layout: {
		type: 'vbox',
		align: 'stretch'
	    },
	    items: [
		{
		    fieldLabel: gettext('Sender'),
		    xtype: 'textfield',
		    listeners: { specialkey: 'onSpecialKey' },
		    reference: 'from'
		},
		{
		    fieldLabel: gettext('Receiver'),
		    xtype: 'textfield',
		    listeners: { specialkey: 'onSpecialKey' },
		    reference: 'target'
		},
		{
		    fieldLabel: gettext('Filter'),
		    xtype: 'textfield',
		    listeners: { specialkey: 'onSpecialKey' },
		    reference: 'xfilter'
		}
	    ]
	},
	{
	    width: 330,
	    border: false,
	    padding: 10,
	    layout: {
		type: 'vbox',
		align: 'stretch'
	    },
	    items: [
		{
		    fieldLabel: gettext('Start'),
		    reference: 'starttime',
		    listeners: { change: 'onFilterChange' },
		    value: (function() {
			var now = new Date();
			return new Date(now.getTime() - 3600000);
		    }()),
		    xtype: 'promxoxDateTimeField'
		},
		{
		    fieldLabel: gettext('End'),
		    reference: 'endtime',
		    listeners: { change: 'onFilterChange' },
		    value: (function() {
			var now = new Date();
			var tomorrow = new Date();
			tomorrow.setDate(now.getDate()+1);
			tomorrow.setHours(0);
			tomorrow.setMinutes(0);
			tomorrow.setSeconds(0);
			return tomorrow;
		    }()),
		    xtype: 'promxoxDateTimeField'
		},
		{
		    layout: {
			type: 'hbox'
		    },
		    border: false,
		    items: [
			{
			    boxLabel: gettext('Include NDRs'),
			    xtype: 'proxmoxcheckbox',
			    listeners: { change: 'onFilterChange' },
			    reference: 'ndr',
			    name: 'ndrs'
			},
			{
			    boxLabel: gettext('Include Greylist'),
			    xtype: 'proxmoxcheckbox',
			    listeners: { change: 'onFilterChange' },
			    margin: { left: 20 },
			    reference: 'greylist',
			    name: 'greylist'
			}
		    ]
		}
	    ]
	}
    ]
});

Ext.define('PMG.MaiLogWindow', {
    extend: 'Ext.window.Window',
    xtype: 'pmgMaiLogWindow',

    title: gettext('Syslog'),

    logid: undefined,
    starttime: undefined,
    endtime: undefined,

    width: 1024,
    height: 400,
    scrollable: true,

    layout: {
	type: 'auto'
    },
    modal: true,
    bodyPadding: 5,

    load: function() {
	var me = this;

	Proxmox.Utils.API2Request({
	    method: 'GET',
	    params: { starttime: me.starttime, endtime: me.endtime },
	    url: '/nodes/' + Proxmox.NodeName + '/tracker/' + me.logid,
	    waitMsgTarget: me,
	    failure: function(response, opts) {
		me.update(gettext('Error') + " " + response.htmlStatus);
	    },
	    success: function(response, opts) {
		var data = response.result.data;

		var logs = "<pre style='margin: 0;'>";
		Ext.Array.each(data.logs, function(line) {
		    logs += Ext.htmlEncode(line) + "\n";
		});
		logs += "</pre>";
		me.update(logs);
	    }
	});
    },

    initComponent : function() {
	var me = this;

	if (!me.logid) {
	    throw "no logid specified";
	}

	if (!me.starttime) {
	    throw "no starttime specified";
	}
	if (!me.endtime) {
	    throw "no endtime specified";
	}

	me.callParent();

	me.setHtml('Loading...');
	me.load();
    }
});

Ext.define('PMG.MailTracker', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgMailTracker',

    title: gettext('Tracking Center'),

    border: false,

    emptyText: gettext('No data in database.'),
    disableSelection: true,

    viewConfig: {
	deferEmptyText: false,
	enableTextSelection: true,
	getRowClass: function(record, index) {
	    var status = record.data.rstatus || record.data.dstatus;
	    return PMG.Utils.mail_status_map[status];
	}
    },

    plugins: [
	{
	    ptype: 'rowexpander',
	    rowBodyTpl: '<p class="logs">{logs}</p>'
	}
    ],

    store: {
	autoDestroy: true,
	model: 'pmg-mail-tracker'
    },

    controller: {

        xclass: 'Ext.app.ViewController',

	onSearch: function() {
	    var view = this.getView();
	    var filter = this.lookupReference('filter');
	    var status = this.lookupReference('status');
	    var params = filter.getFilterParams();
	    status.update(''); // clear status before load
	    view.store.proxy.setExtraParams(params);
	    view.store.proxy.setUrl('/api2/json/nodes/' + Proxmox.NodeName + '/tracker');
	    view.store.load(function(records, operation, success) {
		var response = operation.getResponse();
		if (success) {
		    // fixme: howto avoid duplicate Ext.decode ?
		    var result = Ext.decode(response.responseText);
		    if (result.changes) {
			status.update(result.changes);
		    }
		}
	    });
	},

	showDetails: function(rowNode, record) {
	    var view = this.getView();

	    var params = view.store.proxy.getExtraParams();

	    Proxmox.Utils.API2Request({
		method: 'GET',
		params: { starttime: params.starttime, endtime: params.endtime },
		url: '/nodes/' + Proxmox.NodeName + '/tracker/' + record.data.id,
		waitMsgTarget: view,
		failure: function(response, opts) {
		    record.set('logs',gettext('Error') + " " + response.htmlStatus);
		},
		success: function(response, opts) {
		    var data = response.result.data;
		    var logs = "";

		    Ext.Array.each(data.logs, function(line) {
			logs += Ext.htmlEncode(line) + "<br>";
		    });

		    record.set('logs', logs);
		}
	    });
	},

	control: {
	    'gridview': {
		expandbody: 'showDetails'
	    }
	}
    },

    dockedItems: [
	{
	    xtype: 'pmgMailTrackerFilter',
	    reference: 'filter',
	    listeners:  { filterChanged: 'onSearch' },
	    border: false,
	    dock: 'top'
	},
	{
	    xtype: 'toolbar',
	    items: [
		{ text: 'Search', handler: 'onSearch' },
		{ xtype: 'component', html: '', reference: 'status' }
	    ]
	}
    ],

    columns: [
	{
	    xtype: 'datecolumn',
	    header: gettext('Time'),
	    width: 120,
	    dataIndex: 'time',
	    format: 'M d H:i:s'
	},
	{
	    header: gettext('From'),
	    flex: 1,
	    dataIndex: 'from',
	    renderer: Ext.htmlEncode
	},
	{
	    header: gettext('To'),
	    flex: 1,
	    dataIndex: 'to',
	    renderer: Ext.htmlEncode
	},
	{
	    header: gettext('Status'),
	    width: 150,
	    renderer: function(v, metaData, rec) {
		var returntext = 'unknown';
		var icon = 'question-circle';
		var rstatus = rec.data.rstatus;
		if (v !== undefined && v !== '') {
		    var vtext = PMG.Utils.mail_status_map[v] || v;
		    icon = v;
		    if (rstatus !== undefined && rstatus !== '') {
			var rtext = PMG.Utils.mail_status_map[rstatus] || rstatus;
			returntext = vtext + '/' + rtext;
			icon = rstatus;
		    } else if (rec.data.qid !== undefined) {
			returntext = 'queued/' + vtext;
		    } else {
			returntext = vtext;
		    }
		}

		return PMG.Utils.format_status_icon(icon) + returntext;
	    },
	    dataIndex: 'dstatus'
	},
	{
	    header: gettext('Size'),
	    hidden: true,
	    dataIndex: 'size'
	},
	{
	    header: 'MSGID',
	    width: 300,
	    hidden: true,
	    dataIndex: 'msgid',
	    renderer: Ext.htmlEncode
	},
	{
	    header: gettext('Client'),
	    width: 200,
	    hidden: true,
	    dataIndex: 'client',
	    renderer: Ext.htmlEncode
	}
    ],

    initComponent: function() {
	var me = this;

	me.callParent();

	Proxmox.Utils.monStoreErrors(me.getView(), me.store);
    }
});
