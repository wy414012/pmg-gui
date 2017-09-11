Ext.ns('PMG');

console.log("Starting PMG Manager");


Ext.define('PMG.Utils', {
    singleton: true,

    // this singleton contains miscellaneous utilities

    senderText: gettext('Sender'),
    receiverText: gettext('Receiver'),
    scoreText: gettext('Score'),

    oclass_text: {
	who: gettext('Who Objects'),
	what: gettext('What Objects'),
	when: gettext('When Objects'),
	action: gettext('Action Objects'),
	from: gettext('From'),
	to: gettext('To')
    },

    oclass_icon: {
	who: '<span class="fa fa-fw fa-user-circle"></span> ',
	what: '<span class="fa fa-fw fa-cube"></span> ',
	when: '<span class="fa fa-fw fa-clock-o"></span> ',
	action: '<span class="fa fa-fw fa-flag"></span> ',
	from: '<span class="fa fa-fw fa-user-circle"></span> ',
	to: '<span class="fa fa-fw fa-user-circle"></span> ',
    },

    format_oclass: function(oclass) {
	var icon = PMG.Utils.oclass_icon[oclass] || '';
	var text = PMG.Utils.oclass_text[oclass] || oclass;
	return icon + text;
    },

    rule_direction_text: {
	0: gettext('In'),
	1: gettext('Out'),
	2: gettext('In & Out')
    },

    rule_direction_icon: {
	0: '<span class="fa fa-fw fa-long-arrow-left"></span> ',
	1: '<span class="fa fa-fw fa-long-arrow-right"></span> ',
	2: '<span class="fa fa-fw fa-exchange"></span> '
    },

    format_rule_direction: function(dir) {
	var icon = PMG.Utils.rule_direction_icon[dir] || '';
	var text = PMG.Utils.rule_direction_text[dir] || dir;
	return icon + text;
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
	3002: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'matchfield',
	    subject: gettext('Match Field'),
	    items: [
		{
		    xtype: 'textfield',
		    name: 'field',
		    allowBlank: false,
		    fieldLabel: gettext('Field')
		},
		{
		    xtype: 'textfield',
		    name: 'value',
		    allowBlank: false,
		    fieldLabel: gettext('Value')
		},
	    ]
	},
	3003: {
	    xtype: 'proxmoxWindowEdit',
	    subdir: 'contenttype',
	    width: 400,
	    subject: gettext('Content Type'),
	    items: [
		{
		    xtype: 'combobox',
		    displayField: 'text',
		    labelWidth: 150,
		    valueField: 'mimetype',
		    name: 'contenttype',
		    editable: true,
		    queryMode: 'local',
		    store: {
			autoLoad: true,
			proxy: {
			    type: 'proxmox',
			    url: '/api2/json/config/mimetypes'
			},
		    },
		    fieldLabel: gettext('Content Type'),
		    anyMatch: true,
		    matchFieldWidth: false,
		    listeners: {
			change: function(cb, value) {
			    var me = this;
			    me.up().down('displayfield').setValue(value);
			}
		    }
		},
		{
		    xtype: 'displayfield',
		    fieldLabel: gettext('Value'),
		    labelWidth: 150,
		    allowBlank: false,
		},
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

    updateLoginData: function(data) {
	Proxmox.CSRFPreventionToken = data.CSRFPreventionToken;
	Proxmox.UserName = data.username;
	Ext.util.Cookies.set('PMGAuthCookie', data.ticket, null, '/', null, true );
    },

    quarantineActionExtracted: false,

    extractQuarantineAction: function() {

	if (PMG.Utils.quarantineActionExtracted) return;

	PMG.Utils.quarantineActionExtracted = true;

	var qs = Ext.Object.fromQueryString(location.search);

	var cselect = qs.cselect;
	var action = qs.action;
	var ticket = qs.ticket;

	delete qs.cselect;
	delete qs.action;
	delete qs.ticket;

	var newsearch = Ext.Object.toQueryString(qs);

	var newurl = location.protocol + "//" + location.host + location.pathname;
	if (newsearch) newurl += '?' + newsearch;
	newurl += location.hash;

	if (window.history) {
	    window.history.pushState({ path:newurl }, '', newurl);
	}

	if (action && cselect) {
	    return { action: action, cselect: cselect };
	}
    },

    constructor: function() {
	var me = this;

	// do whatever you want here
    }
});
