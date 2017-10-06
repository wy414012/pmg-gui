Ext.define('pmg-address-list', {
    extend: 'Ext.data.Model',
    fields: [ 'address' ],
    idProperty: 'address'
});

// base class - do not use directly
Ext.define('PMG.UserBlackWhiteList', {
    extend: 'Ext.grid.GridPanel',

    border: false,
    listname: undefined, // 'blacklist' or 'whitelist',

    controller: {

        xclass: 'Ext.app.ViewController',

	onAddAddress: function() {
	    var me = this.getView();
	    var params = me.getStore().getProxy().getExtraParams() || {};

	    var url = '/quarantine/' + me.listname;

	    var items = [{
		xtype: 'proxmoxtextfield',
		name: 'address',
		fieldLabel: gettext("Address")
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
		create: true,
		isAdd: true,
		items: items
	    };

	    if (me.listname === 'blacklist') {
		config.subject = gettext("Blacklist");
	    } else if (me.listname == 'whitelist') {
		config.subject = gettext("Whitelist");
	    } else {
		throw "unknown list - internal error";
	    }

	    var win = Ext.createWidget('proxmoxWindowEdit', config);
	    win.on('destroy', function() { me.store.load() });
	    win.show();
	},

	onRemoveAddress: function() {
	    var me = this.getView();
	    var rec = me.selModel.getSelection()[0];
	    if (!rec) return;

	    var params = me.getStore().getProxy().getExtraParams() || {};
	    var url = '/quarantine/' + me.listname + '/' + rec.getId();

	    Proxmox.Utils.API2Request({
		url: url + '?' + Ext.Object.toQueryString(params),
		method: 'DELETE',
		waitMsgTarget: me,
		callback: function(options, success, response) {
		    me.store.load();
		},
		failure: function (response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		}
	    });
	},

	changeEmail: function(combobox, value) {
	    var view = this.getView();
	    view.getStore().getProxy().setExtraParams({
		pmail: value
	    });
	    view.getStore().load();
	},

	init: function(view) {
	    if (PMG.view === 'quarantineview') {
		this.lookupReference('email').setVisible(false);
		view.getStore().load();
	    }
	    Proxmox.Utils.monStoreErrors(view.getView(), view.getStore(), true);
	},

	control: {
	    'combobox':{
		change: {
		    fn: 'changeEmail',
		    buffer: 500
		}
	    }
	}
    },

    tbar: [
	{
	    xtype: 'combobox',
	    displayField: 'mail',
	    valueField: 'mail',
	    store: {
		proxy: {
		    type: 'proxmox',
		    url: '/api2/json/quarantine/quarusers'
		},
		fields: [
		    {
			name: 'mail',
			renderer: Ext.htmlEncode
		    }
		]
	    },
	    queryParam: false,
	    queryCaching: false,
	    editable: true,
	    reference: 'email',
	    name: 'email',
	    fieldLabel: 'E-Mail',
	},
	{
	    text: gettext('Add'),
	    handler: 'onAddAddress'
	},
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Remove'),
	    disabled: true,
	    handler: 'onRemoveAddress',
	    confirmMsg: function(rec) {
		var me = this;

		var name = rec.getId();
		return Ext.String.format(
		    gettext('Are you sure you want to remove entry {0}'),
		    "'" + Ext.String.htmlEncode(name) + "'");
	    }
	}
    ],

    columns: [
        {
            header: gettext('Address'),
            dataIndex: 'address',
	    renderer: Ext.String.htmlEncode,
	    flex: 1
        }
    ]
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
            url: "/api2/json/quarantine/blacklist"
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
		'<b>john@example.com</b> (all mails from <b>john@example.com</b>)'

        }
    ]
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
            url: "/api2/json/quarantine/whitelist"
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
		'<b>john@example.com</b> (all mails from <b>john@example.com</b>)'
        }
    ]
});
