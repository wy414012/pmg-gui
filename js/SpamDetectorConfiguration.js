Ext.define('PMG.SpamDetectorConfiguration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgSpamDetectorConfiguration',

    title: gettext('Spam Detector Configuration'),

    items: [
	{
	    title: gettext('Options'),
	    html: 'Options'
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


