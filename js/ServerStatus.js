Ext.define('PMG.ServerStatus', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pmgServerStatus',

    title: gettext('Status'),

    border: false,

    scrollable: true,

    bodyPadding: '10 0 0 0',
    defaults: {
	width: 700,
	padding: '0 0 10 10'
    },

    layout: 'column',

    tbar: [
	{
	    text: gettext("Console"),
	    handler: function() {
		PMG.Utils.openVNCViewer('shell', Proxmox.NodeName);
	    }
	},
	'->',
	{
	    xtype: 'proxmoxRRDTypeSelector'
	}
    ],

    initComponent: function() {
        var me = this;

	var nodename = Proxmox.NodeName;
	var rrdstore = Ext.create('Proxmox.data.RRDStore', {
	    rrdurl: "/api2/json/nodes/" + nodename + "/rrddata",
	    fields: [
		{ type: 'number', name: 'loadavg' },
		{ type: 'number', name: 'maxcpu' },
		{ type: 'number', name: 'cpu' },
		{ type: 'number', name: 'iowait' },
		{ type: 'number', name: 'memtotal' },
		{ type: 'number', name: 'memused' },
		{ type: 'number', name: 'swaptotal' },
		{ type: 'number', name: 'swapused' },
		{ type: 'number', name: 'roottotal' },
		{ type: 'number', name: 'rootused' },
		{ type: 'number', name: 'netin' },
		{ type: 'number', name: 'netout' },
		{ type: 'date', dateFormat: 'timestamp', name: 'time' }
	    ]
	});

	Ext.apply(me, {
	    items: [
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('CPU usage'),
		    unit: 'percent',
		    fields: ['cpu','iowait'],
		    fieldTitles: [gettext('CPU usage'), gettext('IO delay')],
		    store: rrdstore
		},
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('Server load'),
		    fields: ['loadavg'],
		    fieldTitles: [gettext('Load average')],
		    store: rrdstore
		},
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('Memory usage'),
		    unit: 'bytes',
		    fields: ['memtotal','memused'],
		    fieldTitles: [gettext('Total'), gettext('Used')],
		    store: rrdstore
		},
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('Swap usage'),
		    unit: 'bytes',
		    fields: ['swaptotal','swapused'],
		    fieldTitles: [gettext('Total'), gettext('Used')],
		    store: rrdstore
		},
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('Network traffic'),
		    unit: 'bytespersecond',
		    fields: ['netin','netout'],
		    fieldTitles: [gettext('Ingress'), gettext('Egress')],
		    store: rrdstore
		},
		{
		    xtype: 'proxmoxRRDChart',
		    title: gettext('Disk usage'),
		    unit: 'bytes',
		    fields: ['roottotal','rootused'],
		    fieldTitles: [gettext('Total'), gettext('Used')],
		    store: rrdstore
		}
	    ],
	    listeners: {
		activate: function() {
		    rrdstore.startUpdate();
		},
		destroy: function() {
		    rrdstore.stopUpdate();
		}
	    }
	});
	me.callParent();
   }
});
    
