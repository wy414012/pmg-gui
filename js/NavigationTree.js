Ext.define('PMG.store.NavigationStore', {
    extend: 'Ext.data.TreeStore',

    storeId: 'NavigationStore',

    root: {
	expanded: true,
	children: [
	    {
		text: gettext('Dashboard'),
		iconCls: 'fa fa-tachometer',
		path: 'pmgDashboard',
		leaf: true
	    },
	    {
		text: gettext('Mail Filter'),
		iconCls: 'fa fa-envelope',
		path: 'pmgRuleConfiguration',
		expanded: true,
		children: [
		    {
			text: gettext('Action Objects'),
			iconCls: 'fa fa-flag',
			path: 'pmgActionList',
			leaf: true,
		    },
		    {
			text: gettext('Who Objects'),
			iconCls: 'fa fa-user-circle',
			path: 'pmgWhoConfiguration',
			leaf: true,
		    },
		    {
			text: gettext('What Objects'),
			iconCls: 'fa fa-cube',
			path: 'pmgWhatConfiguration',
			leaf: true,
		    },
		    {
			text: gettext('When Objects'),
			iconCls: 'fa fa-clock-o',
			path: 'pmgWhenConfiguration',
			leaf: true,
		    }
		]
	    },
	    {
		text: gettext('Configuration'),
		iconCls: 'fa fa-gears',
		path: 'pmgSystemConfiguration',
		expanded: true,
		children: [
		    {
			text: gettext('Mail Proxy'),
			iconCls: 'fa fa-envelope-o',
			path: 'pmgMailProxyConfiguration',
			leaf: true,
		    },
		    {
			text: gettext('Spam Detector'),
			iconCls: 'fa fa-bullhorn',
			path: 'pmgSpamDetectorConfiguration',
			leaf: true,
		    },
		    {
			text: gettext('Virus Detector'),
			iconCls: 'fa fa-bug',
			path: 'pmgVirusDetectorConfiguration',
			leaf: true,
		    },
		    {
			text: gettext('User Management'),
			iconCls: 'fa fa-users',
			path: 'pmgUserManagement',
			leaf: true,
		    },
		    {
			text: gettext('Cluster'),
			iconCls: 'fa fa-server',
			path: 'pmgClusterAdministration',
			leaf: true,
		    },
		    {
			text: gettext('License'),
			iconCls: 'fa fa-ticket',
			path: 'pmgLicense',
			leaf: true,
		    }
		]
	    },
	    {
		text: gettext('Administration'),
		iconCls: 'fa fa-wrench',
		path: 'pmgServerAdministration',
		expanded: true,
		children: [
		    {
			text: gettext('Quarantine'),
			iconCls: 'fa fa-cubes',
			path: 'pmgSpamQuarantine',
			leaf: true,
		    },
		    {
			text: gettext('User Whitelist'),
			iconCls: 'fa fa-file-o',
			path: 'pmgUserWhitelist',
			leaf: true,
		    },
		    {
			text: gettext('User Blacklist'),
			iconCls: 'fa fa-file',
			path: 'pmgUserBlacklist',
			leaf: true,
		    },
		    {
			text: gettext('Tracking Center'),
			iconCls: 'fa fa-map-o',
			path: 'pmgTrackingCenter',
			leaf: true,
		    },
		    {
			text: gettext('Queues'),
			iconCls: 'fa fa-bars',
			path: 'pmgQueueAdministration',
			leaf: true,
		    }
		]
	    },
	    {
		text: gettext('Statistics'),
		iconCls: 'fa fa-bar-chart',
		border: false,
		path: 'pmgGeneralMailStatistics',
		expanded: true,
		children: [
		    {
			text: gettext('Spam Scores'),
			iconCls: 'fa fa-table',
			path: 'pmgSpamScoreDistribution',
			border: false,
			leaf: true
		    },
		    {
			text: gettext('Virus  Charts'),
			iconCls: 'fa fa-bug',
			path: 'pmgVirusCharts',
			border: false,
			leaf: true
		    },
		    {
			text: gettext('Hourly Distribution'),
			iconCls: 'fa fa-area-chart',
			path: 'pmgHourlyMailDistribution',
			border: false,
			leaf: true
		    },
		    {
			text: gettext('RBL'),
			iconCls: 'fa fa-line-chart',
			path: 'pmgRBLStatistics',
			border: false,
			leaf: true
		    },
		    {
			text: gettext('Domain'),
			iconCls: 'fa fa-table',
			path: 'pmgDomainStatistics',
			border: false,
			leaf: true
		    },
		    {
			text: gettext('Sender'),
			iconCls: 'fa fa-table',
			path: 'pmgSenderStatistics',
			border: false,
			leaf: true
		    },
		    {
			text: gettext('Receiver'),
			iconCls: 'fa fa-table',
			path: 'pmgReceiverStatistics',
			border: false,
			leaf: true
		    },
		    {
			text: gettext('Contact'),
			iconCls: 'fa fa-table',
			path: 'pmgContactStatistics',
			border: false,
			leaf: true
		    }
		]
	    }
	]
    }
});

Ext.define('PMG.view.main.NavigationTree', {
    extend: 'Ext.list.Tree',
    xtype: 'navigationtree',

    select: function(path) {
	var me = this;
	var item = me.getStore().findRecord('path', path, 0, false, true, true);
	me.setSelection(item);
    },

    animation: false,
    expanderOnly: true,
    expanderFirst: false,
    store: 'NavigationStore',
    ui: 'nav'
});
