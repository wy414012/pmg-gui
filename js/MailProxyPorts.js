Ext.define('PMG.MailProxyPorts', {
    extend: 'Proxmox.grid.ObjectGrid',
    alias: ['widget.pmgMailProxyPorts'],

    initComponent : function() {
	var me = this;

	me.add_integer_row('ext_port', gettext('External SMTP Port'),
			   { defaultValue: 26, deleteEmpty: true,
			     minValue: 1, maxValue: 65535 });

	me.add_integer_row('int_port', gettext('Internal SMTP Port'),
			   { defaultValue: 25, deleteEmpty: true,
			     minValue: 1, maxValue: 65535 });

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
