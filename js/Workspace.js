/*
 * Workspace base class
 *
 * popup login window when auth fails (call onLogin handler)
 * update (re-login) ticket every 15 minutes
 *
 */

Ext.define('PMG.Workspace', {
    extend: 'Ext.container.Viewport',

    title: 'Proxmox Mail Gateway',

    loginData: null, // Data from last login call

    onLogin: function(loginData) {},

    // private
    updateLoginData: function(loginData) {
	var me = this;

	me.loginData = loginData;
	Proxmox.CSRFPreventionToken = loginData.CSRFPreventionToken;
	Proxmox.UserName = loginData.username;

	// creates a session cookie (expire = null)
	// that way the cookie gets deleted after browser window close
	Ext.util.Cookies.set('PMGAuthCookie', loginData.ticket, null, '/', null, true);
	me.onLogin(loginData);
    },

    // private
    showLogin: function() {
	var me = this;

	Proxmox.Utils.authClear();
	Proxmox.UserName = null;
	me.loginData = null;

	if (!me.login) {
	    me.login = Ext.create('PMG.window.LoginWindow', {
		handler: function(data) {
		    me.login = null;
		    me.updateLoginData(data);
		}
	    });
	}
	me.onLogin(null);
        me.login.show();
    },

    initComponent : function() {
	var me = this;

	Ext.tip.QuickTipManager.init();

	// fixme: what about other errors
	Ext.Ajax.on('requestexception', function(conn, response, options) {
	    if (response.status == 401) { // auth failure
		me.showLogin();
	    }
	});

	me.callParent();

        if (!Proxmox.Utils.authOK()) {
	    me.showLogin();
	} else {
	    if (me.loginData) {
		me.onLogin(me.loginData);
	    }
	}

	Ext.TaskManager.start({
	    run: function() {
		var ticket = Proxmox.Utils.authOK();
		if (!ticket || !Proxmox.UserName) {
		    return;
		}

		Ext.Ajax.request({
		    params: {
			username: Proxmox.UserName,
			password: ticket
		    },
		    url: '/api2/json/access/ticket',
		    method: 'POST',
		    failure: function() {
			me.showLogin();
		    },
		    success: function(response, opts) {
			var obj = Ext.decode(response.responseText);
			me.updateLoginData(obj.data);
		    }
		});
	    },
	    interval: 15*60*1000
	});
    }
});

Ext.define('PMG.StdWorkspace', {
    extend: 'PMG.Workspace',

    alias: ['widget.pmgStdWorkspace'],

    onLogin: function(loginData) {
	var me = this;

	me.updateUserInfo();

	if (loginData) {
	    Proxmox.Utils.API2Request({
		url: '/version',
		method: 'GET',
		success: function(response) {
		    PMG.VersionInfo = response.result.data;
		    me.updateVersionInfo();
		}
	    });
	}
    },

    updateUserInfo: function() {
	var me = this;

	var ui = me.query('#userinfo')[0];

	if (Proxmox.UserName) {
	    var msg =  Ext.String.format(gettext("You are logged in as {0}"), "'" + Proxmox.UserName + "'");
	    ui.update('<div class="x-unselectable" style="white-space:nowrap;">' + msg + '</div>');
	} else {
	    ui.update('');
	}
	ui.updateLayout();
    },

    updateVersionInfo: function() {
	var me = this;

	var ui = me.query('#versioninfo')[0];

	if (PMG.VersionInfo) {
	    var version = PMG.VersionInfo.version + '-' + PMG.VersionInfo.release + '/' +
		PMG.VersionInfo.repoid;
	    ui.update('Mail Gateway ' + version);
	} else {
	    ui.update('Mail Gateway');
	}
	ui.updateLayout();
    },

    initComponent : function() {
	var me = this;

	Ext.History.init();

	// var sprovider = Ext.create('PVE.StateProvider');
	// Ext.state.Manager.setProvider(sprovider);

	Ext.apply(me, {
	    layout: { type: 'border' },
	    border: false,
	    items: [
		{
		    region: 'north',
		    layout: {
			type: 'hbox',
			align: 'middle'
		    },
		    baseCls: 'x-plain',
		    defaults: {
			baseCls: 'x-plain'
		    },
		    border: false,
		    margin: '2 0 2 5',
		    items: [
			{
			    html: '<a class="x-unselectable" target=_blank href="http://www.proxmox.com">' +
				'<img style="padding-top:4px;padding-right:5px" src="/pve2/images/proxmox_logo.png"/></a>'
			},
			{
			    minWidth: 200,
			    id: 'versioninfo',
			    html: 'Mail Gateway'
			},
			{
			    flex: 1
			},
			{
			    pack: 'end',
			    id: 'userinfo',
			    stateful: false
			},
			{
			    pack: 'end',
			    margin: '0 5 0 10',
			    xtype: 'button',
			    baseCls: 'x-btn',
			    iconCls: 'fa fa-sign-out',
			    text: gettext("Logout"),
			    handler: function() {
				me.showLogin();
				// fixme: me.setContent(null);
			    }
			}
		    ]
		},
		{
		    region: 'center',
		    stateful: true,
		    stateId: 'pvecenter',
		    minWidth: 100,
		    minHeight: 100,
		    id: 'content',
		    defaults: { layout: 'fit' },
		    xtype: 'pmgPanelConfig',
		    items: [
			{
			    xtype: 'panel',
			    title: 'Mail Filter',
			    itemId: 'filter',
			    expandedOnInit: true,
			    items: [{ xtype: 'pmgRuleConfiguration' }]
			},
			{
			    xtype: 'panel',
			    groups: ['filter'],
			    title: 'Actions',
			    itemId: 'filter-actions',
			    html: "Actions"
			},
			{
			    xtype: 'panel',
			    groups: ['filter'],
			    title: 'Who',
			    itemId: 'filter-who',
			    html: "Who"
			},
			{
			    xtype: 'panel',
			    groups: ['filter'],
			    title: 'What',
			    itemId: 'filter-what',
			    html: "What"
			},
			{
			    xtype: 'panel',
			    groups: ['filter'],
			    title: 'When',
			    itemId: 'filter-when',
			    html: "When"
			},

			{
			    xtype: 'panel',
			    title: 'Configuration',
			    itemId: 'configuration',
			    expandedOnInit: true,
			    items: [{ xtype: 'pmgSystemConfiguration' }]
			},
			{
			    xtype: 'panel',
			    groups: ['configuration'],
			    title: 'Mail Proxy',
			    itemId: 'config-mail-proxy',
			    html: "Mail Proxy"
			},
			{
			    xtype: 'panel',
			    groups: ['configuration'],
			    title: 'Spam Detector',
			    itemId: 'config-spam',
			    html: "Spam Detector"
			},
			{
			    xtype: 'panel',
			    groups: ['configuration'],
			    title: 'Virus Detector',
			    itemId: 'config-virus',
			    html: "Virus Detector"
			},
			{
			    xtype: 'panel',
			    groups: ['configuration'],
			    title: 'User Management',
			    itemId: 'config-users',
			    html: "User Management"
			},
			{
			    xtype: 'panel',
			    groups: ['configuration'],
			    title: 'Cluster',
			    itemId: 'config-cluster',
			    html: "Cluster"
			},
			{
			    xtype: 'panel',
			    groups: ['configuration'],
			    title: 'License',
			    itemId: 'config-license',
			    html: "License"
			},

			{
			    xtype: 'panel',
			    title: 'Administration',
			    itemId: 'admin',
			    expandedOnInit: true,
			    items: [{ xtype: 'pmgServerAdministration' }]
			},
			{
			    xtype: 'panel',
			    groups: ['admin'],
			    title: 'Statistics',
			    itemId: 'statistics',
			    html: "Statistics"
			},
			{
			    xtype: 'panel',
			    groups: ['admin'],
			    title: 'Quarantine',
			    itemId: 'quarantine',
			    html: "Quarantine"
			},
			{
			    xtype: 'panel',
			    groups: ['admin'],
			    title: 'Tracking Center',
			    itemId: 'tracking',
			    html: "Tracking Center"
			},
			{
			    xtype: 'panel',
			    groups: ['admin'],
			    title: 'Queues',
			    itemId: 'queues',
			    html: "Queues"
			}
		    ]
		}
	    ]
	});

	me.callParent();

	me.updateUserInfo();

	// on resize, center all modal windows
	Ext.on('resize', function(){
	    var wins = Ext.ComponentQuery.query('window[modal]');
	    if (wins.length > 0) {
		wins.forEach(function(win){
		    win.alignTo(me, 'c-c');
		});
	    }
	});
    }
});
