requirejs(
[
    "jquery",
    "TP",
    "framework/tooltips",
    "views/expando/lapView"
],
function(
    $,
    TP,
    ToolTips,
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
        stateModel.addRange = jasmine.createSpy("add range");
        stateModel.removeRange = jasmine.createSpy("remove range");

        return new LapView({ 
            model: buildWorkoutModel(),
            stateModel: stateModel 
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
            expect(LapView).toBeDefined();
            expect(buildLapView).not.toThrow();
        });

        describe("Render", function()
        {

            it("Should set the highlight class if the model is not focused", function()
            {
                view.model.getState().set("isFocused", true);
                view.render();
                expect(view.$el.is(".highlight")).toBeTruthy();
            });

            it("Should not set the highlight class if the model is not focused", function()
            {
                view.render();
                expect(view.$el.is(".highlight")).toBeFalsy();
            });

            it("Should check the checkbox if the model is selected", function()
            {
                view.model.getState().set("isSelected", true);
                view.render();
                expect(view.$("input[type=checkbox]").is(":checked")).toBeTruthy();
            });

            it("Should not check the checkbox if the model is not selected", function()
            {
                view.render();
                expect(view.$("input[type=checkbox]").is(":checked")).toBeFalsy();
            });
        });

        describe("Focus", function()
        {
            it("Should add the highlight class when the model becomes focused", function()
            {
                view.render();
                view.model.getState().set("isFocused", true);
                expect(view.$el.is(".highlight")).toBeTruthy();
            });

            it("Should remove the highlight state when the model loses focus", function()
            {
                view.model.getState().set("isFocused", true);
                view.render();
                view.model.getState().set("isFocused", false);
                expect(view.$el.is(".highlight")).toBeFalsy();
            });

            it("Should tell state model to focus the model on click", function()
            {
                view.render();
                view.$(".lapDescription").trigger("click");
                expect(view.stateModel.get("primaryRange")).toBe(view.model);
            });
        });

        describe("Select", function()
        {
            it("Should check the checkbox when the model becomes selected", function()
            {
                view.render();
                view.model.getState().set("isSelected", true);
                expect(view.$("input[type=checkbox]").is(":checked")).toBeTruthy();
            });

            it("Should uncheck the checkbox when the model becomes unselected", function()
            {
                view.model.getState().set("isSelected", true);
                view.render();
                view.model.getState().set("isSelected", false);
                expect(view.$("input[type=checkbox]").is(":checked")).toBeFalsy();
            });

            it("Should add lap range to state model on checkbox click", function()
            {
                view.render();
                view.$("input[type=checkbox]").attr("checked", true).trigger("change");
                expect(view.stateModel.addRange).toHaveBeenCalledWith(view.model);
            });

            it("Should remove lap range from state model on checkbox click", function()
            {
                view.model.getState().set("isSelected", true);
                view.render();
                view.$("input[type=checkbox]").attr("checked", false).trigger("change");
                expect(view.stateModel.removeRange).toHaveBeenCalledWith(view.model);
            });
        });

        describe("Edit", function()
        {
            beforeEach(function()
            {
                view = buildLapView();
                spyOn(view.stateModel, "set").andCallFake(function(key, model)
                {
                    if(key === "primaryRange")
                    {
                        model.getState().set("isFocused", true);    
                    }
                });

                spyOn(ToolTips, "enableTooltips");
                spyOn(ToolTips, "disableTooltips");
            });

            it("Should make a lap editable on the second click", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                view.$(".lapDescription").trigger("click").trigger("click");
                expect(view.$(".editLapName input").length).toBe(1);
                expect(view.model.getState().get("isEditing")).toBeTruthy();
            });

            it("Should not make a lap editable on the first click", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                view.$(".lapDescription").trigger("click");
                expect(view.$(".editLapName input").length).toBe(0);
                expect(view.model.getState().get("isEditing")).toBeFalsy();
            });

            it("Should not make other ranges editable", function()
            {
                view.render();
                view.$(".lapDescription").trigger("click").trigger("click");
                expect(view.$(".editLapName input").length).toBe(0);
                expect(view.model.getState().get("isEditing")).toBeFalsy();
            });

            it("Should save name changes on blur", function()
            {
                view.model.getState().set("isLap", true);
                view.model.getState().set("isEditing", true);
                view.model.set("name", "Old Name");
                view.render();
                view.$(".editLapName input").val("New Name").trigger("blur");
                expect(view.model.get("name")).toBe("New Name");
                expect(view.model.getState().get("isEditing")).toBeFalsy();
            });

            it("Should save name changes on enter key", function()
            {
                view.model.getState().set("isLap", true);
                view.model.getState().set("isEditing", true);
                view.model.set("name", "Old Name");
                view.render();
                view.$(".editLapName input").val("New Name").trigger("enter");
                expect(view.model.get("name")).toBe("New Name");
                expect(view.model.getState().get("isEditing")).toBeFalsy();
            });

            it("Should cancel changes on cancel (escape key)", function()
            {
                view.model.getState().set("isLap", true);
                view.model.getState().set("isEditing", true);
                view.model.set("name", "Old Name");
                view.render();
                view.$(".editLapName input").val("New Name").trigger("cancel");
                expect(view.model.get("name")).toBe("Old Name");
                expect(view.model.getState().get("isEditing")).toBeFalsy();
            });

            it("Should render name changes triggered on the model", function()
            {
                view.model.set("name", "Old Name");
                view.render();
                view.model.set("name", "New Name");
                expect(view.$(".editLapName").text()).toEqual("New Name");
            });
        });

        describe("Delete", function()
        {
            it("Should have a delete icon for laps", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                expect(view.$(".delete").length).toBe(1);
            });

            it("Should not have a delete icon for other items", function()
            {
                view.render();
                expect(view.$(".delete").length).toBe(0);
            });

            it("Should display a confirmation on clicking the delete icon", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                view.$(".delete").trigger("click");
                expect(view.deleteConfirmationView).not.toBeNull();
            });

            it("Should delete the lap on user confirmation", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                view.$(".delete").trigger("click");
                view.deleteConfirmationView.trigger("userConfirmed");
                expect(view.model.getState().get("isDeleted")).toBeTruthy();
            });

            it("Should not delete the lap on user cancel", function()
            {
                view.model.getState().set("isLap", true);
                view.render();
                view.$(".delete").trigger("click");
                view.deleteConfirmationView.trigger("userCancelled");
                expect(view.model.getState().get("isDeleted")).toBeFalsy();
            });
        });
    });
});
