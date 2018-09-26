Ext.define('PMG.MailProxyTLSPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pmgMailProxyTLSPanel',

    layout: {
	type: 'vbox',
	align: 'stretch'
    },

    initComponent: function() {
	var me = this;

	var tlsSettings = Ext.create('PMG.MailProxyTLS', {
	    xtype: 'pmgMailProxyTLS',
	    title: gettext('Settings'),
	    border: 0,
	    collapsible: true,
	    padding: '0 0 20 0'
	});

	var tlsDomains = Ext.create('PMG.MailProxyTLSDomains', {
	    xtype: 'pmgMailProxyTLSDomains',
	    title: gettext('TLS Domain Policy'),
	    border: 0,
	    collapsible: true,
	    padding: '0 0 20 0'
	});

	me.items = [ tlsSettings, tlsDomains ];

	me.callParent();

	tlsSettings.relayEvents(me, ['activate', 'deactivate', 'destroy']);
	tlsDomains.relayEvents(me, ['activate', 'deactivate', 'destroy']);
    }
});
