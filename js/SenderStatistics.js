Ext.define('PMG.SenderStatistics', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgSenderStatistics',

    title: gettext('Statistics') + ': ' + gettext('Sender'),

    tbar: [ { xtype: 'pmgStatTimeSelector' } ],

    layout: 'fit',

    plugins: 'gridfilters',

    store: {
	type: 'pmgStatStore',
	staturl: '/api2/json/statistics/sender',
	remoteSort: true,
	remoteFilter: true,
	fields: [
	    'sender',
	    { type: 'integer', name: 'count' },
	    { type: 'integer', name: 'bytes' },
	    { type: 'integer', name: 'viruscount' }
	],
	proxy: {
	    type: 'proxmox',
	    sortParam: 'orderby',
	    getParams: function(operation) {
		var me = this, i;
		if (!operation.isReadOperation) {
		    return {};
		}
		var params = Ext.data.RestProxy.prototype.getParams.apply(me, arguments);

		var filters = operation.getFilters() || [];
		for (i = 0; i < filters.length; i++) {
		    filter = filters[i];
		    if (filter.config.id === 'x-gridfilter-sender') {
			var v = filter.getValue();
			if (v !== undefined && v !== '') {
			    params.filter = v;
			}
		    }
		}
		return params;
	    }
	},
	sorters: [
	    {
		property: 'count',
		direction: 'DESC'
	    }
	]
    },

    columns: [
	{
	    text: gettext('Sender'),
	    flex: 1,
	    dataIndex: 'sender',
	    filter: {
		type: 'string',
		itemDefaults: {
                    // any Ext.form.field.Text configs accepted
		}
            }
	},
	{
	    text: gettext('Count'),
	    dataIndex: 'count'
	},
	{
	    text: gettext('Size') + ' (KB)',
	    dataIndex: 'bytes',
	    renderer: function(v) {
		return Ext.Number.toFixed(v/1024, 0);
	    }
	}
    ]
});
