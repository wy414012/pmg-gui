Ext.define('PMG.data.StatStore', {
    extend: 'Ext.data.Store',
    alias: 'store.pmgStatStore',

    autoDestroy: true,

    staturl: undefined,
    
    reload: function() {
	var me = this;

	var ts = PMG.StatTimeSelector.getTimeSpan();

	var last = me.proxy.extraParams;
	
	if (last.starttime === ts.starttime && last.endtime === ts.endtime)
	    return; // avoid repeated loads

	me.proxy.url = me.staturl;
	me.proxy.extraParams = { starttime: ts.starttime, endtime: ts.endtime };

	console.log("LOAD" + me.proxy.url);
	
	me.load();
    },

    proxy: {
	type: 'proxmox'
    },

    constructor: function(config) {
	var me = this;

	config = config || {};

	// staturl is required
	if (!config.staturl) {
	    throw "no staturl specified";
	}
	
	me.mon(Ext.GlobalEvents, 'pmgStatTimeSelectorUpdate', me.reload, me);
	
	me.callParent([config]);

	me.reload();
   }
});
