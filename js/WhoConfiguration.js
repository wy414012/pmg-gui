Ext.define('PMG.WhoConfiguration', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pmgWhoConfiguration',

    ogclass: 'who',

    title: gettext('Who Objects'),

    layout: { type: 'hbox', align: 'stretch' },
    border: false,
    
    initComponent : function() {
	var me = this;

	var left = Ext.create('PMG.ObjectGroupList', {
	    width: 250,
	    ogclass: me.ogclass,
	    subject: me.title,
	    border: false
	});
	
	var right = Ext.create('PMG.ObjectGroup', {
	    otype_list: [1000, 1001, 1002, 1003, 1004],
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
	    right.setObjectInfo(rec.data);
	    var baseurl = '/config/ruledb/who/' + rec.data.id;
	    right.setBaseUrl(baseurl);
	});
	
	me.items = [ left, { xtype: 'splitter' }, right ];

	me.callParent();
    }
});
