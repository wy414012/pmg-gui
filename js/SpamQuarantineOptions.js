/*global Proxmox*/
Ext.define('PMG.SpamQuarantineOptions', {
    extend: 'Proxmox.grid.ObjectGrid',
    alias: ['widget.pmgSpamQuarantineOptions'],

    monStoreErrors: true,

    authmodeTextHash: {
	ticket: 'Ticket',
	ldap: 'LDAP',
	ldapticket: 'LDAP or Ticket'
    },

    reportstyleTextHash: {
	none: gettext('No Reports'),
	'short': gettext('Short'),
	verbose: gettext('Verbose'),
	outlook: gettext('Verbose') + ' (Outlook 2007)',
	custom: gettext('Custom')
    },
    
    initComponent : function() {
	var me = this;

	me.add_integer_row('lifetime', gettext('Lifetime (days)'),
			   { minValue: 1, defaultValue: 7,
			     deleteEmpty: true });

	var render_authmode = function(value) {
	    return me.authmodeTextHash[value] || value;
	};

	/*jslint confusion: true*/
	/* defaultValue is a string and a number*/
	me.add_combobox_row('authmode', gettext('Authentication mode'), {
	    defaultValue: 'ticket',
	    renderer: render_authmode,
	    comboItems: [
		['ticket', render_authmode('ticket') ],
		['ldap', render_authmode('ldap') ],
		['ldapticket', render_authmode('ldapticket') ]]
	});

	var render_reportstyle = function(value) {
	    return me.reportstyleTextHash[value] || value;
	};

	me.add_combobox_row('reportstyle', gettext('Report Style'), {
	    defaultValue: 'verbose',
	    renderer: render_reportstyle,
	    comboItems: [
		['none', render_reportstyle('none') ],
		['short', render_reportstyle('short') ],
		['verbose', render_reportstyle('verbose') ],
		['outlook', render_reportstyle('outlook') ],
		['custom', render_reportstyle('custom') ]]
	});
	/*jslint confusion: false*/

	me.add_text_row('hostname', gettext('Quarantine Host'),
			{ deleteEmpty: true, defaultValue: Proxmox.Utils.noneText });
	me.add_text_row('mailfrom', gettext("EMail 'From:'"),
			{ deleteEmpty: true, defaultValue: Proxmox.Utils.noneText });

	me.add_boolean_row('viewimages', gettext('View images'),
			   { defaultValue: 1});
	
	me.add_boolean_row('allowhrefs', gettext('Allow HREFs'),
			   {defaultValue: 1 });

	var baseurl = '/config/spamquar';

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	Ext.apply(me, {
	    tbar: [{
		text: gettext('Edit'),
		xtype: 'proxmoxButton',
		disabled: true,
		handler: function() { me.run_editor(); },
		selModel: me.selModel
	    }],
	    url: '/api2/json' + baseurl,
	    editorConfig: {
		url: '/api2/extjs' + baseurl
	    },
	    interval: 5000,
	    cwidth1: 200,
	    listeners: {
		itemdblclick: me.run_editor
	    }
	});

	me.callParent();

	me.on('activate', me.rstore.startUpdate);
	me.on('destroy', me.rstore.stopUpdate);
	me.on('deactivate', me.rstore.stopUpdate);
    }
});
