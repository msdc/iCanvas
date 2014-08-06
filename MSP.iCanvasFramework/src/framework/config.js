define(function (require) {
    var CONS = require("./const");
    return {
        TXT: {
            FontFamily: CONS.TXT.DEFAULTFONT.SEGUI,
            FontColor: CONS.COLORS.BLACK,
            DefaultAlign: CONS.TXT.ALIGN.MIDDLE,
            DefaultFontSize: CONS.TXT.DEFAULTSIZE.NORMAL,
            DefaultFontWeight: CONS.TXT.DECORATION.NORMAL
        },
        LINE: {
            Color: CONS.COLORS.LINEGRAY,
            Width: CONS.BORDERS.MIN
        },
        CIRCLE: {
            Color: CONS.COLORS.YELLOW,
            BorderColor: CONS.COLORS.WHITE,
            BorderWidth: CONS.BORDERS.DOUBLE
        }
    }
});