Ext.define('pmg-ldap-config', {
    extend: 'Ext.data.Model',
    fields: [ 'section', 'server1', 'server2', 'comment',
	      'mode', 'binddn', 'bindpw', 'basedn', 'groupbasedn',
	      'filter', 'accountattr', 'mailattr',
	      { name: 'port',  type: 'integer' },
	      { name: 'disable',  type: 'boolean' }
	    ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/config/ldap"
    },
    idProperty: 'section'
});

Ext.define('PMG.LDAPInputPanel', {
    extend: 'Proxmox.panel.InputPanel',
    alias: 'widget.pmgLDAPInputPanel',

    sectionId: undefined,

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
		xtype: me.sectionId ? 'displayfield' : 'textfield',
		fieldLabel: gettext('Profile Name'),
		value: me.sectionId || '',
		name: 'section',
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

	me.create = me.sectionId ? false : true;

	if (me.create) {
            me.url = '/api2/extjs/config/ldap';
            me.method = 'POST';
	} else {
            me.url = '/api2/extjs/config/ldap/' + me.sectionId;
            me.method = 'PUT';
	}

	var ipanel = Ext.create('PMG.LDAPInputPanel', {
	    create: me.create,
	    sectionId: me.sectionId
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
		property: 'section',
		order: 'DESC'
	    }
	});

        var reload = function() {
            me.store.load();
        };

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = me.selModel.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var win = Ext.createWidget('pmgLDAPEdit', {
		sectionId: rec.data.section
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
	    }
	];

	Ext.apply(me, {

	    columns: [
		{
		    header: gettext('ID'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'section'
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
		}
	    ],
	    listeners: {
		itemdblclick: run_editor,
		activate: reload
	    }
	});

	me.callParent();
    }
});
