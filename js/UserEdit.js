/*global Proxmox*/
/*jslint confusion: true*/
/* submitvalue is string and bool */
Ext.define('PMG.UserEdit', {
    extend: 'Proxmox.window.Edit',
    alias: 'widget.pmgUserEdit',
    mixins: ['Proxmox.Mixin.CBind'],

    userid: undefined,

    isAdd: true,

    subject: gettext('User'),

    fieldDefaults: { labelWidth: 120 },

    cbindData: function(initialConfig) {
	var me = this;

	var userid = initialConfig.userid;
	var baseurl = '/api2/extjs/access/users';

	me.create = !userid;
	me.url = userid ?  baseurl + '/' + userid : baseurl;
	me.method = userid ? 'PUT' : 'POST';
	me.autoLoad = userid ? true : false;

	return {
	    useridXType: userid ? 'displayfield' : 'textfield',
	    isSuperUser: userid === 'root@pam'
	};
    },

    items: {
	xtype: 'inputpanel',
	column1: [
	    {
		xtype: 'textfield',
		name: 'username',
		fieldLabel: gettext('User name'),
		allowBlank: false,
		cbind: {
		    submitValue: '{create}',
		    xtype: '{useridXType}'
		}
	    },
	    {
		xtype: 'textfield',
		inputType: 'password',
		fieldLabel: gettext('Password'),
		minLength: 5,
		allowBlank: false,
		name: 'password',
		listeners: {
                    change: function(field){
			field.next().validate();
                    },
                    blur: function(field){
			field.next().validate();
                    }
		},
		cbind: {
		    hidden: '{!create}',
		    disabled: '{!create}'
		}
	    },
	    {
	    	xtype: 'textfield',
		inputType: 'password',
		fieldLabel: gettext('Confirm password'),
		name: 'verifypassword',
		vtype: 'password',
		initialPassField: 'password',
		allowBlank: false,
		submitValue: false,
		cbind: {
		    hidden: '{!create}',
		    disabled: '{!create}'
		}
	    },
	    {
		xtype: 'pmgRoleSelector',
		name: 'role',
		allowBlank: false,
		fieldLabel: gettext('Role'),
		cbind: {
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
		cbind: {
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
		cbind: {
		    disabled: '{isSuperUser}'
		}
	    }
	],

	column2: [
	    {
		xtype: 'proxmoxtextfield',
		name: 'firstname',
		fieldLabel: gettext('First Name'),
		cbind: {
		    deleteEmpty: '{!create}'
		}
	    },
	    {
		xtype: 'proxmoxtextfield',
		name: 'lastname',
		fieldLabel: gettext('Last Name'),
		cbind: {
		    deleteEmpty: '{!create}'
		}
	    },
	    {
		xtype: 'proxmoxtextfield',
		name: 'email',
		fieldLabel: gettext('E-Mail'),
		vtype: 'proxmoxMail',
		cbind: {
		    deleteEmpty: '{!create}'
		}
	    }
	],

	columnB: [
	    {
		xtype: 'proxmoxtextfield',
		name: 'comment',
		fieldLabel: gettext('Comment'),
		cbind: {
		    disabled: '{isSuperUser}',
		    deleteEmpty: '{!create}'
		}
	    },
	    {
		xtype: 'proxmoxtextfield',
		name: 'keys',
		fieldLabel: gettext('Key IDs'),
		cbind: {
		    deleteEmpty: '{!create}'
		}
	    }
	]
    },

    getValues: function(dirtyOnly) {
	var me = this;

	var values = me.callParent(arguments);

	// hack: ExtJS datefield does not submit 0, so we need to set that
	if (!values.expire) {
	    values.expire = 0;
	}

	if (me.create) {
	    values.userid = values.username + '@pmg';
	}

	delete values.username;

	if (!values.password) {
	    delete values.password;
	}

	return values;
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
    }
});
