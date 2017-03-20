Ext.define('PMG.RuleInfo', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.pmgRuleInfo',

    baseurl: undefined,

    ruledata: undefined,

    emptyText: gettext('Please select a rule.'),

    setBaseUrl: function(baseurl) {
	var me = this;

	me.baseurl = baseurl;

	me.reload();
    },

    reload: function() {
	var me = this;

	if (!me.baseurl) {
	    me.setRuleInfo(undefined);
	    return;
	}

	Proxmox.Utils.API2Request({
	    url: me.baseurl + "/config",
	    method: 'GET',
	    waitMsgTarget: me,
	    success: function(response, opts) {
		me.setRuleInfo(response.result.data);
	    },
	    failure: function (response, opts) {
		Ext.Msg.alert(gettext('Error'), response.htmlStatus);
	    }
	});
    },

    setRuleInfo: function(ruledata) {
	var me = this;

	me.ruledata = ruledata;

	me.down('#addFromButton').setDisabled(me.ruledata === undefined);
	me.down('#addToButton').setDisabled(me.ruledata === undefined);
	me.down('#addWhenButton').setDisabled(me.ruledata === undefined);
	me.down('#addWhatButton').setDisabled(me.ruledata === undefined);
	me.down('#addActionButton').setDisabled(me.ruledata === undefined);

	if (me.ruledata === undefined) {

	    me.store.setData([]);
	    me.down('#ruleinfo').update(me.emtpyText);
	    me.down('#ruledata').setHidden(true);

	} else {

	    var html = '<b>' + Ext.String.htmlEncode(me.ruledata.name) + '</b>';
	    html += '<br><br>';
	    html += 'Priority: ' +  me.ruledata.priority + '<br>';
	    html += 'Direction: ' + PMG.Utils.format_rule_direction(me.ruledata.direction) + '<br>';
	    html += 'Active: ' +  Proxmox.Utils.format_boolean(me.ruledata.active) + '<br>';

	    var data = [];
	    Ext.Array.each(['from', 'to', 'when', 'what', 'action'], function(oc) {
		var list = ruledata[oc];
		if (list === undefined) { return; }
		Ext.Array.each(list, function(og) {
		    data.push({ oclass: oc, name: og.name, id: og.id });
		});
	    });

	    me.store.setData(data);

	    me.down('#ruleinfo').update(html);
	    me.down('#ruledata').setHidden(false);
	}
    },

    initComponent : function() {
	var me = this;

	me.store = new Ext.data.Store({
	    fields: [ 'oclass', 'name' ]
	});

	me.columns = [
	    {
		header: gettext('Type'),
		dataIndex: 'oclass',
	    },
	    {
		header: gettext('name'),
		dataIndex: 'name',
		flex: 1
	    }
	];

	me.selModel = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = Ext.createWidget('proxmoxStdRemoveButton', {
	    selModel: me.selModel,
	    getUrl: function(rec) {
		return me.baseurl + '/' + rec.data.oclass + '/'+ rec.data.id;
	    },
	    callback: function() { me.reload(); },
	    getRecordName: function(rec) { return rec.data.name; },
	    waitMsgTarget: me
	});

	var add_object_group = function(url, ogroupId) {
	    Proxmox.Utils.API2Request({
		url: url,
		params: { ogroup: ogroupId },
		method: 'POST',
		waitMsgTarget: me,
		callback: function() {
		    me.reload();
		},
		failure: function (response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		}
	    });
	};

	me.dockedItems = [];

	me.dockedItems.push({
	    xtype: 'toolbar',
	    dock: 'top',
	    items: [
		{
		    text: gettext('From'),
		    disabled: true,
		    itemId: 'addFromButton',
		    handler: function() {
			var win = Ext.create('PMG.ObjectGroupSelector', {
			    rulegroup: 'from',
			    listeners: {
				selectObjectGroup: function(view, rec) {
				    win.destroy();
				    add_object_group(me.baseurl + '/from', rec.data.id);
				}
			    }
			});
			win.show();
		    }
		},
		{
		    text: gettext('To'),
		    disabled: true,
		    itemId: 'addToButton',
		    handler: function() {
			var win = Ext.create('PMG.ObjectGroupSelector', {
			    rulegroup: 'to',
			    listeners: {
				selectObjectGroup: function(view, rec) {
				    win.destroy();
				    add_object_group(me.baseurl + '/to', rec.data.id);
				}
			    }
			});
			win.show();
		    }
		},
		{
		    text: gettext('When'),
		    disabled: true,
		    itemId: 'addWhenButton',
		    handler: function() {
			var win = Ext.create('PMG.ObjectGroupSelector', {
			    rulegroup: 'when',
			    listeners: {
				selectObjectGroup: function(view, rec) {
				    win.destroy();
				    add_object_group(me.baseurl + '/when', rec.data.id);
				}
			    }
			});
			win.show();
		    }
		},
		{
		    text: gettext('What'),
		    disabled: true,
		    itemId: 'addWhatButton',
		    handler: function() {
			var win = Ext.create('PMG.ObjectGroupSelector', {
			    rulegroup: 'what',
			    listeners: {
				selectObjectGroup: function(view, rec) {
				    win.destroy();
				    add_object_group(me.baseurl + '/what', rec.data.id);
				}
			    }
			});
			win.show();
		    }
		},
		{
		    text: gettext('Action'),
		    disabled: true,
		    itemId: 'addActionButton',
		    handler: function() {
			var win = Ext.create('PMG.ObjectGroupSelector', {
			    rulegroup: 'action',
			    listeners: {
				selectObjectGroup: function(view, rec) {
				    win.destroy();
				    add_object_group(me.baseurl + '/action', rec.data.ogroup);
				}
			    }
			});
			win.show();
		    }
		},
		remove_btn
	    ]
	});

	me.dockedItems.push({
	    dock: 'top',
	    border: 1,
	    layout: 'anchor',
	    itemId: 'ruledata',
	    items: [
		{
		    xtype: 'component',
		    anchor: '100%',
		    itemId: 'ruleinfo',
		    style: { 'white-space': 'pre' },
		    padding: 10,
		    html: me.emptyText,
		    listeners: {
			dblclick: {
			    fn: function(e, t) {
				if (me.ruledata === undefined) { return; }
				me.fireEvent('dblclickRuleInfo', me, e, t, me.ruledata);
			    },
			    element: 'el',
			    scope: this,
			}
		    }
		}
	    ]
	});

	Ext.apply(me, {
	    listeners: {
		activate: function() { me.reload() }
	    }
	});

	me.callParent();

	if (me.baseurl) {
	    me.reload();
	}
    }
});
