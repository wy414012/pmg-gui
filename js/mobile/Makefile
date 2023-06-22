include ../../defines.mk

# caution: order is important
MOBILESRC=				\
	  prelude.js			\
	  component.js			\
	  loginscreen.js		\
	  mailview.js			\
	  quarantineview.js		\
	  utils.js			\
	  app.js			\

lint: pmgmanagerlib-mobile.js
	$(ESLINT) $^

.PHONY: check
check: lint

pmgmanagerlib-mobile.js: $(MOBILESRC)
	cat $^ >$@.tmp
	mv $@.tmp $@

.PHONY: clean
clean:
	rm -rf pmgmanagerlib-mobile.js pmgmanagerlib-mobile.js.tmp
