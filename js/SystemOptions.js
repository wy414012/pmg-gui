Ext.define('PMG.SystemOptions', {
    extend: 'Proxmox.grid.ObjectGrid',
    xtype: 'pmgSystemOptions',

    monStoreErrors: true,
    interval: 5000,
    cwidth1: 200,

    url: '/api2/json/config/admin',
    editorConfig: {
	url: '/api2/extjs/config/admin'
    },

    controller: {
	xclass: 'Ext.app.ViewController',

	onEdit: function() {
	    var me = this.getView();
	    me.run_editor();
	}
    },

    tbar: [{
	text: gettext('Edit'),
	xtype: 'proxmoxButton',
	disabled: true,
	handler: 'onEdit'
    }],

    listeners: {
	itemdblclick: 'onEdit',
    },

    initComponent : function() {
	var me = this;

	me.add_boolean_row('dailyreport', gettext('Send daily reports'),
			   { defaultValue: 1});

	me.add_boolean_row('advfilter', gettext('Use advanced statistic filters'),
			   { defaultValue: 1});

	me.add_integer_row('statlifetime', gettext('User statistic lifetime (days)'),
			   { minValue: 1, defaultValue: 7, deleteEmpty: true });

	me.add_text_row('email', gettext("Administrator EMail"),
			{ deleteEmpty: true, defaultValue: Proxmox.Utils.noneText });

	me.callParent();

	me.on('activate', me.rstore.startUpdate);
	me.on('destroy', me.rstore.stopUpdate);
    }
})

