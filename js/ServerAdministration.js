Ext.define('PMG.ServerAdministration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgServerAdministration',

    title: gettext('Server Administration'),

    border: false,
    defaults: { border: false },

    items: [
	{
	    xtype: 'pmgServerStatus',
	    itemId: 'status'
	},
	{
	    xtype: 'proxmoxNodeServiceView',
            title: gettext('Services'),
	    itemId: 'services',
	    startOnlyServices: {
		syslog: true,
		pmgproxy: true,
		pmgdaemon: true
	    },
	    nodename: Proxmox.NodeName
	},
	{
            title: gettext('Updates'),
	    itemId: 'updates',
	    html: "Server Administration2"
	},
	{
	    xtype: 'proxmoxLogView',
	    itemId: 'logs',
	    title: gettext('Syslog'),
	    url: "/api2/extjs/nodes/" + Proxmox.NodeName + "/syslog",
	    log_select_timespan: 1
	},
	{
	    xtype: 'proxmoxNodeTasks',
	    itemId: 'tasks',
	    title: gettext('Tasks'),
	    height: 'auto',
	    nodename: Proxmox.NodeName
	}
    ]
});


