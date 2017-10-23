Ext.define('PMG.LoginView', {
    extend: 'Ext.container.Container',
    xtype: 'loginview',

    controller: {
	xclass: 'Ext.app.ViewController',

	init: function(view) {
	    var me = this;

	    var realmfield = me.lookup('realmfield');

	    if (view.targetview !== 'quarantineview') {
		return;
	    }

	    realmfield.setValue('quarantine');

	    // try autologin with quarantine ticket from URL

	    var loginForm = this.lookupReference('loginForm');

	    var qs = Ext.Object.fromQueryString(location.search);
	    if (qs.ticket == undefined) { return; }
	    var ticket = decodeURIComponent(qs.ticket);
	    var match = ticket.match(/^PMGQUAR:([^\s\:]+):/);
	    if (!match) { return; }
	    var username = match[1];
	    var loginwin = me.lookup('loginwindow');
	    loginwin.autoShow = false;
	    loginwin.setVisible(false);
	    realmfield.setDisabled(true);

	    me.lookup('usernameField').setValue(username);
	    me.lookup('passwordField').setValue(ticket);

	    me.submitForm();
	},

	submitForm: function() {
	    var me = this;
	    var view = me.getView();
	    var loginForm = me.lookupReference('loginForm');

	    if (loginForm.isValid()) {
		if (loginForm.isVisible()) {
		    loginForm.mask(gettext('Please wait...'), 'x-mask-loading');
		}
		loginForm.submit({
		    success: function(form, action) {
			// save login data and create cookie
			PMG.Utils.updateLoginData(action.result.data);
			PMG.app.changeView(view.targetview);
		    },
		    failure: function(form, action) {
			loginForm.unmask();
			Ext.MessageBox.alert(
			    gettext('Error'),
			    gettext('Login failed. Please try again')
			);
		    }
		});
	    }
	},

	control: {
	    'field[name=lang]': {
		change: function(f, value) {
		    var dt = Ext.Date.add(new Date(), Ext.Date.YEAR, 10);
		    Ext.util.Cookies.set('PMGLangCookie', value, dt);

		    var loginwin = this.lookupReference('loginwindow');
		    loginwin.mask(gettext('Please wait...'), 'x-mask-loading');
		    window.location.reload();
		}
	    },
	    'button[reference=loginButton]': {
		click: 'submitForm'
	    }
	}
    },

    plugins: 'viewport',

    layout: {
	type: 'border'
    },

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
		    xtype: 'versioninfo',
		    makeApiCall: false
		}
	    ]
	},
	{
	    region: 'center'
	},
	{
	    xtype: 'window',
	    closable: false,
	    resizable: false,
	    reference: 'loginwindow',
	    autoShow: true,
	    modal: true,

	    defaultFocus: 'usernameField',

	    layout: {
		type: 'auto'
	    },

	    title: gettext('Proxmox Mail Gateway Login'),

	    items: [
		{
		    xtype: 'form',
		    layout: {
			type: 'form'
		    },
		    defaultButton: 'loginButton',
		    url: '/api2/extjs/access/ticket',
		    reference: 'loginForm',

		    fieldDefaults: {
			labelAlign: 'right',
			allowBlank: false
		    },

		    items: [
			{
			    xtype: 'textfield',
			    fieldLabel: gettext('User name'),
			    name: 'username',
			    itemId: 'usernameField',
			    reference: 'usernameField'
			},
			{
			    xtype: 'textfield',
			    inputType: 'password',
			    fieldLabel: gettext('Password'),
			    name: 'password',
			    reference: 'passwordField'
			},
			{
			    xtype: 'proxmoxLanguageSelector',
			    fieldLabel: gettext('Language'),
			    value: Ext.util.Cookies.get('PMGLangCookie') || 'en',
			    name: 'lang',
			    submitValue: false
			},
			{
			    xtype: 'hiddenfield',
			    reference: 'realmfield',
			    name: 'realm',
			    value: 'pmg'
                        }
		    ],
		    buttons: [
			{
			    text: gettext('Login'),
			    reference: 'loginButton',
			    formBind: true
			}
		    ]
		}
	    ]
	}
    ]
});
