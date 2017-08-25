Ext.define('pmg-spam-level-distribution', {
    extend: 'Ext.data.Model',
    fields: [
	'level', 'count',
	{
	    type: 'string',
	    name: 'label',
	    convert: function(v, rec) {
		if (rec.data.level >= 10) {
		    return 'Level >= 10';
		} else {
		    return 'Level ' + rec.data.level;
		}
	    }
	}
    ],
    proxy: {
	type: 'proxmox',
	url: "/api2/json/statistics/spam"
    },
    idProperty: 'level'
});

Ext.define('PMG.SpamLevelChart1', {
    extend: 'Ext.chart.CartesianChart',
    xtype: 'pmgSpamLevelChart1',

    title: gettext('Spam Level Distribution'),
    height: 350,

    animation: false,
    flipXY: true,
    store: {
	autoLoad: true,
	model: 'pmg-spam-level-distribution'
    },  

    //define the x and y-axis configuration.
    axes: [{
	type: 'numeric',
	position: 'bottom',
	title: 'Count',
	grid: true,
	minimum: 0
    }, {
	type: 'category',
	position: 'left'
    }],

    //define the actual bar series.
    series: [{
	type: 'bar',
	xField: 'label',
	yField: 'count',
	axis: 'bottom'
    }]
});

Ext.define('PMG.SpamLevelChart', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgSpamLevelChart',
	    
    disableSelection: true,
    hideHeaders: true,

    title: gettext('Spam Level Distribution'),
    
    store: {
	autoLoad: true,
	model: 'pmg-spam-level-distribution'
    },  

    columns: [
	{
	    flex: 1,
	    dataIndex: 'label'
	},
	{
	    width: 150,
	    dataIndex: 'count'
	},
    ]
});

Ext.define('PMG.VirusTop10', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgVirusTop10',

    title: gettext('Virus Charts (Top 10)'),
    
    disableSelection: true,

    emptyText: gettext('No virus names in database.'),
    viewConfig: {
	deferEmptyText: false
    },

    store: {
	fields: [ 'name', 'count' ],
	proxy: {
            type: 'proxmox',
	    url: "/api2/json/statistics/virus"
	},
    },

    columns: [
	{
	    header: gettext('Name'),
	    flex: 1,
	    dataIndex: 'name'
	},
	{
	    header: gettext('Count'),
	    width: 150,
	    dataIndex: 'count'
	}
    ]
});

Ext.define('PMG.MailStatGrid', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgMailStatGrid',
	    
    disableSelection: true,
    hideHeaders: true,

    store: {
	fields: [ 'name', 'value', 'percentage' ],
    },

    columns: [
	{
	    flex: 1,
	    dataIndex: 'name'
	},
	{
	    width: 150,
	    dataIndex: 'value'
	},
	{
	    width: 300,
	    
	    xtype: 'widgetcolumn',
	    dataIndex: 'percentage',
	    widget: {
		xtype: 'progressbarwidget',
		textTpl: ['{percent:number("0")}%' ]
	    },

	    onWidgetAttach: function (column, widget, rec) {
		if (rec.data.percentage === undefined) {
		    widget.setStyle("visibility: hidden");
		} else {
		    widget.setStyle("visibility: visible");
		}
	    }
	}
    ]
});

Ext.define('PMG.MailTrafficStatistics', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgMailTrafficStatistics',

    title: gettext('Mail'),

    border: false,
    scrollable: true,
    
    bodyPadding: '0 0 10 0',
    defaults: {
	collapsible: true,
	animCollapse: false,
	margin: '10 10 0 10'
    },

    controller: {
	xclass: 'Ext.app.ViewController',

	getJunkData: function(data) {
	    var res = [];

	    res.push({
		name: gettext("Incoming Mails"),
		value: data.count_in,
		percentage: 1
	    });
	    
	    res.push({
		name: gettext("Junk Mails"),
		value: data.junk_in,
		percentage: data.junk_in/data.count_in
	    });
	    
	    res.push({
		name: gettext("Greylisted Mails"),
		value: data.glcount,
		percentage: data.glcount/data.count_in
	    });

	    res.push({
		name: gettext("Spam Mails"),
		value: data.spamcount_in,
		percentage: data.spamcount_in/data.count_in
	    });

	    res.push({
		name: gettext("SPF rejects"),
		value: data.spfcount,
		percentage: data.spfcount/data.count_in
	    });

	    res.push({
		name: gettext("Virus Mails"),
		value: data.viruscount,
		percentage: data.viruscount/data.count_in
	    });

	    return res;
	},
	    
	getGeneralData: function(data) {
	    var res = [];

	    res.push({
		name: gettext("Total Mails"),
		value: data.count,
		percentage: 1
	    });
	    
	    res.push({
		name: gettext("Incoming Mails"),
		value: data.count_in,
		percentage: data.count_in/data.count
	    });

	    res.push({
		name: gettext("Outgoing Mails"),
		value: data.count_out,
		percentage: data.count_out/data.count
	    });
	    
	    res.push({
		name: gettext("Virus Outbreaks"),
		value: data.viruscount_out
	    });
	    
	    res.push({
		name: gettext("Avg. Mail Precessing Time"),
		value: Ext.String.format(gettext("{0} seconds"),
					 Ext.Number.toFixed(data.avptime, 2))
	    });

	    res.push({
		name: gettext("Incoming Mail Traffic"),
		value: Ext.Number.toFixed(data.traffic_in/(1024*1024), 2) + ' MByte'
	    });

	    res.push({
		name: gettext("Outgoing Mail Traffic"),
		value: Ext.Number.toFixed(data.traffic_out/(1024*1024), 2) + ' MByte'
	    });
	    return res;
	},
	
	onReload: function() {
	    var controller = this;
	    var view = this.getView();
	    var generalGrid = this.lookupReference('general')
	    var junkGrid = this.lookupReference('junk')
	    Proxmox.Utils.API2Request({
		url: '/api2/extjs/statistics/mail',
		method: 'GET',
		success: function(response) {
		    generalGrid.store.setData(controller.getGeneralData(response.result.data));
		    junkGrid.store.setData(controller.getJunkData(response.result.data));
		},
		failure: function(response, opts) {
		    Proxmox.Utils.setErrorMask(view, response.htmlStatus);
		    generalGrid.store.setData([]);
		    junkGrid.store.setData([]);
		}
	    });
	},
	
	init: function(view) {
	    this.onReload();
	}
    },

    items: [
	{
	    xtype: 'pmgMailStatGrid',
	    title: gettext('General Mail Statistics'),
	    reference: 'general',
	},
	{
	    xtype: 'pmgMailStatGrid',
	    title: gettext('Junk Mail Statistics'),
	    reference: 'junk',
	},
	{
	    xtype: 'pmgSpamLevelChart1',
	},
	{
	    xtype: 'pmgSpamLevelChart',
	},
	{
	    xtype: 'pmgVirusTop10',
	}   
    ]
});

Ext.define('PMG.SpamMailStatistics', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgSpamMailStatistics',

    title: gettext('Spam'),

    border: false


});

Ext.define('PMG.VirusMailStatistics', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgVirusMailStatistics',

    title: gettext('Virus'),

    border: false

});

Ext.define('PMG.MailStatistics', {
    extend: 'Ext.tab.Panel',
    xtype: 'pmgMailStatistics',

    border: false,

    title: 'General Mail Statistics',


    items: [
	{
	    xtype: 'pmgMailTrafficStatistics',
	    itemId: 'mail'
	},
	{
	    xtype: 'pmgSpamMailStatistics',
	    itemId: 'spam'
	},
 	{
	    xtype: 'pmgVirusMailStatistics',
	    itemId: 'virus'
	}
   ]
});
