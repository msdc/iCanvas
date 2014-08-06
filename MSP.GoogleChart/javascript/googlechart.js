var googleChart = googleChart || {
    containerPie: document.getElementById("div_chart_pie"),
    containerBar: document.getElementById("div_chart_bar"),
    containerColumn: document.getElementById("div_chart_column"),
    containerLine: document.getElementById("div_chart_line"),
    data: {},
    option:{},
    init: function () {
        google.load("visualization", "1.0", { 'packages': ['corechart', 'table'] });
        google.setOnLoadCallback(this.buildData);
    },
    buildData:function() {
        var googleData = new google.visualization.DataTable();
        googleData.addColumn('string', 'Topping');
        googleData.addColumn('number', 'Slices');
        googleData.addColumn('number', 'test');
        googleData.addRows([
            ['row1', 10, 1],
            ['row2', 8, 3],
            ['row3', 5, 6],
            ['row4', 4, 2],
            ['row5', 3, 10],
            ['row6', 1, 1]
        ]);
        var googleOption = {
            'title': 'Google chart test by v-juzha',
            'width': 800,
            'height': 600,
            is3D: true
        };
        googleChart.data = googleData;
        googleChart.option = googleOption;
        googleChart.drawChartPie();
    },
    changeChart: function (chartValue) {
        switch (chartValue) {
            case "0":
                this.drawChartPie();
                break;
            case "1":
                this.drawChartBar();
                break;
            case "2":
                this.drawChartColumn();
                break;
            case "3":
                this.drawChartLine();
                break;
            default:
                this.drawChartPie();
                break;
        }
    },
    changeDisplay: function (container) {
        this.containerPie.style.display = "none";
        this.containerBar.style.display = "none";
        this.containerColumn.style.display = "none";
        this.containerLine.style.display = "none";
        container.style.display = "block";
    },
    drawChartPie: function () {
        var chartPie = new google.visualization.PieChart(googleChart.containerPie);
        google.visualization.events.addListener(chartPie, 'click', this.selectHandler);
        chartPie.draw(googleChart.data, googleChart.option);
        googleChart.changeDisplay(googleChart.containerPie);
    },
    drawChartBar: function () {
        
        var chartBar = new google.visualization.BarChart(googleChart.containerBar);
        chartBar.draw(googleChart.data,googleChart.option);
        googleChart.changeDisplay(googleChart.containerBar);
    },
    drawChartColumn: function () {
        googleChart.changeDisplay(googleChart.containerColumn);
        var chartColumn = new google.visualization.ColumnChart(googleChart.containerColumn);
        chartColumn.draw(googleChart.data, googleChart.option);
    },
    drawChartLine: function () {
        googleChart.changeDisplay(googleChart.containerLine);
        var chartLine = new google.visualization.LineChart(googleChart.containerLine);
        chartLine.draw(googleChart.data, googleChart.option);
    },
    selectHandler: function () {
        alert("You selected me.");
    }
};
googleChart.init();