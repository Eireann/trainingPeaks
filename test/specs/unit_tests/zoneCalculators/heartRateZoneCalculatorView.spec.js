requirejs(
[
    "jquery",
    "TP",
    "app",
    "shared/utilities/zoneCalculator",
    "shared/views/userSettings/heartRateZonesCalculatorView"
],
function (
    $,
    TP,
    theMarsApp,
    ZoneCalculator,
    HeartRateZonesCalculatorView
         )
{
    describe("Heart Rate Zone Calculator View", function()
    {

        describe("Render", function()
        {
            var view;

            beforeEach(function()
            {
                view = new HeartRateZonesCalculatorView({ model: new TP.Model({ threshold: 150 }) });
                view.render();
                view.$("select[name=calculatorType]").val("Lactate Threshold").trigger("change");
                view.$("select[name=calculatorDefinitionId]").val("1").trigger("change");
            });

            it("Should list some of the available calculator methods", function()
            {
                expect(view.$el.text()).toContain("Joe Friel for Cycling");
            });

            it("Should have a calculate button", function()
            {
                $calculate = view.$("button.calculate");
                expect($calculate.length).toBe(1);
            });

            it("Should request zone calculation after clicking on calculate", function()
            {
                var calculatorDeferred = new $.Deferred();
                spyOn(ZoneCalculator.prototype, "calculate").andReturn(calculatorDeferred);
                view.$("button.calculate").trigger("click");
                expect(ZoneCalculator.prototype.calculate).toHaveBeenCalled();
            });

            it("Should display some zones after the calculator finishes", function()
            {
                var zones = [
                    { label: "Test Zone 1", minimum: 1, maximum: 100 },
                    { label: "Test Zone 2", minimum: 101, maximum: 200 }
                ];


                spyOn(ZoneCalculator.prototype, "calculate").andCallFake(function(model)
                {
                    model.set("zones", zones);
                    var def = new $.Deferred();
                    def.resolve();
                    return def;
                });

                view.$("button.calculate").trigger("click");

                expect(view.$el.text()).toContain("Test Zone 1");
                expect(view.$el.text()).toContain("Test Zone 2");
            });
        });

    });

});