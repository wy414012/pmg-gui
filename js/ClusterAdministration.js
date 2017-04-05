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

Ext.define('PMG.ClusterAddNodeWindow', {
    extend: 'Ext.window.Window',
    xtype: 'pmgClusterAddNodeWindow',
    mixins: ['Proxmox.Mixin.CBind'],

    width: 800,

    modal: true,

    title: gettext('Cluster Join Information'),

    ipAddress: undefined,

    fingerprint: undefined,

    items: [
	{
	    xtype: 'component',
	    border: false,
	    padding: 10,
	    html: gettext("Please use the 'Join' button on the node you want to add, using the following IP address and fingerprint.")
	},
	{
	    xtype: 'container',
	    layout: 'form',
	    border: false,
	    padding: '0 10 10 10',
	    items: [
		{
		    xtype: 'textfield',
		    fieldLabel: gettext('IP Address'),
		    cbind: { value: '{ipAddress}' },
		    editable: false
		},
		{
		    xtype: 'textfield',
		    fieldLabel: gettext('Fingerprint'),
		    cbind: { value: '{fingerprint}' },
		    editable: false
		}
	    ]
	}
    ]
});

Ext.define('PMG.ClusterAdministration', {
    extend: 'Ext.tab.Panel',
    xtype: 'pmgClusterAdministration',

    title: gettext('Cluster Administration'),

    border: false,
    defaults: { border: false },

    viewModel: {
	parent: null,
	data: {
	    nodecount: 0,
	    master: undefined
	}
    },

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
		    var vm = this.getViewModel();
		    vm.set('nodecount', records.length);

		    var master = undefined;
		    Ext.Array.each(records, function(ni) {
			if (ni.data.type === 'master') {
			    master = ni;
			}
		    });
		    vm.set('master', master);
		},

		onAdd: function() {
		    var vm = this.getViewModel();

		    var win = Ext.create('PMG.ClusterAddNodeWindow', {
			ipAddress: vm.get('master').get('ip'),
			fingerprint: vm.get('master').get('fingerprint')
		    });

		    win.show();
		}
	    },
	    store: {
		autoLoad: true,
		model: 'pmg-cluster'
	    },
	    tbar: [
		{
		    text: gettext('Create'),
		    reference: 'createButton',
		    bind: {
			disabled: '{nodecount}'
		    }
		},
		{
		    text: gettext('Add'),
		    reference: 'addButton',
		    handler: 'onAdd',
		    bind: {
			disabled: '{!master}'
		    }
		},
		{
		    text: gettext('Join'),
		    reference: 'joinButton',
		    bind: {
			disabled: '{nodecount}'
		    }
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
