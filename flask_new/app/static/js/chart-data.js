var randomScalingFactor = function(){ return Math.round(Math.random()*1000)};

$.getJSON('/getUser',function(ret){
    document.getElementById("curUser").innerHTML=ret.user ;
})

$(document).ready(function() {
    $.getJSON('/getUseRecord', function (ret1) {
        $.getJSON('/getDate', function (ret2) {
            var lineChartData;
            lineChartData = {
                labels: [ret2[0], ret2[1], ret2[2], ret2[3], ret2[4], ret2[5], ret2[6]],
                datasets: [
                    {
                        label: "My First dataset",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: [ret1[0], ret1[1], ret1[2], ret1[3], ret1[4], ret1[5], ret1[6]]
                    },
                ]

            }
            var chart1 = document.getElementById("line-chart").getContext("2d");
            window.myLine = new Chart(chart1).Line(lineChartData, {
                responsive: true
            });
        })
    })
})




$(document).ready(function() {
    $.getJSON('/getMonthData', function (ret1) {
        $.getJSON('/getMonth', function (ret2) {
            var barChartData;
            barChartData = {
                labels: [ret2[0], ret2[1], ret2[2], ret2[3], ret2[4], ret2[5], ret2[6]],
                datasets: [
                    {
                        label: "My First dataset",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: [ret1[0], ret1[1], ret1[2], ret1[3], ret1[4], ret1[5], ret1[6]]
                    },
                ]

            }
            var chart2 = document.getElementById("bar-chart").getContext("2d");
            window.myBar = new Chart(chart2).Bar(barChartData, {
                responsive : true
            });
        })
    })
})

	var pieData = [
				{
					value: 300,
					color:"#30a5ff",
					highlight: "#62b9fb",
					label: "Blue"
				},
				{
					value: 50,
					color: "#ffb53e",
					highlight: "#fac878",
					label: "Orange"
				},
				{
					value: 100,
					color: "#1ebfae",
					highlight: "#3cdfce",
					label: "Teal"
				},
				{
					value: 120,
					color: "#f9243f",
					highlight: "#f6495f",
					label: "Red"
				}

			];
			
	var doughnutData = [
					{
						value: 300,
						color:"#30a5ff",
						highlight: "#62b9fb",
						label: "Blue"
					},
					{
						value: 50,
						color: "#ffb53e",
						highlight: "#fac878",
						label: "Orange"
					},
					{
						value: 100,
						color: "#1ebfae",
						highlight: "#3cdfce",
						label: "Teal"
					},
					{
						value: 120,
						color: "#f9243f",
						highlight: "#f6495f",
						label: "Red"
					}
	
				];

window.onload = function(){

	var chart3 = document.getElementById("doughnut-chart").getContext("2d");
	window.myDoughnut = new Chart(chart3).Doughnut(doughnutData, {responsive : true
	});
	var chart4 = document.getElementById("pie-chart").getContext("2d");
	window.myPie = new Chart(chart4).Pie(pieData, {responsive : true
	});
	
};