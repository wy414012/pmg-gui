Ext.define('PMG.SystemConfiguration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgSystemConfiguration',

    title: gettext('Configuration') + ': ' + gettext('System'),

    items: [
	{
	    title: gettext('Network'),
	    xtype: 'proxmoxNodeNetworkView',
	    nodename: Proxmox.NodeName
	},
	{
	    title: gettext('DNS'),
	    xtype: 'proxmoxNodeDNSView',
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


