s/spyOn(\([^)]*\)).andReturn(/sinon.stub(\1).returns(/g

s/spyOn(\([^)]*\)).andCallFake(/sinon.stub(\1, /g
s/spyOn(\([^)]*\)).andCallThrough()/sinon.spy(\1)/g

s/jasmine.createSpy(\([^)]*\)).andCallFake(/sinon.spy(/g
s/jasmine.createSpy().andReturn(/sinon.stub().returns(/g
s/jasmine.createSpy().andReturn(/sinon.stub().returns(/g

s/spyOn(\([^)]*\))/sinon.stub(\1)/g
s/jasmine.createSpy(\([^)]*\))/sinon.stub()/g
s/jasmine.createSpyObj/createSpyObj/g
s/.andReturn(/.returns(/g
s/.mostRecentCall/.lastCall/g
s/.calls\[\([^\]]*\)]/.getCall(\1)/g
