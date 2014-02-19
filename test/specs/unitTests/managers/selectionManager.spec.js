define(
[
    "underscore",
    "moment",
    "shared/managers/selectionManager"
],
function(
    _,
    moment,
    SelectionManager
)
{
    describe("SelectionManager", function()
    {

        function MockSelectionClass(models)
        {
            this.models = models;
            this.activate = sinon.stub();
            this.deactivate = sinon.stub();
            this.fakeAction = sinon.stub();
        }

        function MockRangeSelectionClass(models)
        {
            this.models = models;
            this.activate = sinon.stub();
            this.deactivate = sinon.stub();
            this.extendTo = sinon.stub().returns(true);
        }

        var selectionManager;
        beforeEach(function()
        {
            selectionManager = new SelectionManager();
        });

        describe(".setSelection", function()
        {


            var item;
            beforeEach(function()
            {

                item = {};
                item.selectionClass = MockSelectionClass;

            });

            it("should use the sepecified selection class", function()
            {
                selectionManager.setSelection(item);
                expect(selectionManager.selection instanceof MockSelectionClass).to.equal(true);
            });

            it("should pass in the item when constructing the selection", function()
            {
                selectionManager.setSelection(item);
                expect(selectionManager.selection.models).to.eql([item]);
            });

            it("should activate the selection", function()
            {
                selectionManager.setSelection(item);
                expect(selectionManager.selection.activate).to.have.been.called;
            });

            it("should deactivate the previous selection", function()
            {
                selectionManager.setSelection(item);
                var previousSelection = selectionManager.selection;

                selectionManager.setSelection(_.clone(item));
                expect(previousSelection.deactivate).to.have.been.called;
            });

            it("should not fail if shift key is held", function()
            {
                selectionManager.setSelection(item, { shiftKey: true });
                expect(selectionManager.selection.activate).to.have.been.called;
            });

        });

        describe(".setSelection w/ RangeSelection", function()
        {

            var item;
            beforeEach(function()
            {

                item = {};
                item.selectionClass = MockRangeSelectionClass;

            });

            it("should extend the selection if shift is held", function()
            {
                selectionManager.setSelection(_.clone(item));
                expect(selectionManager.selection.activate).to.have.been.called;
                var selection = selectionManager.selection;
                selectionManager.setSelection(_.clone(item), { shiftKey: true });
                expect(selectionManager.selection.extendTo).to.have.been.called;
                expect(selectionManager.selection).to.eql(selection);
            });

        });
        
        describe(".setMultiSelection", function()
        {

            var item, items;
            beforeEach(function()
            {

                item = {};
                item.selectionClass = MockSelectionClass;

                items = [ _.clone(item), _.clone(item) ];
                selectionManager.setMultiSelection(items);
            });

            it("should pass in all items", function()
            {
                expect(selectionManager.selection.models).to.eql(items);
            });

            it("should activate the selection", function()
            {
                expect(selectionManager.selection.activate).to.have.been.called;
            });

        });
        
        describe(".clearSelection", function()
        {

            var item, items;
            beforeEach(function()
            {

                item = {};
                item.selectionClass = MockSelectionClass;
            });

            it("should deactivate the old selection", function()
            {
                selectionManager.setSelection(item);
                var selection = selectionManager.selection;

                selectionManager.clearSelection();
                expect(selection.deactivate).to.have.been.called;
            });

            it("should not fail if there is no selection", function()
            {
                selectionManager.clearSelection();
            });

            it("should null out the selection", function()
            {
                selectionManager.setSelection(item);
                selectionManager.clearSelection();
                expect(selectionManager.selection).to.equal(null);
            });

        });

        describe(".execute", function()
        {

            var item;
            beforeEach(function()
            {

                item = {};
                item.selectionClass = MockSelectionClass;

            });

            it("should return false if there is no selection", function()
            {
                expect(selectionManager.execute("fake")).to.equal(false);
            });

            it("should return false if the selection has no such action", function()
            {
                selectionManager.setSelection(item);
                expect(selectionManager.execute("doesnotexist")).to.equal(false);
            });

            it("should call the action if it has one", function()
            {
                selectionManager.setSelection(item);
                selectionManager.execute("fake");
                expect(selectionManager.selection.fakeAction).to.have.been.called;
            });

        });

    });

});
