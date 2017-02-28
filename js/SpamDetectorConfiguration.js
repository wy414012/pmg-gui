Ext.define('PMG.SpamDetectorConfiguration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgSpamDetectorConfiguration',

    title: gettext('Configuration') + ': ' +
	gettext('Spam Detector'),

    items: [
	{
	    title: gettext('Options'),
	    xtype: 'pmgSpamDetectorOptions'
	},
	{
	    title: gettext('Languages'),
	    html: 'Languages'
	},
	{
	    title: gettext('Quarantine'),
	    html: 'Quarantine'
	},
	{
	    title: gettext('Backscatter'),
	    html: 'Backscatter'
	},
	{
	    title: gettext('Theme'),
	    html: 'Theme'
	}
    ]
});


