Ext.define('PMG.ReceiverStatistics', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgReceiverStatistics',

    title: gettext('Statistics') + ': ' + gettext('Receiver'),

    tbar: [ { xtype: 'pmgStatTimeSelector' } ],

    layout: 'fit'


});


