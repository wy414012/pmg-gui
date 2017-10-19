Ext.define('PMG.FetchmailEdit', {
    extend: 'Proxmox.window.Edit',
    xtype: 'pmgFetchmailEdit',

    userid: undefined,

    isAdd: true,

    subject: 'Fetchmail',

    fieldDefaults: { labelWidth: 120 },

    items: {
	xtype: 'inputpanel',
	column1: [
	    {
		xtype: 'textfield',
		name: 'server',
		fieldLabel: gettext('Server'),
		allowBlank: false
	    },
	    {
		xtype: 'proxmoxintegerfield',
		name: 'port',
		fieldLabel: gettext('Port'),
		minValue: 1,
		maxValue: 65535,
		allowBlank: false
	    },
	    {
		xtype: 'textfield',
		name: 'user',
		fieldLabel: gettext('Username'),
		allowBlank: false
	    },
	    {
		xtype: 'textfield',
		name: 'pass',
		inputType: 'password',
		fieldLabel: gettext('Passsword'),
		allowBlank: false
	    },
	    {
		xtype: 'textfield',
		name: 'target',
		fieldLabel: gettext('Deliver to'),
		allowBlank: false
	    },

	],
	column2: [
	    {
		xtype: 'proxmoxcheckbox',
		fieldLabel: gettext('Enabled'),
		name: 'enable',
		uncheckedValue: 0,
		checked: true
	    },
	    {
		xtype: 'proxmoxintegerfield',
		name: 'interval',
		fieldLabel: gettext('Interval'),
		value: 1,
		minValue: 1,
		maxValue: 24*12*7,
		allowBlank: false
	    },
	    {
		xtype: 'proxmoxcheckbox',
		fieldLabel: gettext('Use SSL'),
		name: 'ssl',
		uncheckedValue: 0,
		checked: false
	    },
	    {
		xtype: 'proxmoxcheckbox',
		fieldLabel: gettext('Keep old mails'),
		name: 'keep',
		uncheckedValue: 0,
		checked: false
	    }
	]
    }
});
