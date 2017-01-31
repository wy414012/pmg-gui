Ext.define('PMG.SystemConfiguration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgSystemConfiguration',

    title: gettext('System Configuration'),

    items: [
	{
	    title: gettext('Network'),
	    xtype: 'proxmoxNodeNetworkView',
	    nodename: Proxmox.NodeName
	},
	{
	    title: gettext('Time'),
            xtype: 'proxmoxNodeTimeView',
	    nodename: Proxmox.NodeName
	},
	{
            title: gettext('Backup'),
	    html: "Backkup"
	},
	{
            title: gettext('Restore'),
	    html: "Restore"
	},
	{
            title: gettext('Reports'),
	    html: "Reports"
	},
	{
            title: gettext('SSH Access'),
	    html: "SSH Access"
	}
    ]
});


