// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "moment",
    "models/calendarDay",
    "models/calendarWeekCollection"
],
function(moment, CalendarDay, CalendarWeek)
{
    describe("Calendar Week Collection", function()
    {
        it("should load as a module", function()
        {
            expect(CalendarWeek).toBeDefined();
        });

        describe("Cut, Copy, Paste", function()
        {

            var calendarWeek;
            var days;

            beforeEach(function()
            {
                days = [];
                calendarWeek = new CalendarWeek();
                for (var i = 0; i < 7; i++)
                {
                    var date = moment().add("days", i);
                    var day = new CalendarDay({ date: date.format("YYYY-MM-DD") });
                    days.push(day);
                    calendarWeek.add(day);
                    spyOn(day, "copyToClipboard").andCallThrough();
                    spyOn(day, "cutToClipboard").andCallThrough();
                    spyOn(day, "onPaste").andCallThrough();
                }
            });

            describe("copyToClipboard", function()
            {

                it("Should return a new CalendarWeek model", function()
                {
                    var copiedWeek = calendarWeek.copyToClipboard();
                    expect(copiedWeek instanceof CalendarWeek).toBe(true);
                });

                it("Should not return itself", function()
                {
                    var copiedWeek = calendarWeek.copyToClipboard();
                    expect(copiedWeek).not.toBe(calendarWeek);
                });

                it("Should have the correct number of days", function()
                {
                    var copiedWeek = calendarWeek.copyToClipboard();
                    expect(copiedWeek.length).toEqual(days.length);
                    expect(copiedWeek.length).toEqual(7);
                });

                it("Should call copy on each of the days", function()
                {
                    var copiedWeek = calendarWeek.copyToClipboard();
                    _.each(days, function(day)
                    {
                        expect(day.copyToClipboard).toHaveBeenCalled();
                    });
                });

            });

            describe("cutToClipboard", function()
            {

                it("Should return a new CalendarWeek model", function()
                {
                    var cutWeek = calendarWeek.cutToClipboard();
                    expect(cutWeek instanceof CalendarWeek).toBe(true);
                });

                it("Should not return itself", function()
                {
                    var cutWeek = calendarWeek.cutToClipboard();
                    expect(cutWeek).not.toBe(calendarWeek);
                });

                it("Should have the correct number of days", function()
                {
                    var cutWeek = calendarWeek.cutToClipboard();
                    expect(cutWeek.length).toEqual(days.length);
                });

                it("Should call cut on each of the days", function()
                {
                    var cutWeek = calendarWeek.cutToClipboard();
                    _.each(days, function(day)
                    {
                        expect(day.cutToClipboard).toHaveBeenCalled();
                    });
                });

            });

            describe("onPaste", function()
            {

                it("Should have the correct number of days", function()
                {
                    var pastedItems = calendarWeek.copyToClipboard().onPaste("2020-01-01");
                    expect(pastedItems.length).toEqual(days.length);
                });

                it("Should call onPaste on each of the copied days, incrementing the date", function()
                {
                    var dateToPasteTo = "2030-12-25";
                    var copiedItems = calendarWeek.copyToClipboard();
                    copiedItems.each(function(day)
                    {
                        spyOn(day, "onPaste").andCallThrough();
                    });
                    var pastedItems = copiedItems.onPaste(dateToPasteTo);
                    dateToPasteTo = moment(dateToPasteTo);
                    copiedItems.each(function(day)
                    {
                        expect(day.onPaste).toHaveBeenCalled();
                        expect(day.onPaste.mostRecentCall.args[0].format("YYYY-MM-DD")).toBe(dateToPasteTo.format("YYYY-MM-DD"));
                        dateToPasteTo.add("days", 1);
                    });
                });

            });

        });


    });

});