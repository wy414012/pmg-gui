Ext.define('PMG.grid.AttachmentGrid', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgAttachmentGrid',
    mixins: ['Proxmox.Mixin.CBind'],

    showDownloads: true,

    title: gettext('Attachments'),
    iconCls: 'fa fa-paperclip',

    minHeight: 50,
    maxHeight: 250,
    scrollable: true,
    collapsed: true,

    tools: [
	{
	    xtype: 'checkbox',
	    boxLabel: gettext('show all parts'),
	    boxLabelAlgign: 'before',
	    listeners: {
		change: function(cb, value) {
		    let grid = this.up('pmgAttachmentGrid');
		    let store = grid.getStore();
		    store.clearFilter();
		    if (!value) {
			store.filter({
			    property: 'content-disposition',
			    value: 'attachment',
			});
		    }
		},
	    },
	},
	{
	    type: 'down',
	    handler: function() {
		let me = this;
		let type = me.type === 'up' ? 'down' : 'up';
		me.up('pmgAttachmentGrid').toggleCollapse();
		me.setType(type);
	    },
	},
    ],

    header: {
	padding: '6 10 6 10', // make same height as normal panel
    },

    store: {
	autoDestroy: true,
	fields: ['name', 'content-type', 'size', 'content-disposition'],
	proxy: {
	    type: 'proxmox',
	},
	filters: {
	    property: 'content-disposition',
	    value: 'attachment',
	},
    },

    controller: {
	xclass: 'Ext.app.ViewController',
	init: function(view) {
	    view.store.on('load', this.onLoad, this);
	},
	onLoad: function(store, records, success) {
	    let me = this;
	    let view = me.getView();
	    if (!success) {
		view.updateTitleStats(-1);
		return;
	    }
	    let count = 0;
	    let totalSize = records.reduce((sum, { data }) => {
		if (data['content-disposition'] === 'attachment') {
		    count++;
		    return sum + data.size;
		}
		return sum;
	    }, 0);
	    view.updateTitleStats(count, totalSize);
	},
    },

    updateTitleStats: function(count, totalSize) {
	let me = this;
	let title;
	if (count > 0) {
	    title = Ext.String.format(gettext('{0} Attachments'), count);
	    title += ` (${Proxmox.Utils.format_size(totalSize)})`;
	    me.expand();
	} else {
	    title = gettext('No Attachments');
	    me.collapse();
	}
	me.setTitle(title);
    },

    setID: function(rec) {
	var me = this;
	if (!rec || !rec.data || !rec.data.id) {
	    me.getStore().removeAll();
	    return;
	}
	var url = '/api2/json/quarantine/listattachments?id=' + rec.data.id;
	me.mailid = rec.data.id;
	me.store.proxy.setUrl(url);
	me.store.load();
    },

    emptyText: gettext('No Attachments'),

    download: function() {
	Ext.Msg.alert(arguments);
    },

    columns: [
	{
	    text: gettext('Filename'),
	    dataIndex: 'name',
	    flex: 1,
	},
	{
	    text: gettext('Filetype'),
	    dataIndex: 'content-type',
	    renderer: PMG.Utils.render_filetype,
	    flex: 1,
	},
	{
	    text: gettext('Size'),
	    renderer: Proxmox.Utils.render_size,
	    dataIndex: 'size',
	    flex: 1,
	},
	{
	    header: gettext('Download'),
	    cbind: {
		hidden: '{!showDownloads}',
	    },
	    renderer: function(value, mD, rec) {
		var me = this;
		let url = `/api2/json/quarantine/download?mailid=${me.mailid}&attachmentid=${rec.data.id}`;
		return `<a target='_blank' class='download' download='${rec.data.name}' href='${url}'>
		    <i class='fa fa-fw fa-download'</i>
		</a>`;
	    },
	},
    ],
});
