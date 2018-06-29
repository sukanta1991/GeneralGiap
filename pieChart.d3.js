/*Polyfill for finding min value from an array. If the array is array of objects(key-value pair), pass the key.*/
Array.prototype.min = function(property){
	var minVal,arrayType = typeof(this[0]);
	var getMinval = function(value){
		if(value!=null)
			minVal =  value<minVal || minVal==undefined?value:minVal;
	}
	if(property!=0 && !property && arrayType !="string" && arrayType!="number")
		throw new Error("Property/Key is missing");
		
	this.each(function(x){
		if(arrayType=="string" || arrayType=="number"){
			getMinval(x);
		}
		else{
			getMinval(x[property])
		}
	});
	return minVal;
}

/*Chart code goes here*/

var renderGoalChart = function(sliderVal){
			var aggregatedData; //will be set in another function
            sliderVal = parseInt(sliderVal)||0;//sliderVal will be injected
            var color =["#3366CC", "#DC3912","#FF9900","#990099","#c4a001","#006fc4"]
            var basePieData = d3.pie().sort(null).value(function(d){return d.Wtg})(aggregatedData);
            var container = d3.select("#chartId")
                ,containerWidth = parseInt(container.style("width").replace("px",""))
                ,containerHeight = parseInt(container.style("height").replace("px",""))
                ,height = Math.min(containerHeight,containerWidth/1.7);
            var div = document.getElementById("chartId");
            minPTA = Math.round(aggregatedData.min("PTA").toFixed(3)*100);
            var sliderLabel = document.getElementById("sliderLabel");
            if(sliderVal+10>minPTA){
                goalChart.sliderVal = minPTA-10;
                sliderVal=minPTA-10;
            }
            else{
                goalChart.sliderVal = sliderVal;
            }
            div.innerHTML="";
            var id = "svgId";
            var svg = container.append("svg")
                         .attr("xmlns","http://www.w3.org/2000/svg")
                        .attr("xmlns:xlink","http://www.w3.org/1999/xlink")
                        .style("height",containerHeight)
                        .style("width",containerWidth)
                        .attr("id",id);
            var xAxis=div.rectangleRelativeMidPoint().split(",")[0];
            var yAxis=div.rectangleRelativeMidPoint().split(",")[0];
            var g = svg.append("g").attr("id","chartGroup")
            var outerRadius = height/3.5;
            var innerRadius = outerRadius*.33;
            var totalPTA = (function(){
                var totalWtg=0;
                var pta = 0;
                //Check if actual value is non-zero, if yes find pta.
                aggregatedData.forEach(function(x){
                    if(x.Actual){
                        totalWtg+=x.Wtg;
                        pta+=x.PTA*100*x.Wtg;
                    }
                });
                return pta/totalWtg;
            })();

            var multiplier = (outerRadius-innerRadius)/(100-(minPTA-(sliderVal+10)));
            var slider = document.getElementById("slider");
            
            var radiusExtension = 30;
            slider.value = sliderVal;
            var arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).endAngle(function(d){return d.endAngle})
                                .startAngle(function(d){return d.startAngle});
            var basePie = g.append("g")
                    
                basePie.selectAll("g").data(basePieData).enter().append("path")
                    .attr("d",arc)
                    .attr("fill","white")
                    .attr("stroke","grey");
            var actualsPie = g.append("g")
            actualsPie.selectAll("g").data(basePieData).enter().append("path")
                                .attr("class","actualsPie").attr("d",d3.arc()
                                        .innerRadius(function(d){
                                            return !d.data.Actual?0:innerRadius;
                                        })
                                        .outerRadius(function(d){
                                            return !d.data.Actual?0:innerRadius+((d.data.PTA*100-(minPTA-(sliderVal+10)))*multiplier);
                                        })
                                        .startAngle(function(d){return d.startAngle;})
                                        .endAngle(function(d){return d.endAngle;}))
                        .attr("fill",function(d,i){return color[i];})
                        .attr("stroke","grey")
                        .on("mouseenter",function(d){
                            tooltip.transition()		
                                .duration(200)		
                                .style("opacity", .9);		
                            tooltip.html(
                                "<span class='boldText'>"+d.data.GoalName+"</span><br/>"
                                +"Weightage : "+d.data.Wtg + "%"
                                +"<br/>"
                                +"Goal : "+d.data.Target.toFixed(1)
                                +"<br/>"
                                +"Actuals : " + d.data.Actual.toFixed(1)
                                +"<br/>"
                                +"PTA: "+(d.data.PTA*100).toFixed(1) + "%"
                            )
                                .style("left", (d3.event.pageX) + "px")		
                                .style("top", (d3.event.pageY - 28) + "px");
                        })
                        .on("mouseout",function(d){
                            // tooltip.html(d.data.GoalName);
                            tooltip.style("opacity","0")
                        })

                        .on("click",function(d){
                            showActualsPopUp(d.data.GoalName);
                        });
            
                        
            /*Circle radius extension*/
            var line = g.append("g")
                        .attr("transform","translate(150,0) rotate(-90)")
                        .selectAll("g")
                        .data(basePieData)
                        .enter()
                        .append("line")
                        .attr("x1",function(d){
                            return innerRadius*Math.cos(d.endAngle)
                        })
                        .attr("y1",function(d){
                            return innerRadius*Math.sin(d.endAngle)
                        })
                        .attr("x2",function(d){
                            return (outerRadius+radiusExtension) * Math.cos(d.endAngle)
                        })
                        .attr("y2",function(d){
                            return (outerRadius+radiusExtension) * Math.sin(d.endAngle)
                        })
                        .style("stroke","black")
            var legend = g.append("g")
            /*waterguage(g,{
                outerRadius : innerRadius,
                innerRadius:0,
                value : totalPTA>100?100:totalPTA.toFixed(1)
            });*/
            var pta = g.append("g").attr("class","pta")
                        .attr("transform","translate(150,0)")
                        .append("svg:text").text(totalPTA.toFixed(1))
                        .attr("x",function(){
                            return totalPTA>100?0-(innerRadius/1.1):0-(innerRadius/1.3);
                        })
                        .style("fill","black")
                        .attr("y",5)
                                // .attr('transform',"translate(370,0)")

			/*For legend*/					
            var legendText = legend.selectAll("g")
                                .data(basePieData)
                                .enter()
                                .append("text")
                                .attr("class","pieLegend")
                                .attr("x",function(d){
                                    var angle = Math.degrees(d.startAngle+((d.endAngle - d.startAngle)/2))
                                    var extension = angle>180 ? 90 :10;
                                    if(angle<90)
                                        angle = Math.radian(360+(angle-90));
                                    else
                                        angle = Math.radian(angle-90);
                                    return (outerRadius+extension)*Math.cos(angle);
                                })
                                .attr("y",function(d){
                                    var angle = Math.degrees(d.startAngle+((d.endAngle - d.startAngle)/2))
                                    var extension = 20;
                                    if(angle<90)
                                        angle = Math.radian(360+(angle-90));
                                    else
                                        angle = Math.radian(angle-90);
                                    return (outerRadius+extension)*Math.sin(angle);
                                })
                                .selectAll(".pieLegend")
                                .data(function(d){return [d,d]})
                                .enter()
                                    .append("tspan")
                                    .text(function(d,i){
                                        return i==0?d.data.ShortNames:(d.data.PTA!=null?(d.data.PTA*100).toFixed(1):"");
                                    })
                                    .attr("dy",function(d,i){return i==1?"1.2em":"0";})
                                    .attr("x",function(d,i){
                                        return parseInt(d3.select(this.parentNode).attr("x")+20);
                                    })
                                .style("fill","black")
                                .style("font-size","9pt")
            legend.attr("transform","translate(150,0)");
            g.attr("transform", "translate(" + parseInt(outerRadius-50)+ "," + parseInt(outerRadius*1.5) + ")");
            //line.attr("transform","translate(370,0)");
            actualsPie.attr("transform","translate(150,0)");
            basePie.attr("transform","translate(150,0)");
            // g.style("height",yAxis*2);
            //svg.style("height","500px");
        }
        
    }
