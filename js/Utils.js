Ext.ns('PMG');

console.log("Starting PMG Manager");


Ext.define('PMG.Utils', {
    singleton: true,

    // this singleton contains miscellaneous utilities

    senderText: gettext('Sender'),
    receiverText: gettext('Receiver'),
    anyProfileText: gettext('Any Profile'),

    oclass_text: {
	who: gettext('Who Objects'),
	what: gettext('What Objects'),
	when: gettext('When Objects'),
	action: gettext('Action Objects')
    },

    rule_direction_text: {
	0: gettext('In'),
	1: gettext('Out'),
	2: gettext('In & Out')
    },

    format_rule_direction: function(dir) {
	return PMG.Utils.rule_direction_text[dir] || dir;
    },

    format_otype: function(otype) {
	var editor = PMG.Utils.object_editors[otype];
	if (editor) {
	    return editor.subject;
	}
	return 'unknown';
    },

    format_ldap_protocol: function(p) {
	if (p === undefined) return 'LDAP';
	if (p === 'ldap') return 'LDAP';
	if (p === 'ldaps') return 'LDAPS';
	return 'unknown';
    },

    object_editors: {
	1000: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'regex',
	    subject: gettext("Regular Expression"),
	    width: 400,
	    items: [
		{
		    xtype: 'textfield',
		    name: 'regex',
		    labelWidth: 150,
		    fieldLabel: gettext("Regular Expression")
		}
	    ]
	},
	1005: {
	    xtype: 'pmgLDAPGroupEditor',
	    subdir: 'ldap',
	    subject: gettext("LDAP Group")
	},
	1006: {
	    xtype: 'pmgLDAPUserEditor',
	    subdir: 'ldapuser',
	    subject: gettext("LDAP User")
	},
	1009: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'receiver_regex',
	    subject: gettext("Regular Expression"),
	    receivertest: true,
	    width: 400,
	    items: [
		{
		    xtype: 'textfield',
		    name: 'regex',
		    labelWidth: 150,
		    fieldLabel: gettext("Regular Expression")
		}
	    ]
	},
	1001: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'email',
	    subject: gettext("Email"),
	    width: 400,
	    items: [
		{
		    xtype: 'textfield',
		    name: 'email',
		    fieldLabel: gettext("Email")
		}
	    ]
	},
	1007: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'receiver',
	    subject: gettext("Email"),
	    receivertest: true,
	    width: 400,
	    items: [
		{
		    xtype: 'textfield',
		    name: 'email',
		    fieldLabel: gettext("Email")
		}
	    ]
	},
	1002: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'domain',
	    subject: gettext("Domain"),
	    width: 400,
	    items: [
		{
		    xtype: 'textfield',
		    name: 'domain',
		    fieldLabel: gettext("Domain")
		}
	    ]
	},
	1008: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'receiver_domain',
	    subject: gettext("Domain"),
	    receivertest: true,
	    width: 400,
	    items: [
		{
		    xtype: 'textfield',
		    name: 'domain',
		    fieldLabel: gettext("Domain")
		}
	    ]
	},
	1003: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'ip',
	    subject: gettext("IP Address"),
	    width: 400,
	    items: [
		{
		    xtype: 'textfield',
		    name: 'ip',
		    fieldLabel: gettext("IP Address")
		}
	    ]
	},
	1004: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'network',
	    subject: gettext("IP Network"),
	    width: 400,
	    items: [
		{
		    xtype: 'textfield',
		    name: 'cidr',
		    fieldLabel: gettext("IP Network")
		}
	    ]
	},
	2000: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'timeframe',
	    subject: gettext("TimeFrame"),
	    items: [
		{
		    xtype: 'timefield',
		    name: 'start',
		    format: 'H:i',
		    fieldLabel: gettext("Start Time")
		},
		{
		    xtype: 'timefield',
		    name: 'end',
		    format: 'H:i',
		    fieldLabel: gettext("End Time")
		}
	    ]
	},
	4005: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'bcc',
	    subject: gettext('BCC'),
	    width: 400,
	    items: [
		{
		    xtype: 'textfield',
		    name: 'name',
		    allowBlank: false,
		    fieldLabel: gettext('Name')
		},
		{
		    xtype: 'textareafield',
		    name: 'info',
		    fieldLabel: gettext("Description")
		},
		{
		    xtype: 'textfield',
		    name: 'target',
		    allowBlank: false,
		    fieldLabel: gettext("Target")
		},
		{
		    xtype: 'proxmoxcheckbox',
		    checked: true,
		    name: 'original',
		    fieldLabel: gettext("send orig. Mail")
		}
	    ]

	}
    },

    openVNCViewer: function(consoletype, nodename) {
	var url = Ext.urlEncode({
	    console: consoletype, // upgrade or shell
	    novnc: 1,
	    node: nodename
	});
	var nw = window.open("?" + url, '_blank',
			     "innerWidth=745,innerheight=427");
	nw.focus();
    },

    constructor: function() {
	var me = this;

	// do whatever you want here
    }
});
