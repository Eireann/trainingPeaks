define(
[
    "jquery",
    "TP",
    "views/expando/lapView"
],
function(
    $,
    TP,
    LapView
    )
{

    function buildWorkoutModel()
    {
        return new TP.Model({
            id: 1234,
            details: new TP.Model(),
            detailData: new TP.Model({
                totalStats: {},
                lapsStats: []
            })
        });
    }

    function buildLapView() {
        var stateModel = new TP.Model();
        stateModel.addRange = sinon.stub();
        stateModel.removeRange = sinon.stub();

        return new LapView({ 
            model: buildWorkoutModel(),
            stateModel: stateModel,
            featureAuthorizer: {
                runCallbackOrShowUpgradeMessage: function(feature, callback){return callback();},
                canAccessFeature: function(){return true;},
                features: {
                    ViewGraphRanges: null
                }
            }
        });
    }

    describe("LapView", function()
    {

        var view;

        beforeEach(function()
        {
            view = buildLapView();
        });

        it("Should have a valid contructor", function()
        {
            expect(LapView).to.not.be.undefined;
            expect(buildLapView).to.not.throw();
        });

        describe("Render", function()
        {

            it("Should set the highlight class if the model is not focused", function()
            {
                view.model.getState().set("isFocused", true);
                view.render();
                expect(view.$el.is(".highlight")).to.be.ok;
            });

            it("Should not set the highlight class if the model is not focused", function()
            {
                view.render();
                expect(view.$el.is(".highlight")).to.not.be.ok;
            });

            it("Should check the checkbox if the model is selected", function()
            {
                view.model.getState().set("isSelected", true);
                view.render();
                expect(view.$("input[type=checkbox]").is(":checked")).to.be.ok;
            });

            it("Should not check the checkbox if the model is not selected", function()
            {
                view.render();
                expect(view.$("input[type=checkbox]").is(":checked")).to.not.be.ok;
            });
        });

        describe("Focus", function()
        {
            it("Should add the highlight class when the model becomes focused", function()
            {
                view.render();
                view.model.getState().set("isFocused", true);
                expect(view.$el.is(".highlight")).to.be.ok;
            });

            it("Should remove the highlight state when the model loses focus", function()
            {
                view.model.getState().set("isFocused", true);
                view.render();
                view.model.getState().set("isFocused", false);
                expect(view.$el.is(".highlight")).to.not.be.ok;
            });

            it("Should tell state model to focus the model on click", function()
            {
                view.render();
                view.$(".lapDescription").trigger("click");
                expect(view.stateModel.get("primaryRange")).to.equal(view.model);
            });
        });

        describe("Select", function()
        {
            it("Should check the checkbox when the model becomes selected", function()
            {
                view.render();
                view.model.getState().set("isSelected", true);
                expect(view.$("input[type=checkbox]").is(":checked")).to.be.ok;
            });

            it("Should uncheck the checkbox when the model becomes unselected", function()
            {
                view.model.getState().set("isSelected", true);
                view.render();
                view.model.getState().set("isSelected", false);
                expect(view.$("input[type=checkbox]").is(":checked")).to.not.be.ok;
            });

            it("Should add lap range to state model on checkbox click", function()
            {
                view.render();
                view.$("input[type=checkbox]").attr("checked", true).trigger("change");
                expect(view.stateModel.addRange).to.have.been.calledWith(view.model);
            });

            it("Should remove lap range from state model on checkbox click", function()
            {
                view.model.getState().set("isSelected", true);
                view.render();
                view.$("input[type=checkbox]").attr("checked", false).trigger("change");
                expect(view.stateModel.removeRange).to.have.been.calledWith(view.model);
            });
        });

        describe("Edit", function()
        {
            beforeEach(function()
            {
                view = buildLapView();
                sinon.stub(view.stateModel, "set", function(key, model)
                {
                    if(key === "primaryRange")
                    {
                        model.getState().set("isFocused", true);    
                    }
                });
            });

            it("Should make a lap editable on the second click", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                view.$el.trigger("click").trigger("click");
                expect(view.$el.is(".editing")).to.be.ok;
                expect(view.model.getState().get("isEditing")).to.be.ok;
            });

            it("Should not make a lap editable on the first click", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                view.$el.trigger("click");
                expect(view.$el.is(".editing")).to.not.be.ok;
                expect(view.model.getState().get("isEditing")).to.not.be.ok;
            });

            it("Should not make other ranges editable", function()
            {
                view.render();
                view.$el.trigger("click").trigger("click");
                expect(view.$el.is(".editing")).to.not.be.ok;
                expect(view.model.getState().get("isEditing")).to.not.be.ok;
            });

            it("Should save name changes on blur", function()
            {
                view.model.getState().set("isLap", true);
                view.model.set("name", "Old Name");
                view.render();
                view.$el.trigger("click").trigger("click");
                view.$("input.lapName").val("New Name").trigger("blur");
                expect(view.model.get("name")).to.equal("New Name");
                expect(view.model.getState().get("isEditing")).to.not.be.ok;
            });

            it("Should save name changes on enter key", function()
            {
                view.model.getState().set("isLap", true);
                view.model.set("name", "Old Name");
                view.render();
                view.$el.trigger("click").trigger("click");
                view.$("input.lapName").val("New Name").trigger("enter");
                expect(view.model.get("name")).to.equal("New Name");
                expect(view.model.getState().get("isEditing")).to.not.be.ok;
            });

            it("Should cancel changes on cancel (escape key)", function()
            {
                view.model.getState().set("isLap", true);
                view.model.set("name", "Old Name");
                view.render();
                view.$("input.lapName").val("New Name").trigger("cancel");
                expect(view.model.get("name")).to.equal("Old Name");
                expect(view.model.getState().get("isEditing")).to.not.be.ok;
            });

            it("Should render name changes triggered on the model", function()
            {
                view.model.set("name", "Old Name");
                view.render();
                view.model.set("name", "New Name");
                expect(view.$("span.lapName").text()).to.contain("New Name");
            });
        });

        describe("Delete", function()
        {
            it("Should have a delete icon for laps", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                expect(view.$(".delete").length).to.equal(1);
            });

            it("Should not have a delete icon for other items", function()
            {
                view.render();
                expect(view.$(".delete").length).to.equal(0);
            });

            it("Should display a confirmation on clicking the delete icon", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                view.$(".delete").trigger("click");
                expect(view.deleteConfirmationView).to.not.be.null;
            });

            it("Should delete the lap on user confirmation", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                view.$(".delete").trigger("click");
                view.deleteConfirmationView.trigger("userConfirmed");
                expect(view.model.getState().get("isDeleted")).to.be.ok;
            });

            it("Should not delete the lap on user cancel", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                view.$(".delete").trigger("click");
                view.deleteConfirmationView.trigger("userCancelled");
                expect(view.model.getState().get("isDeleted")).to.not.be.ok;
            });
        });
    });
});
