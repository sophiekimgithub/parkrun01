$(document).ready(function() {
    Data.getSummInfo();
})

var Graph = {
  getGraph : function(infoArr, maxTime, minTime) {
    var dpsArr = [];
    var dps = {};
    for(var i in infoArr) {
      var dateVar = infoArr[i].runDate.split("/")[0];
      var monthVar = parseInt(infoArr[i].runDate.split("/")[1])-1;
      var yearVar = infoArr[i].runDate.split("/")[2];
      var hourVar = infoArr[i].runTime.split(":")[0];
      var minuteVar = infoArr[i].runTime.split(":")[1];
      dps.x = new Date(yearVar, monthVar, dateVar);
      dps.y = parseInt(hourVar + minuteVar);
      if(maxTime==dps.y) {
          dps.indexLabel = "slowest";
          dps.markerColor = "DarkSlateGrey";
          dps.markerType = "cross";
      }
      if(minTime==dps.y) {
          dps.indexLabel = "fastest";
          dps.markerColor = "red";
          dps.markerType = "triangle";
      }
	    dpsArr.push(dps);
      dps = {};
    }
    var graphData = new CanvasJS.Chart("chartDiv", {
	     animationEnabled: true,
	     theme: "light2",
	     title:{
		       text: "Progress"
     	 },
	     axisY:{
		      includeZero: false,
          //interval:100,
          valueFormatString: "##:00"
          //labelFormatter:function(e) {
          //  return CanvasJS.formatNumber(e.value, "##:00");
          //}
	     },
       toolTip: {
         enabled: true,
         animationEnabled: true,
         contentFormatter: function(e) {
            return CanvasJS.formatNumber(e.entries[0].dataPoint.y, "##:##");
         }
       },
       data: [{
		       type: "line",
		       dataPoints: dpsArr
	     }]
     });
     graphData.render();
  }
}

var Data = {
  getSummInfo:function() {
      var num = $("#athleteNum").val();
      var urlStr = "http://www.parkrun.com.au/results/athleteresultshistory/?athleteNumber="+num;
      var proxy = "https://cors-anywhere.herokuapp.com/";
      var infoArr = [];
      var info = {};
      var summInfo = {};
      var htmlStr = "";
      var summHtmlStr = "";
      var eventNum = 0;

      $.ajax({
        url : proxy + urlStr,
        dataType : "html",
        error : function() {
          console.log("fail to get data from server");
        },
        success : function(data) {
          var eventSumm = $(data).find("#results")[1];
          var volSumm = $(data).find("#results")[2];
          var idx = 0;

          //parkrun selectbox
          $(eventSumm).find("td").each(function() {
            if(idx%7 === 0) {
              info.eventNm = $(this).text();
            } else if(idx%7 === 1) {
              info.eventNum = $(this).text();
              eventNum += parseInt($(this).text());
            } else if(idx%7 === 2) {
              info.eventBestGe = $(this).text();
            } else if(idx%7 === 3) {
              info.eventBestOv = $(this).text();
            } else if(idx%7 === 4) {
              info.eventBestTi = $(this).text();
            }

            if(idx%7 === 6) {
              infoArr.push(info);
              info = {};
            }
            idx++;
          });

          htmlStr += "<select class='selectpicker' id='parkSelect'>";
          htmlStr += "<option value='all'>All</option>";
          for(var i in infoArr) {
            var parkStr = "parkrun";
            var eventNmArr = infoArr[i].eventNm.split(" ");
            eventNmArr.pop(parkStr);
            var eventNm = eventNmArr.join("").toLowerCase();
            if(eventNm) {
                htmlStr += "<option value='"+eventNm+"'>"+infoArr[i].eventNm+"</option>";
            }
          }
          htmlStr += "</select>";
          $("#selectDiv").html(htmlStr);

          //volunteer summary
          idx = 0;
          var volNum = 0;
          $(volSumm).find("td").each(function() {
            if(idx%3 === 2) {
              volNum += parseInt($(this).text());
            }
            idx++;
          });
          summInfo.volNum = volNum;
          summInfo.eventNum = eventNum / 2;

          summHtmlStr += "<table id='summTable' class='table table-bordered'>";
          summHtmlStr += "<tbody>";
          summHtmlStr += "<tr>";
          summHtmlStr += "<th colspan='2' scope='row'>Total Number : "+summInfo.eventNum+"</th>";
          summHtmlStr += "</tr>";
          summHtmlStr += "<tr>";
          summHtmlStr += "<th colspan='2' scope='row'>Volunteer Number : "+summInfo.volNum+"</th>";
          summHtmlStr += "</tr>";
          summHtmlStr += "<tr>";
          summHtmlStr += "<th scope='col'>Event</th>";
          summHtmlStr += "<th scope='col'>PB</th>";
          summHtmlStr += "</tr>";
          for(var i in infoArr) {
            summHtmlStr += "<tr>";
            summHtmlStr += "<td>"+infoArr[i].eventNm+"</td>";
            summHtmlStr += "<td>"+infoArr[i].eventBestTi+"</td>";
            summHtmlStr += "</tr>";
          }
          summHtmlStr += "</tbody>";
          summHtmlStr += "</table>";
          $("#summaryDiv").html(summHtmlStr);

          Data.changePark();
        }
      })
  },

  changePark:function() {
    $("#parkSelect").change(function() {
      var str = "";
      var val = "";
      $("select option:selected").each(function() {
          str += $(this).val();
          val += $(this).text();
      });
      $("#selectedPark").val(str);
      console.log(str+","+ $("#athleteNum").val());
      if(str=="all") {
          $("#summaryDiv").css("display", "block");
          $("#chartDiv").css("display", "none");
          $("#infoDiv").css("display", "none");
      } else {
          $("#summaryDiv").css("display", "none");
          $("#chartDiv").css("display", "block");
          $("#infoDiv").css("display", "block");
      }
      Data.getInfo(str, $("#athleteNum").val());
      $("#infoTitle").text(val);
    }).trigger("change");
  },

  getInfo:function(park, num) {
      var urlStr = "http://www.parkrun.com.au/"+park+"/results/athletehistory/?athleteNumber="+num;
      var proxy = "https://cors-anywhere.herokuapp.com/";
      var infoArr = [];
      var info = {};
      var htmlStr = "";
      var maxTime = 0;
      var minTime = 9999;

      $.ajax({
        url : proxy + urlStr,
        dataType : "html",
        error : function() {
          document.write("fail to get data from server");
        },
        success : function(data) {
          var resultElem = $(data).find("#results")[2];
          //var resultElem = '<table class="sortable" id="results" cellspacing="4" cellpadding="0" align="center" border="0"> <caption>All Results</caption> <thead><tr><th>Run Date</th><th>Run Number</th><th>Pos</th><th>Time</th><th>Age Grade</th><th>PB?</th></tr></thead> <tbody><tr><td><a href="http://www.parkrun.com.au/parramatta/results/weeklyresults?runSeqNumber=256">25/12/2017</a></td><td><a href="http://www.parkrun.com.au/parramatta/results/weeklyresults?runSeqNumber=256">256</a></td><td>114</td><td>29:22</td><td>51.53%</td><td></td></tr> <tr><td><a href="http://www.parkrun.com.au/parramatta/results/weeklyresults?runSeqNumber=240">09/09/2017</a></td><td><a href="http://www.parkrun.com.au/parramatta/results/weeklyresults?runSeqNumber=240">240</a></td><td>121</td><td>28:21</td><td>53.38%</td><td>PB</td></tr> </tbody> </table>';

          var idx = 0;
          $(resultElem).find("td").each(function() {
            var hourTempVar = "";
            var minTempVar = "";
            if(idx % 6 === 0) {
              info.runDate = $(this).text();
            } else if(idx % 6 === 1) {
              info.runNum = $(this).text();
            } else if(idx % 6 === 2) {
              info.runPos = $(this).text();
            } else if(idx % 6 === 3) {
              info.runTime = $(this).text();
              hourTempVar = ($(this).text().split(":"))[0];
              minTempVar = ($(this).text().split(":"))[1];
              if(maxTime < parseInt(hourTempVar + minTempVar)) {
                maxTime = parseInt(hourTempVar + minTempVar);
              }
              if(minTime > parseInt(hourTempVar + minTempVar)) {
                minTime = parseInt(hourTempVar + minTempVar);
              }
            } else if(idx % 6 === 4) {
              info.runAgeGrade = $(this).text();
            } else if(idx % 6 === 5) {
              info.runPB = $(this).text();
            }

            if(idx % 6 === 5) {
              infoArr.push(info);
              info = {};
            }
            idx++;
          });

          htmlStr += "<table class='table table-striped'>";
          htmlStr += "<thead>";
          htmlStr += "<tr>";
          htmlStr += "<th>Run Date</th>";
          htmlStr += "<th>Run Num</th>";
          htmlStr += "<th>Pos</th>";
          htmlStr += "<th>Time</th>";
          htmlStr += "<th>Age Grade</th>";
          htmlStr += "<th>PB?</th>";
          htmlStr += "</tr>";
          htmlStr += "</thead>";
          htmlStr += "<tbody>";

          for (var i in infoArr) {
            htmlStr += "<tr>";
            htmlStr += "<td>"+infoArr[i].runDate+"</td>";
            htmlStr += "<td>"+infoArr[i].runNum+"</td>";
            htmlStr += "<td>"+infoArr[i].runPos+"</td>";
            htmlStr += "<td>"+infoArr[i].runTime+"</td>";
            htmlStr += "<td>"+infoArr[i].runAgeGrade+"</td>";
            htmlStr += "<td>"+infoArr[i].runPB+"</td>";
            htmlStr += "</tr>";
            $("#infoDiv").html(htmlStr);
          }
          htmlStr += "</tbody>";
          htmlStr += "</table>";
          Graph.getGraph(infoArr, maxTime, minTime);
        }
      });
    }
  }

var Links = {
  setColor : function(color) {
    var aList = document.querySelectorAll('a');
    var i = 0;
    while(i < aList.length) {
      aList[i].style.color=color;
      i++;
    }
    //$('a').css('color',color);
  }
}

var Body = {
  setBackgroudColor : function(color) {
    document.querySelector('body').style.backgroundColor=color;
  },
  setColor : function(color) {
    document.querySelector('body').style.color=color;
  }
}

function nightDayHandler(self) {
  var target = document.querySelector('body');
  if(self.value==='night') {
    Body.setBackgroudColor('black');
    Body.setColor('white');
    Links.setColor('powderBlue');
    self.value='day';
  } else {
    Body.setBackgroudColor('white');
    Body.setColor('black');
    Links.setColor('blue');
    self.value='night';
  }
}
