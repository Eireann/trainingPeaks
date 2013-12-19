define(
[
    "underscore",
    "TP",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs"
],
function(
    _,
    TP,
    testHelpers,
    xhrData
    )
{

    describe("open the calendar for a coach", function()
    {
        var $mainRegion;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.supercoach);
            $mainRegion = testHelpers.theApp.mainRegion.$el;
            testHelpers.theApp.router.navigate("calendar", true);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should display a list of coached athletes in the calendar", function()
        {
            expect($mainRegion.find("select.athleteCalendarSelect").length).to.equal(1);
            expect($mainRegion.find("select.athleteCalendarSelect option").length).to.equal(2);
        });

        describe("For default athlete", function()
        {

            it("Should have the first user set as the current athlete id", function()
            {
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(12345);
            });

            it("Should request workout data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345/workouts")).to.equal(true);
            });

            it("Should not request workout data for other athlete ids", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/workouts")).to.equal(false);
            });
        });

        describe("For athlete id from url", function()
        {

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.supercoach);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                testHelpers.theApp.router.navigate("calendar/athletes/23456", true);
                testHelpers.resolveRequest("GET", "fitness/v1/athletes/23456/settings", {});
            });
            
            it("Should have the requested user set as the current athlete id", function()
            {
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(23456);
            });

            it("Should request settings data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/settings")).to.equal(true);
            });

            it("Should request workout data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/workouts")).to.equal(true);
            });

            it("Should not request workout data for other athlete ids", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345/workouts")).to.equal(false);
            });
        });

        describe("For athlete that has been removed from coach", function()
        {
          
            describe("when the removed athlete is the currentAthlete", function()
            {

                describe("and the default calendar url is loaded", function()
                {

                    beforeEach(function()
                    {
                        testHelpers.startTheAppAndLogin(xhrData.users.supercoach);
                        testHelpers.theApp.user.setCurrentAthlete(new TP.Model({athleteId: 9999 }));
                        testHelpers.theApp.router.navigate("calendar", true);
                    });

                    it("Should not request settings data for the removed athlete id", function()
                    {
                        expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/9999/settings")).to.equal(false);
                    });

                    it("Should request settings data for the default athlete id", function()
                    {
                        expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345/settings")).to.equal(true);
                    });

                    it("Should set the currentAthleteId to the default athlete", function()
                    {
                        testHelpers.resolveRequest("GET", "fitness/v1/athletes/12345/settings", {});
                        expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(12345);
                    });

                });

                describe("and the calendar url for the removed athlete is loaded", function()
                {

                    beforeEach(function()
                    {
                        testHelpers.startTheAppAndLogin(xhrData.users.supercoach);
                        testHelpers.theApp.user.setCurrentAthlete(new TP.Model({athleteId: 9999 }));
                        testHelpers.theApp.router.navigate("calendar/athletes/9999", true);
                    });

                    it("Should not request settings data for the removed athlete id", function()
                    {
                        expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/9999/settings")).to.equal(false);
                    });

                    it("Should request settings data for the default athlete id", function()
                    {
                        expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345/settings")).to.equal(true);
                    });

                    it("Should set the currentAthleteId to the default athlete", function()
                    {
                        testHelpers.resolveRequest("GET", "fitness/v1/athletes/12345/settings", {});
                        expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(12345);
                    });

                });

            });

            describe("when the removed athlete is not the currentAthlete", function()
            {

                describe("and the calendar url for the removed athlete is loaded", function()
                {

                    beforeEach(function()
                    {
                        testHelpers.startTheAppAndLogin(xhrData.users.supercoach);
                        testHelpers.theApp.router.navigate("calendar/athletes/9999", true);
                    });

                    it("Should not request settings data for the removed athlete id", function()
                    {
                        expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/9999/settings")).to.equal(false);
                    });

                    it("Should request settings data for the default athlete id", function()
                    {
                        expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345/settings")).to.equal(true);
                    });

                    it("Should set the currentAthleteId to the default athlete", function()
                    {
                        testHelpers.resolveRequest("GET", "fitness/v1/athletes/12345/settings", {});
                        expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(12345);
                    });

                });

            });

        });

        describe("For coach with no athletes", function()
        {
            beforeEach(function()
            {
                var supercoach = TP.utils.deepClone(xhrData.users.supercoach);
                supercoach.athletes = [];
                testHelpers.startTheAppAndLogin(supercoach);
            });

            it("Should not throw any exceptions", function()
            {
                var loadTheCalendar = function()
                {
                    testHelpers.theApp.router.navigate("calendar", true);
                };
                expect(loadTheCalendar).not.to.throw();
            });

            it("Should not request settings data for any athlete id", function()
            {
                testHelpers.theApp.router.navigate("calendar", true);
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/[0-9]+/settings")).to.equal(false);
            });

        });
        
        describe("For coach with no premium athletes", function()
        {
            beforeEach(function()
            {
                var supercoach = TP.utils.deepClone(xhrData.users.supercoach);
                _.each(supercoach.athletes, function(athlete)
                {
                    athlete.userType = 6;
                });
                testHelpers.startTheAppAndLogin(supercoach);
            });

            it("Should not throw any exceptions", function()
            {
                var loadTheCalendar = function()
                {
                    testHelpers.theApp.router.navigate("calendar", true);
                };
                expect(loadTheCalendar).not.to.throw();
            });

            it("Should not request settings data for any athlete id", function()
            {
                testHelpers.theApp.router.navigate("calendar", true);
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/[0-9]+/settings")).to.equal(false);
            });

            xit("Should display an error message", function()
            {
                var $body = testHelpers.theApp.getBodyElement();
                expect($body.find(".dialog").length).to.equal(0);
                testHelpers.theApp.router.navigate("calendar", true);                   
                expect($body.find(".dialog").length).to.equal(1);
            });

        });

        describe("Switch athlete from dropdown", function()
        {

            it("Should have the first user set as the current athlete id", function()
            {
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(12345);
            });

            it("Should request workout data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345/workouts")).to.equal(true);
            });

            it("Should not request workout data for other athlete ids", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/workouts")).to.equal(false);
            });

            it("Should request athlete settings on selecting a new athlete", function()
            {
                testHelpers.clearRequests();
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/settings")).to.equal(true);
            });

            it("Should not change the athlete id until athlete settings have loaded", function()
            {
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(12345);
            });

            it("Should change the athlete id after athlete settings have loaded", function()
            {
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                testHelpers.resolveRequest("GET", "fitness/v1/athletes/23456/settings", {});
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(23456);
            });

            it("Should not request new athlete workouts until athlete settings have loaded", function()
            {
                testHelpers.clearRequests();
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/workouts")).to.equal(false);
            });

            it("Should request new athlete workouts after athlete settings have loaded", function()
            {
                testHelpers.clearRequests();
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                testHelpers.resolveRequest("GET", "fitness/v1/athletes/23456/settings", {});
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/workouts")).to.equal(true);
            });

        });

        describe("Navigate between dashboard and calendar", function()
        {
            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.supercoach);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                testHelpers.theApp.router.navigate("calendar", true);
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                testHelpers.resolveRequest("GET", "fitness/v1/athletes/23456/settings", {});
                testHelpers.clearRequests();
                testHelpers.theApp.user.getDashboardSettings().set("pods", []);
            });

            it("Should retain the currently selected athlete when switching to the dashboard", function()
            { 
                testHelpers.theApp.router.navigate("dashboard", true);
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/[0-9]/settings")).to.equal(false);
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.eql(23456);
            });

            it("Should retain the currently selected athlete when switching back to the dashboard", function()
            { 
                testHelpers.theApp.router.navigate("dashboard", true);
                testHelpers.theApp.router.navigate("calendar", true);
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/[0-9]/settings")).to.equal(false);
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.eql(23456);
            });
        });

        describe("Switch back to previously loaded athlete", function()
        {

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.supercoach);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                testHelpers.theApp.router.navigate("calendar", true);
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                testHelpers.resolveRequest("GET", "fitness/v1/athletes/23456/settings", {});
                $mainRegion.find(".athleteCalendarSelect").val(12345).trigger("change");
                testHelpers.resolveRequest("GET", "fitness/v1/athletes/12345/settings", {});
            });

            it("Should change the athlete id immediately if athlete settings have already loaded", function()
            {
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(23456);
            });

            it("Should not fetch settings again if athlete settings have already loaded", function()
            {
                testHelpers.clearRequests();
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/settings")).to.equal(false);
            });
        });

    });


});
