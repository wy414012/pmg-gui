/*global Proxmox*/
/*jslint confusion: true*/
/* bind is a function function */
Ext.define('PMG.RuleInfo', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgRuleInfo',

    controller: {
	xclass: 'Ext.app.ViewController',

	setBaseUrl: function(baseurl) {
	    var me = this;
	    me.getViewModel().set('baseurl', baseurl);
	    me.reload();
	},

	reload: function() {
	    var me = this;
	    var viewmodel = me.getViewModel();
	    var baseurl = viewmodel.get('baseurl');

	    if (!baseurl) {
		me.setRuleInfo(undefined);
		return;
	    }

	    Proxmox.Utils.API2Request({
		url: baseurl + "/config",
		method: 'GET',
		success: function(response, opts) {
		    me.setRuleInfo(response.result.data);
		},
		failure: function (response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		}
	    });
	},

	removeObjectGroup: function(rec) {
	    var me = this;
	    Ext.Msg.confirm(
		gettext('Confirm'),
		Ext.String.format(
		    gettext('Are you sure you want to remove entry {0}'),
		    "'" + rec.data.name + "'"),
		function(button) {
		    if (button === 'yes') {
			Proxmox.Utils.API2Request({
			    url: me.getViewModel().get('baseurl') + '/' + rec.data.oclass + '/'+ rec.data.typeid,
			    method: 'DELETE',
			    waitMsgTarget: me.getView(),
			    callback: function() {
				me.reload();
			    },
			    failure: function (response, opts) {
				Ext.Msg.alert(gettext('Error'), response.htmlStatus);
			    }
			});
		    }
		}
	    );
	},

	addObjectGroup: function(type, record) {
	    var me = this;
	    var baseurl = me.getViewModel().get('baseurl');
	    var url = baseurl + '/' + type;
	    var id = (type === 'action')?record.data.ogroup:record.data.id;
	    Proxmox.Utils.API2Request({
		url: url,
		params: { ogroup: id },
		method: 'POST',
		waitMsgTarget: me.getView(),
		callback: function() {
		    me.reload();
		},
		failure: function (response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		}
	    });
	},

	setRuleInfo: function(ruledata) {
	    var me = this;

	    var viewmodel = me.getViewModel();

	    if (ruledata === undefined) {

		viewmodel.set('selectedRule', null);
		viewmodel.get('objects').setData([]);

	    } else {

		ruledata.name = Ext.String.htmlEncode(ruledata.name);
		viewmodel.set('selectedRule', ruledata);

		var data = [];
		Ext.Array.each(['from', 'to', 'when', 'what', 'action'], function(oc) {

		    var store = viewmodel.get(oc + 'objects');
		    if (ruledata[oc] === undefined || store === undefined) { return; }

		    // we build a filter for the objects,
		    // which are already added to the rule,
		    // so what we only show the ones,
		    // which are still available

		    var ids = Ext.Array.pluck(ruledata[oc], 'id');
		    // for the actions, we have a different id field
		    var idField = (oc === 'action')?'ogroup':'id';
		    store.clearFilter();
		    store.addFilter({
			filterFn:function(record){
			    // FIXME
			    // actions have the ogroup as a string
			    // -> parseInt
			    return (ids.indexOf(parseInt(record.data[idField])) === -1);
			}
		    });
		    store.load();
		    Ext.Array.each(ruledata[oc], function(og) {
			data.push({ oclass: oc, name: og.name, typeid: og.id });
		    });
		});

		viewmodel.get('objects').setData(data);
	    }
	},

	removeIconClick: function(gridView, rowindex, colindex, button, event, record) {
	    var me = this;
	    me.removeObjectGroup(record);
	},

	removeDrop: function(gridView, data, overModel) {
	    var me = this;
	    var record = data.records[0]; // only one
	    me.removeObjectGroup(record);
	    return true;
	},

	addIconClick: function(gridView, rowindex, colindex, button, event, record) {
	    var me = this;
	    me.addObjectGroup(gridView.panel.type, record);
	    return true;
	},

	addDrop: function(gridView, data, overModel) {
	    var me = this;
	    var record = data.records[0]; // only one
	    me.addObjectGroup(data.view.panel.type, record);
	    return true;
	},

	control: {
	    'grid[reference=usedobjects]': {
		drop: 'addDrop'
	    },
	    'tabpanel[reference=availobjects] > grid': {
		drop: 'removeDrop'
	    }
	}
    },

    viewModel: {
	data: {
	    baseurl: undefined
	},

	stores: {
	    objects: {
		fields: ['oclass', 'name', 'typeid'],
		groupField: 'oclass',
		sorters: 'name'
	    },

	    actionobjects: {
		model: 'pmg-action-list',
		proxy: {
		    type: 'proxmox',
		    url: "/api2/json/config/ruledb/action/objects"
		},
		sorters: 'name'
	    },
	    fromobjects: {
		model: 'pmg-object-group',
		proxy: {
		    type: 'proxmox',
		    url: "/api2/json/config/ruledb/who"
		},
		sorters: 'name'
	    },
	    toobjects: {
		model: 'pmg-object-group',
		proxy: {
		    type: 'proxmox',
		    url: "/api2/json/config/ruledb/who"
		},
		sorters: 'name'
	    },
	    whatobjects: {
		model: 'pmg-object-group',
		proxy: {
		    type: 'proxmox',
		    url: "/api2/json/config/ruledb/what"
		},
		sorters: 'name'
	    },
	    whenobjects: {
		model: 'pmg-object-group',
		proxy: {
		    type: 'proxmox',
		    url: "/api2/json/config/ruledb/when"
		},
		sorters: 'name'
	    }
	}
    },


    defaults: {
	padding: '5 10 5 10'
    },

    bodyPadding: '5 0 5 0',

    layout: {
	type: 'vbox',
	align: 'stretch'
    },

    scrollable: true,

    items: [
	{
	    xtype: 'panel',
	    bodyPadding: '10 10 10 10',
	    data: {
		name: ''
	    },
	    bind: {
		data: {
		    name: '{selectedRule.name}',
		    priority: '{selectedRule.priority}',
		    active: '{selectedRule.active}',
		    direction: '{selectedRule.direction}',
		    selected: '{selectedRule}'
		}
	    },
	    tpl: [
		'<tpl if="selected">',
		'<b>{name}</b><br><br>',
		'Priority: {priority}<br>',
		'Direction: {[PMG.Utils.format_rule_direction(values.direction)]}<br>',
		'Active: {[Proxmox.Utils.format_boolean(values.active)]}<br>',
		'<tpl else>',
		gettext('Please select a rule.'),
		'</tpl>'
	    ]
	},
	{
	    xtype: 'grid',
	    reference: 'usedobjects',
	    hidden: true,
	    emptyText: gettext('No Objects'),
	    features: [{
		id: 'group',
		ftype: 'grouping',
		enableGroupingMenu: false,
		collapsible: false,
		groupHeaderTpl: [
		    '{[PMG.Utils.format_oclass(values.name)]}'
		]
	    }],

	    title: gettext('Used Objects'),

	    viewConfig: {
		plugins: {
		    ptype: 'gridviewdragdrop',
		    copy: true,
		    dragGroup: 'usedobjects',
		    dropGroup: 'unusedobjects',

		    // do not show default grid dragdrop behaviour
		    dropZone: {
			indicatorHtml: '',
			indicatorCls: '',
			handleNodeDrop: Ext.emptyFn
		    }
		}
	    },

	    columns: [
		{
		    header: gettext('Type'),
		    dataIndex: 'oclass',
		    hidden: true
		},
		{
		    header: gettext('Name'),
		    dataIndex: 'name',
		    flex: 1
		},
		{
		    text: '',
		    xtype: 'actioncolumn',
		    align: 'center',
		    width: 40,
		    items: [
			{
			    iconCls: 'fa fa-fw fa-minus-circle',
			    tooltip: gettext('Remove'),
			    handler: 'removeIconClick'
			}
		    ]
		}
	    ],

	    bind: {
		store: '{objects}',
		hidden: '{!selectedRule}'
	    }
	},
	{
	    xtype: 'tabpanel',
	    title: gettext('Available Objects'),
	    reference: 'availobjects',
	    hidden: true,
	    bind: {
		hidden: '{!selectedRule}'
	    },
	    defaults: {
		xtype: 'grid',
		emptyText: gettext('No Objects'),
		viewConfig: {
		    plugins: {
			ptype: 'gridviewdragdrop',
			dragGroup: 'unusedobjects',
			dropGroup: 'usedobjects',

			// do not show default grid dragdrop behaviour
			dropZone: {
			    indicatorHtml: '',
			    indicatorCls: '',
			    handleNodeDrop: Ext.emptyFn
			}
		    }
		},
		columns: [
		    {
			header: gettext('Name'),
			dataIndex: 'name',
			flex: 1
		    },
		    {
			text: '',
			xtype: 'actioncolumn',
			align: 'center',
			width: 40,
			items: [
			    {
				iconCls: 'fa fa-fw fa-plus-circle',
				tooltip: gettext('Add'),
				handler: 'addIconClick'
			    }
			]
		    }
		]
	    },
	    items: [
		{
		    title: gettext('Action'),
		    bind: {
			store: '{actionobjects}'
		    },
		    type: 'action',
		    iconCls: 'fa fa-flag'
		},
		{
		    title: gettext('From'),
		    iconCls: 'fa fa-user-circle',
		    type: 'from',
		    bind: {
			store: '{fromobjects}'
		    }
		},
		{
		    title: gettext('To'),
		    iconCls: 'fa fa-user-circle',
		    type: 'to',
		    bind: {
			store: '{toobjects}'
		    }
		},
		{
		    title: gettext('What'),
		    iconCls: 'fa fa-cube',
		    type: 'what',
		    bind: {
			store: '{whatobjects}'
		    }
		},
		{
		    title: gettext('When'),
		    iconCls: 'fa fa-clock-o',
		    type: 'when',
		    bind: {
			store: '{whenobjects}'
		    }
		}
	    ]
	}
    ]
});
