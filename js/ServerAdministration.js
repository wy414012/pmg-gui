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
	    xtype: 'proxmoxLogView',
	    title: gettext('Syslog'),
	    url: "/api2/extjs/nodes/" + Proxmox.NodeName + "/syslog",
	    log_select_timespan: 1
	},
	{
	    xtype: 'proxmoxNodeTasks',
	    title: gettext('Tasks'),
	    height: 'auto',
	    nodename: Proxmox.NodeName
	}
    ]
});


