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

	console.dir(loginData);
	
	me.loginData = loginData;
	PMG.CSRFPreventionToken = loginData.CSRFPreventionToken;
	PMG.UserName = loginData.username;

	// creates a session cookie (expire = null) 
	// that way the cookie gets deleted after browser window close
	Ext.util.Cookies.set('PMGAuthCookie', loginData.ticket, null, '/', null, true);
	me.onLogin(loginData);
    },

    // private
    showLogin: function() {
	var me = this;

	PMG.Utils.authClear();
	PMG.UserName = null;
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

        if (!PMG.Utils.authOK()) {
	    me.showLogin();
	} else { 
	    if (me.loginData) {
		me.onLogin(me.loginData);
	    }
	}

	Ext.TaskManager.start({
	    run: function() {
		var ticket = PMG.Utils.authOK();
		if (!ticket || !PMG.UserName) {
		    return;
		}

		Ext.Ajax.request({
		    params: { 
			username: PMG.UserName,
			password: ticket
		    },
		    url: '/api2/json/access/ticket',
		    method: 'POST',
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

    // private
    setContent: function(comp) {
	var me = this;
	
	var cont = me.child('#content');

	var lay = cont.getLayout();

	var cur = lay.getActiveItem();

	if (comp) {
	    PMG.Utils.setErrorMask(cont, false);
	    comp.border = false;
	    cont.add(comp);
	    if (cur !== null && lay.getNext()) {
		lay.next();
		var task = Ext.create('Ext.util.DelayedTask', function(){
		    cont.remove(cur);
		});
		task.delay(10);
	    }
	}
	else {
	    // helper for cleaning the content when logging out
	    cont.removeAll();
	}
    },

    onLogin: function(loginData) {
	var me = this;

	me.updateUserInfo();

	if (loginData) {
	    PMG.Utils.API2Request({
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

	if (PMG.UserName) {
	    var msg =  Ext.String.format(gettext("You are logged in as {0}"), "'" + PMG.UserName + "'");
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
				me.setContent(null);
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
		    xtype: 'container',
		    layout: { type: 'card' },
		    border: false,
		    margin: '0 5 0 0',
		    items: []
		},
		{
		    region: 'west',
		    stateful: true,
		    stateId: 'pvewest',
		    itemId: 'west',
		    xtype: 'container',
		    border: false,
		    layout: { type: 'vbox', align: 'stretch' },
		    margin: '0 0 0 5',
		    split: true,
		    width: 200,
		    items: [{ html: "A TEST" }],
		    listeners: {
			resize: function(panel, width, height) {
			    var viewWidth = me.getSize().width;
			    if (width > viewWidth - 100) {
				panel.setWidth(viewWidth - 100);
			    }
			}
		    }
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

