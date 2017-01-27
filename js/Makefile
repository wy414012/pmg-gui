JSSRC= 				                 	\
	Utils.js					\
	LoginWindow.js					\
	Workspace.js

lint: ${JSSRC}
	jslint ${JSSRC} 

pmgmanagerlib.js: ${JSSRC}
	cat ${JSSRC} >$@.tmp
	mv $@.tmp $@

all: pmgmanagerlib.js

.PHONY: clean
clean:
	find . -name '*~' -exec rm {} ';'	
	rm -rf pmgmanagerlib.js



