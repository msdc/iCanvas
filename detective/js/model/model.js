var map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    , [1, 1, 2, 2, 1, 1, 1, 1, 1, 1]
    , [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    , [1, 1, 1, 1, 1, 2, 1, 1, 1, 1]
    , [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    , [1, 1, 1, 3, 1, 1, 1, 1, 1, 1]
    , [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    , [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    , [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    , [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];





var model = function (mapData) {
    this.applyMapData(mapData?mapData:map);
}

model.prototype = {
    applyMapData: function (mapData) {
        this.map = mapData;
    }
    , applyCards: function (cards) {
        this.cards = cards;
    }
}