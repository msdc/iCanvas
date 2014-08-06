
define(function (require) {
    return {
        POSITION: {
            ABSOLUTE: "absolute",
            RELATIVE: "relative"
        },
        FLOAT: {
            LEFT: "left",
            RIGHT: "right"
        },
        REGEXP: {
            PX: /-?(\d+(\.\d+)?)?(?=\s*px)/,
            NUM: /-?\d+(\.\d+)?/,
            ABSNUM: /\{-?(\d+(\.\d+)?)?\}/,
            OPERATOR: /[^-](\+|\-|\*|\/)/
        },
        COLORS: {
            BLACK: "black",
            WHITE: "white",
            BLUE: "blue",
            RED: "red",
            YELLOW: "yellow",
            GREEN: "green",
            LINEGRAY: "rgb(230,230,230)"
        },
        BORDERS: {
            MIN: 1,
            DOUBLE: 2,
            TRIPPLE: 3,
            FOURTIMES: 4,
            FIVETIMES: 5
        },
        TXT: {
            DECORATION: {
                BOLD: "bold",
                NORMAL: "normal",
                UNDERLINE: "underline"
            },
            DEFAULTFONT: {
                SEGUI: "Segoe UI",
                SEGUILIGHT: "Segoe UI Light",
                VERD: "Verdana"
            },
            DEFAULTSIZE: {
                SMALL: 10,
                NORMAL: 12,
                BIG: 15,
                BIGGER: 18,
                HUGE: 24
            },
            ALIGN: {
                LEFT: "left",
                RIGHT: "right",
                MIDDLE: "middle",
                CENTER: "center"
            }
        }
    }

});