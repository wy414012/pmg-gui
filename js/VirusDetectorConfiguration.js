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
	    xtype: 'pmgClamAVDatabase'
	},
	{
	    title: gettext('Quarantine'),
	    xtype: 'pmgVirusQuarantineOptions'
	}
    ]
});


