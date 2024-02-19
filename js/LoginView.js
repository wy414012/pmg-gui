Ext.define('PMG.LoginView', {
    extend: 'Ext.container.Container',
    xtype: 'loginview',

    controller: {
	xclass: 'Ext.app.ViewController',

	init: function(view) {
	    let me = this;

	    let realmfield = me.lookup('realmfield');

	    me.lookup('quarantineButton').setVisible(!!Proxmox.QuarantineLink);

	    if (view.targetview !== 'quarantineview') {
		return;
	    }

	    // hide save username field for quarantine view
	    me.lookup('saveunField').setVisible(false);

	    realmfield.setValue('quarantine');

	    // try autologin with quarantine ticket from URL

	    let qs = Ext.Object.fromQueryString(location.search);
	    if (qs.ticket === undefined) {
		return;
	    }
	    let ticket = decodeURIComponent(qs.ticket);
	    let match = ticket.match(/^PMGQUAR:([^\s:]+):/);
	    if (!match) {
		return;
	    }
	    let username = match[1];
	    let loginwin = me.lookup('loginwindow');
	    loginwin.autoShow = false;
	    loginwin.setVisible(false);
	    realmfield.setDisabled(true);

	    me.lookup('usernameField').setValue(username);
	    me.lookup('passwordField').setValue(ticket);

	    me.submitForm();
	},

	submitForm: async function() {
	    let me = this;
	    let view = me.getView();
	    let loginForm = me.lookupReference('loginForm');
	    var unField = me.lookupReference('usernameField');
	    var saveunField = me.lookupReference('saveunField');

	    if (loginForm.isValid()) {
		if (loginForm.isVisible()) {
		    loginForm.mask(gettext('Please wait...'), 'x-mask-loading');
		}

		// set or clear username for admin view
		if (view.targetview !== 'quarantineview') {
		    var sp = Ext.state.Manager.getProvider();
		    if (saveunField.getValue() === true) {
			sp.set(unField.getStateId(), unField.getValue());
		    } else {
			sp.clear(unField.getStateId());
		    }
		    sp.set(saveunField.getStateId(), saveunField.getValue());
		}

		let creds = loginForm.getValues();

		try {
		    let resp = await Proxmox.Async.api2({
			url: '/api2/extjs/access/ticket',
			params: creds,
			method: 'POST',
		    });

		    let data = resp.result.data;
		    if (data.ticket.startsWith('PMG:!tfa!')) {
			data = await me.performTFAChallenge(data);
		    }
		    PMG.Utils.updateLoginData(data);
		    PMG.app.changeView(view.targetview);
		} catch (error) {
		    Proxmox.Utils.authClear();
		    loginForm.unmask();
		    Ext.MessageBox.alert(
			gettext('Error'),
			gettext('Login failed. Please try again'),
		    );
		}
	    }
	},

	performTFAChallenge: async function(data) {
	    let me = this;

	    let userid = data.username;
	    let ticket = data.ticket;
	    let challenge = JSON.parse(decodeURIComponent(
		ticket.split(':')[1].slice("!tfa!".length),
	    ));

	    let resp = await new Promise((resolve, reject) => {
		Ext.create('Proxmox.window.TfaLoginWindow', {
		    userid,
		    ticket,
		    challenge,
		    onResolve: value => resolve(value),
		    onReject: reject,
		}).show();
	    });

	    return resp.result.data;
	},

	openQuarantineLinkWindow: function() {
	    let me = this;
	    me.lookup('loginwindow').setVisible(false);
	    Ext.create('Proxmox.window.Edit', {
		title: gettext('Request Quarantine Link'),
		url: '/quarantine/sendlink',
		isCreate: true,
		submitText: gettext('OK'),
		method: 'POST',
		items: [
		    {
			xtype: 'proxmoxtextfield',
			name: 'mail',
			fieldLabel: gettext('Your E-Mail'),
		    },
		],
		listeners: {
		    destroy: function() {
			me.lookup('loginwindow').show(true);
		    },
		},
	    }).show();
	},

	control: {
	    'field[name=lang]': {
		change: function(f, value) {
		    let dt = Ext.Date.add(new Date(), Ext.Date.YEAR, 10);
		    Ext.util.Cookies.set('PMGLangCookie', value, dt);

		    let loginwin = this.lookupReference('loginwindow');
		    loginwin.mask(gettext('Please wait...'), 'x-mask-loading');
		    window.location.reload();
		},
	    },
	    'button[reference=quarantineButton]': {
		click: 'openQuarantineLinkWindow',
	    },
	    'button[reference=loginButton]': {
		click: 'submitForm',
	    },
	    'window[reference=loginwindow]': {
		show: function() {
		    let me = this;
		    let view = me.getView();
		    if (view.targetview !== 'quarantineview') {
			var sp = Ext.state.Manager.getProvider();
			var checkboxField = this.lookupReference('saveunField');
			var unField = this.lookupReference('usernameField');

			var checked = sp.get(checkboxField.getStateId());
			checkboxField.setValue(checked);

			if (checked === true) {
			    var username = sp.get(unField.getStateId());
			    unField.setValue(username);
			    var pwField = this.lookupReference('passwordField');
			    pwField.focus();
			}
		    }
		},
	    },
	},
    },

    plugins: 'viewport',

    layout: {
	type: 'border',
    },

    items: [
	{
	    region: 'north',
	    xtype: 'container',
	    layout: {
		type: 'hbox',
		align: 'middle',
	    },
	    margin: '2 5 2 5',
	    height: 38,
	    items: [
		{
		    xtype: 'proxmoxlogo',
		},
		{
		    xtype: 'versioninfo',
		    makeApiCall: false,
		},
	    ],
	},
	{
	    region: 'center',
	},
	{
	    xtype: 'window',
	    closable: false,
	    resizable: false,
	    reference: 'loginwindow',
	    autoShow: true,
	    modal: true,
	    width: 450,

	    defaultFocus: 'usernameField',

	    layout: {
		type: 'auto',
	    },

	    title: gettext('Proxmox Mail Gateway Login'),

	    items: [
		{
		    xtype: 'form',
		    layout: {
			type: 'form',
		    },
		    defaultButton: 'loginButton',
		    url: '/api2/extjs/access/ticket',
		    reference: 'loginForm',

		    fieldDefaults: {
			labelAlign: 'right',
			allowBlank: false,
		    },

		    items: [
			{
			    xtype: 'textfield',
			    fieldLabel: gettext('User name'),
			    name: 'username',
			    itemId: 'usernameField',
			    reference: 'usernameField',
			    stateId: 'login-username',
			    inputAttrTpl: 'autocomplete=username',
			},
			{
			    xtype: 'textfield',
			    inputType: 'password',
			    fieldLabel: gettext('Password'),
			    name: 'password',
			    reference: 'passwordField',
			    inputAttrTpl: 'autocomplete=current-password',
			},
			{
			    xtype: 'proxmoxLanguageSelector',
			    fieldLabel: gettext('Language'),
			    value: Ext.util.Cookies.get('PMGLangCookie') || 'en',
			    name: 'lang',
			    submitValue: false,
			},
			{
			    xtype: 'hiddenfield',
			    reference: 'realmfield',
			    name: 'realm',
			    value: 'pmg',
                        },
		    ],
		    buttons: [
			{
			    xtype: 'checkbox',
			    fieldLabel: gettext('Save User name'),
			    name: 'saveusername',
			    reference: 'saveunField',
			    stateId: 'login-saveusername',
			    labelAlign: 'right',
			    labelWidth: 150,
			    submitValue: false,
			},
			{
			    text: gettext('Request Quarantine Link'),
			    reference: 'quarantineButton',
			},
			{
			    text: gettext('Login'),
			    reference: 'loginButton',
			    formBind: true,
			},
		    ],
		},
	    ],
	},
    ],
});
