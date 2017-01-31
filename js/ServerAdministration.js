Ext.define('PMG.ServerAdministration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgServerAdministration',

    title: gettext('Server Administration'),

    items: [
	{
            title: gettext('Services'),
	    html: "Server Administration1"
	},
	{
            title: gettext('Updates'),
	    html: "Server Administration2"
	},
	{
	    xtype: 'proxmoxNodeTasks',
	    title: gettext('Tasks'),
	    height: 'auto',
	    nodename: Proxmox.NodeName
	}
    ]
});


