Ext.define('PMG.MailProxyOptions', {
    extend: 'Proxmox.grid.ObjectGrid',
    alias: ['widget.pmgMailProxyOptions'],

    initComponent : function() {
	var me = this;

	var rows = {
	    banner: {
		required: true,
		defaultValue: 'ESMTP Proxmox',
		header: gettext('SMTPD Banner'),
		editor: {
		    xtype: 'proxmoxWindowEdit',
		    subject: gettext('SMTPD Banner'),
		    items: {
			xtype: 'proxmoxtextfield',
			name: 'banner',
			deleteEmpty: true,
			fieldLabel: gettext('SMTPD Banner')
		    }
		}
	    },
	};

	var baseurl = '/config/mail';

	Ext.apply(me, {
	    url: '/api2/json' + baseurl,
	    editorConfig: {
		url: '/api2/extjs' + baseurl,
	    },
	    interval: 5000,
	    cwidth1: 200,
	    rows: rows,
	    listeners: {
		itemdblclick: me.run_editor
	    }
	});

	me.callParent();

	me.on('activate', me.rstore.startUpdate);
	me.on('destroy', me.rstore.stopUpdate);
    }
});
