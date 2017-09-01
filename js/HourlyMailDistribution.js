Ext.define('PMG.MailDistChart', {
    extend: 'Ext.chart.CartesianChart',
    xtype: 'pmgMailDistChart',

    width: 770,
    height: 300,
    animation: false,

    axes: [{
	type: 'numeric',
	title: gettext('Count'),
	position: 'left',
	grid: true,
	minimum: 0
    }, {
	type: 'category',
	position: 'bottom',
	fields: ['index']
    }],

    initComponent: function() {
	var me = this;


	if (!me.store) {
	    throw "cannot work without store";
	}

	if (!me.field) {
	    throw "cannot work without a field";
	}

	me.callParent();

	me.addSeries({
	    type: 'bar',
	    xField: 'index',
	    yField: me.field,
	    tooltip: {
		trackMouse: true,
		renderer: function(tooltip, record, item) {
		    var start = record.get('index');
		    var end = start+1;
		    tooltip.setHtml('Time: ' + start + ' - ' + end + '<br>' +
				    'Count: ' + record.get(item.field));
		}
	    }
	});
    }
});

Ext.define('PMG.HourlyMailDistribution', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgHourlyMailDistribution',

    scrollable: true,

    bodyPadding: '0 0 10 0',
    defaults: {
	margin: '10 10 0 10'
    },

    title: gettext('Statistics') + ': ' + gettext('Hourly Distribution'),

    tbar: [ { xtype: 'pmgStatTimeSelector' } ],

    initComponent: function() {
	var me = this;

	var store = Ext.create('PMG.data.StatStore', {
	    staturl: '/api2/json/statistics/maildistribution',
	    fields: [
		{ type: 'integer', name: 'index' },
		{ type: 'integer', name: 'count' },
		{ type: 'integer', name: 'count_in' },
		{ type: 'integer', name: 'count_out' },
		{ type: 'integer', name: 'spamcount_in' },
		{ type: 'integer', name: 'spamcount_out' },
		{ type: 'integer', name: 'viruscount_in' },
		{ type: 'integer', name: 'viruscount_ou' },
		{ type: 'integer', name: 'bounces_in' },
		{ type: 'integer', name: 'bounces_out' },
	    ]
	});

	me.items = [
	    {
		xtype: 'pmgMailDistChart',
		title: gettext('Incoming Mails'),
		field: 'count_in',
		store: store
	    },
	    {
		xtype: 'pmgMailDistChart',
		title: gettext('Outgoing Mails'),
		field: 'count_out',
		store: store
	    }
	];

	me.callParent();

	me.on('destroy', store.destroy, store);
    }
});
