/*global Proxmox*/
Ext.define('PMG.MailProxyRelaying', {
    extend: 'Proxmox.grid.ObjectGrid',
    alias: ['widget.pmgMailProxyRelaying'],

    monStoreErrors: true,
    
    initComponent : function() {
	var me = this;

	me.add_text_row('relay', gettext('Default Relay'),
			{ deleteEmpty: true, defaultValue: Proxmox.Utils.noneText });

	me.add_integer_row('relayport', gettext('SMTP Port'),
			   { defaultValue: 25, deleteEmpty: true,
			     minValue: 1, maxValue: 65535 });

	me.add_boolean_row('relaynomx', gettext('Disable MX lookup'));

	me.add_text_row('smarthost', gettext('Smarthost'),
			{ deleteEmpty: true, defaultValue: Proxmox.Utils.noneText });

	var baseurl = '/config/mail';

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	Ext.apply(me, {
	    tbar: [{
		text: gettext('Edit'),
		xtype: 'proxmoxButton',
		disabled: true,
		handler: function() { me.run_editor() },
		selModel: me.selModel
	    }],
	    url: '/api2/json' + baseurl,
	    editorConfig: {
		url: '/api2/extjs' + baseurl
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
	me.on('deactivate', me.rstore.stopUpdate);
    }
});
