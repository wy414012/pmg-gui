Ext.define('PMG.MailProxyTLSPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pmgMailProxyTLSPanel',

    layout: {
	type: 'vbox',
	align: 'stretch'
    },

    bodyPadding: '0 0 10 0',
    defaults: {
	collapsible: true,
	animCollapse: false,
	margin: '10 10 0 10'
    },

    initComponent: function() {
	var me = this;

	var tlsSettings = Ext.create('PMG.MailProxyTLS', {
	    title: gettext('Settings')
	});

	var tlsDomains = Ext.create('PMG.MailProxyTLSDomains', {
	    title: gettext('TLS Domain Policy'),
	    flex: 1
	});

	me.items = [ tlsSettings, tlsDomains ];

	me.callParent();

	tlsSettings.relayEvents(me, ['activate', 'deactivate', 'destroy']);
	tlsDomains.relayEvents(me, ['activate', 'deactivate', 'destroy']);
    }
});
