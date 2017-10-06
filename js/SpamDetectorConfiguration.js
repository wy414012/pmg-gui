Ext.define('PMG.SpamDetectorConfiguration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgSpamDetectorConfiguration',

    title: gettext('Configuration') + ': ' +
	gettext('Spam Detector'),

    border: false,
    defaults: { border: false },

    items: [
	{
	    title: gettext('Options'),
	    xtype: 'pmgSpamDetectorOptions'
	},
	{
	    title: gettext('Quarantine'),
	    xtype: 'pmgSpamQuarantineOptions'
	},
	{
	    title: gettext('Theme'),
	    html: 'Theme'
	}
    ]
});


