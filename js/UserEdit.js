Ext.define('PMG.UserViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.pmgUserViewModel',

    data: {
	userid: undefined,
	isCreate: true,
	isSuperUser: false,
    }
});

Ext.define('PMG.UserEdit', {
    extend: 'Proxmox.window.Edit',
    alias: ['widget.pmgUserEdit'],

    viewModel: { type: 'pmgUserViewModel' },

    isAdd: true,

    subject: gettext('User'),

    fieldDefaults: { labelWidth: 120 },

    items: {
	xtype: 'inputpanel',
	onGetValues: function(values) {
	    var me = this;

	    // hack: ExtJS datefield does not submit 0, so we need to set that
	    if (!values.expire) {
		values.expire = 0;
	    }

	    if (me.create) {
		values.userid = values.userid + '@pmg';
	    }

	    if (!values.password) {
		delete values.password;
	    }

	    return values;
	},

	column1: [
	    {
		xtype: 'textfield',
		name: 'userid',
		fieldLabel: gettext('User name'),
		allowBlank: false,
		bind: {
		    value: '{userid}',
		    submitValue: '{isCreate}',
		    editable: '{isCreate}'
		}
	    },
	    {
		xtype: 'textfield',
		inputType: 'password',
		fieldLabel: gettext('Password'),
		minLength: 5,
		name: 'password',
		listeners: {
                    change: function(field){
			field.next().validate();
                    },
                    blur: function(field){
			field.next().validate();
                    }
		},
		hidden: true, // avoid flicker
		bind: {
		    hidden: '{!isCreate}',
		    disabled: '{!isCreate}'
		}
	    },
	    {
	    	xtype: 'textfield',
		inputType: 'password',
		fieldLabel: gettext('Confirm password'),
		name: 'verifypassword',
		vtype: 'password',
		initialPassField: 'password',
		submitValue: false,
		hidden: true,  // avoid flicker
		bind: {
		    hidden: '{!isCreate}',
		    disabled: '{!isCreate}'
		}
	    },
	    {
		xtype: 'pmgRoleSelector',
		name: 'role',
		allowBlank: false,
		fieldLabel: gettext('Role'),
		bind: {
		    disabled: '{isSuperUser}'
		}
	    },
	    {
                xtype: 'datefield',
                name: 'expire',
		emptyText: Proxmox.Utils.neverText,
		format: 'Y-m-d',
		submitFormat: 'U',
                fieldLabel: gettext('Expire'),
		bind: {
		    disabled: '{isSuperUser}'
		}
            },
	    {
		xtype: 'proxmoxcheckbox',
		fieldLabel: gettext('Enabled'),
		name: 'enable',
		uncheckedValue: 0,
		defaultValue: 1,
		checked: true,
		bind: {
		    disabled: '{isSuperUser}'
		}
	    }
	],

	column2: [
	    {
		xtype: 'proxmoxtextfield',
		name: 'firstname',
		fieldLabel: gettext('First Name'),
		bind: {
		    deleteEmpty: '{!isCreate}'
		}
	    },
	    {
		xtype: 'proxmoxtextfield',
		name: 'lastname',
		fieldLabel: gettext('Last Name'),
		bind: {
		    deleteEmpty: '{!isCreate}'
		}
	    },
	    {
		xtype: 'proxmoxtextfield',
		name: 'email',
		fieldLabel: gettext('E-Mail'),
		vtype: 'proxmoxMail',
		bind: {
		    deleteEmpty: '{!isCreate}'
		}
	    }
	],

	columnB: [
	    {
		xtype: 'proxmoxtextfield',
		name: 'comment',
		fieldLabel: gettext('Comment'),
		bind: {
		    disabled: '{isSuperUser}',
		    deleteEmpty: '{!isCreate}'
		}
	    },
	    {
		xtype: 'proxmoxtextfield',
		name: 'keys',
		fieldLabel: gettext('Key IDs'),
		bind: {
		    deleteEmpty: '{!isCreate}'
		}
	    }
	]
    },

    controller: {

	xclass: 'Ext.app.ViewController',

	init: function(view) {
	    var userid = view.userid;
	    var viewModel = view.getViewModel();

	    view.getViewModel().set('isCreate', !view.userid);

	    if (userid) {
		viewModel.set('userid', userid);
		if (userid === 'root@pam') {
		    viewModel.set('isSuperUser', true);
		}
	    }
	}
    },

    setValues: function(values) {
	var me = this;

	if (Ext.isDefined(values.expire)) {
	    if (values.expire) {
		values.expire = new Date(values.expire * 1000);
	    } else {
		// display 'never' instead of '1970-01-01'
		values.expire = null;
	    }
	}

	me.callParent([values]);
    },

    initComponent : function() {
        var me = this;

	var userid = me.userid;
	me.create = !userid; // fixme

        if (!userid) {
            me.url = '/api2/extjs/access/users';
            me.method = 'POST';
        } else {
	    me.autoLoad = true;
            me.url = '/api2/extjs/access/users/' + userid;
            me.method = 'PUT';
	}

	me.callParent();
    }
});
