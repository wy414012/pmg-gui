Ext.define('PMG.RoleSelector', {
    extend: 'Proxmox.form.KVComboBox',
    alias: 'widget.pmgRoleSelector',

    comboItems: [
	['admin', gettext('Administrator')],
	['qmanager', gettext('Quarantine Manager')],
	['audit', gettext('Auditor')]
    ]
});
