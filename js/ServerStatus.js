Ext.define('PMG.ServerStatus', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pmgServerStatus',

    title: gettext('Status'),

    border: false,

    scrollable: true,

    bodyPadding: '10 0 0 0',
    defaults: {
	width: 700,
	padding: '0 0 10 10',
    },

    layout: 'column',

    controller: {
	xclass: 'Ext.app.ViewController',

	openConsole: function() {
	    Proxmox.Utils.openXtermJsViewer('shell', 0, Proxmox.NodeName);
	},

	nodeCommand: function(cmd) {
	    var me = this.getView();
	    Proxmox.Utils.API2Request({
		params: { command: cmd },
		url: '/nodes/' + Proxmox.NodeName + '/status',
		method: 'POST',
		waitMsgTarget: me,
		failure: function(response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		},
	    });
	},

	nodeShutdown: function() {
	    this.nodeCommand('shutdown');
	},

	nodeReboot: function() {
	    this.nodeCommand('reboot');
	},
    },

    tbar: [
	{
	    text: gettext("Console"),
	    iconCls: 'fa fa-terminal',
	    handler: 'openConsole',
	},
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Restart'),
	    dangerous: true,
	    confirmMsg: gettext('Node') + " '" + Proxmox.NodeName + "' - " + gettext('Restart'),
	    handler: 'nodeReboot',
	    iconCls: 'fa fa-undo',
	},
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Shutdown'),
	    dangerous: true,
	    confirmMsg: gettext('Node') + " '" + Proxmox.NodeName + "' - " + gettext('Shutdown'),
	    handler: 'nodeShutdown',
	    iconCls: 'fa fa-power-off',
	},
	'->',
	{
	    xtype: 'proxmoxRRDTypeSelector',
	},
    ],

    initComponent: function() {
        var me = this;

	var nodename = Proxmox.NodeName;
	var rrdstore = Ext.create('Proxmox.data.RRDStore', {
	    rrdurl: "/api2/json/nodes/" + nodename + "/rrddata",
	    fields: [
		{ type: 'number', name: 'loadavg' },
		{ type: 'number', name: 'maxcpu' },
		{
		    type: 'number',
		    name: 'cpu',
		    convert: function(val) {
			return val*100;
		    },
		},
		{
		    type: 'number',
		    name: 'iowait',
		    convert: function(val) {
			return val*100;
		    },
		},
		{ type: 'number', name: 'memtotal' },
		{ type: 'number', name: 'memused' },
		{ type: 'number', name: 'swaptotal' },
		{ type: 'number', name: 'swapused' },
		{ type: 'number', name: 'roottotal' },
		{ type: 'number', name: 'rootused' },
		{ type: 'number', name: 'netin' },
		{ type: 'number', name: 'netout' },
		{ type: 'date', dateFormat: 'timestamp', name: 'time' },
	    ],
	});

	Ext.apply(me, {
	    items: [
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('CPU usage'),
		    unit: 'percent',
		    fields: ['cpu', 'iowait'],
		    fieldTitles: [gettext('CPU usage'), gettext('IO delay')],
		    store: rrdstore,
		},
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('Server load'),
		    fields: ['loadavg'],
		    fieldTitles: [gettext('Load average')],
		    store: rrdstore,
		},
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('Memory usage'),
		    unit: 'bytes',
		    fields: ['memtotal', 'memused'],
		    fieldTitles: [gettext('Total'), gettext('Used')],
		    store: rrdstore,
		},
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('Swap usage'),
		    unit: 'bytes',
		    fields: ['swaptotal', 'swapused'],
		    fieldTitles: [gettext('Total'), gettext('Used')],
		    store: rrdstore,
		},
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('Network traffic'),
		    unit: 'bytespersecond',
		    fields: ['netin', 'netout'],
		    fieldTitles: [gettext('Ingress'), gettext('Egress')],
		    store: rrdstore,
		},
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('Disk usage'),
		    unit: 'bytes',
		    fields: ['roottotal', 'rootused'],
		    fieldTitles: [gettext('Total'), gettext('Used')],
		    store: rrdstore,
		},
	    ],
	    listeners: {
		activate: function() {
		    rrdstore.startUpdate();
		},
		destroy: function() {
		    rrdstore.stopUpdate();
		},
	    },
	});
	me.callParent();
   },
});

