Ext.ns('PMG');

console.log("Starting PMG Manager");


Ext.define('PMG.Utils', {
    singleton: true,
 
    // this singleton contains miscellaneous utilities

    senderText: gettext('Sender'),
    receiverText: gettext('Receiver'),

    oclass_text: {
	who: gettext('Who Objects'),
	what: gettext('What Objects'),
	when: gettext('When Objects'),
	action: gettext('Action Objects')
    },
    
    format_otype: function(otype) {
	var editor = PMG.Utils.object_editors[otype];
	if (editor) {
	    return editor.subject;
	}
	return 'unknown';
    },

    object_editors: {
	1000: {
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
	1009: {
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
	}
    },
			  
    constructor: function() {
	var me = this;

	// do whatever you want here
    }
});
