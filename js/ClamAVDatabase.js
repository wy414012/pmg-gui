Ext.define('PMG.ClamAVDatabaseConfig', {
    extend: 'Proxmox.grid.ObjectGrid',
    alias: ['widget.pmgClamAVDatabaseConfig'],

    initComponent : function() {
	var me = this;

	me.add_text_row('dbmirror', gettext('Database Mirror'),
			{ deleteEmpty: true, defaultValue: 'database.clamav.net' });

	var baseurl = '/config/clamav';

	Ext.apply(me, {
	    url: '/api2/json' + baseurl,
	    editorConfig: {
		url: '/api2/extjs' + baseurl,
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
    }
});
Ext.define('pmg-clamav-dbstat', {
    extend: 'Ext.data.Model',
    fields: [ 'name', 'type', 'build_time', 'version',
	      { name: 'nsigs', type: 'integer' }],
    idProperty: 'name'
});

Ext.define('PMG.ClamAVDatabaseStatus', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pmgClamAVDatabaseStatus'],

    title: gettext('Status'),

    reload: function() {
	var me = this;

        me.store.load();
    },

    initComponent : function() {
	var me = this;

	me.store = new Ext.data.Store({
	    model: 'pmg-clamav-dbstat',
	    proxy: {
		type: 'proxmox',
		url: "/api2/json/nodes/" + Proxmox.NodeName + "/clamav/dbstat"
	    },
	    sorters: {
		property: 'name',
		order: 'DESC'
	    }
	});

	Proxmox.Utils.monStoreErrors(me, me.store);

	Ext.apply(me, {
	    viewConfig: {
		trackOver: false
	    },
	    columns: [
		{
		    header: gettext('Name'),
		    sortable: true,
		    flex: 1,
		    dataIndex: 'name'
		},
		{
		    header: gettext('Build time'),
		    sortable: true,
		    flex: 2,
		    dataIndex: 'build_time'
		},
		{
		    header: gettext('Version'),
		    flex: 1,
		    sortable: true,
		    dataIndex: 'version'
		},
		{
		    header: gettext('Signatures'),
		    flex: 1,
		    sortable: true,
		    dataIndex: 'nsigs'
		},
	    ]
	});
	me.callParent();

	me.reload();
    }
});

Ext.define('PMG.ClamAVDatabase', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.pmgClamAVDatabase'],

    layout: { type: 'vbox', align: 'stretch' },

    initComponent : function() {
	var me = this;

	var selModel = Ext.create('Ext.selection.RowModel', {});
	var editPanel = Ext.create('PMG.ClamAVDatabaseConfig', {
	    border: false,
	    xtype: 'pmgClamAVDatabaseConfig',
	    selModel: selModel
	});

	me.tbar = [
	    {
		text: gettext('Edit'),
		xtype: 'proxmoxButton',
		disabled: true,
		handler: function() { editPanel.run_editor() },
		selModel: selModel
            },
	    {
		text: gettext('Update now'),
		handler: function() {
		    console.log("run update");
		}
	    }
	];

	me.items = [
	    editPanel,
	    {
		border: false,
		xtype: 'pmgClamAVDatabaseStatus'
	    }
	];

	me.callParent();

    }
});
