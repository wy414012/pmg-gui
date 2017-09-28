Ext.define('PMG.grid.SpamInfoGrid',{
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgSpamInfoGrid',

    setID: function(rec) {
	var me = this;
	if (!rec || !rec.data || !rec.data.id) {
	    me.getStore().removeAll();
	    return;
	}

	me.setStore({
	    autoLoad: true,
	    autoDestroy: true,
	    proxy: {
		type: 'proxmox',
		url: '/api2/json/quarantine/content?id='+rec.data.id,
		root: 'data.spaminfo'
	    }
	});
    },

    emptyText: gettext('No Spam Info'),
    hidden: true,
    border: true,
    bodyBorder: false,

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
