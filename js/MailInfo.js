Ext.define('PMG.MailInfoBox', {
    extend: 'Ext.container.Container',
    xtype: 'pmgMailInfo',

    cls: 'x-toolbar-default',
    style: {
	'border-left': '0px',
	'border-right': '0px',
    },

    update: function(data) {
	let me = this;
	let escaped = {};
	for (const [key, value] of Object.entries(data)) {
	    escaped[key] = Ext.htmlEncode(value);
	}
	me.items.each((item) => item.update(escaped));
    },

    layout: {
	type: 'vbox',
	align: 'stretch',
    },

    defaults: {
	xtype: 'tbtext',
    },

    items: [
	{ tpl: `<b>${gettext("From")}:</b> {from}` },
	{ tpl: `<b>${gettext("Subject")}:</b> {subject}` },
    ],
});
