Ext.define('PMG.grid.SpamInfoGrid', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgSpamInfoGrid',

    store: {
	autoDestroy: true,
	fields: ['desc', 'name', { type: 'number', name: 'score' }],
	proxy: {
	    type: 'proxmox',
	    root: 'data.spaminfo',
	},
	sorters: 'score',
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
	ftype: 'summary',
    }],

    columns: [
	{
	    text: gettext('Test Name'),
	    dataIndex: 'name',
	    flex: 2,
	    summaryType: 'count',
	    summaryRenderer: function(value, summaryData, dataIndex, metaData) {
		return gettext('Spamscore');
	    },
	},
	{
	    text: gettext('Score'),
	    dataIndex: 'score',
	    align: 'right',
	    renderer: function(value, metaData) {
		let color = value < 0 ? '#d7e9f6' : value > 0 ? '#f3d6d7' : '';
		let fontWeight = value >= 3 ? '1000' : value >= 1.5 ? '600' : '';
		metaData.tdStyle = `background-color: ${color}; font-weight: ${fontWeight};`;
		return value;
	    },
	    summaryType: 'sum',
	    summaryRenderer: function(value, summaryData, dataIndex, metaData) {
		return Ext.util.Format.round(value, 5);
	    },
	},
	{
	    text: gettext('Description'),
	    dataIndex: 'desc',
	    flex: 3,
	},
    ],
});
