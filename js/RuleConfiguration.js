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

	var right = Ext.create('Ext.panel.Panel', {
	    html: "test",
	    border: false,
	    flex: 1,
	    listeners: {
		dblclickOGInfo: function(w, e, t, ogdata) {
		    // test if the correct groups is selected (just to be sure)
		    var rec = left.selModel.getSelection()[0];
		    if (rec && rec.data && rec.data.id === ogdata.id) {
			left.run_editor();
			return;
		    }
		}
	    }
	});

	me.mon(left.selModel, "selectionchange", function() {
	    var rec = left.selModel.getSelection()[0];
	    if (!(rec && rec.data && rec.data.id)) {
		return;
	    }
	    return; // fixme
	    right.setObjectInfo(rec.data);
	    var baseurl = '/config/ruledb/rules/' + rec.data.id;
	    right.setBaseUrl(baseurl);
	});

	me.items = [ left, { xtype: 'splitter' }, right ];

	me.callParent();
    }
});
