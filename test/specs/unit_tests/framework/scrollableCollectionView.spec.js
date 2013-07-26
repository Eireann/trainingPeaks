requirejs(
["TP",
 "views/scrollableCollectionView"],
 function(TP, ScrollableCollectionView)
 {
     describe("ScrollableCollectionView", function()
     {

     });

    describe("ScrollableCollectionView.ScrollableCollectionViewAdapterCollection", function()
     {
        beforeEach(function() 
        {
            var options =
            {
                sourceCollection: new TP.Collection(),
                maxSize: 3
            };
            var adapterCollection = new ScrollableCollectionView.ScrollableCollectionViewAdapterCollection(options);
        });
        it("Should be exposed as a module", function() 
        {
            expect(adapterCollection).toBeDefined();
        });
        it("Should fail this test", function() {
            expect(true).toBeFalse();
        });
     });
 }
 );