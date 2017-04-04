Ext.define('PMG.Application', {
    extend: 'Ext.app.Application',

    name: 'PMG',

    // default fragment for the router
    defaultToken: 'pmgDashboard',

    stores: [
	'NavigationStore'
    ],

    layout: 'fit',

    realignWindows: function() {
	var modalwindows = Ext.ComponentQuery.query('window[modal]');
	Ext.Array.forEach(modalwindows, function(item) {
	    item.center();
	});
    },

    launch: function() {
	var me = this;
	// show login window if not loggedin
	var loggedin = Proxmox.Utils.authOK();
	Ext.on('resize', me.realignWindows);
	Ext.create({ xtype: loggedin ? 'mainview' : 'loginview' });
    }
});

Ext.application('PMG.Application');
