var graphValue = "1year";
var graphStock = "USA";
var graphData = [];
var MEOHData = {label: "",color: "#336699",data: []};
var convert = false;
var currentTime = new Date();
currentTime.setDate(currentTime.getDate()-1);



function populateStats(url) {

    var http_request = new XMLHttpRequest();
    try {
        // Opera 8.0+, Firefox, Chrome, Safari
        http_request = new XMLHttpRequest();
    } catch (e) {
        // Internet Explorer Browsers
        try {
            http_request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
                // Something went wrong
                alert("Error collecting data");
                return false;
            }
        }
    }
    http_request.onreadystatechange = function() {
        if (http_request.readyState == 4) 
        {
            
            var jsonObj = JSON.parse(http_request.responseText);
            
            var jsonQuotes = jsonObj.query.results.quote;
            //first table
            document.getElementById("lasttrade").innerHTML = jsonQuotes.LastTradePriceOnly;
            if (parseFloat(jsonQuotes.Change) < 0.0)
                document.getElementById("change").innerHTML = jsonQuotes.Change.fontcolor("red") + " (" + jsonQuotes.ChangeinPercent.fontcolor("red") + ")";
            else
                document.getElementById("change").innerHTML = jsonQuotes.Change + " (" + jsonQuotes.ChangeinPercent + ")";
            
            document.getElementById("volume").innerHTML = numberWithCommas(jsonQuotes.Volume);
            document.getElementById("open").innerHTML = jsonQuotes.Open;
            document.getElementById("previousclose").innerHTML = jsonQuotes.PreviousClose;
            document.getElementById("dayrange").innerHTML = jsonQuotes.DaysRange;
            document.getElementById("timeoflasttrade").innerHTML = jsonQuotes.LastTradeTime;
            //second table
            document.getElementById("exchange").innerHTML = jsonQuotes.StockExchange;
            document.getElementById("cap").innerHTML = jsonQuotes.MarketCapitalization;
            document.getElementById("52weekrange").innerHTML = jsonQuotes.YearRange;
            document.getElementById("divdate").innerHTML = jsonQuotes.ExDividendDate;
            document.getElementById("divshare").innerHTML = jsonQuotes.DividendShare;
            document.getElementById("movingaverage").innerHTML = jsonQuotes.FiftydayMovingAverage;
        
        }
    
    }
    
    http_request.open("GET", url, true);
    http_request.send();
    
}


function numberWithCommas(num) {
    var parts = num.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function getIndexOfArr(arr, k) {
    for (var i = (arr.length - 1); i >= 0; i--) {
        if (arr[i][0] >= k) {
            return [i];
        }
    }
}

function retrieveData(fileName, dataFile, stock) {
    return $.ajax({
        url: 'api/' + stock,
        type: "GET",
        dataType: "text",
        success: function(data) {
            var checkForDate = function(value) {
                var pos = value.indexOf('-');
                if (pos == -1) 
                {
                    return parseFloat(value);
                } else {
                    var part = value.split('-');
                    var date = new Date(part[0], (part[1] - 1), part[2]);
                    return date.getTime();
                }
            };

            dataFile.data = $.csv.toArrays(data, {onParseValue: checkForDate});
            dataFile.data.splice(0, 1);
            
            for (var i = 0; i < dataFile.data.length; i++) 
            {
                dataFile.data[i].splice(1, 5);
            }
        }
    });

}

function convertToPercent(indexes, dataFile, stock, graphColor){
            var percentData = {label: stock, color: graphColor,data: []};
            if (typeof(dataFile.data[indexes]) === 'undefined' || dataFile.data[indexes] === null)
            {
                indexes = dataFile.data.length - 1;
                var baseValue = dataFile.data[indexes][1];
            }
            else
            {
                var baseValue = dataFile.data[indexes][1];
            }
            for (var i = 0; i <= indexes; i++) 
            {
                var dataArr = [];
                dataArr.push(dataFile.data[i][0]);
                dataArr.push(((dataFile.data[i][1] / baseValue) * 100.00) - 100);
                percentData.data.push(dataArr);
            }
            return percentData;
}

function setGraph() {
    if (graphValue == "5year")
        $("#5Year").click();
    else if (graphValue == "1year")
        $("#Year").click();
    else if (graphValue == "Quarter")
        $("#Quarter").click();
    else if (graphValue == "Month")
        $("#Month").click();
}

function setButtonClicks() {
    $("#USA").click(function() {
        graphStock = "USA";
        var NasdaqMEOH = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20%3D%20%22MEOH%22&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=";

        populateStats(NasdaqMEOH);
        MEOHData.label = "MEOH";
        setButtonColor();

        $.when(retrieveData("stockData.php", MEOHData, "MEOH")).done(function(){
            clearOptions();
            setGraph();
        });
    });
    $("#Canada").click(function() {
        graphStock = "Canada";
        var TorontoMEOH = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20%3D%20%22MX.TO%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";

        populateStats(TorontoMEOH);
        MEOHData.label = "MX.TO";
        setButtonColor();

        $.when(retrieveData("stockData.php", MEOHData, "MX.TO")).done(function(){
            clearOptions();
            setGraph();
        });
    });
     $("#5Year").click(function() {
        graphValue = "5year";
        setButtonColor();
        
        if (isAnythingChecked())
        {
            calPercents();
        }else
            $.plot("#stockGraph", [MEOHData], getGraphOptions());
    });
    $("#Year").click(function() {
        graphValue = "1year";
        setButtonColor();

        if (isAnythingChecked())
        {
            calPercents();
        }else
        {
            var index = getIndexOfArr(MEOHData.data, (new Date(currentTime.getFullYear() - 1, currentTime.getMonth(), currentTime.getDate())).getTime());
            var tempMEOH = {};
            tempMEOH = JSON.parse(JSON.stringify(MEOHData));
            tempMEOH.data.splice(parseInt(index) + 1, tempMEOH.data.length);
            clearGraph();
            if (graphData.length <= 0)
            {
                graphData.push(tempMEOH);
                $.plot("#stockGraph", graphData, getGraphOptions(index));
            }
        }
    });  
    $("#Quarter").click(function() {
        graphValue = "Quarter";
        setButtonColor();
        
       if (isAnythingChecked())
        {
            calPercents();
        }
        else 
        {
            var index = getIndexOfArr(MEOHData.data, (new Date(currentTime.getFullYear(), (currentTime.getMonth() - 3), currentTime.getDate())).getTime());
            var tempMEOH = {};
            tempMEOH = JSON.parse(JSON.stringify(MEOHData));
            tempMEOH.data.splice(parseInt(index) + 1, tempMEOH.data.length);
            clearGraph();
            if (graphData.length <= 0)
            {
                graphData.push(tempMEOH);
                $.plot("#stockGraph", graphData, getGraphOptions(index));
            }
        }
    });
    $("#Month").click(function() {
        graphValue = "Month";
        setButtonColor();
        //var dateToSearch = (new Date(currentTime.getFullYear(), (currentTime.getMonth() - 1), currentTime.getDate())).getTime();
        if (isAnythingChecked())
        {
            calPercents();
        }
        else 
        {
            var tempMEOH = {};
            var index = getIndexOfArr(MEOHData.data, (new Date(currentTime.getFullYear(), (currentTime.getMonth() - 1), currentTime.getDate())).getTime());
            tempMEOH = JSON.parse(JSON.stringify(MEOHData));
            tempMEOH.data.splice(parseInt(index) + 1, tempMEOH.data.length);
            clearGraph();
            if (graphData.length <= 0)
            {
                graphData.push(tempMEOH);
                $.plot("#stockGraph", graphData, getGraphOptions(index));
            }
        }
    });
    $("#Compare").click(function() {
        if (isAnythingChecked())
        {
            calPercents();
        }else
            alert("Please select a comparison.");
      
        
    });
}


function setButtonColor() {
    if (graphStock == "USA")
    {
        document.getElementById("USA").style.backgroundColor = '#336699';
        document.getElementById("Canada").style.backgroundColor = '#FFFFFF';
    }else
    {

        document.getElementById("USA").style.backgroundColor = '#FFFFFF';
        document.getElementById("Canada").style.backgroundColor = '#336699';
    }
    
    if (graphValue == "5year")
    {
        document.getElementById("5Year").style.backgroundColor = '#336699';
        document.getElementById("Year").style.backgroundColor = '#FFFFFF';
        document.getElementById("Quarter").style.backgroundColor = '#FFFFFF';
        document.getElementById("Month").style.backgroundColor = '#FFFFFF';
    }
    else if (graphValue == "1year")
    {
        document.getElementById("5Year").style.backgroundColor = '#FFFFFF';
        document.getElementById("Year").style.backgroundColor = '#336699';
        document.getElementById("Quarter").style.backgroundColor = '#FFFFFF';
        document.getElementById("Month").style.backgroundColor = '#FFFFFF';
    }
    else if (graphValue == "Quarter")
    {
        document.getElementById("5Year").style.backgroundColor = '#FFFFFF';
        document.getElementById("Year").style.backgroundColor = '#FFFFFF';
        document.getElementById("Quarter").style.backgroundColor = '#336699';
        document.getElementById("Month").style.backgroundColor = '#FFFFFF';
    }
    else if (graphValue == "Month")
    {
        document.getElementById("5Year").style.backgroundColor = '#FFFFFF';
        document.getElementById("Year").style.backgroundColor = '#FFFFFF';
        document.getElementById("Quarter").style.backgroundColor = '#FFFFFF';
        document.getElementById("Month").style.backgroundColor = '#336699';
    }
}

function calPercents() {
        clearGraph();
        if (graphData.length <= 0)
        {
            
            var promises = [];
            var index;
            if (graphValue == "5year")
            {
                index = getIndexOfArr(MEOHData.data, (new Date(currentTime.getFullYear() - 5, currentTime.getMonth(), currentTime.getDate())).getTime());
                
            }
            else if (graphValue == "1year")
            {
                index = getIndexOfArr(MEOHData.data, (new Date(currentTime.getFullYear() - 1, currentTime.getMonth(), currentTime.getDate())).getTime());
                
            }
            else if (graphValue == "Quarter")
            {
                index = getIndexOfArr(MEOHData.data, (new Date(currentTime.getFullYear(), (currentTime.getMonth() - 3), currentTime.getDate())).getTime());
            }
            else if (graphValue == "Month")
            {
                index = getIndexOfArr(MEOHData.data, (new Date(currentTime.getFullYear(), (currentTime.getMonth() - 1), currentTime.getDate())).getTime());

            }
            var options = getGraphOptions(index);
            //add MEOH first
            graphData.push(convertToPercent(index, MEOHData, MEOHData.label, "#336699"));
            if (SP.checked) 
            {
                //add SP to graph
                if (typeof SNPData != 'object')
                {
                    window.SNPData = {label: "S & P 500",data: []};
                    var SNPPromise = retrieveData("stockData.php", SNPData, "^GSPC");
                    promises.push(SNPPromise);
                    $.when(SNPPromise).done(function(){
                        graphData.push(convertToPercent(index, SNPData, SNPData.label, "#FA0515"));
                    });
                }else
                    graphData.push(convertToPercent(index, SNPData, SNPData.label, "#FA0515"));
            }
            if (SPChemical.checked) 
            {
                //add SP chemicals to graph
                if (typeof SNPChemicalData != 'object')
                {
                    window.SNPChemicalData = {label: "S & P Chemical Index",data: []};
                    var SNPPromise = retrieveData("stockData.php", SNPChemicalData, "^CEX");
                    promises.push(SNPPromise);
                    $.when(SNPPromise).done(function(){
                        graphData.push(convertToPercent(index, SNPChemicalData, SNPChemicalData.label, "#FFA600"));
                    });
                }else
                    graphData.push(convertToPercent(index, SNPChemicalData, SNPChemicalData.label, "#FFA600"));
            }
            if (Nasdaq.checked) 
            {
                //add Nasdaq to graph
                if (typeof nasdaqData != 'object')
                {
                    window.nasdaqData = {label: "Nasdaq",data: []};
                    var nasdaqPromise = retrieveData("stockData.php", nasdaqData, "^NDX");
                    promises.push(nasdaqPromise);
                    $.when(nasdaqPromise).done(function(){
                        graphData.push(convertToPercent(index, nasdaqData, nasdaqData.label, "#1FDB1F"));
                    });
                }else
                    graphData.push(convertToPercent(index, nasdaqData, nasdaqData.label, "#1FDB1F"));
            }
           
            if ($.trim($("#compareText").val()).length !== 0)
            {
                    if (typeof searchData != 'object')
                    {    
                        window.searchData = {data: []};
                    }
                    var searchedStock = $.trim($("#compareText").val());
                    if ($.trim($("#compareText").val()) !== searchData.label)
                    {
                        $("#Compare").attr("disabled", true);
                        searchData.label = searchedStock;
                        var searchPromise = retrieveData("stockData.php", searchData, searchedStock);
                        promises.push(searchPromise);
                        $.when(searchPromise).done(function(){
                            //if there's no data returned, don't try and convert
                            if($.isEmptyObject(searchData.data) === false)
                            {
                                graphData.push(convertToPercent(index, searchData, searchData.label, "#FA05D9"));
                                $("#errorField").css("visibility","hidden");
                            }else
                            {
                                $("#errorField").css("visibility","visible");
                            }
                            $("#Compare").attr("disabled", false);
                        });
                    }
                    else
                    {
                        graphData.push(convertToPercent(index, searchData, searchData.label, "#FA05D9"));
                    }
                    
            }
            
            
            
            $.when.apply(null, promises).done(function(){
                if (graphData.length > 0)
                {
                 $.plot("#stockGraph", graphData, options);
                }
            });
        }
}

function clearGraph() {
    while(graphData.length > 0)
        {
            graphData.pop();
        }
}

function clearOptions() {
    $("input[type=checkbox]").each(function (){
        $(this).attr("checked", false);
    });
    $("#compareText").val("");
}

function isAnythingChecked() {
    convert = false;
    if($("input:checkbox:checked").length > 0)
    {
      convert = true;
    }
    if (!($.trim($("#compareText").val()).length === 0))
    {
        convert = true;          
    }
    return convert;
}

function getGraphOptions(index) {
    filled = !isAnythingChecked();
    options = {};
    if (graphValue == "5year")
            {
                options = {
                    lines: {
                        show: true,
                        fill: filled,
                        zero: false
                    },
                    yaxis: {
                        labelHeight: 10,
                        tickFormatter: function(v, axis) {
                            if (convert == true)
                            {
                                return v.toFixed(axis.tickDecimals) + '%';
                            }else
                                return v.toFixed(axis.tickDecimals);
                        }
                    },
                    xaxis: {
                        mode: "time",
                        labelWidth: 10,
                        labelHeight: 10,
                        ticks: [MEOHData.data[MEOHData.data.length - 1][0], 
                            (new Date(currentTime.getFullYear() - 4, currentTime.getMonth(), currentTime.getDate())).getTime(), 
                            (new Date(currentTime.getFullYear() - 3, currentTime.getMonth(), currentTime.getDate())).getTime(), 
                            (new Date(currentTime.getFullYear() - 2, currentTime.getMonth(), currentTime.getDate())).getTime(), 
                            (new Date(currentTime.getFullYear() - 1, currentTime.getMonth(), currentTime.getDate())).getTime(), 
                            MEOHData.data[0][0]]
                    },
                    legend: {
                        show: true,
                        container: $("#legend")
                    }
                };
            }
            else if (graphValue == "1year")
            {
                options = {
                        lines: {
                            show: true,
                            fill: filled,
                            zero: false
                        },
                        
                            yaxis: {
                                labelHeight: 10,
                                tickFormatter: function(v, axis) {
                                    if (convert == true)
                                    {
                                        return v.toFixed(axis.tickDecimals) + '%';
                                    }else
                                        return v.toFixed(axis.tickDecimals);
                                }
                            },

                        xaxis: {
                            mode: "time",
                            timeformat: "%b %d",
                            labelWidth: 10,
                            labelHeight: 10,
                            min: MEOHData.data[index][0],
                            ticks: [MEOHData.data[index][0], 
                                (new Date(currentTime.getFullYear(), currentTime.getMonth() - 10, currentTime.getDate())).getTime(), 
                                (new Date(currentTime.getFullYear(), currentTime.getMonth() - 8, currentTime.getDate())).getTime(), 
                                (new Date(currentTime.getFullYear(), currentTime.getMonth() - 6, currentTime.getDate())).getTime(), 
                                (new Date(currentTime.getFullYear(), currentTime.getMonth() - 4, currentTime.getDate())).getTime(), 
                                (new Date(currentTime.getFullYear(), currentTime.getMonth() - 2, currentTime.getDate())).getTime(), 
                                MEOHData.data[0][0]]
                        },
                        legend: {
                            show: true,
                            container: $("#legend")
                        }
                    };
            }
            else if (graphValue == "Quarter")
            {
                options = {
                    lines: {
                        show: true,
                        fill: filled,
                        zero: false
                    },
                    xaxis: {
                        mode: "time",
                        timeformat: "%b %d",
                        labelWidth: 10,
                        labelHeight: 10,
                        min:  MEOHData.data[index][0],
                        ticks: [MEOHData.data[index][0], 
                            (new Date(currentTime.getFullYear(), currentTime.getMonth() - 2, currentTime.getDate())).getTime(), 
                            (new Date(currentTime.getFullYear(), currentTime.getMonth() - 1, currentTime.getDate())).getTime(), 
                            MEOHData.data[0][0]]
                    },
                    yaxis: {
                        labelHeight: 10,
                        tickFormatter: function(v, axis) {
                            if (convert == true)
                            {
                                return v.toFixed(axis.tickDecimals) + '%';
                            }else
                                return v.toFixed(axis.tickDecimals);
                            }
                    },
                    legend: {
                        show: true,
                        container: $("#legend")
                    }
                };
            }
            else if (graphValue == "Month")
            { 
                options = {
                    lines: {
                        show: true,
                        fill: filled,
                        zero: false
                    },
                    xaxis: {
                        mode: "time",
                        timeformat: "%b %d",
                        labelWidth: 10,
                        labelHeight: 10,
                        min: MEOHData.data[index][0],
                        ticks: [MEOHData.data[index][0], 
                            MEOHData.data[0][0]]
                    },
                    yaxis: {
                        labelHeight: 10,
                        tickFormatter: function(v, axis) {
                            if (convert == true)
                            {
                                return v.toFixed(axis.tickDecimals) + '%';
                            }else
                                return v.toFixed(axis.tickDecimals);
                            }
                    },
                    legend: {
                        show: true,
                        container: $("#legend")
                    }
                };
            }
            return options;
}

$(document).ready(function() {
    setButtonClicks();
   $("#USA").click();
    // $("#compareText").autocomplete({
    // source: function (request, response) {
        
    //     // faking the presence of the YAHOO library bc the callback will only work with
    //     // "callback=YAHOO.Finance.SymbolSuggest.ssCallback"
    //     var YAHOO = window.YAHOO = {Finance: {SymbolSuggest: {}}};
        
    //     YAHOO.Finance.SymbolSuggest.ssCallback = function (data) {
    //         var mapped = $.map(data.ResultSet.Result, function (e, i) {
    //             return {
    //                 label: e.symbol + ' (' + e.name + ')',
    //                 value: e.symbol
    //             };
    //         });
    //         response(mapped);
    //     };
        
    //     var url = [
    //         "http://d.yimg.com/autoc.finance.yahoo.com/autoc?",
    //         "query=" + request.term,
    //         "&callback=YAHOO.Finance.SymbolSuggest.ssCallback"];

    //     $.getScript(url.join(""));
    // },
    // minLength: 1
    // });

    //set up download link URLs
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth();
    var year = today.getFullYear();

    var url = 'http://ichart.yahoo.com/table.csv?s=MEOH&a=' + month + '&b=' + day + '&c=' + (year-5) + '&d=' + month + '&e=' + day + '&f=' + year + '&g=d&ignore=.csv';
    document.getElementById("downloadUSA").href=url; 

    var url = 'http://ichart.yahoo.com/table.csv?s=MX.TO&a=' + month + '&b=' + day + '&c=' + (year-5) + '&d=' + month + '&e=' + day + '&f=' + year + '&g=d&ignore=.csv';
    document.getElementById("downloadCanada").href=url;
});