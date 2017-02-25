Ext.define('pmg-domains', {
    extend: 'Ext.data.Model',
    fields: [ 'domain', 'comment' ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/config/domains"
    },
    idProperty: 'domain'
});

Ext.define('PMG.RelayDomains', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pmgRelayDomains'],

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pmg-domains',
	    sorters: {
		property: 'domain',
		order: 'DESC'
	    }
	});

        var reload = function() {
            store.load();
        };

	var sm = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = Ext.createWidget('proxmoxButton', {
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    confirmMsg: function (rec) {
		return Ext.String.format(
		    gettext('Are you sure you want to remove entry {0}'),
		    "'" + rec.data.domain + "'");
	    },
	    handler: function(btn, event, rec) {
		Proxmox.Utils.API2Request({
		    url: '/config/domains/' + rec.data.domain,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	var tbar = [
            {
		text: gettext('Create'),
		handler: function() {
		    var config = {
			method: 'POST',
			create: true,
			url: "/api2/extjs/config/domains",
			subject: gettext("Relay Domain"),
			items: {
			    xtype: 'proxmoxtextfield',
			    name: 'domain',
			    fieldLabel: gettext("Relay Domain")
			}
		    };

		    var win = Ext.createWidget('proxmoxWindowEdit', config);
		    win.on('destroy', reload);
		    win.show();
		}
            },
	    remove_btn
        ];

	Proxmox.Utils.monStoreErrors(me, store);

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    tbar: tbar,
	    viewConfig: {
		trackOver: false
	    },
	    columns: [
		{
		    header: gettext('Relay Domain'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'domain'
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
		activate: reload
	    }
	});

	me.callParent();
    }
});
