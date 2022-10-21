/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 import React, { useEffect, useState, createRef } from 'react';
 import { styled, getCategoricalSchemeRegistry } from '@superset-ui/core';
 import { SupersetBulletChartV3Props, SupersetBulletChartV3StylesProps } from './types';
 import * as d3 from 'd3';
 import * as d3Scale from 'd3-scale';
 
 const categorialSchemeRegistry = getCategoricalSchemeRegistry();
 // The following Styles component is a <div> element, which has been styled using Emotion
 // For docs, visit https://emotion.sh/docs/styled
 
 // Theming variables are provided for your use via a ThemeProvider
 // imported from @superset-ui/core. For variables available, please visit
 // https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts
 
 const Styles = styled.div<SupersetBulletChartV3StylesProps>`
  /*  background-color: ${({ theme }) => theme.colors.secondary.light5};
   padding: ${({ theme }) => theme.gridUnit * 4}px;
   border-radius: ${({ theme }) => theme.gridUnit * 2}px; */
   height: ${({ height }) => height}px;
   width: ${({ width }) => width}px;
 `;
 
 /**
  * ******************* WHAT YOU CAN BUILD HERE *******************
  *  In essence, a chart is given a few key ingredients to work with:
  *  * Data: provided via `props.data`
  *  * A DOM element
  *  * FormData (your controls!) provided as props by transformProps.ts
  */
 
 export default function SupersetBulletChartV3(props: SupersetBulletChartV3Props) {
   // height and width are the height and width of the DOM element as it exists in the dashboard.
   // There is also a `data` prop, which is, of course, your DATA 🎉
   const { data, height, colorScheme, width, orderDesc } = props;
 
   let totals = 0;
   // custom colors theme
   let customColors: string[];
   const svgRef = createRef<SVGSVGElement>();
   const colorsValues = categorialSchemeRegistry.values();
 
   const filterColors: any = colorsValues.filter(
     (c: any) => c.id === colorScheme,
   );
   if (filterColors[0]) {
     customColors = [...filterColors[0].colors];
   }
   // let selectedOption = "chart";
 
   const onSiteChanged = (type: any, value: any) => {
     setType({ selectedOption: value , totals: totals});
   };
 
   const [form, setType] = useState({
     selectedOption: 'chart',
     totals: 0
   });
 
   // Often, you just want to get a hold of the DOM and go nuts.
   // Here, you can do that with createRef, and the useEffect hook.
   useEffect(() => {
     render(svgRef);
     // setType({ selectedOption: 'chart' , totals: totals});
   }, [props, form, setType, orderDesc]);
 
   const groupData = (data: any, total: any) => {
     let cumulative = 0
     const _data = data.map((d: any) => {
       cumulative += d.metricpossiblevalues
       return {
         metricpossiblevalues: d.metricpossiblevalues,
         cumulative: cumulative - d.metricpossiblevalues,
         metricvalue: d.metricvalue,
         metricpossible: d.metricpossible,
         percent: (d.metricpossiblevalues / total * 100).toFixed(2)
       }
     }).filter((d: any) => d.metricpossiblevalues > 0)
     return _data
   }

   
   const render = (svgRef: any) => {
 
     const config: any = {
       f: d3.format('.1f'),
       margin: { top: 20, right: 10, bottom: 20, left: 10 },
       barHeight: 40,
     }
     const { f, margin, barHeight } = config
     const w = width - margin.left - margin.right
     const h = height - margin.top - margin.bottom
     const halfBarHeight = barHeight;
     const lineHeight = 1.1;
     const lineWidth = 20;

      //
      const getMetricPossible = (data: any)=> {
        data.each(function(this:any){
        const text = d3.select(this);
        wrap(this, text.node().getComputedTextLength());
      });
    }

     const wrap = (txt: any, data: any) => {
       const width = data;
       const text = d3.select(txt);
       const words = text.text().split(/\s+/).reverse();
       let word;
       let line: any = [];
       let lineNumber = 0;
       const lineHeight = 1.1; // ems
       const x = text.attr("x");
       const y = text.attr("y");
       const dy = parseFloat(text.attr("dy")) || 0;
       let tspan: any = text.text(null)
         .append("tspan")
         .attr("x", x)
         .attr("y", y)
         .attr("dy", dy + "em");
 
       while (word = words.pop()) {
         line.push(word);
         tspan.text(line.join(" "));
         const tspanWidth = tspan.node().getComputedTextLength() + 1; 
         if (tspanWidth > width) {
           line.pop();
           tspan.text(line.join(" "));
           line = [word];
           tspan = text.append("tspan")
             .attr("x", x)
             .attr("y", y)
             .attr("dy", ++lineNumber * lineHeight + dy + "em")
             .text(word);
         }
       }
     }
 
     function creatUniqueArray() {
       const unique = [];
       const distinct = [];
       // const result = [];
       for (let i = 0; i < data.length; i++) {
         if (data[i].metricpossible) {
           if (!unique[data[i].metricpossible]) {
             distinct.push(data[i]);
             unique[data[i].metricpossible] = 1;
           }
         }
       }
       return distinct;
     }
     const resultset = creatUniqueArray();
     const counts = resultset.filter((d: any)=> d.metricpossiblevalues < 5 ).length;
     const middleIndex = resultset.indexOf(resultset[Math.round((resultset.length - 1) / 2)]);
     const total = d3.sum(resultset, (d: any) => d.metricpossiblevalues);
     totals = total;
     orderDesc ? resultset.sort((a: any, b: any) => a.orderby - b.orderby) : resultset.sort((a: any, b: any) => b.orderby - a.orderby) ;
     const _data = groupData(resultset, total);

      //getX
    const getX = (d: any, index: any)=> {
      const polyLineWidth = 20;
      const valIndex = (index == 0 || counts < 2) ? 0.9: 0.9;
      if( index < middleIndex  ) {
        return (xScale(d.cumulative)! + (xScale(d.metricpossiblevalues)!)) + (polyLineWidth * (valIndex + 6));
      } else {
        return  (xScale(d.cumulative)! + (xScale(d.metricpossiblevalues)!)) - (polyLineWidth * (valIndex + 10));
      }
    }

    // getY
    const getY = (d: any, index: any)=> {
      const polyLineHeight = 20;
      const pointFirstY = (h / 2) - (halfBarHeight * lineHeight); 
        let pointThirdY  = 0;
        if( index < middleIndex  ) {
          pointThirdY = pointFirstY - (polyLineHeight * (index + 0.7));
        } else {
          pointThirdY = pointFirstY - (polyLineHeight * (index * 1.2));
        }
        return `${pointThirdY}`
    }

    //getPoints 
    const getPoints = (d: any, index: any) => {
      const polyLineHeight = 20;
      const polyLineWidth = 20;
      const pointFirstX = (xScale(d.cumulative)! + (xScale(d.metricpossiblevalues)!) / 2) - 12;
      const pointFirstY = (h / 2) - (halfBarHeight * lineHeight) + 5; 
      let pointSecondX = 0;
      let pointSecondY = 0;
      let pointThirdX  = 0;
      let pointThirdY  = 0;
      if( index < middleIndex  ) {
        pointSecondX = pointFirstX;
        pointSecondY = pointFirstY - (polyLineHeight * (index + 1));
        pointThirdX =  pointFirstX + (polyLineWidth * (index + 1));
        pointThirdY = pointFirstY - (polyLineHeight * (index + 1));
      } else {
        pointSecondX = pointFirstX;
        pointSecondY = pointFirstY - (polyLineHeight * (index + 1));
        pointThirdX =  pointFirstX - (polyLineWidth * (index + 1));
        pointThirdY = pointFirstY - (polyLineHeight * (index + 1));
      }
      /* pointSecondX = pointFirstX;
      pointSecondY = pointFirstY - (polyLineHeight * (index + 1));
      pointThirdX =  pointFirstX - (polyLineWidth * (index + 1));
      pointThirdY = pointFirstY - (polyLineHeight * (index + 1)); */
      // arrayOfPoints.push({index: index, x: pointThirdX, y: pointThirdY});
      return `${pointFirstX} ${pointFirstY} ${pointSecondX} ${pointSecondY} ${pointThirdX} ${pointThirdY}`;
    }

   
 
     // indicator position
     let indicatorPosition: any;
     let filteredRecords = [];
     if (data.length > 0) {
       if (data[0].metricpossible) {
         filteredRecords = data.filter(
           (d: any) => d.metricpossible === data[0].metricvalue,
         );
       }
     }
     if (filteredRecords.length > 0) {
       indicatorPosition = filteredRecords[0].metricvalue;
     }
 
     // set up scales for horizontal placement
     const xScale = d3Scale.scaleLinear()
       .domain([0, total])
       .range([0, w]);
 
     // create svg in passed in div
     // d3.select('svg').remove();
     const selection = d3.select(svgRef.current)
       // .append('svg')
       .attr('width', w)
       .attr('height', height)
       .append('g')
       .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
 
     // stack rect for each data value
     d3.selectAll('rect').remove();
     selection.selectAll('rect')
       .data(_data)
       .enter().append('rect')
       .attr('class', 'rect-stacked')
       .attr('x', (d: any) =>( xScale(d.cumulative)! - 12))
       .attr('y', h / 2 - halfBarHeight)
       .attr('height', barHeight)
       .attr('width', (d: any) => xScale(d.metricpossiblevalues)!)
       .style('fill', (d, i) => customColors[i + 4])
       .text((d: any) =>  f(d.percent) < 5 ? f(d.percent) + '%, ' + ' ' +  d.metricpossible : f(d.percent) + '%');
 
     // add values on top of bar(indicator)
     d3.selectAll('.text-value').remove();
     selection.selectAll('.text-value')
       .data(_data)
       .enter().append('text')
       .attr('class', 'text-value')
       .attr('text-anchor', 'middle')
       .attr('font-size', '14px')
       .style('fill', (d, i) => customColors[customColors.length - 3])
       .attr('x', (d: any) => xScale(d.cumulative)! + (xScale(d.metricpossiblevalues)!) / 2)
       .attr('y', (h / 2) - (halfBarHeight * 1.1))
       .text((d: any) => {
         return d.metricpossible == indicatorPosition ? '▼' : '';
       });
 
     // add some labels for percentages
     d3.selectAll('.text-percent').remove();
     selection.selectAll('.text-percent')
       .data(_data)
       .enter().append('text')
       .attr('class', 'text-percent')
       .attr('text-anchor', 'middle')
       .attr('font-size', '11px')
       // .attr('width', '100px')
       .attr('x', (d: any, index: any) =>f(d.percent) < 5 ? getX(d, index) : xScale(d.cumulative)! + (xScale(d.metricpossiblevalues)!) / 2)
       .attr('y',(d: any, index: any) => f(d.percent) < 5 ? getY(d, index) : ((h / 2) - (halfBarHeight / 2)))
      //  .attr('x', (d: any, index: any) =>f(d.percent) < 5 ? getX(d, index) : xScale(d.cumulative)! + (xScale(d.metricpossiblevalues)!) / 2)
      //  .attr('y',(d: any, index: any) => f(d.percent) < 5 ? getY(d, index) : ((h / 2) - (halfBarHeight / 2)))
       .text((d: any) =>  f(d.percent) < 5 ? f(d.percent) + '%, ' + ' ' +  d.metricpossible : f(d.percent) + '%');
      //  .text((d: any) =>  f(d.percent) + '%');
 
     // add the labels bellow bar
     d3.selectAll('.text-label').remove();
     selection.selectAll('.text-label')
       .data(_data)
       .enter().append('text')
       .attr('class', 'text-label')
       .attr('text-anchor', 'middle')
       .attr('font-size', '9px')
       .attr('x', (d: any) => xScale(d.cumulative)! + (xScale(d.metricpossiblevalues)!) / 2)
       .attr('y', (h / 2) + 15)
       .style('fill', '#000')
       .attr('width', (d: any) => ((xScale(d.metricpossiblevalues)!) / 3))
       .text((d: any) => f(d.percent) < 5 ? '' :  d.metricpossible)
       .call(getMetricPossible);
       // .style('fill', (d, i) => customColors[i])
 
     // draw polylines
    /*  d3.selectAll('polyline').remove();
     selection.selectAll('.polyline')
       .data(_data)
       .enter()
       .append('polyline')
       .style('stroke', 'black')
       .style('fill', 'none')
       .attr('stroke-width', 0.5)
       .attr('points', (d: any, index: any) => f(d.percent) < 5 ? `${(xScale(d.cumulative)! + (xScale(d.metricpossiblevalues)!) / 2)} ${(h / 2) - (halfBarHeight * lineHeight)}, 
                                   ${((xScale(d.cumulative)! + (xScale(d.metricpossiblevalues)!) / 2))} ${((h / 2) - (halfBarHeight * lineHeight)) - (lineWidth * index)},
                                   ${(xScale(d.cumulative)! + (xScale(d.metricpossiblevalues)!)) + ((xScale(d.cumulative)! + (xScale(d.metricpossiblevalues)!)) / 10)} ${((h / 2) - (halfBarHeight * lineHeight)) - (lineWidth * index)} 
                                   ` : '') */
      d3.selectAll('polyline').remove();
      selection.selectAll('.polyline')
        .data(_data)
        .enter()
        .append('polyline')
        .style('stroke', 'black')
        .style('fill', 'none')
        .attr('stroke-width', 0.5)
        .attr('points', (d: any, index: any) => f(d.percent) < 5 ? getPoints(d, index) : '');
   };
 
   return (
     <div>
       <div>
         <input type="radio"
           id="chart"
           value="chart"
           name="optionGroup"
           checked = { form.selectedOption === 'chart'}
           onClick={(e) => onSiteChanged('', "chart")}
         /> <label htmlFor="chart" style={{verticalAlign: 'middle'}}>chart</label>
         <input type="radio"
           style={{ marginLeft: '20px' }}
           id="number"
           value="number"
           name="optionGroup"
           checked = { form.selectedOption === 'number'}
           onClick={(e) => onSiteChanged('', "number")}
         /> <label htmlFor="number" style={{verticalAlign: 'middle'}}>number</label>
       </div>
       {
         form.selectedOption === "chart" ?
           <svg ref={svgRef}></svg> :
           <div style={{
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             height: `${height}px`,
             fontSize: '10em',
             fontWeight: 'bold'
           }}>{ form.totals }</div>
       }
     </div >
   );
 }
 