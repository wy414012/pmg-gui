Ext.define('PMG.PBSInputPanel', {
    extend: 'Ext.tab.Panel',
    xtype: 'pmgPBSInputPanel',
    mixins: ['Proxmox.Mixin.CBind'],

    bodyPadding: 10,
    remoteId: undefined,

    cbindData: function(initialConfig) {
	let me = this;

	me.isCreate = initialConfig.isCreate || !initialConfig.remoteId;
	return {
	    unsetValue: me.isCreate ? null : undefined,
	};
    },

    items: [
	{
	    xtype: 'inputpanel',
	    title: gettext('Backup Server'),
	    onGetValues: function(values) {
		values.disable = values.enable ? 0 : 1;
		delete values.enable;
		return values;
	    },
	    column1: [
		{
		    xtype: 'pmxDisplayEditField',
		    name: 'remote',
		    cbind: {
			value: '{unsetValue}',
			editable: '{isCreate}',
		    },
		    fieldLabel: gettext('ID'),
		    allowBlank: false,
		},
		{
		    xtype: 'proxmoxtextfield',
		    name: 'server',
		    cbind: {
			value: '{unsetValue}',
		    },
		    vtype: 'DnsOrIp',
		    fieldLabel: gettext('Server'),
		    allowBlank: false,
		},
		{
		    xtype: 'proxmoxtextfield',
		    name: 'datastore',
		    cbind: {
			value: '{unsetValue}',
		    },
		    fieldLabel: 'Datastore',
		    allowBlank: false,
		},
		{
		    xtype: 'proxmoxKVComboBox',
		    name: 'notify',
		    fieldLabel: gettext('Notify'),
		    comboItems: [
			['always', gettext('Always')],
			['error', gettext('Errors')],
			['never', gettext('Never')],
		    ],
		    deleteEmpty: false,
		    emptyText: gettext('Never'),
		},
	    ],
	    column2: [
		{
		    xtype: 'proxmoxtextfield',
		    name: 'username',
		    cbind: {
			value: '{unsetValue}',
		    },
		    emptyText: gettext('Example') + ': admin@pbs',
		    fieldLabel: gettext('Username'),
		    regex: /\S+@\w+/,
		    regexText: gettext('Example') + ': admin@pbs',
		    allowBlank: false,
		},
		{
		    xtype: 'proxmoxtextfield',
		    inputType: 'password',
		    name: 'password',
		    cbind: {
			value: '{unsetValue}',
			allowBlank: '{!isCreate}',
			emptyText: (get) => get('isCreate') ? '' : gettext('Unchanged'),
		    },
		    fieldLabel: gettext('Password'),
		},
		{
		    xtype: 'proxmoxcheckbox',
		    name: 'enable',
		    checked: true,
		    uncheckedValue: 0,
		    fieldLabel: gettext('Enable'),
		},
		{
		    xtype: 'proxmoxcheckbox',
		    name: 'include-statistics',
		    checked: true,
		    uncheckedValue: 0,
		    fieldLabel: gettext('Include Statistics'),
		},
	    ],
	    columnB: [
		{
		    xtype: 'proxmoxtextfield',
		    name: 'fingerprint',
		    cbind: {
			value: '{unsetValue}',
		    },
		    fieldLabel: gettext('Fingerprint'),
		    emptyText: gettext('Server certificate SHA-256 fingerprint, required for self-signed certificates'),
		    regex: /[A-Fa-f0-9]{2}(:[A-Fa-f0-9]{2}){31}/,
		    regexText: gettext('Example') + ': AB:CD:EF:...',
		    allowBlank: true,
		},
	    ],
	},
	{
	    xtype: 'inputpanel',
	    title: gettext('Prune Options'),
	    defaults: {
		// set nested, else we'd only set the defaults for the two column containers
		defaults: {
		    minValue: 1,
		    labelWidth: 100,
		    allowBlank: true,
		},
	    },
	    column1: [
		{
		    xtype: 'proxmoxintegerfield',
		    fieldLabel: gettext('Keep Last'),
		    name: 'keep-last',
		    cbind: { deleteEmpty: '{!isCreate}' },
		},
		{
		    xtype: 'proxmoxintegerfield',
		    fieldLabel: gettext('Keep Daily'),
		    name: 'keep-daily',
		    cbind: { deleteEmpty: '{!isCreate}' },
		},
		{
		    xtype: 'proxmoxintegerfield',
		    fieldLabel: gettext('Keep Monthly'),
		    name: 'keep-monthly',
		    cbind: { deleteEmpty: '{!isCreate}' },
		},
	    ],
	    column2: [
		{
		    xtype: 'proxmoxintegerfield',
		    fieldLabel: gettext('Keep Hourly'),
		    name: 'keep-hourly',
		    cbind: { deleteEmpty: '{!isCreate}' },
		},
		{
		    xtype: 'proxmoxintegerfield',
		    fieldLabel: gettext('Keep Weekly'),
		    name: 'keep-weekly',
		    cbind: { deleteEmpty: '{!isCreate}' },
		},
		{
		    xtype: 'proxmoxintegerfield',
		    fieldLabel: gettext('Keep Yearly'),
		    name: 'keep-yearly',
		    cbind: { deleteEmpty: '{!isCreate}' },
		},
	    ],
	},
    ],
});

Ext.define('PMG.PBSEdit', {
    extend: 'Proxmox.window.Edit',
    xtype: 'pmgPBSEdit',
    onlineHelp: 'pmgbackup_pbs_remotes',

    subject: 'Proxmox Backup Server',
    isAdd: true,

    bodyPadding: 0,

    initComponent: function() {
	let me = this;

	me.isCreate = !me.remoteId;

	me.method = 'POST';
	me.url = '/api2/extjs/config/pbs';
	if (!me.isCreate) {
	    me.url += `/${me.remoteId}`;
	    me.method = 'PUT';
	}

	me.items = [{
	    xtype: 'pmgPBSInputPanel',
	    isCreate: me.isCreate,
	    remoteId: me.remoteId,
	}];

	me.callParent();

	if (!me.isCreate) {
	    me.load({
		success: function(response, options) {
		    let values = response.result.data;

		    values.enable = values.disable ? 0 : 1;
		    me.setValues(values);
		},
	    });
	}
    },
});
