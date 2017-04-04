Ext.define('PMG.image.Logo', {
    extend: 'Ext.Img',
    xtype: 'proxmoxlogo',

    height: 30,
    width: 172,
    src: '/pve2/images/proxmox_logo.png',
    alt: 'Proxmox',
    autoEl: {
	tag: 'a',
	href: 'https://www.proxmox.com',
	target: '_blank'
    }
});
