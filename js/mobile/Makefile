
# caution: order is important
MOBILESRC=				\
	  component.js			\
	  loginscreen.js		\
	  mailview.js			\
	  quarantineview.js		\
	  utils.js			\
	  app.js			\

pmgmanagerlib-mobile.js: ${MOBILESRC}
	cat $^ >$@.tmp
	mv $@.tmp $@

.PHONY: clean
clean:
	rm -rf pmgmanagerlib-mobile.js pmgmanagerlib-mobile.js.tmp
