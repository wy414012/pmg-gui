Ext.define('pmg-address-list', {
    extend: 'Ext.data.Model',
    fields: ['address'],
    idProperty: 'address',
});

// base class - do not use directly
Ext.define('PMG.UserBlackWhiteList', {
    extend: 'Ext.grid.GridPanel',

    border: false,
    listname: undefined, // 'blacklist' or 'whitelist',

    selModel: 'checkboxmodel',

    emptyText: gettext('No data in database'),

    controller: {

        xclass: 'Ext.app.ViewController',

	onAddAddress: function() {
	    var me = this.getView();
	    var params = me.getStore().getProxy().getExtraParams() || {};

	    var url = '/quarantine/' + me.listname;

	    var items = [{
		xtype: 'proxmoxtextfield',
		name: 'address',
		minLength: 3,
		regex: /^[^\,\;\s]*$/, // no whitespace no , and no ;
		fieldLabel: gettext("Address"),
	    }];

	    Ext.Object.each(params, function(key, value) {
		items.push({
		    xtype: 'hidden',
		    name: key,
		    value: value,
		});
	    });

	    var config = {
		method: 'POST',
		url: url,
		onlineHelp: 'pmg_userblackwhitelist',
		isCreate: true,
		isAdd: true,
		items: items,
	    };

	    if (me.listname === 'blacklist') {
		config.subject = gettext("Blacklist");
	    } else if (me.listname == 'whitelist') {
		config.subject = gettext("Whitelist");
	    } else {
		throw "unknown list - internal error";
	    }

	    var win = Ext.createWidget('proxmoxWindowEdit', config);
	    win.on('destroy', function() { me.store.load(); });
	    win.show();
	},

	onRemoveAddress: function() {
	    var me = this.getView();
	    var records = me.selModel.getSelection();
	    if (records.length < 1) {
		return;
	    }

	    var url = '/quarantine/' + me.listname + '/';

	    let params = {
		address: records.map((rec) => rec.getId()).join(','),
	    };
	    Ext.applyIf(params, me.getStore().getProxy().getExtraParams());

	    Proxmox.Utils.API2Request({
		url: url + '?' + Ext.Object.toQueryString(params),
		method: 'DELETE',
		waitMsgTarget: me,
		callback: function(options, success, response) {
		    me.store.load();
		},
		failure: function(response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		},
	    });
	},

	changeEmail: function(combobox, value) {
	    var view = this.getView();
	    if (value && combobox.isValid()) {
		view.getStore().getProxy().setExtraParams({
		    pmail: value,
		});
		view.getStore().load();
	    }
	},

	init: function(view) {
	    var emailcb = this.lookupReference('email');
	    if (PMG.view === 'quarantineview') {
		emailcb.setVisible(false);
		view.getStore().load();
	    } else {
		emailcb.getStore().getProxy().setExtraParams({
		    list: view.listname === 'blacklist' ? 'BL' : 'WL',
		});
	    }
	    Proxmox.Utils.monStoreErrors(view.getView(), view.getStore(), true);
	},

	control: {
	    'combobox': {
		change: {
		    fn: 'changeEmail',
		    buffer: 500,
		},
	    },
	},
    },

    tbar: [
	{
	    xtype: 'combobox',
	    displayField: 'mail',
	    vtype: 'email',
	    allowBlank: false,
	    valueField: 'mail',
	    store: {
		proxy: {
		    type: 'proxmox',
		    url: '/api2/json/quarantine/quarusers',
		},
		fields: [
		    {
			name: 'mail',
			renderer: Ext.htmlEncode,
		    },
		],
	    },
	    queryParam: false,
	    queryCaching: false,
	    editable: true,
	    reference: 'email',
	    name: 'email',
	    listConfig: {
		emptyText:
		'<div class="x-grid-empty">' +
		gettext('No data in database') +
		'</div>',
	    },
	    fieldLabel: 'E-Mail',
	},
	{
	    text: gettext('Add'),
	    handler: 'onAddAddress',
	},
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Remove'),
	    disabled: true,
	    handler: 'onRemoveAddress',
	    confirmMsg: function() {
		var me = this.up('gridpanel');

		var selection = me.selModel.getSelection();
		var text;
		var param;

		if (selection.length > 1) {
		    text = gettext('Are you sure you want to remove {0} entries');
		    param = selection.length.toString();
		} else if (selection.length > 0) {
		    var rec = selection[0];
		    var name = rec.getId();
		    text = gettext('Are you sure you want to remove entry {0}');
		    param = "'" + Ext.String.htmlEncode(name) + "'";
		}

		if (text && param) {
		    return Ext.String.format(text, param);
		}
	    },
	},
    ],

    columns: [
        {
            header: gettext('Address'),
            dataIndex: 'address',
	    renderer: Ext.String.htmlEncode,
	    flex: 1,
        },
    ],
});

Ext.define('PMG.UserBlacklist', {
    extend: 'PMG.UserBlackWhiteList',
    xtype: 'pmgUserBlacklist',

    title: gettext('Blacklist'),

    listname: 'blacklist',

    store: {
	model: 'pmg-address-list',
	autoDestroy: true,
	proxy: {
            type: 'proxmox',
            url: "/api2/json/quarantine/blacklist",
	},
	sorters: {
	    property: 'address',
	},
    },

    dockedItems: [
	{
            dock: 'top',
	    bodyStyle: {
		padding: '10px',
		'border-left': '0px',
		'border-right': '0px',
	    },
            html: gettext('With this feature, you can manually mark E-mails from certain domains or addresses as spam.') + '<br><br>' +
		'<b>*.com</b> (all mails from <b>.com</b> domains)' + '<br>' +
		'<b>*@example.com</b> (all mails from domain <b>example.com</b>)' + '<br>' +
		'<b>john@example.com</b> (all mails from <b>john@example.com</b>)',

        },
    ],
});

Ext.define('PMG.UserWhitelist', {
    extend: 'PMG.UserBlackWhiteList',
    xtype: 'pmgUserWhitelist',

    title: gettext('Whitelist'),

    listname: 'whitelist',

    store: {
	model: 'pmg-address-list',
	autoDestroy: true,
	proxy: {
            type: 'proxmox',
            url: "/api2/json/quarantine/whitelist",
	},
	sorters: {
	    property: 'address',
	},
    },

    dockedItems: [
	{
            dock: 'top',
	    bodyStyle: {
		padding: '10px',
		'border-left': '0px',
		'border-right': '0px',
	    },
            html: gettext('With this feature, you can manually bypass spam checking for certain domains or E-mail addresses.') + '<br><br>' +
		'<b>*.com</b> (all mails from <b>.com</b> domains)' + '<br>' +
		'<b>*@example.com</b> (all mails from domain <b>example.com</b>)' + '<br>' +
		'<b>john@example.com</b> (all mails from <b>john@example.com</b>)',
        },
    ],
});
