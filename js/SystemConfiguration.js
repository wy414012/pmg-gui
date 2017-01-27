Ext.define('PMG.SystemConfiguration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgSystemConfiguration',

    title: gettext('System Configuration'),

    items: [
	{
            title: gettext('Network'),
	    html: "Network"
	},
	{
            title: gettext('Time'),
	    html: "Time"
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


