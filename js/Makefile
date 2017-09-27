JSSRC=							\
	Utils.js					\
	FilterProxy.js					\
	LoginView.js					\
	RoleSelector.js					\
	ServerStatus.js					\
	ServerAdministration.js				\
	LDAPProfileSelector.js				\
	LDAPGroupSelector.js				\
	LDAPGroupEditor.js				\
	LDAPUserSelector.js				\
	LDAPUserEditor.js				\
	RegexTester.js					\
	ObjectGroupList.js				\
	ObjectGroup.js					\
	ObjectGroupSelector.js				\
	ObjectGroupConfiguration.js			\
	ActionList.js					\
	RuleInfo.js					\
	RuleEditor.js					\
	Logo.js						\
	MainView.js					\
	SpamQuarantine.js				\
	UserBlackWhiteList.js				\
	QuarantineView.js				\
	Dashboard.js					\
	VersionInfo.js					\
	MailTracker.js					\
	NavigationTree.js				\
	RuleConfiguration.js				\
	SystemOptions.js				\
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
	ClamAVDatabase.js				\
	VirusDetectorConfiguration.js			\
	LDAPConfig.js					\
	UserEdit.js					\
	UserView.js					\
	UserManagement.js				\
	ViewMailHeaders.js				\
	PostfixQShape.js				\
	PostfixMailQueue.js				\
	QueueAdministration.js				\
	ClusterAdministration.js			\
	ConfigPanel.js					\
	StatTimeSelector.js				\
	StatStore.js					\
	MailStatGrid.js					\
	VirusCharts.js					\
	SpamScoreDistribution.js 			\
	GeneralMailStatistics.js			\
	RBLStatistics.js				\
	DomainStatistics.js				\
	SenderStatistics.js				\
	ReceiverStatistics.js				\
	ContactStatistics.js				\
	HourlyMailDistribution.js			\
	Application.js

OnlineHelpInfo.js: /usr/bin/asciidoc-pmg
	/usr/bin/asciidoc-pmg scan-extjs ${JSSRC} >$@.tmp
	mv $@.tmp $@

lint: ${JSSRC}
	jslint ${JSSRC} 

pmgmanagerlib.js: OnlineHelpInfo.js ${JSSRC}
	cat OnlineHelpInfo.js ${JSSRC} >$@.tmp
	mv $@.tmp $@

all: pmgmanagerlib.js

.PHONY: clean
clean:
	find . -name '*~' -exec rm {} ';'	
	rm -rf pmgmanagerlib.js OnlineHelpInfo.js



