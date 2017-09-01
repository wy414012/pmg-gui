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
			text: gettext('Statistics'),
			iconCls: 'fa fa-bar-chart',
			border: false,
			path: 'pmgGeneralMailStatistics',
			expanded: true,
			children: [
			    {
				text: gettext('Spam Scores'),
				path: 'pmgSpamScoreDistribution',
				border: false,
				leaf: true
			    },
			    {
				text: gettext('Virus  Charts'),
				path: 'pmgVirusCharts',
				border: false,
				leaf: true
			    },
			    {
				text: gettext('Hourly Distribution'),
				path: 'pmgHourlyMailDistribution',
				border: false,
				leaf: true
			    },
			    {
				text: gettext('Domain'),
				path: 'pmgDomainStatistics',
				border: false,
				leaf: true

			    }
			]
		    },
		    {
			text: gettext('Quarantine'),
			iconCls: 'fa fa-cubes',
			path: 'pmgSpamQuarantine',
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
