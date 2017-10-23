Ext.define('PMG.RBLStatistics', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgRBLStatistics',

    scrollable: true,
    border: false,

    bodyPadding: '10 0 10 10',

    title: gettext('Statistics') + ': ' + gettext('RBL rejects'),

    tbar: [ { xtype: 'pmgStatTimeSelector' } ],

    items: [
	{
	    title: gettext('RBL rejects'),
	    xtype: 'proxmoxRRDChart',
	    legend: false,
	    fields: [ 'count' ],
	    fieldTitles: [
		gettext('RBL rejects')
	    ],
	    store: {
		type: 'pmgStatStore',
		includeTimeSpan: true,
		staturl: "/api2/json/statistics/rblcount",
		fields: [
		    { type: 'integer', name: 'count' },
		    { type: 'date', dateFormat: 'timestamp', name: 'time' }
		]
	    }
	}
    ]
});
