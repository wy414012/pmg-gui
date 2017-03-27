Ext.define('PMG.UserEdit', {
    extend: 'Proxmox.window.Edit',
    alias: ['widget.pmgUserEdit'],

    isAdd: true,

    initComponent : function() {
        var me = this;

        me.create = !me.userid;

        var url;
        var method;
        var realm;

        if (me.create) {
            url = '/api2/extjs/access/users';
            method = 'POST';
        } else {
            url = '/api2/extjs/access/users/' + me.userid;
            method = 'PUT';
	}

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

        var column1 = [
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
	    column1.push(pwfield, verifypw);
	}

	column1.push(
	    {
		xtype: 'textfield',
		name: 'role',
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

        var column2 = [
	    {
		xtype: 'proxmoxtextfield',
		name: 'firstname',
		fieldLabel: gettext('First Name')
	    },
	    {
		xtype: 'proxmoxtextfield',
		name: 'lastname',
		fieldLabel: gettext('Last Name')
	    },
	    {
		xtype: 'proxmoxtextfield',
		name: 'email',
		fieldLabel: gettext('E-Mail'),
		vtype: 'proxmoxMail'
	    }
	];

	var columnB = [
	    {
		xtype: 'proxmoxtextfield',
		name: 'comment',
		disabled: me.userid === 'root@pam',
		fieldLabel: gettext('Comment')
	    },
	    {
		xtype: 'proxmoxtextfield',
		name: 'keys',
		fieldLabel: gettext('Key IDs')
	    }
	];

	var ipanel = Ext.create('Proxmox.panel.InputPanel', {
	    column1: column1,
	    column2: column2,
	    columnB: columnB,
	    onGetValues: function(values) {
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

		console.dir(values);

		return values;
	    }
	});

	Ext.applyIf(me, {
            subject: gettext('User'),
            url: url,
            method: method,
	    fieldDefaults: {
		labelWidth: 120
	    },
	    items: [ ipanel ]
        });

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
