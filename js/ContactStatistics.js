Ext.define('PMG.ContactStatistics', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgContactStatistics',

    title: gettext('Statistics') + ': ' + gettext('Contact'),

    tbar: [ { xtype: 'pmgStatTimeSelector' } ],

    layout: 'fit'


});


