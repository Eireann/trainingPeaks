define(
[
    "jquery",
    "TP",
    "views/calendar/library/exerciseDetailsView"
],
function(
         $,
         TP,
         ExerciseDetailsView
         )
{
    describe("ExerciseDetailsView", function()
    {

        var view, featureAuthorizer;
        beforeEach(function()
        {
            var originalModel = new TP.Model();
            var clonedModel = new TP.Model();
            sinon.stub(clonedModel, "fetch");
            sinon.stub(originalModel, "clone").returns(clonedModel);

            featureAuthorizer = {
                canAccessFeature: sinon.stub(),
                features: {
                    IsOwnerOrCoach: null
                }
            };
            featureAuthorizer.canAccessFeature.returns(false);

            view = new ExerciseDetailsView({ 
                model: originalModel,
                featureAuthorizer: featureAuthorizer
            });

        });

        it("Should render the exercise details", function()
        {
            view.model.set("itemName", "Test Exercise");
            view.model.set("totalTimePlanned", 2);
            view.render();

            expect(view.$("#itemNameField").val()).to.eql("Test Exercise");
            expect(view.$("#totalTimePlannedField").val()).to.eql("2:00:00");
        });

        describe("Editing", function()
        {

            it("Should render all inputs as readonly by default", function()
            {
                view.render();
                expect(view.$("input[readonly]").length).to.be.greaterThan(0);
                expect(view.$("input:not([readonly])").length).to.eql(0);
            });

            it("Should disable the edit button by default", function()
            {
                view.render();
                expect(view.$("button.edit").length).to.eql(1);
                expect(view.$("button.edit").is(":disabled")).to.be.ok;
            });

            it("Should disable the delete button by default", function()
            {
                view.render();
                expect(view.$("button.delete").length).to.eql(1);
                expect(view.$("button.delete").is(":disabled")).to.be.ok;
            });

            it("Should enable the delete button if the user can edit the library", function()
            {
                featureAuthorizer.canAccessFeature.returns(true);
                view.model.set("libraryOwnerId", 1);
                view.render();
                expect(view.$("button.delete").length).to.eql(1);
                expect(view.$("button.delete").is(":disabled")).to.not.be.ok;
            });

            it("Should enable the edit button if the user can edit the library, and it is not a structured workout", function()
            {
                featureAuthorizer.canAccessFeature.returns(true);
                view.model.set("libraryOwnerId", 1);
                view.model.set("isStructuredWorkout", false);
                view.render();
                expect(view.$("button.edit").length).to.eql(1);
                expect(view.$("button.edit").is(":disabled")).to.not.be.ok;
            });

            it("Should remove readonly attribute when edit is clicked", function()
            {
                featureAuthorizer.canAccessFeature.returns(true);
                view.model.set("libraryOwnerId", 1);
                view.model.set("isStructuredWorkout", false);
                view.render();
                view.$("button.edit").trigger("click");
                expect(view.$("input[readonly]").length).to.eql(0);
                expect(view.$("input:not([readonly])").length).to.be.greaterThan(0);
            });

        });

    });
});