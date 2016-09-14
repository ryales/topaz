function hxlProxyToJSON(input,headers){
  var output = [];
  var keys=[];
  input.forEach(function(e,i){
      if(headers==true && i==0){
          keys = e;
      } else if(headers==true && i>1) {
          var row = {};
          e.forEach(function(e2,i2){
              row[keys[i2]] = e2;
          });
          output.push(row);
      } else if(headers!=true){
          var row = {};
          e.forEach(function(e2,i2){
              row[keys[i2]] = e2;
          });
          output.push(row);
      }
  });
  return output;
}

function generateStats(idA,idB,data){
    // Define variables for demographic stats
    var tEmbark    = 0;
        tDisembark = 0;

        tTransIn   = 0;
        tTransOut  = 0;

        tRescue    = 0;
        tMen       = 0;
        tWomen     = 0;
        tChild     = 0;
        tDead      = 0;
        tOps = data.length;

    // Define variables for operations counts
    var tRescueOps    = 0;
        tDisembarkOps = 0;
        tTransInOps   = 0;
        tTransOutOps  = 0;

    var pplRescued   = 0;
        pplTransIn   = 0;
        pplTransOut  = 0;
        pplDisembark = 0;

    for(i = 0; i < tOps; i++) {
        numEmbark    = parseInt(data[i]['sTotal']);
        numDisembark = parseInt(data[i]['disTotal']);

        if (!isNaN(numEmbark)) {tEmbark += numEmbark;};
        if (!isNaN(numDisembark)) {tDisembark += numDisembark;};

        numMen    = parseInt(data[i]['sMen']);
        numWomen  = parseInt(data[i]['sWomen']);
        numChild  = parseInt(data[i]['sChildren']);
        numDead   = parseInt(data[i]['dTotal']);

        if (!isNaN(numMen))   {tMen   += numMen;};
        if (!isNaN(numWomen)) {tWomen += numWomen;};
        if (!isNaN(numChild)) {tChild += numChild;};
        if (!isNaN(numDead))  {tDead  += numDead;};

        if (data[i]['opType'] == "Rescue") {
          tRescue += 1;
          pplRescued += parseInt(data[i]['sTotal']);
        } else if (data[i]['opType'] == "Disembarkment") {
          tDisembark += 1;
          pplDisembark += parseInt(data[i]['disTotal']); 
        } else if (data[i]['opType'] == "Transfer In") {
          tTransIn += 1;
          pplTransIn += parseInt(data[i]['sTotal']);
        } else if (data[i]['opType'] == "Transfer Out") {
          tTransOut += 1;
          pplTransOut += parseInt(data[i]['disTotal']);
        }

    }

        console.log("Total Embarked: " + tEmbark);
        console.log("Total Disembarked: " + tDisembark);
        console.log("Total Men: " + tMen);
        console.log("Total Women: " + tWomen);
        console.log("Total Children: " + tChild);
        console.log("Total Dead: " + tDead);

        console.log("Total Rescued: " + pplRescued);
        console.log("Total Transferred In: " + pplTransIn);
        console.log("Total Transferred Out: " + pplTransOut);
        console.log("Total Disembarked: " + pplDisembark);



    // Push list items to arrays by category
    for (i = 0; i < tOps; i++) {
      if (data[i]['opType'] == "Rescue") {
        tRescueOps += 1;
      } else if (data[i]['opType'] == "Disembarkment") {
        tDisembarkOps += 1;     
      } else if (data[i]['opType'] == "Transfer In") {
        tTransInOps += 1;
      } else if (data[i]['opType'] == "Transfer Out") {
        tTransOutOps += 1;
      }
    }

    console.log(tOps,tMen,tWomen,tChild);
    console.log(tRescueOps,tDisembarkOps,tTransInOps,tTransOutOps);


      var htmlA = '<h3>STATISTICS</h3>';
      htmlA = htmlA + "<p>Rescues: <span class='figure'>" + tRescueOps + '</span><br/>';
      htmlA = htmlA + "Bodies Recovered: <span class='figure'>" + tDead + "</span></br>";
      htmlA = htmlA + "People Rescued: <span class='figure'>" + pplRescued + '</span><p/>';

      var htmlB = "<img alt='Rescue Symbol' title='People Rescued from the Sea' class='icon' src='img/rescue_black.svg'>";
      htmlB = htmlB + "<span class='figure-padding'>" + pplRescued + "</span><br/>";
      htmlB = htmlB + "<img alt='Transferred In Symbol' title='People Taken Onboard from Other Rescue Vessels' class='icon' src='img/transfer_in_black.svg'>";
      htmlB = htmlB + "<span class='figure-padding'>" + pplTransIn + "</span>";


      var htmlC = "<img alt='Disembark Symbol' title='People Disembarked on Land' class='icon' src='img/disembark_black.svg'>";
      htmlC = htmlC + "<span class='figure-padding'>" + pplDisembark + "</span><br/>";
      htmlC = htmlC + "<img  alt='Transferred Out Symbol' title='People Transferred to Other Rescue Vessels' class='icon' src='img/transfer_out_black.svg'>";
      htmlC = htmlC + "<span class='figure-padding'>" + pplTransOut + "</span>";

      /*

       + tRescues;
       + tDisembark;
      htmlB = htmlB + "</div></div><div class='col-md-3 col-sm-6'>";
       </br>" + tTransIn;
       </br>" + tTransOut;*/
      

      $(idA).html(htmlA);
      $('#embark_stats').html(htmlB);
      $('#disembark_stats').html(htmlC);
      generatePieCharts(tMen,tWomen,tChild,tDead,pplRescued,pplDisembark,pplTransOut,pplTransIn);
}

function generateCharts(data) {
    var mwc = dc.pieChart("#mwc_pieChart");
      //sad = dc.pieChart("#sad_pieChart")

    var cf_topaz = crossfilter(data);

    var all = cf_topaz.groupAll();

    var rescuesByDateDimension  = cf_topaz.dimension(function(d){ return d["date"]; });
    var rescuesByTotalDimension = cf_topaz.dimension(function(d){ return d["sTotal"]; });

    var totalRescued   = rescuesByTotalDimension.group().reduceSum(function(d) {return d["sMen"];});
    var menGroup   = rescuesByTotalDimension.group().reduceSum(function(d) {return d["sMen"];});
    var womenGroup = rescuesByTotalDimension.group().reduceSum(function(d) {return d["sWomen"];});
    var childGroup = rescuesByTotalDimension.group().reduceSum(function(d) {return d["sChildren"];});

    var rescueGroupsByTotal = cf_topaz.groupAll().reduceSum(function(d){ return d["sTotal"]; }).value();
    var rescueGroupsByMen = cf_topaz.groupAll().reduceSum(function(d){ return d["sMen"]; });
    var rescueGroupsByWomen = cf_topaz.groupAll().reduceSum(function(d){ return d["sWomen"]; });
    var rescueGroupsByChild = cf_topaz.groupAll().reduceSum(function(d){ return d["sTotal"] - d["sChildren"]; }).value();

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

function outputMedia(media) {
  var o1 = "";
      o2 = "";
      o3 = "";

  var videoArray = [];
  var storyArray = [];
  var photoArray = [];

  // Push list items to arrays by category
  for (i = 0; i < media.length; i++) {
    if (media[i]['Category'] == "Video") {
      videoArray.push("<li class=list-group-item><a href=" + media[i]['URL'] + ">" + media[i]['Title'] + "</a></li> ");
    } else if (media[i]['Category'] == "Story") {
      storyArray.push("<li class=list-group-item><a href=" + media[i]['URL'] + ">" + media[i]['Title'] + "</a></li> ");     
    } else if (media[i]['Category'] == "Photos") {
      photoArray.push("<li class=list-group-item><a href=" + media[i]['URL'] + ">" + media[i]['Title'] + "</a></li> ");
    }
  }

  // Output first five items per category if more than 5
  for ( k = 0; k < 5; k++ ) {
    if (k > videoArray.length - 1) { break; }
    o1 += videoArray[k];
  }
  for ( k = 0; k < 5; k++ ) {
    if (k > storyArray.length - 1) { break; }
    o2 += storyArray[k];
  }
  for ( k = 0; k < 5; k++ ) {
    if (k > photoArray.length - 1) { break; }
    o3 += photoArray[k];   
  }

  var html1 = "";
      html1 = html1 + o1;

  var html2 = "";
      html2 = html2 + o2;

  var html3 = "";
      html3 = html3 + o3;

  $(videoOutput).html(html1);
  $(newsOutput).html(html2);
  $(photoOutput).html(html3);
}

function generatePieCharts(tm,tw,tc,td,pr,pd,po,pi) {
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
    data: mwcData,
    options: {
      legend: {
        display: false
      }
    }
  });

  var ops = document.getElementById("opsChart");
  //console.log(mwc);
  var opsData = {
    labels: ["Rescued from the Sea","Disembarked on Land","Transferred to Other Rescue Vessel","Transferred onto the Responder Vessel"],
    datasets: [
      {
        data: [pr,pd,po,pi],
        backgroundColor: [
              "#CD0000",
              "#EE3B3B",
              "#F08080",
              "#F07432"
          ],
          hoverBackgroundColor: [
              "#CD0000",
              "#EE3B3B",
              "#F08080",
              "#F07432"
          ]
        }]
  };

  mwcChart = new Chart(ops,{
    type: 'pie',
    data: opsData,
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

var mediaCall = $.ajax({
    type: 'GET',
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=off&force=on&url=https%3A//docs.google.com/spreadsheets/d/1pH0ztwQ8_EUOIKHhi1U15A6W4eLgCnn8IoWBEYTVnUM/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv',
    dataType: 'json',
});

$.when(dataCall,mediaCall).then(function(dataArgs,mediaArgs){
    var data  = hxlProxyToJSON(dataArgs[0],true);
        media = hxlProxyToJSON(mediaArgs[0],true);

    var dateFormat = d3.time.format("%d/%m/%Y");

    data.forEach(function(d){
        d['Date'] = dateFormat.parse(d['date']);
    });

    media.forEach(function(d){
        d['DATE'] = dateFormat.parse(d['DATE']);
    })

    console.log("Data: ", data);
    console.log("Media: ", media);
    outputMedia(media);
    generateStats("#tot_stats","#ops_stats",data);
});
