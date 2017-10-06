Ext.define('PMG.VirusDetectorOptions', {
    extend: 'Proxmox.grid.ObjectGrid',
    alias: ['widget.pmgVirusDetectorOptions'],

    monStoreErrors: true,

    initComponent : function() {
	var me = this;

	me.add_boolean_row('archiveblockencrypted',
			   gettext('Block encrypted archives'));
	
	me.add_integer_row('archivemaxrec', gettext('Max recursion'),
			   { minValue: 1, defaultValue: 5,
			     deleteEmpty: true });

	me.add_integer_row('archivemaxfiles', gettext('Max files'),
			   { minValue: 0, defaultValue: 1000,
			     deleteEmpty: true });

	me.add_integer_row('archivemaxsize', gettext('Max file size'),
			   { minValue: 1000000, defaultValue: 25000000,
			     deleteEmpty: true });

	me.add_integer_row('maxscansize', gettext('Max scan size'),
			   { minValue: 1000000, defaultValue: 100000000,
			     deleteEmpty: true });

	me.add_integer_row('maxcccount', gettext('Max credit card numbers'),
			   { minValue: 0, defaultValue: 0,
			     deleteEmpty: true });
	
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
	me.on('deactivate', me.rstore.stopUpdate);
    }
});
