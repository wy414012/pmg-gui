Ext.define('PMG.Application', {
    extend: 'Ext.app.Application',

    name: 'PMG',

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

	if (loggedin) {
	    if (location.pathname === "/quarantine") {
		Ext.create({ xtype: 'quarantineview' });
	    } else {
		Ext.create({ xtype: 'mainview' });
	    }
	} else {
	    Ext.create({ xtype: 'loginview' });
	}
    }
});

Ext.application('PMG.Application');
