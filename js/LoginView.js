Ext.define('PMG.LoginView', {
    extend: 'Ext.container.Container',
    xtype: 'loginview',

    controller: {
	xclass: 'Ext.app.ViewController',
	submitForm: function() {
	    var me = this;
	    var loginForm = me.lookupReference('loginForm');

	    if (loginForm.isValid()) {
		loginForm.mask(gettext('Please wait...'), 'x-mask-loading');
		loginForm.submit({
		    success: function(form, action) {
			// save login data and create cookie
			PMG.Utils.updateLoginData(action.result.data);
			// change view to mainview
			me.getView().destroy();
			Ext.create({ xtype: 'mainview' });
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
	    'button[reference=loginButton]': {
		click: 'submitForm'
	    }
	}
    },

    plugins: 'viewport',

    layout: 'border',

    items: [
	{
	    region: 'north',
	    xtype: 'container',
	    layout: {
		type: 'hbox',
		align: 'middle'
	    },
	    margin: '4 5 4 5',
	    items: [
		{
		    xtype: 'proxmoxlogo'
		},
		{
		    xtype: 'versioninfo',
		    makeApiCall: false,
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
	    autoShow: true,
	    modal: true,

	    layout: 'auto',

	    title: gettext('Proxmox Mail Gateway Login'),

	    items: [
		{
		    xtype: 'form',
		    layout: 'form',
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
			    reference: 'usernameField',
			},
			{
			    xtype: 'textfield',
			    inputType: 'password',
			    fieldLabel: gettext('Password'),
			    name: 'password',
			    reference: 'passwordField'
			},
			{
			    xtype: 'hiddenfield',
			    name: 'realm',
			    value: 'pam',
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
