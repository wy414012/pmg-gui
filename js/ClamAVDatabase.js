Ext.define('PMG.ClamAVDatabase', {
    extend: 'Proxmox.grid.ObjectGrid',
    alias: ['widget.pmgClamAVDatabase'],

    initComponent : function() {
	var me = this;

	me.add_text_row('dbmirror', gettext('Database Mirror'),
			{ deleteEmpty: true, defaultValue: 'database.clamav.net' });
	
	var baseurl = '/config/clamav';

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
