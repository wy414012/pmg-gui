Ext.define('PMG.MailProxyOptions', {
    extend: 'Proxmox.grid.ObjectGrid',
    alias: ['widget.pmgMailProxyOptions'],

    initComponent : function() {
	var me = this;

	var register_bool = function(cfg, name, subject, defaultValue, labelWidth) {
	    cfg[name] = {
		required: true,
		defaultValue: defaultValue,
		header: subject,
		renderer: Proxmox.Utils.format_boolean,
		editor: {
		    xtype: 'proxmoxWindowEdit',
		    subject: subject,
		    items: {
			xtype: 'proxmoxcheckbox',
			name: name,
			uncheckedValue: 0,
			defaultValue: defaultValue,
			deleteDefaultValue: true,
			labelWidth: labelWidth,
			fieldLabel: subject
		    }
		}
	    };
	};

	var register_integer = function(cfg, name, subject, defaultValue,
					minValue, maxValue, labelWidth) {
	    cfg[name] = {
		required: true,
		defaultValue: defaultValue,
		header: subject,
		editor: {
		    xtype: 'proxmoxWindowEdit',
		    subject: subject,
		    items: {
			xtype: 'proxmoxintegerfield',
			name: 'name',
			minValue: minValue,
			maxValue: maxValue,
			deleteEmpty: true,
			value: defaultValue,
			labelWidth: labelWidth,
			fieldLabel: subject
		    }
		}
	    };
	};

	var rows = {};

	register_integer(rows, 'maxsize', gettext('Message Size (bytes)'),
			 1024*1024*10, 1024, undefined, 150);

	register_bool(rows, 'rejectunknown', gettext('Reject Unknown Clients'), 0, 150);

	register_bool(rows, 'rejectunknownsender', gettext('Reject Unknown Senders'), 0, 150);

	register_bool(rows, 'helotests', gettext('SMTP HELO checks'), 0, 150);

	register_bool(rows, 'use_rbl', gettext('Use RBL checks'), 1, 150);

	// fixme: verify receivers

	register_bool(rows, 'greylist', gettext('Use Greylisting'), 1, 150);

	register_bool(rows, 'spf', gettext('Use SPF'), 1, 100);

	register_bool(rows, 'hide_received', gettext('Hide Internal Hosts'), 0, 150);

	register_integer(rows, 'dwarning', gettext('Delay Warning Time (hours)'),
			 4, 0, undefined, 200);

	register_integer(rows, 'conn_count_limit', gettext('Client Connection Count Limit'),
			 50, 0, 65535, 200);

	register_integer(rows, 'conn_rate_limit', gettext('Client Connection Rate Limit'),
			 0, 0, undefined, 200);

	register_integer(rows, 'message_rate_limit', gettext('Client Message Rate Limit'),
			 0, 0, undefined, 200);

	rows.banner = {
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
