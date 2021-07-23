Ext.define('PMG.NodeInfoPanel', {
    extend: 'Proxmox.panel.StatusView',
    alias: 'widget.pmgNodeInfoPanel',

    layout: {
	type: 'table',
	columns: 2,
	tableAttrs: {
	    style: {
		width: '100%',
	    },
	},
    },

    defaults: {
	xtype: 'pmxInfoWidget',
	padding: '0 10 5 10',
    },

    items: [
	{
	    itemId: 'nodecpu',
	    iconCls: 'fa fa-fw pmx-itype-icon-processor pmx-icon',
	    title: gettext('CPU usage'),
	    valueField: 'cpu',
	    maxField: 'cpuinfo',
	    renderer: Proxmox.Utils.render_node_cpu_usage,
	},
	{
	    itemId: 'wait',
	    iconCls: 'pmx-icon-size fa fa-fw fa-clock-o',
	    title: gettext('IO delay'),
	    valueField: 'wait',
	},
	{
	    xtype: 'box',
	    colspan: 2,
	    padding: '0 0 20 0',
	},
	{
	    iconCls: 'fa fa-fw pmx-itype-icon-memory pmx-icon',
	    itemId: 'memory',
	    title: gettext('RAM usage'),
	    valueField: 'memory',
	    maxField: 'memory',
	    renderer: Proxmox.Utils.render_node_size_usage,
	},
	{
	    itemId: 'load',
	    iconCls: 'pmx-icon-size fa fa-fw fa-tasks',
	    title: gettext('Load average'),
	    printBar: false,
	    textField: 'loadavg',
	},
	{
	    iconCls: 'pmx-icon-size fa fa-fw fa-hdd-o',
	    itemId: 'rootfs',
	    title: gettext('HD space') + ' (root)',
	    valueField: 'rootfs',
	    maxField: 'rootfs',
	    renderer: Proxmox.Utils.render_node_size_usage,
	},
	{
	    iconCls: 'pmx-icon-size fa fa-fw fa-refresh',
	    itemId: 'swap',
	    printSize: true,
	    title: gettext('SWAP usage'),
	    valueField: 'swap',
	    maxField: 'swap',
	    renderer: Proxmox.Utils.render_node_size_usage,
	},
	{
	    xtype: 'box',
	    colspan: 2,
	    padding: '0 0 20 0',
	},
	{
	    itemId: 'cpus',
	    colspan: 2,
	    printBar: false,
	    title: gettext('CPU(s)'),
	    textField: 'cpuinfo',
	    renderer: Proxmox.Utils.render_cpu_model,
	    value: '',
	},
	{
	    itemId: 'kversion',
	    colspan: 2,
	    title: gettext('Kernel Version'),
	    printBar: false,
	    textField: 'kversion',
	    value: '',
	},
	{
	    xtype: 'pmxNodeInfoRepoStatus',
	    itemId: 'repositoryStatus',
	    product: 'Proxmox Mail Gateway',
	    repoLink: '#pmgServerAdministration:aptrepositories',
	},
    ],

    updateTitle: function() {
	var me = this;
	var uptime = Proxmox.Utils.render_uptime(me.getRecordValue('uptime'));
	me.setTitle(Proxmox.NodeName + ' (' + gettext('Uptime') + ': ' + uptime + ')');
    },

    initComponent: function() {
	let me = this;

	me.rstore = Ext.create('Proxmox.data.ObjectStore', {
	    interval: 3000,
	    url: '/api2/json/nodes/localhost/status',
	    autoStart: true,
	});

	me.callParent();

	me.on('destroy', function() { me.rstore.stopUpdate(); });
    },
});
