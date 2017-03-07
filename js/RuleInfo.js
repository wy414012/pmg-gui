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
		me.down('#addFromButton').setDisabled(false);

	    },
	    failure: function (response, opts) {
		Ext.Msg.alert(gettext('Error'), response.htmlStatus);
	    }
	});
    },

    setRuleInfo: function(ruledata) {
	var me = this;

	me.ruledata = ruledata;

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

	var remove_btn = Ext.createWidget('proxmoxButton', {
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: me.selModel,
	    confirmMsg: function (rec) {
		return Ext.String.format(
		    gettext('Are you sure you want to remove entry {0}'),
		    "'" + rec.data.name + "'");
	    },
	    handler: function(btn, event, rec) {
		console.dir(rec.data);
		Proxmox.Utils.API2Request({
		    url: me.baseurl + '/' + rec.data.oclass + '/'+ rec.data.id,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			me.reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

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
			var win = Ext.create('Ext.window.Window', {
			    title: 'From',
			    width: 600,
			    layout: 'auto',
			    modal: true,
			    bodyPadding: 5,
			    items: {
				xtype: 'pmgObjectGroupList',
				enableButtons: false,
				ogclass: 'who',
				listeners: {
				    itemdblclick: function(view, rec) {
					console.log("ADD");
					console.dir(rec.data.id);
					win.destroy();
					Proxmox.Utils.API2Request({
					    url: me.baseurl + '/from',
					    params: { ogroup: rec.data.id },
					    method: 'POST',
					    waitMsgTarget: me,
					    callback: function() {
						me.reload();
					    },
					    failure: function (response, opts) {
						Ext.Msg.alert(gettext('Error'), response.htmlStatus);
					    }
					});
				    }
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
