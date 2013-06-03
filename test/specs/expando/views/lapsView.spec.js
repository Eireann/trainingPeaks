requirejs(
[
    "jquery",
    "TP",
    "views/expando/lapsView"
],
function(
    $,
    TP,
    LapsView
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

    describe("LapsView", function()
    {
        it("Should have a valid contructor", function()
        {
            expect(LapsView).toBeDefined();
            expect(function() { new LapsView({ model: buildWorkoutModel(), detailDataPromise: {} }); }).not.toThrow();
        });

        describe("Select peak type", function()
        {
            var lapsView, fakeHrPeak, fakeCadencePeak;

            beforeEach(function()
            {
                fakeHrPeak = { begin: 1200, end: 2400, interval: 120, value: 197 };
                fakeCadencePeak = { begin: 1900, end: 3100, interval: 120, value: 133 };
                lapsView = new LapsView({ model: buildWorkoutModel(), detailDataPromise: {} });
                lapsView.selectedPeakType = 'heartrate';
                spyOn(lapsView, "render");
                spyOn(lapsView, "selectEntireWorkout");
                spyOn(lapsView, "findPeak").andCallFake(function(peakType)
                {
                    return peakType === "heartrate" ? fakeHrPeak : fakeCadencePeak;
                });
            });

            it("Should trigger a rangeselected event when selecting a peak", function()
            {
                spyOn(lapsView, "trigger");
                lapsView.selectPeak('heartrate', 120, true, true);
                expect(lapsView.trigger).toHaveBeenCalled();
                expect(lapsView.trigger.calls[0].args[0]).toEqual("rangeselected");
                expect(lapsView.trigger.calls[0].args[2].addToSelection).toBe(true);
            });

            it("Should unselect all checked peaks on changing peak type", function()
            {
                lapsView.selectPeak('heartrate', 120, true, true);
                spyOn(lapsView, "trigger");
                lapsView.changePeakType('cadence');

                expect(lapsView.trigger).toHaveBeenCalled();
                expect(lapsView.trigger.callCount).toBe(2);

                console.log(lapsView.trigger.calls);
                expect(lapsView.trigger.calls[0].args[0]).toEqual("rangeselected");
                expect(lapsView.trigger.calls[0].args[1].get("begin")).toEqual(fakeHrPeak.begin);
                expect(lapsView.trigger.calls[0].args[1].get("end")).toEqual(fakeHrPeak.end);
                expect(lapsView.trigger.calls[0].args[2].removeFromSelection).toBe(true);

                expect(lapsView.trigger.calls[1].args[0]).toEqual("rangeselected");
                expect(lapsView.trigger.calls[1].args[1].get("begin")).toEqual(fakeCadencePeak.begin);
                expect(lapsView.trigger.calls[1].args[1].get("end")).toEqual(fakeCadencePeak.end);
                expect(lapsView.trigger.calls[1].args[2].addToSelection).toBe(true);
            });

            it("Should select the entire workout after changing peak type", function()
            {
                lapsView.changePeakType('cadence');
                expect(lapsView.selectEntireWorkout).toHaveBeenCalled();
            });
        });

    });
});