Ext.define('PMG.QuarantineList', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgQuarantineList',

    emptyText: gettext('No E-Mail address selected'),
    viewConfig: {
	deferEmptyText: false
    },

    config: {
	emailSelection: false,
	notFoundText: gettext('No data in database.')
    },

    statics: {
	from: 0,
	to: 0
    },

    controller: {
	xclass: 'Ext.app.ViewController',

        init: function(view) {
	    var me = this;
	    if (PMG.view === 'quarantineview') {
		view.emailSelection = false;
		me.setEmptyText();
	    }
	    var emailCombobox = me.lookupReference('email');
	    emailCombobox.setVisible(view.emailSelection);
	    emailCombobox.setDisabled(!view.emailSelection);

	    var from;
	    if (PMG.QuarantineList.from != 0) {
		from = new Date(PMG.QuarantineList.from * 1000);
	    } else {
		from = new Date();
	    }

	    var to;
	    if (PMG.QuarantineList.to != 0) {
		to = new Date(PMG.QuarantineList.to * 1000);
	    } else {
		to = new Date();
	    }

	    // we to this to trigger the change event of those fields
	    me.lookupReference('from').setValue(from);
	    me.lookupReference('to').setValue(to);

	    Proxmox.Utils.monStoreErrors(view.getView(), view.getStore());
	    me.load(function() {
		if (view.cselect) {
		    view.setSelection(view.getStore().getById(view.cselect));
		}
	    });
        },
	// extjs has no method to dynamically change the emptytext on
	// grids, so we have to do it this way
	setEmptyText: function(emptyText) {
	    var me = this;
	    var view = me.getView();
	    var tableview = view.getView();
	    tableview.emptyText = '<div class="x-grid-empty">'+ (emptyText || view.notFoundText) + '</div>';
	},

	load: function(callback) {
	    var me = this;
	    var view = me.getView();
	    if (view.emailSelection) {
		if (!me.lookupReference('email').getSelection()) {
		    // if the combobox has no selection we do not reload
		    return;
		}
		me.setEmptyText();
	    }
	    view.getStore().load(callback);
	},

	setFrom: function(from) {
	    var me = this.getView();
	    var params = me.getStore().getProxy().getExtraParams();
	    params.starttime = from;
	    PMG.QuarantineList.from = from;
	    me.getStore().getProxy().setExtraParams(params);
	},

	setTo: function(to) {
	    var end_of_to = to + 24*60*60; // we want the end of the day
	    var me = this.getView();
	    var params = me.getStore().getProxy().getExtraParams();
	    params.endtime = end_of_to;
	    PMG.QuarantineList.to = to; // we save the start of the day here
	    me.getStore().getProxy().setExtraParams(params);
	},

	setUser: function(user) {
	    var me = this.getView();
	    var params = me.getStore().getProxy().getExtraParams();
	    params.pmail = user;
	    me.getStore().getProxy().setExtraParams(params);
	    me.user = user;
	},

	changeTime: function(field, value) {
	    var me = this;
	    var list = me.getView();

	    if (!value) {
		return;
	    }

	    var val = value.getTime()/1000;
	    var combobox = me.lookupReference('email');
	    var params = combobox.getStore().getProxy().getExtraParams();

	    var to = me.lookupReference('to');
	    var from = me.lookupReference('from');

	    if (field.name === 'from') {
		me.setFrom(val);
		params.starttime = val;
		to.setMinValue(value);

	    } else if (field.name === 'to') {
		me.setTo(val);
		params.endtime = val + 24*60*60;
		from.setMaxValue(value);
	    } else {
		return;
	    }

	    // the combobox does not know anything about the extraparams
	    // so we disable queryCaching until we expand (and query) again
	    combobox.queryCaching = false;
	    combobox.getStore().getProxy().setExtraParams(params);

	    me.load();
	},

	resetEmail: function() {
	    var me = this;
	    var view = me.getView();
	    if (view.emailSelection) {
		me.setUser(undefined);
	    }
	},

	changeEmail: function(tb, value) {
	    var me = this;
	    me.setUser(value);
	    me.load();
	},

	setQueryCaching: function() {
	    this.lookupReference('email').queryCaching = true;
	},

	control: {
	    '#':{
		beforedestroy: 'resetEmail',
	    },
	    'combobox[reference=email]': {
		change: {
		    fn: 'changeEmail',
		    buffer: 500
		},
		expand: 'setQueryCaching'
	    },
	    datefield: {
		change: {
		    fn: 'changeTime'
		}
	    }

	}
    },

    features: [
	{
	    ftype: 'grouping',
	    groupHeaderTpl: '{columnName}: {name} ({children.length})'
	}
    ],

    tbar: {
	layout: {
	    type: 'vbox',
	    align: 'stretch'
	},
	defaults: {
	    margin: 2
	},
	items: [
	    {
		fieldLabel: gettext('From'),
		reference: 'from',
		xtype: 'datefield',
		format: 'Y-m-d',
		name: 'from'
	    },
	    {
		fieldLabel: gettext('To'),
		reference: 'to',
		xtype: 'datefield',
		format: 'Y-m-d',
		name: 'to'
	    },
	    {
		xtype: 'combobox',
		hidden: true,
		displayField: 'mail',
		valueField: 'mail',
		listConfig: {
		    emptyText:
			'<div class="x-grid-empty">' +
			    gettext('No Data in Database') +
			'</div>'
		},
		store: {
		    proxy: {
			type: 'proxmox',
			url: '/api2/json/quarantine/spamusers'
		    },
		    fields: [
			{
			    name: 'mail',
			    renderer: Ext.htmlEncode
			}
		    ]
		},
		queryParam: false,
		queryCaching: false,
		editable: false,
		reference: 'email',
		name: 'email',
		fieldLabel: 'E-Mail'
	    }
	]
    }
});
