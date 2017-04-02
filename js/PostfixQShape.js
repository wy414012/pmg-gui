Ext.define('pmg-qshape', {
    extend: 'Ext.data.Model',
    fields: [
	'domain',
	{ type: 'integer', name: 'total'},
	{ type: 'integer', name: '5s'},
	{ type: 'integer', name: '10s'},
	{ type: 'integer', name: '20s'},
	{ type: 'integer', name: '40s'},
	{ type: 'integer', name: '80s'},
	{ type: 'integer', name: '160s'},
	{ type: 'integer', name: '320s'},
	{ type: 'integer', name: '640s'},
	{ type: 'integer', name: '1280s'},
	{ type: 'integer', name: '1280s+'}
    ],
    idProperty: 'domain'
});

Ext.define('PMG.Postfix.QShape', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.pmgPostfixQShape',

    nodename : undefined,

    store: {
	autoLoad: true,
	model: 'pmg-qshape'
    },

    controller: {

	xclass: 'Ext.app.ViewController',

	init: function(view) {
	    if (view.nodename) view.setNodename(view.nodename);
	},

	onFlush: function() {
	    var view = this.getView();

	    Proxmox.Utils.API2Request({
		url: '/api2/extjs/nodes/' + Proxmox.NodeName + '/postfix/flush_queues',
		method: 'POST',
		waitMsgTarget: view,
		success: function(response, opts) {
		    view.store.load();
		},
		failure: function (response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		}
	    });
	},

	onDeleteAll: function() {
	    var view = this.getView();

	    Proxmox.Utils.API2Request({
		url: '/api2/extjs/nodes/' + Proxmox.NodeName + '/postfix/delete_deferred_queue',
		method: 'POST',
		waitMsgTarget: view,
		success: function(response, opts) {
		    view.store.load();
		},
		failure: function (response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		}
	    });
	},

	onDiscardVerifyDatabase: function() {
	    var view = this.getView();

	    Proxmox.Utils.API2Request({
		url: '/api2/extjs/nodes/' + Proxmox.NodeName + '/postfix/discard_verify_cache',
		method: 'POST',
		waitMsgTarget: view,
		failure: function (response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		}
	    });
	},

	control: {
	    '#': {
		activate: function() {
		    this.view.store.load(); // reload
		}
	    },
	}
    },

    tbar: [
        {
	    text: gettext('Flush Queue'),
	    handler: 'onFlush'
	},
	{
	    xtype: 'proxmoxButton',
	    text: gettext('Delete all Messages'),
	    dangerous: true,
	    confirmMsg: "Are you sure you want to delete all deferred mails?",
	    selModel: null,
	    handler: 'onDeleteAll'
	},
	{
	    text: gettext('Discard address verification database'),
	    handler: 'onDiscardVerifyDatabase'
	}
    ],

    columns: [
	{
	    header: gettext('Domain'),
	    width: 200,
	    dataIndex: 'domain'
	},
	{
	    header: gettext('Total'),
	    width: 80,
	    dataIndex: 'total'
	},
	{
	    header: '5s',
	    width: 80,
	    dataIndex: '5s'
	},
	{
	    header: '10s',
	    width: 80,
	    dataIndex: '10s'
	},
	{
	    header: '20s',
	    width: 80,
	    dataIndex: '20s'
	},
	{
	    header: '40s',
	    width: 80,
	    dataIndex: '40s'
	},
	{
	    header: '80s',
	    width: 80,
	    dataIndex: '80s'
	},
	{
	    header: '160s',
	    width: 80,
	    dataIndex: '160s'
	},
	{
	    header: '320s',
	    width: 80,
	    dataIndex: '320s'
	},
	{
	    header: '640s',
	    width: 80,
	    dataIndex: '640s'
	},
	{
	    header: '1280s',
	    width: 80,
	    dataIndex: '1280s'
	},
	{
	    header: '1280s+',
	    width: 80,
	    dataIndex: '1280s+'
	}
    ],

    setNodename: function(nodename) {
	var me = this;

	me.nodename = nodename;

	me.store.setProxy({
	    type: 'proxmox',
	    url: "/api2/json/nodes/" + me.nodename + "/postfix/qshape"
	});

	me.store.load();
    }

});
