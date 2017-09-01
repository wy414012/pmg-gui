Ext.define('PMG.SenderStatistics', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgSenderStatistics',

    title: gettext('Statistics') + ': ' + gettext('Sender'),

    tbar: [ { xtype: 'pmgStatTimeSelector' } ],

    layout: 'fit'


});


