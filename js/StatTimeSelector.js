Ext.define('PMG.StatTimeSelector', {
    extend: 'Ext.container.Container',
    xtype: 'pmgStatTimeSelector',

    statics: {
	selected_year: undefined,
	selected_month: undefined,
	selected_day: undefined,

	getTimeSpan: function() {
	    var year = this.selected_year;
	    var month = this.selected_month;
	    var day = this.selected_day;

	    var starttime, endtime, span;

	    if (!month) {
		starttime = new Date(year, 0);
		endtime = new Date(year + 1, 0);
	    } else if (!day) {
		starttime = new Date(year, month - 1);
		endtime = new Date(year, month);
	    } else {
		starttime = new Date(year, month - 1, day);
		endtime = new Date(year, month - 1, day + 1);
	    }

	    var data = {};

	    data.starttime = (starttime.getTime() / 1000).toFixed(0);
	    data.endtime = (endtime.getTime() / 1000).toFixed(0);

	    return data;
	},
    },

    layout: {
	type: 'hbox',
    },

    controller: {
	xclass: 'Ext.app.ViewController',

	updateVisibility: function() {
	    var view = this.getView();

	    var yearsel = this.lookupReference('yearsel');
	    var monthsel = this.lookupReference('monthsel');
	    var daysel = this.lookupReference('daysel');

	    var year = yearsel.getValue();
	    var month = monthsel.getValue();
	    daysel.setVisible(month !== 0);
	    if (!month) {
		daysel.setValue(0);
	    }
	    var day = daysel.getValue();

	    var statics = Ext.getClass(view);

	    statics.selected_year = year;
	    statics.selected_month = month;
	    statics.selected_day = day;

	    var data = statics.getTimeSpan();
	    Ext.GlobalEvents.fireEvent('pmgStatTimeSelectorUpdate', data);
	},

	onSelect: function() {
	    this.updateVisibility();
	},

	init: function(view) {
	    var statics = Ext.getClass(view);

	    var yearsel = this.lookupReference('yearsel');
	    var monthsel = this.lookupReference('monthsel');
	    var daysel = this.lookupReference('daysel');

	    yearsel.setValue(statics.selected_year);
	    monthsel.setValue(statics.selected_month);
	    daysel.setValue(statics.selected_month ? statics.selected_day : 0);

	    this.updateVisibility();
	},
    },

    items: [
	{
	    xtype: 'combobox',
	    reference: 'yearsel',
	    store: {
		fields: ['year'],
		data: (function() {
		    var today = new Date();
		    var year = today.getFullYear();
		    return [{ year: year }, { year: year -1 }, { year: year -2 }];
		}()),
	    },
	    listeners: { select: 'onSelect' },
	    value: new Date().getFullYear(),
	    queryMode: 'local',
	    displayField: 'year',
	    editable: false,
	    valueField: 'year',
	},
	{
	    xtype: 'combobox',
	    reference: 'monthsel',
	    store: {
		fields: ['month', 'name'],
		data: (function() {
		    var i;
		    var data = [{ month: 0, name: gettext('Whole year') }];
		    for (i = 1; i <= 12; i++) {
			data.push({ month: i, name: Ext.Date.monthNames[i-1] });
		    }
		    return data;
		}()),
	    },
	    listeners: { select: 'onSelect' },
	    queryMode: 'local',
	    displayField: 'name',
	    editable: false,
	    valueField: 'month',
	},
	{
	    xtype: 'combobox',
	    reference: 'daysel',
	    store: {
		fields: ['day', 'name'],
		data: (function() {
		    var i;
		    var data = [{ day: 0, name: gettext('Whole month') }];
		    for (i = 1; i <= 31; i++) {
			data.push({ day: i, name: i });
		    }
		    return data;
		}()),
	    },
	    listeners: { select: 'onSelect' },
	    queryMode: 'local',
	    displayField: 'name',
	    editable: false,
	    valueField: 'day',
	},
    ],
}, function() {
    var today = new Date();

    this.selected_year = today.getFullYear();
    this.selected_month = today.getMonth() + 1;
    this.selected_day = today.getDate();
});
