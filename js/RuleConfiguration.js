Ext.define('PMG.RuleConfiguration', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.pmgRuleConfiguration',

    title: gettext('Configuration') + ': ' +
	gettext('Rules'),
    rootVisible: false,

    baseurl: '/config/ruledb/rules',

    useArrows: true,
    rowLines: true,

    reload: function() {
	var me = this;

	Proxmox.Utils.API2Request({
	    url: me.baseurl,
	    method: 'GET',
	    waitMsgTarget: me,
	    success: function(response) {
		var data = response.result.data;
		var rulelist = [];
		var root = {
		    expanded: true,
		    children: rulelist
		};
		Ext.Array.each(data, function(rule) {
		    var entry = {
			text: rule.name,
			priority: rule.priority,
			active: rule.active,
			direction: rule.direction,
			children: [],
			expanded: false,
			leaf: true
		    };

		    var add_group = function(group, group_name) {

			var tmp = [];

			entry.leaf = false;
			entry.children.push({
			    text: group_name,
			    expanded: true,
			    leaf: false,
			    children: tmp
			});

			Ext.Array.each(group, function(obj) {
			    tmp.push({
				leaf: true,
				text: obj.name,
				info: obj.info
			    });
			});
		    };

		    if (rule.from) {
			add_group(rule.from, gettext('From'));
		    }
		    if (rule.to) {
			add_group(rule.to, gettext('To'));
		    }
		    if (rule.what) {
			add_group(rule.what, gettext('What'));
		    }
		    if (rule.when) {
			add_group(rule.when, gettext('When'));
		    }
		    if (rule.action) {
			add_group(rule.action, gettext('Action'));
		    }

		    rulelist.push(entry);
		});
		me.store.setRoot(root);
	    },
	    failure: function (response, opts) {
		me.store.setRoot({});
		Ext.Msg.alert(gettext('Error'), response.htmlStatus);
	    }
	});

    },

    initComponent : function() {
	var me = this;

	me.store = Ext.create('Ext.data.TreeStore', {});

	me.columns = [
	    {
		xtype: 'treecolumn',
		text: gettext('Name'),
		width: 300,
		sortable: true,
		dataIndex: 'text',
		locked: true
	    },
	    {
		text: gettext('Priority'),
		width: 80,
		dataIndex: 'priority',
		sortable: true
            },
	    {
		text: gettext('Active'),
		width: 80,
		dataIndex: 'active',
		sortable: true
            },
	    {
		text: gettext('Direction'),
		width: 80,
		dataIndex: 'direction',
		renderer: function(value) {
		    if (value === 0) {
			return 'in';
		    } else if (value === 1) {
			return 'out';
		    } else if (value === 2) {
			return 'inout';
		    } else {
			return value; // unknown
		    }
		},
		sortable: true
            },
	    {
		text: gettext('Description'),
		flex: 1,
		dataIndex: 'info',
		sortable: false
            }
	];

	me.callParent();

	me.reload();
    }
});
