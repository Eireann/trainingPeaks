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
                sinon.stub(selectionManager, "copySelectionToClipboard");
                var e = new $.Event("keydown", { which: "C".charCodeAt(), ctrlKey: true });
                $body.trigger(e);
                expect(selectionManager.copySelectionToClipboard).to.have.been.called;
            });

            it("Cmd-C should cause copy", function()
            {
                sinon.stub(selectionManager, "copySelectionToClipboard");
                var e = new $.Event("keydown", { which: "C".charCodeAt(), metaKey: true });
                $body.trigger(e);
                expect(selectionManager.copySelectionToClipboard).to.have.been.called;
            });

            it("Ctrl-X should cause cut", function()
            {
                sinon.stub(selectionManager, "cutSelectionToClipboard");
                var e = new $.Event("keydown", { which: "X".charCodeAt(), ctrlKey: true });
                $body.trigger(e);
                expect(selectionManager.cutSelectionToClipboard).to.have.been.called;
            });

            it("Cmd-X should cause cut", function()
            {
                sinon.stub(selectionManager, "cutSelectionToClipboard");
                var e = new $.Event("keydown", { which: "X".charCodeAt(), metaKey: true });
                $body.trigger(e);
                expect(selectionManager.cutSelectionToClipboard).to.have.been.called;
            });

            it("Ctrl-V should cause paste", function()
            {
                sinon.stub(selectionManager, "pasteClipboardToSelection");
                var e = new $.Event("keydown", { which: "V".charCodeAt(), ctrlKey: true });
                $body.trigger(e);
                expect(selectionManager.pasteClipboardToSelection).to.have.been.called;
            });

            it("Cmd-V should cause paste", function()
            {
                sinon.stub(selectionManager, "pasteClipboardToSelection");
                var e = new $.Event("keydown", { which: "V".charCodeAt(), metaKey: true });
                $body.trigger(e);
                expect(selectionManager.pasteClipboardToSelection).to.have.been.called;
            });

            describe("When a modal view is open", function()
            {
                beforeEach(function()
                {
                    $("<div></div>").addClass("modalOverlayMask").appendTo($body);
                });

                it("Ctrl-C should not cause copy", function()
                {
                    sinon.stub(selectionManager, "copySelectionToClipboard");
                    var e = new $.Event("keydown", { which: "C".charCodeAt(), ctrlKey: true });
                    $body.trigger(e);
                    expect(selectionManager.copySelectionToClipboard).to.not.have.been.called;
                });

                it("Cmd-C should not cause copy", function()
                {
                    sinon.stub(selectionManager, "copySelectionToClipboard");
                    var e = new $.Event("keydown", { which: "C".charCodeAt(), metaKey: true });
                    $body.trigger(e);
                    expect(selectionManager.copySelectionToClipboard).to.not.have.been.called;
                });

                it("Ctrl-X should not cause cut", function()
                {
                    sinon.stub(selectionManager, "cutSelectionToClipboard");
                    var e = new $.Event("keydown", { which: "X".charCodeAt(), ctrlKey: true });
                    $body.trigger(e);
                    expect(selectionManager.cutSelectionToClipboard).to.not.have.been.called;
                });

                it("Cmd-X should not cause cut", function()
                {
                    sinon.stub(selectionManager, "cutSelectionToClipboard");
                    var e = new $.Event("keydown", { which: "X".charCodeAt(), metaKey: true });
                    $body.trigger(e);
                    expect(selectionManager.cutSelectionToClipboard).to.not.have.been.called;
                });

                it("Ctrl-V should not cause paste", function()
                {
                    sinon.stub(selectionManager, "pasteClipboardToSelection");
                    var e = new $.Event("keydown", { which: "V".charCodeAt(), ctrlKey: true });
                    $body.trigger(e);
                    expect(selectionManager.pasteClipboardToSelection).to.not.have.been.called;
                });

                it("Cmd-V should not cause paste", function()
                {
                    sinon.stub(selectionManager, "pasteClipboardToSelection");
                    var e = new $.Event("keydown", { which: "V".charCodeAt(), metaKey: true });
                    $body.trigger(e);
                    expect(selectionManager.pasteClipboardToSelection).to.not.have.been.called;
                });

            });

            describe("When an input is focused", function()
            {
                var $input;

                beforeEach(function()
                {
                    $input = $("<input type='text'/>");
                    $input.focus().appendTo($body);
                });

                it("Ctrl-C should not cause copy", function()
                {
                    sinon.stub(selectionManager, "copySelectionToClipboard");
                    var e = new $.Event("keydown", { which: "C".charCodeAt(), ctrlKey: true });
                    $input.trigger(e);
                    expect(selectionManager.copySelectionToClipboard).to.not.have.been.called;
                });

                it("Cmd-C should not cause copy", function()
                {
                    sinon.stub(selectionManager, "copySelectionToClipboard");
                    var e = new $.Event("keydown", { which: "C".charCodeAt(), metaKey: true });
                    $input.trigger(e);
                    expect(selectionManager.copySelectionToClipboard).to.not.have.been.called;
                });

                it("Ctrl-X should not cause cut", function()
                {
                    sinon.stub(selectionManager, "cutSelectionToClipboard");
                    var e = new $.Event("keydown", { which: "X".charCodeAt(), ctrlKey: true });
                    $input.trigger(e);
                    expect(selectionManager.cutSelectionToClipboard).to.not.have.been.called;
                });

                it("Cmd-X should not cause cut", function()
                {
                    sinon.stub(selectionManager, "cutSelectionToClipboard");
                    var e = new $.Event("keydown", { which: "X".charCodeAt(), metaKey: true });
                    $input.trigger(e);
                    expect(selectionManager.cutSelectionToClipboard).to.not.have.been.called;
                });

                it("Ctrl-V should not cause paste", function()
                {
                    sinon.stub(selectionManager, "pasteClipboardToSelection");
                    var e = new $.Event("keydown", { which: "V".charCodeAt(), ctrlKey: true });
                    $input.trigger(e);
                    expect(selectionManager.pasteClipboardToSelection).to.not.have.been.called;
                });

                it("Cmd-V should not cause paste", function()
                {
                    sinon.stub(selectionManager, "pasteClipboardToSelection");
                    var e = new $.Event("keydown", { which: "V".charCodeAt(), metaKey: true });
                    $input.trigger(e);
                    expect(selectionManager.pasteClipboardToSelection).to.not.have.been.called;
                });

            });
        });

        describe("Cut/Copy/Paste functionality", function()
        {

            var workout, metric;
            beforeEach(function()
            {
                calendarManager.loadActivities("2013-10-21", "2013-10-21");
                testHelpers.resolveRequests("GET", "2013-10-21", []);

                workout = new WorkoutModel({ workoutId: 1, workoutDay: "2013-10-22" });
                metric = new MetricModel({ id: 1, timeStamp: "2013-10-22T13:26:42" });

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

                testHelpers.resolveRequest("PUT", "workouts/1", {});
                testHelpers.resolveRequest("PUT", "timedmetrics/1", {});

                expect(workout.getCalendarDay()).to.eql("2013-10-25");
                expect(metric.getCalendarDay()).to.eql("2013-10-25");
                expect(metric.get("timeStamp")).to.eql("2013-10-25T13:26:42");

            });

            it("should copy, paste", function()
            {
                selectionManager.setSelection(calendarManager.days.get("2013-10-21"));
                selectionManager.setSelection(calendarManager.days.get("2013-10-23"), { shiftKey: true });

                selectionManager.copySelectionToClipboard();

                selectionManager.setSelection(calendarManager.days.get("2013-10-24"));
                selectionManager.pasteClipboardToSelection();

                testHelpers.resolveRequest("POST", "workouts", {});
                testHelpers.resolveRequest("POST", "timedmetrics", {});

                expect(workout.getCalendarDay()).to.eql("2013-10-22");
                expect(metric.getCalendarDay()).to.eql("2013-10-22");
                expect(metric.get("timeStamp")).to.eql("2013-10-22T13:26:42");

                expect(calendarManager.days.get("2013-10-25").itemsCollection.length).to.eql(2);

            });

            it("should cut, paste workouts", function()
            {
                selectionManager.setSelection(workout);
                selectionManager.cutSelectionToClipboard();

                selectionManager.setSelection(calendarManager.days.get("2013-10-24"));
                selectionManager.pasteClipboardToSelection();

                testHelpers.resolveRequest("PUT", "workouts/1", {});

                expect(workout.getCalendarDay()).to.eql("2013-10-24");
            });

            it("should cut, paste metircs", function()
            {
                selectionManager.setSelection(metric);
                selectionManager.cutSelectionToClipboard();

                selectionManager.setSelection(calendarManager.days.get("2013-10-24"));
                selectionManager.pasteClipboardToSelection();

                testHelpers.resolveRequest("PUT", "metrics/1", {});

                expect(metric.getCalendarDay()).to.eql("2013-10-24");
            });
            it("should copy, paste workouts", function()
            {
                selectionManager.setSelection(workout);
                selectionManager.copySelectionToClipboard();

                selectionManager.setSelection(calendarManager.days.get("2013-10-24"));
                selectionManager.pasteClipboardToSelection();

                testHelpers.resolveRequest("POST", "workouts", {});

                expect(workout.getCalendarDay()).to.eql("2013-10-22");
                expect(calendarManager.days.get("2013-10-24").itemsCollection.length).to.eql(1);
            });

            it("should cut, paste metircs", function()
            {
                selectionManager.setSelection(metric);
                selectionManager.copySelectionToClipboard();

                selectionManager.setSelection(calendarManager.days.get("2013-10-24"));
                selectionManager.pasteClipboardToSelection();

                testHelpers.resolveRequest("POST", "metrics", {});

                expect(metric.getCalendarDay()).to.eql("2013-10-22");
                expect(calendarManager.days.get("2013-10-24").itemsCollection.length).to.eql(1);
            });


        });

    });

});
