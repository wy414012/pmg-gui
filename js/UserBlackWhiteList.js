Ext.define('pmg-address-list', {
    extend: 'Ext.data.Model',
    fields: [ 'address' ],
    idProperty: 'address'
});

// base class - do not use directly
Ext.define('PMG.UserBlackWhiteList', {
    extend: 'Ext.grid.GridPanel',

    listname: undefined, // 'blacklist' or 'whitelist',

    controller: {

        xclass: 'Ext.app.ViewController',

	onAddAddress: function() {
	    var me = this.getView();

	    var url = '/quarantine/' + me.listname;

	    var config = {
		method: 'POST',
		url: url,
		create: true,
		isAdd: true,
		items: [
		    {
			xtype: 'proxmoxtextfield',
			name: 'address',
			fieldLabel: gettext("Address")
		    }
		]
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

	    var url = '/quarantine/' + me.listname + '/' + rec.getId();

	    Proxmox.Utils.API2Request({
		url: url,
		method: 'DELETE',
		waitMsgTarget: me,
		callback: function(options, success, response) {
		    me.store.load();
		},
		failure: function (response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		}
	    });
	}
    },

    tbar: [
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
	autoLoad: true,
	proxy: {
            type: 'proxmox',
            url: "/api2/json/quarantine/blacklist"
	},
    },

    dockedItems: [
	{
            dock: 'top',
	    bodyStyle: 'padding: 10px;',
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
	autoLoad: true,
	proxy: {
            type: 'proxmox',
            url: "/api2/json/quarantine/whitelist"
	},
    },

    dockedItems: [
	{
            dock: 'top',
	    bodyStyle: 'padding: 10px;',
            html: gettext('With this feature, you can manually bypass spam checking for certain domains or E-mail addresses.') + '<br><br>' +
		'<b>*.com</b> (all mails from <b>.com</b> domains)' + '<br>' +
		'<b>*@example.com</b> (all mails from domain <b>example.com</b>)' + '<br>' +
		'<b>john@example.com</b> (all mails from <b>john@example.com</b>)'
        }
    ]
});
