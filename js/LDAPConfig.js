Ext.define('pmg-ldap-config', {
    extend: 'Ext.data.Model',
    fields: [ 'profile', 'server1', 'server2', 'comment',
	      'mode', 'binddn', 'bindpw', 'basedn', 'groupbasedn',
	      'filter', 'accountattr', 'mailattr',
	      { name: 'port',  type: 'integer' },
	      { name: 'gcount',  type: 'integer' },
	      { name: 'mcount',  type: 'integer' },
	      { name: 'ucount',  type: 'integer' },
	      { name: 'disable',  type: 'boolean' }
	    ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/config/ldap"
    },
    idProperty: 'profile'
});

Ext.define('PMG.LDAPInputPanel', {
    extend: 'Proxmox.panel.InputPanel',
    alias: 'widget.pmgLDAPInputPanel',

    profileId: undefined,

    onGetValues: function(values) {
	var me = this;

	values.disable = values.enable ? 0 : 1;
	delete values.enable;

	return values;
    },

    initComponent : function() {
	var me = this;

	me.column1 = [
	    {
		xtype: me.profileId ? 'displayfield' : 'textfield',
		fieldLabel: gettext('Profile Name'),
		value: me.profileId || '',
		name: 'profile',
		vtype: 'StorageId',
		allowBlank: false
	    },
	    {
		xtype: 'proxmoxKVComboBox',
		name: 'mode',
		comboItems: [
		    ['ldap', PMG.Utils.format_ldap_protocol('ldap')],
		    ['ldaps', PMG.Utils.format_ldap_protocol('ldaps')]
		],
		value: 'ldap',
		fieldLabel: gettext('Protocol')
	    },
	    {
		xtype: 'textfield',
		fieldLabel: gettext('Server'),
		allowBlank: false,
		vtype: 'IP64Address',
		name: 'server1'
	    },
	    {
		xtype: 'proxmoxtextfield',
		fieldLabel: gettext('Server'),
		allowBlank: true,
		deleteEmpty: me.create ? false : true,
		vtype: 'IP64Address',
		name: 'server2'
	    },
	    {
		xtype: 'proxmoxintegerfield',
		name: 'port',
		emptyText: gettext('Default'),
		deleteEmpty: me.create ? false : true,
		minValue: 1,
		maxValue: 65535,
		fieldLabel: gettext('Port'),
	    },
	    {
		xtype: 'textfield',
		name: 'binddn',
		allowBlank: true,
		fieldLabel: gettext('User name')
	    },
	    {
		xtype: 'textfield',
		inputType: 'password',
		allowBlank: true,
		name: 'bindpw',
		fieldLabel: gettext('Password')
	    }
	];

	me.column2 = [
	    {
		xtype: 'proxmoxcheckbox',
		name: 'enable',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: gettext('Enable')
	    },
	    {
		xtype: 'proxmoxtextfield',
		allowBlank: true,
		deleteEmpty: me.create ? false : true,
		name: 'basedn',
		fieldLabel: gettext('Base DN')
	    },
	    {
		xtype: 'proxmoxtextfield',
		allowBlank: true,
		deleteEmpty: me.create ? false : true,
		name: 'groupbasedn',
		fieldLabel: gettext('Base DN for Groups')
	    },
	    {
		xtype: 'proxmoxtextfield',
		allowBlank: true,
		deleteEmpty: me.create ? false : true,
		name: 'mailattr',
		fieldLabel: gettext('EMail attribute name(s)')
	    },
	    {
		xtype: 'proxmoxtextfield',
		allowBlank: true,
		deleteEmpty: me.create ? false : true,
		name: 'accountattr',
		fieldLabel: gettext('Account attribute name')
	    },
	    {
		xtype: 'proxmoxtextfield',
		allowBlank: true,
		deleteEmpty: me.create ? false : true,
		name: 'filter',
		fieldLabel: gettext('LDAP filter')
	    },
	    {
		xtype: 'proxmoxtextfield',
		allowBlank: true,
		deleteEmpty: me.create ? false : true,
		name: 'groupclass',
		fieldLabel: gettext('Group objectclass')
	    }
	];

	me.columnB = [
	    {
		xtype: 'textfield',
		fieldLabel: gettext('Comment'),
		allowBlank: true,
		name: 'comment'
	    }
	];

	me.callParent();
    }
});

Ext.define('PMG.LDAPEdit', {
    extend: 'Proxmox.window.Edit',
    alias: 'widget.pmgLDAPEdit',

    subject: 'LDAP Profile',
    isAdd: true,

    initComponent : function() {
	var me = this;

	me.create = me.profileId ? false : true;

	if (me.create) {
            me.url = '/api2/extjs/config/ldap';
            me.method = 'POST';
	} else {
            me.url = '/api2/extjs/config/ldap/' + me.profileId + '/config';
            me.method = 'PUT';
	}

	var ipanel = Ext.create('PMG.LDAPInputPanel', {
	    create: me.create,
	    profileId: me.profileId
	});

	me.items = [ ipanel ];

	me.fieldDefaults = {
	    labelWidth: 150
	};

	me.callParent();

	if (!me.create) {
	    me.load({
		success:  function(response, options) {
		    var values = response.result.data;

		    values.enable = values.disable ? 0 : 1;
		    ipanel.setValues(values);
		}
	    });
	}
    }
});

Ext.define('PMG.LDAPConfig', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pmgLDAPConfig'],

    initComponent : function() {
	var me = this;

	me.store = new Ext.data.Store({
	    model: 'pmg-ldap-config',
	    sorters: {
		property: 'profile',
		order: 'DESC'
	    }
	});

        var reload = function() {
            me.store.load();
        };

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var remove_btn =  Ext.createWidget('proxmoxStdRemoveButton', {
	    selModel: me.selModel,
	    baseurl: '/config/ldap',
	    callback: reload,
	    waitMsgTarget: me
	});

	var sync_btn =  Ext.createWidget('proxmoxButton', {
	    text: gettext('Synchronize'),
	    selModel: me.selModel,
	    enableFn: function(rec) {
		return !rec.data.disable;
	    },
	    disabled: true,
	    handler: function(btn, event, rec) {
		Proxmox.Utils.API2Request({
		    url: '/config/ldap/' + rec.data.profile + '/sync',
		    method: 'POST',
		    waitMsgTarget: me,
		    callback: reload,
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	var run_editor = function() {
	    var rec = me.selModel.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var win = Ext.createWidget('pmgLDAPEdit', {
		profileId: rec.data.profile
	    });
	    win.load();
	    win.on('destroy', reload);
	    win.show();
	};

	me.tbar = [
            {
		xtype: 'proxmoxButton',
		text: gettext('Edit'),
		disabled: true,
		selModel: me.selModel,
		handler: run_editor
            },
            {
		text: gettext('Create'),
		handler: function() {
		    var win = Ext.createWidget('pmgLDAPEdit', {});
		    win.on('destroy', reload);
		    win.show();
		}
	    },
	    remove_btn, sync_btn
	];

	Proxmox.Utils.monStoreErrors(me, me.store);

	Ext.apply(me, {

	    columns: [
		{
		    header: gettext('Profile Name'),
		    sortable: true,
		    width: 120,
		    dataIndex: 'profile'
		},
		{
		    header: gettext('Protocol'),
		    sortable: true,
		    dataIndex: 'mode',
		    renderer: PMG.Utils.format_ldap_protocol
		},
		{
		    header: gettext('Server'),
		    sortable: true,
		    dataIndex: 'server1',
		    renderer: function(value, metaData, rec) {
			if (rec.data.server2) {
			    return value + '<br>' + rec.data.server2;
			}
			return value;
		    }
		},
		{
		    header: gettext('Enabled'),
		    width: 80,
		    sortable: true,
		    dataIndex: 'disable',
		    renderer: Proxmox.Utils.format_neg_boolean
		},
		{
		    header: gettext('Comment'),
		    sortable: false,
		    renderer: Ext.String.htmlEncode,
		    dataIndex: 'comment',
		    flex: 1
		},
		{
		    header: gettext('Accounts'),
		    width: 80,
		    sortable: true,
		    dataIndex: 'ucount'
		},
		{
		    header: gettext('Addresses'),
		    width: 80,
		    sortable: true,
		    dataIndex: 'mcount'
		},
		{
		    header: gettext('Groups'),
		    width: 80,
		    sortable: true,
		    dataIndex: 'gcount'
		},
	    ],
	    listeners: {
		itemdblclick: run_editor,
		activate: reload
	    }
	});

	me.callParent();
    }
});
