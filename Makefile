PACKAGE=proxmox-mailgateway-gui
PKGVER=1.0
PKGREL=1

DEB=${PACKAGE}_${PKGVER}-${PKGREL}_all.deb

DESTDIR=

DOCDIR=${DESTDIR}/usr/share/doc/${PACKAGE}

WWWBASEDIR=${DESTDIR}/usr/share/javascript/${PACKAGE}
WWWCSSDIR=${WWWBASEDIR}/css
WWWIMAGESDIR=${WWWBASEDIR}/images
WWWJSDIR=${WWWBASEDIR}/js

IMAGES=			\
	logo-128.png

all:

.PHONY: deb
deb ${DEB}:
	rm -rf build
	rsync -a * build
	cd build; dpkg-buildpackage -b -us -uc
	lintian ${DEB}

install: index.html
	install -d -m 755 ${WWWCSSDIR}
	install -d -m 755 ${WWWIMAGESDIR}
	install -d -m 755 ${WWWJSDIR}
	install -m 0644 index.html ${WWWBASEDIR}
	for i in ${IMAGES}; do install -m 0644 images/$$i  ${WWWIMAGESDIR}; done

.PHONY: upload
upload: ${DEB}
	# fixme	tar cf - ${DEB} | ssh repoman@repo.proxmox.com upload

distclean: clean
	rm -f examples/simple-demo.pem

clean:
	rm -rf ./build *.deb *.changes
	find . -name '*~' -exec rm {} ';'

.PHONY: dinstall
dinstall: ${DEB}
	dpkg -i ${DEB}
