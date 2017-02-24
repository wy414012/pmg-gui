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
	    title: gettext('Ports'),
	    xtype: 'pmgMailProxyPorts'
	},
	{
            title: gettext('Options'),
	    html: "Options"
	},
	{
            title: gettext('Transports'),
	    html: "Transports"
	},
	{
            title: gettext('Networks'),
	    html: "Networks"
	},
	{
            title: gettext('TLS'),
	    html: "TLS"
	},
	{
            title: gettext('Whitelist'),
	    html: "whitelist"
	}
    ]
});


