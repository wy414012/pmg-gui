Ext.define('PMG.MailProxyPorts', {
    extend: 'Proxmox.grid.ObjectGrid',
    alias: ['widget.pmgMailProxyPorts'],

    initComponent : function() {
	var me = this;

	var rows = {
	    ext_port: {
		required: true,
		defaultValue: 26,
		header: gettext('External SMTP Port'),
		editor: {
		    xtype: 'proxmoxWindowEdit',
		    subject: gettext('External SMTP Port'),
		    items: {
			xtype: 'proxmoxintegerfield',
			name: 'ext_port',
			minValue: 1,
			maxValue: 65535,
			deleteEmpty: true,
			value: 26,
			labelWidth: 150,
			fieldLabel: gettext('External SMTP Port')
		    }
		}
	    },
	    int_port: {
		required: true,
		defaultValue: 25,
		header: gettext('Internal SMTP Port'),
		editor: {
		    xtype: 'proxmoxWindowEdit',
		    subject: gettext('Internal SMTP Port'),
		    items: {
			xtype: 'proxmoxintegerfield',
			name: 'int_port',
			minValue: 1,
			maxValue: 65535,
			deleteEmpty: true,
			value: 25,
			labelWidth: 150,
			fieldLabel: gettext('Internal SMTP Port')
		    }
		}
	    }
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
