Ext.define('PMG.VirusDetectorConfiguration', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pmgVirusDetectorConfiguration',

    title: gettext('Configuration') + ': ' +
	gettext('Virus Detector'),

    items: [
	{
	    title: gettext('Options'),
	    xtype: 'pmgVirusDetectorOptions'
	},
	{
	    title: gettext('ClamAV'),
	    html: 'ClamAV'
	},
	{
	    title: gettext('Quarantine'),
	    xtype: 'pmgVirusQuarantineOptions'
	}
    ]
});


