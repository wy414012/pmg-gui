Ext.define('PMG.QueueAdministration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgQueueAdministration',

    title: gettext('Queue Administration'),

    border: false,
    defaults: { border: false },

    items: [
	{
	    title: gettext('Deferred Mails'),
	    xtype: 'pmgPostfixQShape'
	}
    ]
});
