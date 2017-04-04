Ext.define('PMG.SystemConfiguration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgSystemConfiguration',

    title: gettext('Configuration') + ': ' + gettext('System'),
    border: false,
    defaults: { border: false },

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
	    itemId: 'backup',
            title: gettext('Backup'),
	    html: "Backkup"
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


