define(
[
    "backbone",
    "shared/utilities/collections/dateLikeCollection"
],
function(
    Backbone,
    DatelikeCollection
    )
{

    describe("DatelikeCollection", function()
    {
        var manager, model, collection;
        beforeEach(function()
        {
            manager = {
                ensure: function(){},
                ensureRange: function(){}
            };

            model = new Backbone.Model({ id: 10 });

            collection = new DatelikeCollection([model], {
                manager: manager,
                datelike: "day"
            });

        });

        it("Should require a manager and a datelike option", function()
        {
            var buildCollection = function()
            {
                return new DatelikeCollection([], {});
            };

            expect(buildCollection).to.throw();
        });

        describe("get", function()
        {

            it("Should accept an id or a model as input", function()
            {
                expect(collection.get(10)).to.eql(model);
                expect(collection.get(model)).to.eql(model);
            });

            it("Should call manager.ensure", function()
            {
                sinon.spy(manager, "ensure");
                collection.get(20);
                expect(manager.ensure).to.have.been.calledOnce;
            });

        });

        describe("prepareNext", function()
        {
            it("Should call manager.ensureRange", function()
            {
                sinon.spy(manager, "ensureRange");
                collection.prepareNext(10);
                expect(manager.ensureRange).to.have.been.calledOnce;
            });
        });

        describe("preparePrevious", function()
        {
            it("Should call manager.ensureRange", function()
            {
                sinon.spy(manager, "ensureRange");
                collection.preparePrevious(10);
                expect(manager.ensureRange).to.have.been.calledOnce;
            });
        });

    });

});
