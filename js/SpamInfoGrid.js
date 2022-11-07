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
	let me = this;
	let id = rec?.data?.id;
	if (!id) {
	    me.getStore().removeAll();
	    return;
	}
	me.store.proxy.setUrl(`/api2/json/quarantine/content?id=${id}`);
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
	    flex: 1,
	    summaryType: 'count',
	    summaryRenderer: _v => gettext('Spamscore'),
	    tdCls: 'txt-monospace',
	},
	{
	    text: gettext('Score'),
	    dataIndex: 'score',
	    align: 'right',
	    tdCls: 'txt-monospace',
	    renderer: function(score, metaData) {
		if (score === 0) {
		    return score;
		}
		let absScore = Math.abs(score);
		let fontWeight = '400', background = score < 0 ? '#d7e9f6' : '#f3d6d7';
		if (absScore >= 3) {
		    fontWeight = '900';
		    background = score < 0 ? '#ACD1EC' : '#E8B0B2';
		} else if (absScore >= 1.5) {
		    fontWeight = '600';
		} else if (absScore <= 0.1) {
		    fontWeight = '200';
		    background = score < 0 ? '#EEF6FB' : '#FAEFF0';
		}
		metaData.tdStyle = `font-weight: ${fontWeight};background-color: ${background};`;
		return score;
	    },
	    summaryType: 'sum',
	    summaryRenderer: value => Ext.util.Format.round(value, 5),
	},
	{
	    text: gettext('Description'),
	    dataIndex: 'desc',
	    flex: 2,
	},
    ],
});
