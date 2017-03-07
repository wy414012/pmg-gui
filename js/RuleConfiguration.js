Ext.define('PMG.RuleConfiguration', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pmgRuleConfiguration',

    title: gettext('Rules'),

    layout: { type: 'hbox', align: 'stretch' },
    border: false,

    initComponent : function() {
	var me = this;

	var left = Ext.create('PMG.RuleList', {
	    width: 300,
	    subject: me.title,
	    border: false
	});

	var right = Ext.create('PMG.RuleInfo', {
	    border: false,
	    flex: 1,
	    listeners: {
		dblclickRuleInfo: function(w, e, t, ruledata) {
		    // test if the correct groups is selected (just to be sure)
		    var rec = left.selModel.getSelection()[0];
		    if (rec && rec.data && rec.data.id === ruledata.id) {
			left.run_editor();
			return;
		    }
		}
	    }
	});

	me.mon(left.store, "refresh", function() {
	    right.reload();
	});

	me.mon(left.selModel, "selectionchange", function() {
	    var rec = left.selModel.getSelection()[0];
	    if (!(rec && rec.data && rec.data.id)) {
		right.setBaseUrl(undefined);
		return;
	    }
	    var baseurl = '/config/ruledb/rules/' + rec.data.id;
	    right.setBaseUrl(baseurl);
	});

	me.items = [ left, { xtype: 'splitter' }, right ];

	me.callParent();
    }
});
