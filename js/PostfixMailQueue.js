Ext.define('pmg-mailq', {
    extend: 'Ext.data.Model',
    fields: [
	'queue_id', 'queue_name',
	{ type: 'date',  dateFormat: 'timestamp', name: 'arrival_time'},
	{ type: 'integer', name: 'message_size'},
	'sender', 'receiver', 'reason'
    ],
    idProperty: 'queue_id'
});

Ext.define('PMG.Postfix.MailQueue', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.pmgPostfixMailQueue',

    nodename : undefined,

    filter: undefined,

    queuename: 'deferred',

    store: {
	xclass: 'Ext.data.BufferedStore',
	model: 'pmg-mailq',
	remoteFilter: true,
	pageSize: 2000
    },

    controller: {

	xclass: 'Ext.app.ViewController',

	init: function(view) {
	    if (view.nodename) view.setNodename(view.nodename);

	    view.delayFilterTask = new Ext.util.DelayedTask(function() {
		var filter = view.lookupReference('filter').getValue();

		view.filter = filter;
		view.updateProxy();
	    });
	},

	onChangeFilter: function(f, v) {
	    var view = this.getView();
	    view.delayFilterTask.delay(500);
	},

	control: {
	    '#': {
		activate: function() {
		    this.view.updateProxy(); // reload
		}
	    },
	    'field[reference=filter]': {
		change: 'onChangeFilter'
	    }
	}
    },

    tbar: [
	{
	    xtype: 'label',
	    html: gettext('Filter') + ':'
	},
	{
	    xtype: 'textfield',
	    width: 300,
	    reference: 'filter'
	}
    ],

    columns: [
	{
	    header: gettext('Time'),
	    width: 150,
	    renderer: Ext.util.Format.dateRenderer("Y-m-d H:i:s"),
	    dataIndex: 'arrival_time'
	},
	{
	    header: 'KByte',
	    width: 80,
	    dataIndex: 'message_size'
	},
	{
	    header: gettext('Sender'),
	    width: 200,
	    dataIndex: 'sender'
	},
	{
	    header: gettext('Receiver'),
	    width: 200,
	    dataIndex: 'receiver'
	},
	{
	    header: gettext('Reason'),
	    flex: 1,
	    dataIndex: 'reason'
	}
    ],

    pendingLoad: false,

    updateProxy: function() {
	var me = this;

	if (me.pendingLoad) return;

	var proxy = {
	    type: 'proxmox',
	    startParam: 'start',
	    limitParam: 'limit',
	    url: "/api2/json/nodes/" + me.nodename + "/postfix/queue/" + me.queuename
	};

	var filter = me.filter;
	var nodename = me.nodename;
	var queuename = me.queuename;

	if (filter) { proxy.extraParams = { filter: filter }; }


	me.store.setProxy(proxy);

	me.pendingLoad = true;

	me.store.load(function() {
	    me.pendingLoad = false;
	    if (me.nodename !== nodename || me.filter !== filter || me.queuename !== queuename) {
		setTimeout(function() {
		    me.updateProxy();
		}, 100);
	    }
	});
    },

    setFilter: function(filter) {
	this.lookupReference('filter').setValue(filter);
    },

    setNodename: function(nodename) {
	var me = this;

	me.nodename = nodename;

	me.updateProxy();
    },

    setQueueName: function(queuename) {
	var me = this;

	me.queuename = queuename;

	me.updateProxy();
    }

});
