Ext.define('PMG.grid.AttachmentGrid', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'pmgAttachmentGrid',

    store: {
	autoDestroy: true,
	fields: ['name', 'content-type', 'size'],
	proxy: {
	    type: 'proxmox',
	},
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
	alert(arguments);
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
	    renderer: Proxmox.Utils.format_size,
	    dataIndex: 'size',
	    flex: 1,
	},
	{
	    header: gettext('Download'),
	    renderer: function(value, mD, rec) {
		var me = this;
		let url = '/api2/json/quarantine/download';
		url += '?mailid=' + me.mailid;
		url += '&attachmentid=' + rec.data.id;
		return "<a target='_blank' class='download' download='"+ rec.data.name +"' href='" +
		url + "'><i class='fa fa-fw fa-download'</i></a>";
	    },
	},
    ],
});
