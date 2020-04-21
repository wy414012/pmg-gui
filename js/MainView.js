/*global Proxmox*/
Ext.define('PMG.MainView', {
    extend: 'Ext.container.Container',
    xtype: 'mainview',

    title: 'Proxmox Mail Gateway',

    controller: {
	xclass: 'Ext.app.ViewController',
	routes: {
	    ':path:subpath': {
		action: 'changePath',
		before: 'beforeChangePath',
                conditions : {
		    ':path'    : '(?:([%a-zA-Z0-9\\-\\_\\s,]+))',
		    ':subpath' : '(?:(?::)([%a-zA-Z0-9\\-\\_\\s,]+))?'
		}
	    }
	},

	beforeChangePath: function(path, subpath, action) {
	    var me = this;

	    if (!Ext.ClassManager.getByAlias('widget.'+ path)) {
		console.warn('xtype "'+path+'" not found');
		action.stop();
		return;
	    }

	    var lastpanel = me.lookupReference('contentpanel').getLayout().getActiveItem();
	    if (lastpanel && lastpanel.xtype === path) {
		// we have the right component already,
		// we just need to select the correct tab
		// default to the first
		subpath = subpath || 0;
		if (lastpanel.getActiveTab) {
		    // we assume lastpanel is a tabpanel
		    if (lastpanel.getActiveTab().getItemId() !== subpath) {
			// set the active tab
			lastpanel.setActiveTab(subpath);
		    }
		    // else we are already there
		}
		action.stop();
		return;
	    }

	    action.resume();
	},

	changePath: function(path,subpath) {
	    var me = this;
	    var contentpanel = me.lookupReference('contentpanel');
	    var lastpanel = contentpanel.getLayout().getActiveItem();

	    var obj = contentpanel.add({ xtype: path });
	    var treelist = me.lookupReference('navtree');

	    treelist.suspendEvents();
	    treelist.select(path);
	    treelist.resumeEvents();

	    if (Ext.isFunction(obj.setActiveTab)) {
		obj.setActiveTab(subpath || 0);
		obj.addListener('tabchange', function(tabpanel, newc, oldc) {
		    var newpath = path;

		    // only add the subpath part for the
		    // non-default tabs
		    if (tabpanel.items.findIndex('id', newc.id) !== 0) {
			newpath += ":" + newc.getItemId();
		    }

		    me.redirectTo(newpath);
		});
	    }

	    contentpanel.setActiveItem(obj);

	    if (lastpanel) {
		contentpanel.remove(lastpanel, { destroy: true });
	    }

	},

	logout: function() {
	    PMG.app.logout();
	},

	navigate: function(treelist, item) {
	    this.redirectTo(item.get('path'));
	},

	control: {
	    'button[reference=logoutButton]': {
		click: 'logout'
	    }
	},

	init: function(view) {
	    var me = this;

	    // load username
	    me.lookupReference('usernameinfo').update({username:Proxmox.UserName});

	    // show login on requestexception
	    // fixme: what about other errors
	    Ext.Ajax.on('requestexception', function(conn, response, options) {
		if (response.status == 401) { // auth failure
		    me.logout();
		}
	    });

	    // get ticket periodically
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
			    me.logout();
			},
			success: function(response, opts) {
			    var obj = Ext.decode(response.responseText);
			    PMG.Utils.updateLoginData(obj.data);
			}
		    });
		},
		interval: 15*60*1000
	    });

	    // select treeitem and load page from url fragment
	    var token = Ext.util.History.getToken() || 'pmgDashboard';
	    this.redirectTo(token, true);

	}
    },

    plugins: 'viewport',

    layout: { type: 'border' },

    items: [
	{
	    region: 'north',
	    xtype: 'container',
	    layout: {
		type: 'hbox',
		align: 'middle'
	    },
	    margin: '2 5 2 5',
	    height: 38,
	    items: [
		{
		    xtype: 'proxmoxlogo'
		},
		{
		    xtype: 'versioninfo'
		},
		{
		    flex: 1
		},
		{
		    id: 'eolannouncement',
		    baseCls: 'x-plain',
		    padding: '0 0 0 15',
		    width: 400,
		    html: '<a href="https://pmg.proxmox.com/pmg-docs/pmg-admin-guide.html#faq-support-table" target="_blank">'+
			    '<i class="fa eolicon critical fa-exclamation-triangle" style="font-size: 1.5em;"></i> ' +
			    'Support for Proxmox Mailgateway 5.2 ends on 31.07.2020</a>',
		    autoEl: {
			tag: 'div',
			'data-qtip': gettext("You won't get any security fixes after the End-Of-Life date. Please consider upgrading.")
		    }
		},
		{
		    flex: 1
		},
		{
		    baseCls: 'x-plain',
		    reference: 'usernameinfo',
		    padding: '0 5',
		    tpl: Ext.String.format(gettext("You are logged in as {0}"), "'{username}'")
		},
		{
		    xtype: 'proxmoxHelpButton',
		    hidden: false,
		    baseCls: 'x-btn',
		    iconCls: 'fa fa-info-circle x-btn-icon-el-default-toolbar-small ',
		    margin: '0 5 0 0',
		    listenToGlobalEvent: false,
		    onlineHelp: 'pmg_documentation_index'
		},
		{
		    reference: 'logoutButton',
		    xtype: 'button',
		    iconCls: 'fa fa-sign-out',
		    text: gettext('Logout')
		}
	    ]
	},
	{
	    xtype: 'panel',
	    scrollable: 'y',
	    border: false,
	    region: 'west',
	    layout: {
		type: 'vbox',
		align: 'stretch'
	    },
	    items: [{
		xtype: 'navigationtree',
		minWidth: 180,
		reference: 'navtree',
		// we have to define it here until extjs 6.2
		// because of a bug where a viewcontroller does not detect
		// the selectionchange event of a treelist
		listeners: {
		    selectionchange: 'navigate'
		}
	    }, {
		xtype: 'box',
		cls: 'x-treelist-nav',
		flex: 1
	    }]
	},
	{
	    xtype: 'panel',
	    layout: { type: 'card' },
	    region: 'center',
	    border: false,
	    reference: 'contentpanel'
	}
    ]
});
