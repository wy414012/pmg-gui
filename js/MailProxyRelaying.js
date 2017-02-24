Ext.define('PMG.MailProxyRelaying', {
    extend: 'Proxmox.grid.ObjectGrid',
    alias: ['widget.pmgMailProxyRelaying'],

    initComponent : function() {
	var me = this;

	var rows = {
	    relay: {
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
	    },
	    relayport: {
		required: true,
		defaultValue: 25,
		header: gettext('SMTP port'),
		editor: {
		    xtype: 'proxmoxWindowEdit',
		    subject: gettext('SMTP port'),
		    items: {
			xtype: 'proxmoxintegerfield',
			name: 'relayport',
			minValue: 1,
			maxValue: 65535,
			deleteEmpty: true,
			value: 25,
			fieldLabel: gettext('SMTP port')
		    }
		}
	    },
	    relaynomx: {
		required: true,
		defaultValue: 0,
		header: gettext('Disable MX lookup'),
		renderer: Proxmox.Utils.format_boolean,
		editor: {
		    xtype: 'proxmoxWindowEdit',
		    subject: gettext('Disable MX lookup'),
		    items: {
			xtype: 'proxmoxcheckbox',
			name: 'relaynomx',
			uncheckedValue: 0,
			defaultValue: 0,
			deleteDefaultValue: true,
			fieldLabel: gettext('Disable MX lookup')
		    }
		}
	    },
	    smarthost: {
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
	    },

	};

	var baseurl = '/config/mail';

	var reload = function() {
	    me.rstore.load();
	};

	var run_editor = function() {
	    var sm = me.getSelectionModel();
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var rowdef = rows[rec.data.key];
	    if (!rowdef.editor) {
		return;
	    }

	    var win;
	    if (Ext.isString(rowdef.editor)) {
		win = Ext.create(rowdef.editor, {
		    pveSelNode: me.pveSelNode,
		    confid: rec.data.key,
		    url: '/api2/extjs/' + baseurl
		});
	    } else {
		var config = Ext.apply({
		    pveSelNode: me.pveSelNode,
		    confid: rec.data.key,
		    url: '/api2/extjs/' + baseurl
		}, rowdef.editor);
		win = Ext.createWidget(rowdef.editor.xtype, config);
		win.load();
	    }

	    win.show();
	    win.on('destroy', reload);
	};

	Ext.apply(me, {
	    url: '/api2/json/' + baseurl,
	    interval: 5000,
	    cwidth1: 250,
	    //tbar: [ edit_btn, revert_btn ],
	    rows: rows,
	    listeners: {
		itemdblclick: run_editor
		//selectionchange: set_button_status
	    }
	});

	me.callParent();

	me.on('activate', me.rstore.startUpdate);
	me.on('destroy', me.rstore.stopUpdate);

	//me.rstore.on('datachanged', function() {
	//set_button_status();
	//});
    }
});
