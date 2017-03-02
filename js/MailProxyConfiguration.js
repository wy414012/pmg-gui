Ext.define('PMG.MailProxyConfiguration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgMailProxyConfiguration',

    title: gettext('Configuration') + ': ' +
	gettext('Mail Proxy'),

    items: [
	{
	    title: gettext('Relaying'),
	    xtype: 'pmgMailProxyRelaying'
	},
	{
	    title: gettext('Relay Domains'),
	    xtype: 'pmgRelayDomains'
	},
	{
	    title: gettext('Ports'),
	    xtype: 'pmgMailProxyPorts'
	},
	{
            title: gettext('Options'),
	    xtype: 'pmgMailProxyOptions'
	},
	{
            title: gettext('Transports'),
	    xtype: 'pmgTransport'
	},
	{
            title: gettext('Networks'),
	    xtype: 'pmgMyNetworks'
	},
	{
            title: gettext('TLS'),
	    xtype: 'pmgMailProxyTLS'
	},
	{
	    title: gettext('Whitelist'),
	    xtype: 'pmgObjectGroup',
	    hideGroupInfo: true,
	    showDirection: true,
	    otype_list: [1000, 1009, 1001, 1007, 1002, 1008, 1003, 1004],
	    baseurl: '/config/whitelist'
	}
   ]
});


