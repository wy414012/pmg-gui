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

    store: { model: 'pmg-mailq' },

    controller: {

	xclass: 'Ext.app.ViewController',

	init: function(view) {
	    if (view.nodename) view.setNodename(view.nodename);

	    view.delayFilterTask = new Ext.util.DelayedTask(function() {
		var filter = view.lookupReference('filter').getValue();
		view.setFilter(filter);
	    });
	},

	onChangeFilter: function(f, v) {
	    var view = this.getView();
	    view.delayFilterTask.delay(500);
	},

	control: {
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
	    url: "/api2/json/nodes/" + me.nodename + "/postfix/mailq"
	};

	var filter = me.filter;
	var nodename = me.nodename;

	if (filter) { proxy.extraParams = { filter: filter }; }


	me.store.setProxy(proxy);

	me.pendingLoad = true;

	me.store.load(function() {
	    me.pendingLoad = false;
	    if (me.nodename != nodename || me.filter != filter) {
		setTimeout(function() {
		    me.updateProxy();
		}, 100);
	    }
	});
    },

    setFilter: function(filter) {
	var me = this;

	me.filter = filter;

	me.updateProxy();
    },

    setNodename: function(nodename) {
	var me = this;

	me.nodename = nodename;

	me.updateProxy();
    }

});
