Ext.define('PMG.MailProxyRelaying', {
    extend: 'Proxmox.grid.ObjectGrid',
    alias: ['widget.pmgMailProxyRelaying'],

    initComponent : function() {
	var me = this;

	me.rows.relay = {
	    required: true,
	    defaultValue: Proxmox.Utils.noneText,
	    header: gettext('Default Relay'),
	    editor: {
		xtype: 'proxmoxWindowEdit',
		subject: gettext('Default Relay'),
		items: {
		    xtype: 'proxmoxtextfield',
		    name: 'relay',
		    deleteEmpty: true,
		    fieldLabel: gettext('Default Relay')
		}
	    }
	};

	me.add_integer_row('relayport', gettext('SMTP Port'),
			   { defaultValue: 25, deleteEmpty: true,
			     minValue: 1, maxValue: 65535 });

	me.add_boolean_row('relaynomx', ettext('Disable MX lookup'));

	me.rows.smarthost = {
	    required: true,
	    defaultValue: Proxmox.Utils.noneText,
	    header: gettext('Smarthost'),
	    editor: {
		xtype: 'proxmoxWindowEdit',
		subject: gettext('Smarthost'),
		items: {
		    xtype: 'proxmoxtextfield',
		    name: 'smarthost',
		    deleteEmpty: true,
		    fieldLabel: gettext('Smarthost')
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
	    listeners: {
		itemdblclick: me.run_editor
	    }
	});

	me.callParent();

	me.on('activate', me.rstore.startUpdate);
	me.on('destroy', me.rstore.stopUpdate);
    }
});
