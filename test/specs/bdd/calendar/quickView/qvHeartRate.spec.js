// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app"
],
function(
    _,
    testHelpers,
    xhrData,
    theApp)
{


    xdescribe("heart rate tab", function()
    {
        var $mainRegion, $body;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            $mainRegion = theApp.mainRegion.$el;
            $body = theApp.getBodyElement();
            theApp.router.navigate("calendar", true);
            $mainRegion.find("#calendarContainer .day.today .addWorkout").trigger("click");
            $body.find("button[data-workoutid=3]").trigger("click");
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        xit("Should open the heart rate tab", function()
        {
            $body.find(".heartrateTab").trigger("click");
            expect($body.find("#quickViewHRTab").is(":visible")).toBe(true);
        });

        xit("Should display each of the athlete's zones", function()
        {
            var hrTab = $body.find("#quickViewHRTab");
            var tabHtml = hrTab.text();
            _.each(athleteSettings.heartRateZones[0].zones, function(zone)
            {
                expect(tabHtml).toContain(zone.label);
            }, this);
        });

        // how do we get from zone input to actual model value?
        // or do we just close/open and check new value?
        xit("Should parse times as seconds", function()
        {
            var zoneInput = $body.find("input#timeInZone0");
            zoneInput.val("0:01:00");
            zoneInput.trigger("blur");

        });
    });



});