Ext.define('PMG.DKIMEnableEdit', {
    extend: 'Proxmox.window.Edit',
    xtype: 'pmgDKIMEnableEdit',

    items: [
	{
	    xtype: 'displayfield',
	    userCls: 'pmx-hint',
	    value: gettext('You need to create a Selector before enabling DKIM Signing'),
	    hidden: true
	},
	{
	    xtype: 'proxmoxcheckbox',
	    name: 'dkim_sign',
	    uncheckedValue: 0,
	    defaultValue: 0,
	    checked: false,
	    deleteDefaultValue: false,
	    fieldLabel: gettext('Sign Outgoing Mails'),
	}
    ],
    listeners: {
	'show': function() {
	    var me = this;
	    var disablefn = function(errormsg){
		Ext.Msg.alert(gettext('Error'), errormsg);
		me.down('displayfield').setVisible(true);
		me.down('proxmoxcheckbox').setDisabled(true);
		me.close();
	    };

	    Proxmox.Utils.API2Request({
		url : '/config/dkim/selector',
		method : 'GET',
		failure : function(response, opts) {
		    disablefn(response.htmlStatus)
		},
		success : function(response, opts) {
		    if (!Ext.isDefined(response.result.data.record)) {
			disablefn('Could not read private key - please create a selector first!');
		    }
		}
	    });
	}
    }
});

Ext.define('PMG.SelectorViewer', {
    extend: 'Proxmox.window.Edit',
    xtype: 'pmgDKIMSelectorView',

    url: '/config/dkim/selector',
    title: gettext('Selector'),

    width: 800,
    resizable: true,

    items: [
	{
	    xtype: 'displayfield',
	    fieldLabel: gettext('Selector'),
	    name: 'selector'
	},
	{
	    xtype: 'displayfield',
	    fieldLabel: gettext('Key Size'),
	    name: 'keysize'
	},
	{
	    xtype: 'textarea',
	    editable: false,
	    grow: true,
	    growMin: 150,
	    growMax: 400,
	    fieldLabel: gettext('DNS TXT Record'),
	    name: 'record',
	    value: 'Could not read private key!'
	}
    ],

    initComponent: function() {
	var me = this;

	me.callParent();

	// hide OK/Reset button, because we just want to show data
	me.down('toolbar[dock=bottom]').setVisible(false);
    }
});

Ext.define('PMG.DKIMSettings', {
    extend: 'Proxmox.grid.ObjectGrid',
    xtype: 'pmgDKIM',

    monStoreErrors: true,

    initComponent : function() {
	var me = this;

	me.rows = {};
	var enable_sign_text = gettext('Enable DKIM Signing');
	me.rows.dkim_sign = {
	    required: true,
	    defaultValue: 0,
	    header: enable_sign_text,
	    renderer: Proxmox.Utils.format_boolean,
	    editor: {
		xtype: 'pmgDKIMEnableEdit',
		subject: enable_sign_text,
	    }
	};

	var selector_text = gettext('Selector');
	me.rows.dkim_selector = {
	    required: true,
	    header: selector_text,
	    editor: {
		xtype: 'proxmoxWindowEdit',
		subject: selector_text,
		isCreate: true,
		method: 'POST',
		url: '/config/dkim/selector',
		items: [
		    {
			xtype: 'displayfield',
			name: 'warning',
			userCls: 'pmx-hint',
			value: gettext('Warning: You need to update the _domainkey DNS records of all signed domains!'),
		    },
		    {
			xtype: 'proxmoxtextfield',
			fieldLabel: selector_text,
			name: 'selector',
			allowBlank: false,
			required: true,
			defaultValue: 'pmg'
		    },
		    {
			xtype: 'proxmoxKVComboBox',
			fieldLabel: gettext('Key Size'),
			name: 'keysize',
			value: '2048',
			allowBlank: false,
			deleteEmpty: false,
			required: true,
			comboItems: [
			    ['1024', '1024'],
			    ['2048', '2048'],
			    ['4096', '4096'],
			    ['8192', '8192']
			]
		    }
		]
	    }
	};

	me.add_boolean_row('dkim_sign_all_mail', gettext('Sign all Outgoing Mail'));

	var baseurl = '/config/admin';

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	Ext.apply(me, {
	    tbar: [{
		text: gettext('View DNS Record'),
		xtype: 'proxmoxButton',
		disabled: true,
		handler: function() {
		    var win = Ext.create('PMG.SelectorViewer', {});
		    win.load();
		    win.show();
		},
		selModel: me.selModel,
	    },
	    {
		text: gettext('Edit'),
		xtype: 'proxmoxButton',
		disabled: true,
		handler: function() { me.run_editor(); },
		selModel: me.selModel
	    }],
	    url: '/api2/json' + baseurl,
	    editorConfig: {
		url: '/api2/extjs' + baseurl,
		onlineHelp: 'pmgconfig_mailproxy_dkim'
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

