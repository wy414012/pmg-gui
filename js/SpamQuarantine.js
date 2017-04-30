Ext.define('PMG.SpamQuarantine', {
    extend: 'Ext.tab.Panel',
    xtype: 'pmgSpamQuarantine',

    title: gettext('Spam Quarantine') + ': ' + Proxmox.UserName,
    border: false,
    scrollable: true,
    defaults: { border: false },

    items: [
	{
	    title: gettext('Today'),
	    itemId: 'today',
	    html: "Backup"
	},
	{
            title: gettext('Archive'),
	    itemId: 'archive',
	    html: "Archive"
	}
    ]
});


