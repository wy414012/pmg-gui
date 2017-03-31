Ext.define('PMG.window.LoginWindow', {
    extend: 'Ext.window.Window',

    controller: {

	xclass: 'Ext.app.ViewController',

	onLogon: function() {
	    var me = this;

	    var form = this.lookupReference('loginForm');
	    var unField = this.lookupReference('usernameField');
	    var realmField = this.lookupReference('realmField');
	    var view = this.getView();

	    var username = unField.getValue();
	    realmField.setValue(username === 'root' ? 'pam' : 'pmg');

	    if(form.isValid()){
		view.el.mask(gettext('Please wait...'), 'x-mask-loading');


		form.submit({
		    failure: function(f, resp){
			view.el.unmask();
			var handler = function() {
			    var uf = me.lookupReference('usernameField');
			    uf.focus(true, true);
			};

			Ext.MessageBox.alert(gettext('Error'),
					     gettext("Login failed. Please try again"),
					     handler);
		    },
		    success: function(f, resp){
			view.el.unmask();

			var handler = view.handler || Ext.emptyFn;
			handler.call(me, resp.result.data);
			view.close();
		    }
		});
	    }
	},

	control: {
	    'field[name=username]': {
		specialkey: function(f, e) {
		    if (e.getKey() === e.ENTER) {
			var pf = this.lookupReference('passwordField');
			if (pf.getValue()) {
			    this.onLogon();
			} else {
			    pf.focus(false);
			}
		    }
		}
	    },
	    'field[name=password]': {
		specialkey: function(f, e) {
		    if (e.getKey() === e.ENTER) {
			this.onLogon();
		    }
		}
	    },
            'button[reference=loginButton]': {
		click: 'onLogon'
            },
	    '#': {
		show: function() {
		    var unField = this.lookupReference('usernameField');
		    unField.focus();
		}
	    }
	}
    },

    width: 400,

    modal: true,

    border: false,

    draggable: true,

    closable: false,

    resizable: false,

    layout: 'auto',

    title: gettext('Proxmox Mail Gateway Login'),

    defaultFocus: 'usernameField',

    items: [{
	xtype: 'form',
	layout: 'form',
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
		stateId: 'login-username'
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
		reference: 'realmField',
		value: 'pam'
	    }
	],
	buttons: [
	    {
		text: gettext('Login'),
		reference: 'loginButton'
	    }
	]
    }]
 });
