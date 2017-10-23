Ext.define('PMG.dashboard.MailProcessing', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgMailProcessing',

    setData: function(data) {
	var me = this;
	me.down('#ptime').update(data);
	me.down('#traffic').update(data);
    },

    layout: {
	type: 'hbox',
	align: 'center',
	pack: 'center'
    },

    defaults: {
	xtype: 'box',
	flex: 1,
	style: {
	    'text-align':'center'
	}
    },

    items: [
	{
	    itemId: 'traffic',
	    data: {
		in: 0,
		out: 0
	    },
	    tpl: [
		'<h3><i class="fa fa-exchange green"></i> ' + gettext('Traffic') + '</h3>',
		'<table class="dash"><tr>',
		'<td class="right half"><h2>{in}</h2></td>',
		'<td class="left">' + PMG.Utils.format_rule_direction(0) + '</td>',
		'</tr><tr>',
		'<td class="right half"><h2>{out}</h2></td>',
		'<td class="left">' + PMG.Utils.format_rule_direction(1) + '</td>',
		'</tr></table>',
	    ]
	},
	{
	    itemId: 'ptime',
	    data: {
		avgptime: 0,
	    },
	    tpl: [
		'<h3><i class="fa fa-clock-o"></i> ' + gettext('Avg. Processing Time') + '</h3>',
		'<p><h2>{ptime}</h2></p>'
	    ]
	}
    ]
});
