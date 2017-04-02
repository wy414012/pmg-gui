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
	}
    },

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

    setNodename: function(nodename) {
	var me = this;

	me.nodename = nodename;

	me.store.setProxy({
	    type: 'proxmox',
	    url: "/api2/json/nodes/" + nodename + "/postfix/mailq"
	});
	me.store.load();
    }

});
