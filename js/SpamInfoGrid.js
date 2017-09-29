Ext.define('PMG.grid.SpamInfoGrid',{
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgSpamInfoGrid',

    store: {
	autoDestroy: true,
	fields: [ 'desc', 'name', { type: 'number', name: 'score' } ],
	proxy: {
	    type: 'proxmox',
	    root: 'data.spaminfo'
	}
    },

    setID: function(rec) {
	var me = this;
	if (!rec || !rec.data || !rec.data.id) {
	    me.getStore().removeAll();
	    return;
	}
	var url = '/api2/json/quarantine/content?id=' + rec.data.id;
	me.store.proxy.setUrl(url);
	me.store.load();
    },

    emptyText: gettext('No Spam Info'),
    hidden: true,

    features: [{
	ftype: 'summary'
    }],

    columns: [
	{
	    text: gettext('Test Name'),
	    dataIndex: 'name',
	    flex: 2,
	    summaryType: 'count',
	    summaryRenderer: function(value, summaryData, dataIndex, metaData) {
		return gettext('Spamscore');
	    }
	},
	{
	    text: gettext('Score'),
	    dataIndex: 'score',
	    align: 'right',
	    summaryType: 'sum',
	    summaryRenderer: function(value, summaryData, dataIndex, metaData) {
		return Ext.util.Format.round(value, 5);
	    }
	},
	{
	    text: gettext('Description'),
	    dataIndex: 'desc',
	    flex: 3
	}
    ],
});
