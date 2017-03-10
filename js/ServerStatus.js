Ext.define('PMG.ServerStatus', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pmgServerStatus',

    title: gettext('Status'),

    border: false,

    tbar: [
	{
	    text: gettext("Console"),
	    handler: function() {
		PMG.Utils.openVNCViewer('shell', Proxmox.NodeName);
	    }
	}
    ]

});
    
