git checkout test/specs && find test/specs -iname \*pec.js -exec sed -f jasmine-to-chai.sed -f jasmine-to-sinon.sed -i "" {} \; 
git checkout test/utils/sharedSpecs && find test/utils/sharedSpecs -iname \*.js -exec sed -f jasmine-to-chai.sed -f jasmine-to-sinon.sed -i "" {} \; 
 
