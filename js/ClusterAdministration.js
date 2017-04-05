Ext.define('pmg-cluster', {
    extend: 'Ext.data.Model',
    fields: [
	'type', 'name', 'ip', 'hostrsapubkey', 'rootrsapubkey',
	'fingerprint', { type: 'integer', name: 'cid' }
    ],
    proxy: {
        type: 'proxmox',
	url: "/api2/json/config/cluster"
    },
    idProperty: 'cid'
});

Ext.define('PMG.ClusterAdministration', {
    extend: 'Ext.tab.Panel',
    xtype: 'pmgClusterAdministration',

    title: gettext('Cluster Administration'),

    border: false,
    defaults: { border: false },

     items: [
	{
	    xtype: 'grid',
	    title: gettext('Nodes'),
	    controller: {
		xclass: 'Ext.app.ViewController',

		init: function(view) {
		    view.store.on('load', this.onLoad, this);
		},

		onLoad: function(store, records) {
		    if(records.length) {
			console.log(records.length);
			this.lookupReference('createButton').setDisabled(records.length);

		    }
		    Ext.Array.each(records, function(ni) {
			console.dir(ni.data);
			if (ni.data.type === 'master') {
			    console.log(ni.data.fingerprint);
			}
		    });
		}

	    },
	    store: {
		autoLoad: true,
		model: 'pmg-cluster'
	    },
	    tbar: [
		{
		    text: gettext('Create Cluster'),
		    reference: 'createButton',
		    disabled: false
		}
	    ],
	    columns: [
		{
		    header: gettext('Node'),
		    width: 150,
		    dataIndex: 'name'
		},
		{
		    header: gettext('Role'),
		    width: 100,
		    dataIndex: 'type'
		},
		{
		    header: gettext('ID'),
		    width: 80,
		    dataIndex: 'cid'
		},
		{

		    header: gettext('IP'),
		    width: 150,
		    dataIndex: 'ip'
		},
	    ]
	}
    ]
});
