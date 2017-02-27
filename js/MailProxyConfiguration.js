Ext.define('PMG.MailProxyConfiguration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgMailProxyConfiguration',

    title: gettext('Mail Proxy Configuration'),

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
	    html: "whitelist"
	}
    ]
});


