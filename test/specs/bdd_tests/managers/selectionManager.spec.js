// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "moment",
    "models/workoutModel",
    "shared/models/metricModel"
],
function(
    $,
    testHelpers,
    xhrData,
    moment,
    WorkoutModel,
    MetricModel
)
{

    describe("SelectionManager (BDD)", function()
    {

        var selectionManager, calendarManager, $body;
        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            selectionManager = testHelpers.theApp.selectionManager;
            calendarManager = testHelpers.theApp.calendarManager;
            $body = testHelpers.theApp.getBodyElement();
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        describe("Cut/Copy/Paste key bindings", function()
        {

            it("Ctrl-C should cause copy", function()
            {
                spyOn(selectionManager, "copySelectionToClipboard");
                var e = new $.Event("keydown", { which: "C".charCodeAt(), ctrlKey: true });
                $body.trigger(e);
                expect(selectionManager.copySelectionToClipboard).toHaveBeenCalled();
            });

            it("Cmd-C should cause copy", function()
            {
                spyOn(selectionManager, "copySelectionToClipboard");
                var e = new $.Event("keydown", { which: "C".charCodeAt(), metaKey: true });
                $body.trigger(e);
                expect(selectionManager.copySelectionToClipboard).toHaveBeenCalled();
            });

            it("Ctrl-X should cause cut", function()
            {
                spyOn(selectionManager, "cutSelectionToClipboard");
                var e = new $.Event("keydown", { which: "X".charCodeAt(), ctrlKey: true });
                $body.trigger(e);
                expect(selectionManager.cutSelectionToClipboard).toHaveBeenCalled();
            });

            it("Cmd-X should cause cut", function()
            {
                spyOn(selectionManager, "cutSelectionToClipboard");
                var e = new $.Event("keydown", { which: "X".charCodeAt(), metaKey: true });
                $body.trigger(e);
                expect(selectionManager.cutSelectionToClipboard).toHaveBeenCalled();
            });

            it("Ctrl-V should cause paste", function()
            {
                spyOn(selectionManager, "pasteClipboardToSelection");
                var e = new $.Event("keydown", { which: "V".charCodeAt(), ctrlKey: true });
                $body.trigger(e);
                expect(selectionManager.pasteClipboardToSelection).toHaveBeenCalled();
            });

            it("Cmd-V should cause paste", function()
            {
                spyOn(selectionManager, "pasteClipboardToSelection");
                var e = new $.Event("keydown", { which: "V".charCodeAt(), metaKey: true });
                $body.trigger(e);
                expect(selectionManager.pasteClipboardToSelection).toHaveBeenCalled();
            });

        });

        xdescribe("Cut/Copy/Paste functionality", function()
        {

            var workout, metric;
            beforeEach(function()
            {
                calendarManager.loadActivities("2013-10-21", "2013-10-21");
                testHelpers.resolveRequests("GET", "2013-10-21", []);

                workout = new WorkoutModel({ workoutDay: "2013-10-22" });
                metric = new MetricModel({ timeStamp: "2013-10-22T13:26:42" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);
            });

            it("should cut, paste a backwards selection", function()
            {
                selectionManager.setSelection(calendarManager.days.get("2013-10-23"));
                selectionManager.setSelection(calendarManager.days.get("2013-10-21"), { shiftKey: true });

                selectionManager.cutSelectionToClipboard();

                selectionManager.setSelection(calendarManager.days.get("2013-10-24"));
                selectionManager.pasteClipboardToSelection();
                
                console.log(testHelpers.resolveRequests("POST", "workouts", {}));
                console.log(testHelpers.resolveRequests("POST", "timedmetrics", {}));

                expect(workout.getCalendarDay()).toEqual("2013-10-25");
                expect(metric.getCalendarDay()).toEqual("2013-10-25");
                expect(metric.get("timeStamp")).toEqual("2013-10-25T13:26:42");

            });


        });

    });

});
