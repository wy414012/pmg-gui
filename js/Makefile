JSSRC= 				                 	\
	Utils.js					\
	LoginWindow.js					\
	ServerAdministration.js				\
	ObjectGroupList.js				\
	ObjectGroup.js					\
	ObjectGroupConfiguration.js			\
	RuleConfiguration.js				\
	SystemConfiguration.js				\
	MailProxyRelaying.js				\
	MailProxyPorts.js				\
	MailProxyOptions.js				\
	MailProxyTLS.js					\
	Transport.js					\
	MyNetworks.js					\
	RelayDomains.js					\
	MailProxyConfiguration.js			\
	SpamDetectorLanguages.js			\
	SpamDetectorOptions.js				\
	SpamQuarantineOptions.js			\
	SpamDetectorConfiguration.js			\
	VirusDetectorOptions.js				\
	VirusQuarantineOptions.js			\
	VirusDetectorConfiguration.js			\
	ConfigPanel.js					\
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



