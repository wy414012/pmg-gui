Ext.define('PMG.QuarantineList', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgQuarantineList',

    emptyText: gettext('No E-Mail address selected'),
    viewConfig: {
	deferEmptyText: false,
    },

    config: {
	emailSelection: false,
	notFoundText: gettext('No data in database'),
    },

    statics: {
	from: 0,
	to: 0,
    },

    allowPositionSave: false,

    controller: {
	xclass: 'Ext.app.ViewController',

        init: function(view) {
	    let me = this;
	    if (PMG.view === 'quarantineview') {
		view.emailSelection = false;
		me.setEmptyText();
	    }
	    let emailCombobox = me.lookupReference('email');
	    emailCombobox.setVisible(view.emailSelection);
	    emailCombobox.setDisabled(!view.emailSelection);

	    let from;
	    if (PMG.QuarantineList.from !== 0) {
		from = new Date(PMG.QuarantineList.from * 1000);
	    } else {
		from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	    }

	    let to;
	    if (PMG.QuarantineList.to !== 0) {
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
	// ExtJS cannot dynamically change the emptyText on grids, so implement ourself
	setEmptyText: function(emptyText) {
	    let me = this;
	    let view = me.getView();
	    let tableview = view.getView();
	    tableview.emptyText = `<div class="x-grid-empty">${emptyText || view.notFoundText}</div>`;
	},

	load: function(callback) {
	    let me = this;
	    me.allowPositionSave = false;
	    let view = me.getView();
	    let store = view.getStore();
	    if (view.emailSelection) {
		if (!me.lookupReference('email').getSelection()) {
		    return; // if the combobox has no selection we do not reload
		}
		me.setEmptyText();
	    }
	    store.load(function() {
		if (me.savedPosition !== undefined) {
		    if (store.getCount() - 1 < me.savedPosition) {
			me.savedPosition = store.getCount() - 1;
		    }
		    view.setSelection(store.getAt(me.savedPosition));
		} else {
		    view.setSelection();
		}
		if (Ext.isFunction(callback)) {
		    callback();
		}
		me.allowPositionSave = true;
	    });
	},

	setFrom: function(from) {
	    let view = this.getView();
	    let params = view.getStore().getProxy().getExtraParams();
	    params.starttime = from;
	    PMG.QuarantineList.from = from;
	    view.getStore().getProxy().setExtraParams(params);
	},

	setTo: function(to) {
	    let end_of_to = to + 24*60*60; // we want the end of the day
	    let view = this.getView();
	    let params = view.getStore().getProxy().getExtraParams();
	    params.endtime = end_of_to;
	    PMG.QuarantineList.to = to; // we save the start of the day here
	    view.getStore().getProxy().setExtraParams(params);
	},

	setUser: function(user) {
	    let view = this.getView();
	    let params = view.getStore().getProxy().getExtraParams();
	    params.pmail = user;
	    view.getStore().getProxy().setExtraParams(params);
	    view.user = user;
	},

	changeTime: function(field, value) {
	    let me = this;

	    me.allowPositionSave = false;
	    me.savedPosition = undefined;

	    if (!value) {
		return;
	    }

	    let val = value.getTime() / 1000;
	    let combobox = me.lookupReference('email');
	    let params = combobox.getStore().getProxy().getExtraParams();

	    let to = me.lookupReference('to');
	    let from = me.lookupReference('from');

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

	    combobox.getStore().getProxy().setExtraParams(params);
	    combobox.getStore().load();

	    me.load();
	},

	resetEmail: function() {
	    let me = this;
	    let view = me.getView();
	    if (view.emailSelection) {
		me.setUser(undefined);
	    }
	},

	changeEmail: function(tb, value) {
	    let me = this;
	    me.savedPosition = undefined;
	    me.allowPositionSave = false;
	    me.setUser(value);
	    me.load();
	},

	savePosition: function(grid, selected, eopts) {
	    let me = this;
	    if (!me.allowPositionSave) {
		return;
	    }
	    if (!selected.length) {
		me.savedPosition = undefined;
		return;
	    }

	    let view = me.getView();
	    let id = view.getStore().indexOf(selected[0]);

	    me.savedPosition = id;
	},

	updateFilter: function(field) {
	    let me = this;
	    let view = me.getView();
	    let store = view.getStore();
	    let sm = view.getSelectionModel();

	    let searchValue = field.getValue().toLowerCase();

	    // supress store event if not empty, let filterBy below trigger it to avoid glitches
	    store.clearFilter(searchValue.length > 0);
	    field.triggers.clear.setVisible(searchValue.length > 0);

	    if (searchValue.length === 0) {
		return;
	    }

	    const selected = sm.getSelection();
	    const selectedRecordId = selected.length === 1 ? selected[0].id : null;
	    let clearSelectedMail = true;
	    let toDeselect = [];
	    store.filterBy(function(record) {
		let match = false;

		Ext.each(['subject', 'from'], function(property) {
		    if (record.data[property] === null) {
			return;
		    }

		    let v = record.data[property].toString();
		    if (v !== undefined) {
			v = v.toLowerCase();
			if (v.includes(searchValue)) {
			    match = true;
			    if (record.id === selectedRecordId) {
				clearSelectedMail = false;
			    }
			}
		    }
		});
		if (!match && sm.isSelected(record)) {
		    toDeselect.push(record);
		}
		return match;
	    });
	    if (toDeselect.length > 0) {
		sm.deselect(toDeselect);
	    }
	    if (selectedRecordId !== null && clearSelectedMail) {
		view.setSelection();
	    }
	},

	control: {
	    '#': {
		beforedestroy: 'resetEmail',
		selectionchange: 'savePosition',
	    },
	    'combobox[reference=email]': {
		change: 'changeEmail',
	    },
	    datefield: {
		change: {
		    fn: 'changeTime',
		},
	    },

	},
    },

    features: [
	{
	    ftype: 'grouping',
	    groupHeaderTpl: '{columnName}: {name} ({children.length})',
	},
    ],

    tbar: {
	layout: {
	    type: 'vbox',
	    align: 'stretch',
	},
	defaults: {
	    margin: 2,
	},
	items: [
	    {
		xtype: 'datefield',
		name: 'from',
		fieldLabel: gettext('Since'),
		reference: 'from',
		format: 'Y-m-d',
	    },
	    {
		xtype: 'datefield',
		name: 'to',
		fieldLabel: gettext('Until'),
		reference: 'to',
		format: 'Y-m-d',
	    },
	    {
		xtype: 'combobox',
		hidden: true,
		displayField: 'mail',
		valueField: 'mail',
		listConfig: {
		    emptyText:
			'<div class="x-grid-empty">' +
			    gettext('No data in database') +
			'</div>',
		},
		store: {
		    proxy: {
			type: 'proxmox',
			url: '/api2/json/quarantine/spamusers',
		    },
		    fields: [
			{
			    name: 'mail',
			    renderer: Ext.htmlEncode,
			},
		    ],
		},
		queryMode: 'local',
		editable: true,
		typeAhead: true,
		forceSelection: true,
		autoSelect: true,
		anyMatch: true,
		selectOnFocus: true,
		reference: 'email',
		fieldLabel: 'E-Mail',
	    },
	    {
		xtype: 'textfield',
		name: 'filter',
		fieldLabel: gettext('Search'),
		emptyText: gettext('Subject, Sender'),
		enableKeyEvents: true,
		triggers: {
		    clear: {
			cls: 'pmx-clear-trigger',
			weight: -1,
			hidden: true,
			handler: function() {
			    let me = this;
			    me.setValue('');
			    // setValue does not results in a keyup event, so trigger manually
			    me.up('grid').getController().updateFilter(me);
			},
		    },
		},
		listeners: {
		    buffer: 500,
		    keyup: 'updateFilter',
		},
	    },
	],
    },
});
