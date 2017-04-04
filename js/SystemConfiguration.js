Ext.define('PMG.SystemConfiguration', {
    extend: 'Ext.tab.Panel',
    xtype: 'pmgSystemConfiguration',

    title: gettext('Configuration') + ': ' + gettext('System'),
    border: false,
    scrollable: true,
    defaults: { border: false },
    items: [
	{
	    title: gettext('Network/Time'),
	    itemId: 'network',
	    xtype: 'panel',
	    layout: {
		type: 'vbox',
		align: 'stretch',
		multi: true,
	    },
	    bodyPadding: '0 0 10 0',
	    defaults: {
		collapsible: true,
		animCollapse: false,
		margin: '10 10 0 10'
	    },
	    items: [
		{
		    flex: 1,
		    title: gettext('Interfaces'),
		    xtype: 'proxmoxNodeNetworkView',
		    nodename: Proxmox.NodeName,
		},
		{
		    height: 200,
		    title: gettext('DNS'),
		    xtype: 'proxmoxNodeDNSView',
		    nodename: Proxmox.NodeName
		},
		{
		    height: 150,
		    title: gettext('Time'),
		    xtype: 'proxmoxNodeTimeView',
		    nodename: Proxmox.NodeName
		},
	    ]
	},
	{
	    itemId: 'backup',
            title: gettext('Backup'),
	    html: "Backup"
	},
	{
	    itemId: 'restore',
            title: gettext('Restore'),
	    html: "Restore"
	},
	{
	    itemId: 'reports',
            title: gettext('Reports'),
	    html: "Reports"
	},
	{
	    itemId: 'ssh',
            title: gettext('SSH Access'),
	    html: "SSH Access"
	}
    ]
});


