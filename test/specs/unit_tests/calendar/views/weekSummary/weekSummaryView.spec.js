define(
[
    "moment",
    "TP",
    "jquery",
    "models/calendar/calendarDay",
    "shared/models/metricModel",
    "models/workoutModel",
    "views/weekSummary/weekSummaryView"
],
function (moment, TP, $, CalendarDay, MetricModel, WorkoutModel, WeekSummaryView)
{
    var count = 0;
    function DayModel() {
        return new CalendarDay({ date: moment("2001-05-25").add(count++, "days").format("YYYY-MM-DD") });
    }

    describe("WeekSummaryView", function ()
    {
        beforeEach(function ()
        {
        });

        it("Is contained within a div with a weekSummary class", function()
        {
            expect(WeekSummaryView.prototype.tagName).to.equal("div");
            expect(WeekSummaryView.prototype.className).to.equal("weekSummary");
        });

        it("Throws an exception when the model or the model's parent collection are not defined", function()
        {
            expect(function () { new WeekSummaryView(); }).to.throw();
            expect(function () { new WeekSummaryView({ model: new TP.Model() }); }).to.throw();

            var parentCollection = new TP.Collection();
            var model = new TP.Model();
            parentCollection.add(model);
            
            expect(function() { new WeekSummaryView({ model: model }); }).to.not.throw();
        });

        it("Ignores MetricModels", function()
        {
            var weekCollection = new TP.Collection();
            var dayModel = new DayModel();

            var summaryModel = new TP.Model();

            weekCollection.add(dayModel);
            weekCollection.add(summaryModel);

            var metricModel = new MetricModel();
            dayModel.add(metricModel);

            var view = new WeekSummaryView({ model: summaryModel });

            expect(function()
            {
                view.render();
            }).to.not.throw();
        });

        it("Rerenders itself when workouts are changed, added, or removed for the week", function()
        {
            sinon.stub(WeekSummaryView.prototype, "render");

            var weekCollection = new TP.Collection();
            var dayModel = new DayModel();
            
            var summaryModel = new TP.Model();

            weekCollection.add(dayModel);
            weekCollection.add(summaryModel);
            
            var view = new WeekSummaryView({ model: summaryModel });

            expect(WeekSummaryView.prototype.render).to.not.have.been.called;

            dayModel.add(new TP.Model());
            
            expect(WeekSummaryView.prototype.render).to.have.been.called;

            WeekSummaryView.prototype.render.reset();
            //change
            dayModel.itemsCollection.at(0).set("key", "0");
            expect(WeekSummaryView.prototype.render).to.have.been.called;
            
            WeekSummaryView.prototype.render.reset();
            
            //remove
            dayModel.remove(dayModel.itemsCollection.at(0));
            expect(WeekSummaryView.prototype.render).to.have.been.called;
        });

        it("Should aggregate weekly workout data totals correctly", function()
        {
            sinon.stub(WeekSummaryView.prototype, "render").returns("");

            var weekCollection = new TP.Collection();
            var dayModel1 = new DayModel();
            var dayModel2 = new DayModel();

            var summaryModel = new TP.Model();

            weekCollection.add(dayModel1);
            weekCollection.add(dayModel2);
            weekCollection.add(summaryModel);

            var view = new WeekSummaryView({ model: summaryModel });

            var workout1 = new WorkoutModel({ totalTime: 1, totalTimePlanned: 2, tssActual: 100, tssPlanned: 200 });
            var workout2 = new WorkoutModel({ totalTime: 2, totalTimePlanned: 4, tssActual: 200, tssPlanned: 400 });
            var workout3 = new WorkoutModel({ totalTime: 3, totalTimePlanned: 6, tssActual: 300, tssPlanned: 600 });
            var workout4 = new WorkoutModel({ totalTime: 4, totalTimePlanned: 8, tssActual: 400, tssPlanned: 800 });

            view.onBeforeRender();

            expect(view.model.get("totalTimeCompleted")).to.equal(0);
            expect(view.model.get("totalTimePlanned")).to.equal(0);
            expect(view.model.get("tssCompleted")).to.equal(0);
            expect(view.model.get("tssPlanned")).to.equal(0);

            dayModel1.add(workout1);
            
            view.onBeforeRender();

            expect(view.model.get("totalTimeCompleted")).to.equal(1);
            expect(view.model.get("totalTimePlanned")).to.equal(2);
            expect(view.model.get("tssCompleted")).to.equal(100);
            expect(view.model.get("tssPlanned")).to.equal(200);

            dayModel1.add(workout2);
            dayModel2.add(workout3);
            dayModel2.add(workout4);

            view.onBeforeRender();
            
            expect(view.model.get("totalTimeCompleted")).to.equal(10);
            expect(view.model.get("totalTimePlanned")).to.equal(20);
            expect(view.model.get("tssCompleted")).to.equal(1000);
            expect(view.model.get("tssPlanned")).to.equal(2000);
        });

        it("Should aggregate weekly workout totals of duration and distance for all workouts including Day Off", function()
        {
            sinon.stub(WeekSummaryView.prototype, "render").returns("");

            var weekCollection = new TP.Collection();
            var dayModel1 = new DayModel();
            var dayModel2 = new DayModel();

            var summaryModel = new TP.Model();

            weekCollection.add(dayModel1);
            weekCollection.add(dayModel2);
            weekCollection.add(summaryModel);

            var view = new WeekSummaryView({ model: summaryModel });

            var bike1 = new WorkoutModel({ distance: 1, distancePlanned: 2, tssActual: 100, tssPlanned: 200, workoutTypeValueId: TP.utils.workout.types.getIdByName("Bike")});
            var bike2 = new WorkoutModel({ distance: 2, distancePlanned: 4, tssActual: 200, tssPlanned: 400, workoutTypeValueId: TP.utils.workout.types.getIdByName("Bike")});
            var run1 =  new WorkoutModel({ distance: 3, distancePlanned: 6, tssActual: 300, tssPlanned: 600, workoutTypeValueId: TP.utils.workout.types.getIdByName("Run")});
            var run2 =  new WorkoutModel({ distance: 4, distancePlanned: 8, tssActual: 400, tssPlanned: 800, workoutTypeValueId: TP.utils.workout.types.getIdByName("Run") });
            var swim1 = new WorkoutModel({ distance: 1, distancePlanned: 2, tssActual: 100, tssPlanned: 200, workoutTypeValueId: TP.utils.workout.types.getIdByName("Swim") });
            var swim2 = new WorkoutModel({ distance: 2, distancePlanned: 4, tssActual: 200, tssPlanned: 400, workoutTypeValueId: TP.utils.workout.types.getIdByName("Swim") });
            var strength1 = new WorkoutModel({ totalTime: 3, totalTimePlanned: 6, tssActual: 300, tssPlanned: 600, workoutTypeValueId: TP.utils.workout.types.getIdByName("Strength") });
            var strength2 = new WorkoutModel({ totalTime: 4, totalTimePlanned: 8, tssActual: 400, tssPlanned: 800, workoutTypeValueId: TP.utils.workout.types.getIdByName("Strength") });
            var rowing1 = new WorkoutModel({ totalTime: 1, totalTimePlanned: 2, tssActual: 100, tssPlanned: 200, workoutTypeValueId: TP.utils.workout.types.getIdByName("Rowing") });
            var rowing2 = new WorkoutModel({ totalTime: 2, totalTimePlanned: 4, tssActual: 200, tssPlanned: 400, workoutTypeValueId: TP.utils.workout.types.getIdByName("Rowing") });
            var dayOff1 = new WorkoutModel({ totalTime: 1, totalTimePlanned: 3, tssActual: 100, tssPlanned: 200, workoutTypeValueId: TP.utils.workout.types.getIdByName("Day Off") });
            var dayOff2 = new WorkoutModel({ totalTime: 2, totalTimePlanned: 4, tssActual: 200, tssPlanned: 400, workoutTypeValueId: TP.utils.workout.types.getIdByName("Day Off") });

            view.onBeforeRender();

            expect(view.model.get("totalsByWorkoutType.2.distance.completed")).to.equal(undefined);
            expect(view.model.get("totalsByWorkoutType.2.distance.planned")).to.equal(undefined);
            expect(view.model.get("totalsByWorkoutType.3.distance.completed")).to.equal(undefined);
            expect(view.model.get("totalsByWorkoutType.3.distance.planned")).to.equal(undefined);
            expect(view.model.get("totalsByWorkoutType.1.distance.completed")).to.equal(undefined);
            expect(view.model.get("totalsByWorkoutType.1.distance.planned")).to.equal(undefined);
            expect(view.model.get("totalsByWorkoutType.9.duration.completed")).to.equal(undefined);
            expect(view.model.get("totalsByWorkoutType.9.duration.planned")).to.equal(undefined);
            expect(view.model.get("totalsByWorkoutType.12.duration.completed")).to.equal(undefined);
            expect(view.model.get("totalsByWorkoutType.12.duration.planned")).to.equal(undefined);
            expect(view.model.get("totalsByWorkoutType.7.duration.completed")).to.equal(undefined);
            expect(view.model.get("totalsByWorkoutType.7.duration.planned")).to.equal(undefined);

            dayModel1.add(bike1);
            dayModel1.add(run1);
            dayModel1.add(swim1);
            dayModel1.add(strength1);
            dayModel1.add(rowing1);
            dayModel1.add(dayOff1);
            
            dayModel2.add(bike2);
            dayModel2.add(run2);
            dayModel2.add(swim2);
            dayModel2.add(strength2);
            dayModel1.add(rowing2);
            dayModel2.add(dayOff2);
            
            view.onBeforeRender();

            expect(view.model.get("totalsByWorkoutType.2.distance.completed")).to.equal(3);
            expect(view.model.get("totalsByWorkoutType.2.distance.planned")).to.equal(6);
            expect(view.model.get("totalsByWorkoutType.2.distance.planned")).to.equal(6);
            expect(view.model.get("totalsByWorkoutType.3.distance.completed")).to.equal(7);
            expect(view.model.get("totalsByWorkoutType.3.distance.planned")).to.equal(14);
            expect(view.model.get("totalsByWorkoutType.1.distance.completed")).to.equal(3);
            expect(view.model.get("totalsByWorkoutType.1.distance.planned")).to.equal(6);
            expect(view.model.get("totalsByWorkoutType.9.duration.completed")).to.equal(7);
            expect(view.model.get("totalsByWorkoutType.9.duration.planned")).to.equal(14);
            expect(view.model.get("totalsByWorkoutType.12.duration.completed")).to.equal(3);
            expect(view.model.get("totalsByWorkoutType.12.duration.planned")).to.equal(6);
            expect(view.model.get("totalsByWorkoutType.7.duration.completed")).to.equal(3);
            expect(view.model.get("totalsByWorkoutType.7.duration.planned")).to.equal(7);
        });
        describe("template logic", function()
        {
            var view;
            beforeEach(function()
            {
                sinon.stub(WeekSummaryView.prototype, "onBeforeRender").returns("");
                var weekCollection = new TP.Collection();
                var dayModel1 = new DayModel();
                var summaryModel = new TP.Model();
                weekCollection.add(dayModel1);
                weekCollection.add(summaryModel);
                view = new WeekSummaryView({ model: summaryModel });
            });

            it("Should not show the total duration bar if there is no Planned Duration", function()
            {
                view.model.set({totalTimePlanned: 0, totalDaysCompleted: 5}, {silent: true});
                view.render();
                expect(view.$el.find('.weekSummaryBarGraphItem.total').length).to.equal(0);
            });
            it("Should list Total Duration as a numeric value if no Planned Duration for the week", function()
            {
                view.model.set({totalTimePlanned: 0, totalTimeCompleted: 1});
                view.render();
                expect(view.$el.find('.statsRow#duration .value').text()).to.equal("1:00:00");
            });
            it("Should show a total TSS bar if any Planed TSS is entered for the week", function()
            {
                view.model.set({tssPlanned: 5});
                view.render();
                expect(view.$el.find('.weekSummaryBarGraphItem.tss').length).to.equal(1);
            });
            it("Should show a planned data bar but no numeric value if there is a mix of planned/completed data" ,function()
            {
                view.model.set({totalDistancePlanned: 1, totalDistanceCompleted: 4});
                view.render();
                expect(view.$el.find('.statsRow#distance').length).to.equal(0);
            });
        });

    });
});
