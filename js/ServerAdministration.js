Ext.define('PMG.ServerAdministration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgServerAdministration',

    title: gettext('Server Administration'),

    items: [
	{
	    xtype: 'proxmoxNodeServiceView',
            title: gettext('Services'),
	    startOnlyServices: {
		syslog: true,
		pmgproxy: true,
		pmgdaemon: true
	    },
	    nodename: Proxmox.NodeName
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


