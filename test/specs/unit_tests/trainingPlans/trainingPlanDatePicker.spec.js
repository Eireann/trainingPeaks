define(
[
    "moment",
    "views/calendar/library/trainingPlanDatePickerView",
    "models/library/trainingPlan",
    "models/library/trainingPlanDetails"
],
function(
    moment,
    TrainingPlanDatePickerView,
    TrainingPlan,
    TrainingPlanDetails

)
{

    // dateOptions: 1 = start, 3 = end, 2 = end on event date
    describe("Training Plan Date Picker", function()
    {

        describe("Without date restrictions", function()
        {
            var view;
            beforeEach(function()
            {
                var model = new TrainingPlan();

                view = new TrainingPlanDatePickerView({ model: model });
                view.render();
            });

            it("Should not disable the datepicker", function()
            {
                expect(view.$(".datepicker").attr("disabled")).to.not.be.ok;
            });

            it("Shouild default to today's date", function()
            {
                var pickerDate = view.$(".datepicker").datepicker("getDate");
                expect(moment(pickerDate).format("YYYY-MM-DD")).to.eql(moment().format("YYYY-MM-DD"));
            });

            it("Should have start and end options", function()
            {
                expect(view.$(".dateOptions option").length).to.eql(2);
                expect(view.$(".dateOptions option[value=1]").length).to.eql(1);
                expect(view.$(".dateOptions option[value=3]").length).to.eql(1);
                expect(view.$(".dateOptions option[value=2]").length).to.eql(0);
            });

            it("Should not disable date options", function()
            {
                expect(view.$(".dateOptions").attr("disabled")).to.not.be.ok;
            });
        });

        describe("Dynamic Plans", function()
        {
            var view;
            beforeEach(function()
            {
                var model = new TrainingPlan();
                model.details.set({
                    isDynamic: true,
                    startDate: "2014-01-01T00:00:00"
                });

                view = new TrainingPlanDatePickerView({ model: model });
                view.render();
            });

            it("Should disable the datepicker", function()
            {
                expect(view.$(".datepicker").attr("disabled")).to.be.ok;
            });

            it("Shouild default to start date", function()
            {
                var pickerDate = view.$(".datepicker").datepicker("getDate");
                expect(moment(pickerDate).format("YYYY-MM-DD")).to.eql("2014-01-01");
            });

            it("Should have start option only", function()
            {
                expect(view.$(".dateOptions option").length).to.eql(1);
                expect(view.$(".dateOptions option[value=1]").length).to.eql(1);
                expect(view.$(".dateOptions option[value=3]").length).to.eql(0);
                expect(view.$(".dateOptions option[value=2]").length).to.eql(0);
            });

            it("Should disable date options", function()
            {
                expect(view.$(".dateOptions").attr("disabled")).to.be.ok;
            });
        });

        describe("Event Plans", function()
        {
            describe("Forced to end on event date", function()
            {
                var view;
                beforeEach(function()
                {
                    var model = new TrainingPlan();
                    model.details.set({
                        eventPlan: true,
                        eventName: "Test Event",
                        startDate: "2014-01-01T00:00:00",
                        eventDate: "2014-12-31T00:00:00",
                        forceDate: true
                    });

                    view = new TrainingPlanDatePickerView({ model: model });
                    view.render();
                });

                it("Should disable the datepicker", function()
                {
                    expect(view.$(".datepicker").attr("disabled")).to.be.ok;
                });

                it("Shouild default to the event end date", function()
                {
                    var pickerDate = view.$(".datepicker").datepicker("getDate");
                    expect(moment(pickerDate).format("YYYY-MM-DD")).to.eql("2014-12-31");
                });

                it("Should have only 'End on Event Date' option", function()
                {
                    expect(view.$(".dateOptions option").length).to.eql(1);
                    expect(view.$(".dateOptions option[value=1]").length).to.eql(0);
                    expect(view.$(".dateOptions option[value=3]").length).to.eql(0);
                    expect(view.$(".dateOptions option[value=2]").length).to.eql(1);
                });

                it("Should disable date options", function()
                {
                    expect(view.$(".dateOptions").attr("disabled")).to.be.ok;
                });
            });

            describe("Not forced to end on event date", function()
            {
                var view;
                beforeEach(function()
                {
                    var model = new TrainingPlan();
                    model.details.set({
                        eventPlan: true,
                        eventName: "Test Event",
                        startDate: "2014-01-01T00:00:00",
                        eventDate: "2014-12-31T00:00:00",
                        forceDate: false
                    });

                    view = new TrainingPlanDatePickerView({ model: model });
                    view.render();
                });

                it("Should not disable the datepicker", function()
                {
                    expect(view.$(".datepicker").attr("disabled")).to.not.be.ok;
                });

                it("Shouild default to today's date", function()
                {
                    var pickerDate = view.$(".datepicker").datepicker("getDate");
                    expect(moment(pickerDate).format("YYYY-MM-DD")).to.eql(moment().format("YYYY-MM-DD"));
                });

                it("Should have 'Start', 'End', and  'End on Event Date' option", function()
                {
                    expect(view.$(".dateOptions option").length).to.eql(3);
                    expect(view.$(".dateOptions option[value=1]").length).to.eql(1);
                    expect(view.$(".dateOptions option[value=3]").length).to.eql(1);
                    expect(view.$(".dateOptions option[value=2]").length).to.eql(1);
                });

                it("Should not disable date options", function()
                {
                    expect(view.$(".dateOptions").attr("disabled")).to.not.be.ok;
                });
            });

            describe("With no event date", function()
            {
                var view;
                beforeEach(function()
                {
                    var model = new TrainingPlan();
                    model.details.set({
                        eventPlan: true,
                        eventName: "Test Event",
                        startDate: "2014-01-01T00:00:00"
                    });

                    view = new TrainingPlanDatePickerView({ model: model });
                    view.render();
                });

                it("Should not disable the datepicker", function()
                {
                    expect(view.$(".datepicker").attr("disabled")).to.not.be.ok;
                });

                it("Shouild default to today's date", function()
                {
                    var pickerDate = view.$(".datepicker").datepicker("getDate");
                    expect(moment(pickerDate).format("YYYY-MM-DD")).to.eql(moment().format("YYYY-MM-DD"));
                });

                it("Should have 'Start', 'End' option", function()
                {
                    expect(view.$(".dateOptions option").length).to.eql(2);
                    expect(view.$(".dateOptions option[value=1]").length).to.eql(1);
                    expect(view.$(".dateOptions option[value=3]").length).to.eql(1);
                    expect(view.$(".dateOptions option[value=2]").length).to.eql(0);
                });

                it("Should not disable date options", function()
                {
                    expect(view.$(".dateOptions").attr("disabled")).to.not.be.ok;
                });
            });
        });

    });
});
