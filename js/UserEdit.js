Ext.define('PMG.UserInputPanel', {
    extend: 'Proxmox.panel.InputPanel',
    alias: 'widget.pmgUserInputPanel',

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

    initComponent : function() {
        var me = this;

	me.create = !me.userid;

	var verifypw;
	var pwfield;

	var validate_pw = function() {
	    if (verifypw.getValue() !== pwfield.getValue()) {
		return gettext("Passwords does not match");
	    }
	    return true;
	};

	verifypw = Ext.createWidget('textfield', {
	    inputType: 'password',
	    fieldLabel: gettext('Confirm password'),
	    name: 'verifypassword',
	    submitValue: false,
	    validator: validate_pw
	});

	pwfield = Ext.createWidget('textfield', {
	    inputType: 'password',
	    fieldLabel: gettext('Password'),
	    minLength: 5,
	    name: 'password',
	    validator: validate_pw
	});

        me.column1 = [
            {
                xtype: me.create ? 'textfield' : 'displayfield',
                name: 'userid',
                fieldLabel: gettext('User name'),
                value: me.userid,
                allowBlank: false,
                submitValue: me.create ? true : false
            }
	];

	if (me.create) {
	    me.column1.push(pwfield, verifypw);
	}

	me.column1.push(
	    {
		xtype: 'pmgRoleSelector',
		name: 'role',
		disabled: me.userid === 'root@pam',
		allowBlank: false,
		fieldLabel: gettext('Role')
	    },
            {
                xtype: 'datefield',
                name: 'expire',
		emptyText: Proxmox.Utils.neverText,
		format: 'Y-m-d',
		disabled: me.userid === 'root@pam',
		submitFormat: 'U',
                fieldLabel: gettext('Expire')
            },
	    {
		xtype: 'proxmoxcheckbox',
		fieldLabel: gettext('Enabled'),
		name: 'enable',
		disabled: me.userid === 'root@pam',
		uncheckedValue: 0,
		defaultValue: 1,
		checked: true
	    }
        );

        me.column2 = [
	    {
		xtype: 'proxmoxtextfield',
		deleteEmpty: me.create ? false : true,
		name: 'firstname',
		fieldLabel: gettext('First Name')
	    },
	    {
		xtype: 'proxmoxtextfield',
		deleteEmpty: me.create ? false : true,
		name: 'lastname',
		fieldLabel: gettext('Last Name')
	    },
	    {
		xtype: 'proxmoxtextfield',
		name: 'email',
		deleteEmpty: me.create ? false : true,
		fieldLabel: gettext('E-Mail'),
		vtype: 'proxmoxMail'
	    }
	];

	me.columnB = [
	    {
		xtype: 'proxmoxtextfield',
		name: 'comment',
		deleteEmpty: me.create ? false : true,
		disabled: me.userid === 'root@pam',
		fieldLabel: gettext('Comment')
	    },
	    {
		xtype: 'proxmoxtextfield',
		deleteEmpty: me.create ? false : true,
		name: 'keys',
		fieldLabel: gettext('Key IDs')
	    }
	];

	me.callParent();
    }
});

Ext.define('PMG.UserEdit', {
    extend: 'Proxmox.window.Edit',
    alias: ['widget.pmgUserEdit'],

    isAdd: true,

    subject: gettext('User'),

    fieldDefaults: {
	labelWidth: 120
    },

    initComponent : function() {
        var me = this;

        me.create = !me.userid;

        if (me.create) {
            me.url = '/api2/extjs/access/users';
            me.method = 'POST';
        } else {
            me.url = '/api2/extjs/access/users/' + me.userid;
            me.method = 'PUT';
	}

	me.items = {
	    xtype: 'pmgUserInputPanel',
	    userid: me.userid
	};

        me.callParent();

        if (!me.create) {
            me.load({
		success: function(response, options) {
		    var data = response.result.data;
		    if (Ext.isDefined(data.expire)) {
			if (data.expire) {
			    data.expire = new Date(data.expire * 1000);
			} else {
			    // display 'never' instead of '1970-01-01'
			    data.expire = null;
			}
		    }
		    me.setValues(data);
                }
            });
        }
    }
});
