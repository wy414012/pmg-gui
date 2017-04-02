Ext.define('PMG.QueueAdministration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgQueueAdministration',

    title: gettext('Queue Administration'),

    border: false,
    defaults: { border: false },

    controller: {

	xclass: 'Ext.app.ViewController',

	onSelect: function(grid, rec) {
	    var view = this.getView();

	    var domain = rec.data.domain;

	    var mailq = this.lookupReference('mailq');

	    if (domain === "TOTAL") {
		mailq.setFilter('');
	    } else {
		mailq.setFilter('@' + rec.data.domain);
	    }

	    view.setActiveTab(mailq);
	},

	control: {
	    pmgPostfixQShape: {
		itemdblclick: 'onSelect',
	    }
	}
    },

    items: [
	{
	    title: gettext('Shape'),
	    xtype: 'pmgPostfixQShape'
	},
	{
	    title: gettext('Deferred Mails'),
	    nodename: Proxmox.NodeName,
	    reference: 'mailq',
	    xtype: 'pmgPostfixMailQueue'
	}
    ]
});
