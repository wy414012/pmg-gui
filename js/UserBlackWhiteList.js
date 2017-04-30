Ext.define('PMG.UserBlacklist', {
    extend: 'Ext.panel.Panel',
     xtype: 'pmgUserBlacklist',

    title: gettext('Blacklist'),
    border: false,
 
    html: "Blacklist"    
});

Ext.define('PMG.UserWhitelist', {
    extend: 'Ext.panel.Panel',
    xtype: 'pmgUserWhitelist',

    title: gettext('Whitelist'),
    border: false,

    html: "Whitelist"    
});


