/*global Proxmox*/
Ext.define('PMG.view.main.VersionInfo',{
    extend: 'Ext.Component',
    xtype: 'versioninfo',

    makeApiCall: true,

    data: {
	version: false
    },

    tpl: [
	'Mail Gateway',
	'<tpl if="version">',
	' {version}-{release}/{repoid}',
	'</tpl>',
	' <a href="https://bugzilla.proxmox.com">BETA</a>'
    ],

    initComponent: function() {
	var me = this;
	me.callParent();

	if (me.makeApiCall) {
	    Proxmox.Utils.API2Request({
		url: '/version',
		method: 'GET',
		success: function(response) {
		    me.update(response.result.data);
		}
	    });
	}
    }
});
