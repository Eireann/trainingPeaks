define(
[
    "underscore",
    "moment",
    "TP",
    "shared/misc/selection",
    "shared/misc/activitySelection",
    "shared/misc/calendarDaySelection"
],
function(
    _,
    moment,
    TP,
    Selection,
    ActivitySelection,
    CalendarDaySelection
)
{

    var selectionClasses =
    {
        Selection: Selection,
        ActivitySelection: ActivitySelection,
        CalendarDaySelection: CalendarDaySelection
    };

    _.each(selectionClasses, function(SelectionClass, selectionClassName)
    {

        describe(selectionClassName, function()
        {

            var selection, items;

            beforeEach(function()
            {
                items = _.times(3, function(i) { return new TP.Model({ i: i }); });
                selection = new SelectionClass(items);

            });

            describe(".activate", function()
            {

                it("should not jump the gun", function()
                {
                    expect(items[0].getState().get("isSelected")).to.not.be.ok;
                    expect(items[1].getState().get("isSelected")).to.not.be.ok;
                    expect(items[2].getState().get("isSelected")).to.not.be.ok;
                });

                it("should set the isSelected state flag on members", function()
                {

                    selection.activate();

                    expect(items[0].getState().get("isSelected")).to.equal(true);
                    expect(items[1].getState().get("isSelected")).to.equal(true);
                    expect(items[2].getState().get("isSelected")).to.equal(true);

                });

                it("should set the isSelected state flag on new members", function()
                {

                    selection.activate();

                    var item = new TP.Model();

                    selection.add(item);

                    expect(item.getState().get("isSelected")).to.equal(true);

                });

                it("should unset the isSelected state flag on removed members", function()
                {

                    selection.activate();
                    selection.remove(items[0]);
                    expect(items[0].getState().get("isSelected")).to.equal(false);

                });

            });

            describe(".deactivate", function()
            {

                it("should set the isSelected state flag on members", function()
                {

                    selection.activate();
                    selection.deactivate();

                    expect(items[0].getState().get("isSelected")).to.equal(false);
                    expect(items[1].getState().get("isSelected")).to.equal(false);
                    expect(items[2].getState().get("isSelected")).to.equal(false);

                });

                it("should set the isSelected state flag on new members", function()
                {

                    selection.activate();
                    selection.deactivate();

                    var item = new TP.Model();

                    selection.add(item);

                    expect(item.getState().get("isSelected")).to.equal(false);

                });

            });

        });

    });

});
