Ext.define('PMG.UserManagement', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgUserManagement',

    title: gettext('Configuration') + ': ' +
	gettext('User Management'),

    border: false,
    defaults: { border: false },

    items: [
	{
	    title: gettext('Local'),
	    itemId: 'local',
	    xtype: "pmgUserView",
	},
	{
	    title: 'LDAP',
	    itemId: 'ldap',
	    xtype: 'pmgLDAPConfig',
	},
	{
	    title: 'Fetchmail',
	    itemId: 'pop',
	    xtype: 'pmgFetchmailView',
	},
    ],
});


