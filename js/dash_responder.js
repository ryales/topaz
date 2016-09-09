function hxlProxyToJSON(input,headers){
  var output = [];
  var keys=[];
  input.forEach(function(e,i){
      if(headers==true && i==0){
          keys = e;
          console.log(keys);
      } else if(headers==true && i>1) {
          var row = {};
          e.forEach(function(e2,i2){
              row[keys[i2]] = e2;
              //console.log(row);
          });
          output.push(row);
      } else if(headers!=true){
          var row = {};
          e.forEach(function(e2,i2){
              row[keys[i2]] = e2;
              //console.log(row);
          });
          output.push(row);
      }
  });
  return output;
}

function generateStats(idA,idB,data){
    var tSaved   = 0;
        tMen     = 0;
        tWomen   = 0;
        tChild   = 0;
        tDead    = 0;
        tRescues = data.length;

    for(i = 0; i < tRescues; i++) {
        numSaved  = parseInt(data[i]['Saved Total']);
        numMen    = parseInt(data[i]['Saved Men']);
        numWomen  = parseInt(data[i]['Saved Women']);
        numChild  = parseInt(data[i]['Saved Children']);
        numDead   = parseInt(data[i]['Dead Total']);

        if (!isNaN(numSaved)) {tSaved += numSaved;};
        if (!isNaN(numMen))   {tMen   += numMen;};
        if (!isNaN(numWomen)) {tWomen += numWomen;};
        if (!isNaN(numChild)) {tChild += numChild;};
        if (!isNaN(numDead)) {tDead += numDead;};
    }

    //console.log(tMen,tWomen,tChild);

      var htmlA = '<h3>STATISTICS</h3>';
      htmlA = htmlA + "<p>Rescues: <span class='figure'>" + tRescues + '</span><br/>';
      htmlA = htmlA + "Bodies Recovered: <span class='figure'>" + tDead + "</span></br>";
      htmlA = htmlA + "People Rescued: <span class='figure'>" + tSaved + '</span><p/>';

      //var htmlB = "<p>Bodies Recovered: <span class='figure'>" + tDead + '</span></p>';

      $(idA).html(htmlA);
      //$(idB).html(htmlB);
      generatePieCharts(tMen,tWomen,tChild,tDead);
}

function generateCharts(data) {
    var mwc = dc.pieChart("#mwc_pieChart");
      //sad = dc.pieChart("#sad_pieChart")

    var cf_topaz = crossfilter(data);

    var all = cf_topaz.groupAll();

    var rescuesByDateDimension  = cf_topaz.dimension(function(d){ return d["Date"]; });
    var rescuesByTotalDimension = cf_topaz.dimension(function(d){ return d["Saved Total"]; });

    var totalRescued   = rescuesByTotalDimension.group().reduceSum(function(d) {return d["Saved Men"];});
    var menGroup   = rescuesByTotalDimension.group().reduceSum(function(d) {return d["Saved Men"];});
    var womenGroup = rescuesByTotalDimension.group().reduceSum(function(d) {return d["Saved Women"];});
    var childGroup = rescuesByTotalDimension.group().reduceSum(function(d) {return d["Saved Children"];});

    var rescueGroupsByTotal = cf_topaz.groupAll().reduceSum(function(d){ return d["Saved Total"]; }).value();
    var rescueGroupsByMen = cf_topaz.groupAll().reduceSum(function(d){ return d["Saved Men"]; });
    var rescueGroupsByWomen = cf_topaz.groupAll().reduceSum(function(d){ return d["Saved Women"]; });
    var rescueGroupsByChild = cf_topaz.groupAll().reduceSum(function(d){ return d["Saved Total"] - d["Saved Children"]; }).value();

    mwc.width($('#savedtotal').width()).height(250)
      .dimension(rescuesByTotalDimension)
      .group(childGroup)
      .innerRadius(10)
          //.externalLabels(-20)
          //.externalRadiusPadding(0)
      .colors(function(d){ /*console.log(d);*/ return colorScale(d); })
      .legend(dc.legend().x(5).y(110).itemHeight(13).gap(2))
      .renderLabel(true)
      /*.renderlet(function(e){
              var html = "";
              e.filters().forEach(function(l){
                  html += l+", ";
              });
              $('#mapfilter').html(html);
      })*/;

    dc.dataCount('#savedtotal')
      .dimension(cf_topaz)
      .group(rescueGroupsByTotal);

    dc.dataCount('#mentotal')
      .dimension(cf_topaz)
      .group(rescueGroupsByMen);

    dc.dataCount('#childtotal')
      .dimension(cf_topaz)
      .group(rescueGroupsByChild);

      dc.renderAll();

}

function generatePieCharts(tm,tw,tc,td) {
  var mwc = document.getElementById("mwcChart");
  //console.log(mwc);
  var mwcData = {
    labels: ["Men Saved","Women Saved","Children Saved"],
    datasets: [
      {
        data: [tm,tw,tc],
        backgroundColor: [
              "#CD0000",
              "#EE3B3B",
              "#F08080"
          ],
          hoverBackgroundColor: [
              "#CD0000",
              "#EE3B3B",
              "#F08080"
          ]
        }]
  };
  var sum = tm+tw+tc+td;

  mwcChart = new Chart(mwc,{
    type: 'pie',
    responsive: false,
    data: mwcData,
    options: {
      legend: {
        display: false
      }
    }
  });

  var sad = document.getElementById("sadChart");
  //console.log(mwc);
  var sadData = {
    labels: ["Total Rescued","Bodies Recovered"],
    datasets: [
      {
        data: [sum,td],
        backgroundColor: [
              "#CD0000",
              "#EE3B3B"
          ],
          hoverBackgroundColor: [
              "#CD0000",
              "#EE3B3B"
          ]
        }]
  };

  sadChart = new Chart(sad,{
    type: 'pie',
    data: sadData,
    options: {
      legend: {
        display: false
      }
    }
  });
}

var dataCall = $.ajax({
    type: 'GET',
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=off&force=on&url=https%3A//docs.google.com/spreadsheets/d/1RnEigM1KUihlDe9hlM8ndLZro6CIv90fol8HVpnQnYg/pub%3Fgid%3D613947999%26single%3Dtrue%26output%3Dcsv',
    dataType: 'json',
});

$.when(dataCall).then(function(dataArgs){
    var data = hxlProxyToJSON(dataArgs,true);

    var dateFormat = d3.time.format("%d/%m/%Y");

    data.forEach(function(d){
        d['Date'] = dateFormat.parse(d['Date']);
    });

    console.log("data: ", data);

    generateStats("#tot_stats","#sad_stats",data);
  });
