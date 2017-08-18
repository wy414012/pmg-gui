Ext.define('PMG.RestoreSystemConfiguration', {
    extend: 'Ext.Panel',
    xtype: 'pmgRestoreSystemConfiguration',

    title: gettext('Restore'),

    controller: {
	xclass: 'Ext.app.ViewController',

	onFactoryDefaults: function() {
	    var me = this.getView();

	    Ext.Msg.confirm(
		gettext('Confirm'),
		gettext('Reset rule database to factory defaults?'),
		function(button) {
		    if (button !== 'yes') return;
		    var url = '/config/ruledb';
		    Proxmox.Utils.API2Request({
			url: '/config/ruledb',
			method: 'POST',
			waitMsgTarget: me,
			failure: function (response, opts) {
			    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
			}
		    });
		}
	    );
	}
    },

    tbar: [
	{
	    text: gettext('Factory Defaults'),
	    handler: 'onFactoryDefaults'
	}
    ]
});

Ext.define('PMG.SystemConfiguration', {
    extend: 'Ext.tab.Panel',
    xtype: 'pmgSystemConfiguration',

    title: gettext('Configuration') + ': ' + gettext('System'),
    border: false,
    scrollable: true,
    defaults: { border: false },
    items: [
	{
	    title: gettext('Network/Time'),
	    itemId: 'network',
	    xtype: 'panel',
	    layout: {
		type: 'vbox',
		align: 'stretch',
		multi: true,
	    },
	    bodyPadding: '0 0 10 0',
	    defaults: {
		collapsible: true,
		animCollapse: false,
		margin: '10 10 0 10'
	    },
	    items: [
		{
		    flex: 1,
		    minHeight: 200,
		    title: gettext('Interfaces'),
		    xtype: 'proxmoxNodeNetworkView',
		    nodename: Proxmox.NodeName,
		},
		{
		    title: gettext('DNS'),
		    xtype: 'proxmoxNodeDNSView',
		    nodename: Proxmox.NodeName
		},
		{
		    title: gettext('Time'),
		    xtype: 'proxmoxNodeTimeView',
		    nodename: Proxmox.NodeName
		},
	    ]
	},
	{
	    itemId: 'backup',
            title: gettext('Backup'),
	    html: "Backup"
	},
	{
	    itemId: 'restore',
	    xtype: 'pmgRestoreSystemConfiguration'
	},
	{
	    itemId: 'options',
            title: gettext('Options'),
	    xtype: 'pmgSystemOptions',
	},
	{
	    itemId: 'ssh',
            title: gettext('SSH Access'),
	    html: "SSH Access"
	}
    ]
});


