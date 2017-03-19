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
	    html: "local"
	},
	{
	    title: gettext('LDAP'),
	    xtype: 'pmgLDAPConfig'
	},
	{
	    title: gettext('POP'),
	    html: "POP"
	}
    ]
});


