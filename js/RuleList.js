Ext.define('pmg-rule-list', {
    extend: 'Ext.data.Model',
    fields: [
	'id', 'name',
	{ name: 'active', type: 'boolean' },
	{ name: 'direction', type: 'integer' },
	{ name: 'priority', type: 'integer' }
    ],
    idProperty: 'id'
});


Ext.define('PMG.RuleList', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pmgRuleList'],

    subject: gettext('Rules'),

    baseurl: '/config/ruledb/rules',

    features: [{
	ftype: 'grouping'
    }],

    inputItems: [
	{
	    xtype: 'textfield',
	    name: 'name',
	    allowBlank: false,
	    fieldLabel: gettext('Name')
	},
	{
	    xtype: 'proxmoxintegerfield',
	    name: 'priority',
	    allowBlank: false,
	    minValue: 0,
	    maxValue: 100,
	    fieldLabel: gettext('Priority')
	},
	{
	    xtype: 'proxmoxKVComboBox',
	    name: 'direction',
	    comboItems: [
		[0, PMG.Utils.format_rule_direction(0)],
		[1, PMG.Utils.format_rule_direction(1)],
		[2, PMG.Utils.format_rule_direction(2)]],
	    value: 2,
	    fieldLabel: gettext('Direction')
	},
	{
	    xtype: 'proxmoxcheckbox',
	    name: 'active',
	    defaultValue: 0,
	    uncheckedValue: 0,
	    checked: false,
	    fieldLabel: gettext('Active')
	}
    ],

    reload: function() {
	var me = this;

	me.store.load();
    },

    run_editor: function() {
	var me = this;

	var rec = me.selModel.getSelection()[0];
	if (!rec) {
	    return;
	}

	var config = {
	    url: "/api2/extjs" + me.baseurl +'/' + rec.data.id + '/config',
	    method: 'PUT',
	    subject: me.subject,
	    width: 400,
	    items: me.inputItems
	};

	var win = Ext.createWidget('proxmoxWindowEdit', config);

	win.load();
	win.on('destroy', me.reload, me);
	win.show();
    },

    initComponent : function() {
	var me = this;

	me.store = new Ext.data.Store({
	    model: 'pmg-rule-list',
	    proxy: {
		type: 'proxmox',
		url: "/api2/json" + me.baseurl,
	    },
	    sorters: [
		{
		    property: 'priority',
		    direction: 'DESC'
		},
		{
		    property: 'name',
		    direction: 'ASC'
		}
	    ],
	    grouper: {
		property: 'active',
		direction: 'DESC',
		getGroupString: function(rec) {
		    return Proxmox.Utils.format_boolean(rec.get('active'));
		}
	    }
	});

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = Ext.createWidget('proxmoxStdRemoveButton', {
	    selModel: me.selModel,
	    baseurl: me.baseurl,
	    callback: function() { me.reload(); },
	    getRecordName: function(rec) { return rec.data.name; },
	    waitMsgTarget: me
	});

	var tbar = [
            {
		xtype: 'proxmoxButton',
		text: gettext('Edit'),
		disabled: true,
		selModel: me.selModel,
		handler: function() { me.run_editor(); }
            },
            {
		text: gettext('Create'),
		handler: function() {
		    var config = {
			method: 'POST',
			url: "/api2/extjs" + me.baseurl,
			create: true,
			width: 400,
			subject: me.subject,
			items: me.inputItems
		    };

		    var win = Ext.createWidget('proxmoxWindowEdit', config);

		    win.on('destroy', me.reload, me);
		    win.show();
		}
            },
	    remove_btn
        ];

	Proxmox.Utils.monStoreErrors(me, me.store);

	Ext.apply(me, {
	    tbar: tbar,
	    columns: [
		{
		    header: gettext('Name'),
		    sortable: false,
		    menuDisabled: true,
		    flex: 1,
		    dataIndex: 'name',
		    renderer: Ext.String.htmlEncode
		},
		{
		    header: gettext('Priority'),
		    sortable: false,
		    menuDisabled: true,
		    align: 'end',
		    dataIndex: 'priority'
		}
	    ],
	    listeners: {
		itemdblclick: function() { me.run_editor(); },
		activate: function() { me.reload(); }
	    }
	});

	me.callParent();

	me.reload(); // initial load
    }
});
