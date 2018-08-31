import * as d3 from 'd3';
import json from './data.json';
import './index.css';

const margin = {
  top: 10, right: 20, bottom: 100, left: 90,
};
const width = 1170 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const cellHeight = height / 12;
const colors = ['#5e4fa2', '#3344ff', '#3288bd', '#66c2a5', '#abdda4', '#e6f598',
  '#ffffbf', '#fee08b', '#fdae61', '#f46d43', '#d53e4f', '#9e0142'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

const x = d3.scaleLinear().range([0, width]);
const color = d3.scaleQuantile().range(colors);

const svg = d3.select('#chart').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// label the months on the y axis
svg.selectAll('.monthLabel')
  .data(months)
  .enter().append('text')
  .text(d => d)
  .attr('class', 'monthLabel')
  .attr('x', 0)
  .attr('y', (d, i) => i * cellHeight)
  .style('text-anchor', 'end')
  .attr('transform', `translate(-6, ${cellHeight / 1.5})`);

// label the y axis
svg.append('text')
  .attr('class', 'axisLabel')
  .attr('text-anchor', 'middle')
  .attr('transform', `translate(${-70}, ${height / 2})rotate(-90)`)
  .text('Month');

const div = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

const baseTemp = json.baseTemperature;
const data = json.monthlyVariance;

data.forEach((d) => {
  // eslint-disable-next-line no-param-reassign
  d.temp = Math.round((baseTemp + d.variance) * 1000) / 1000;
});

const maxTemp = d3.max(data, d => d.temp);

x.domain(d3.extent(data.map(d => d.year)));
color.domain(d3.range(0, Math.ceil(maxTemp), maxTemp / (colors.length - 1)));

// add x axis
svg.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${height})`)
  .call(d3.axisBottom(x)
    .ticks(20)
    .tickSize(8)
    .tickFormat(d3.format('d')));

// label x axis
svg.append('text')
  .attr('class', 'axisLabel')
  .attr('text-anchor', 'middle')
  .attr('transform', `translate(${width / 2}, ${height + 50})`)
  .text('Year');

const rectWidth = d3.scaleBand()
  .rangeRound([0, width])
  .domain(data.map(d => d.year))
  .bandwidth();

// add data
svg.selectAll('.cell')
  .data(data)
  .enter().append('rect')
  .attr('class', 'cell')
  .attr('width', rectWidth)
  .attr('height', cellHeight)
  .attr('x', d => x(d.year))
  .attr('y', d => (d.month - 1) * cellHeight)
  .style('fill', d => color(d.temp))
  .on('mouseover', (d) => {
    div.transition().duration(200).style('opacity', 0.9);
    div.html(`${months[d.month - 1]}, ${d.year}<br/>${d.temp} &#8451;<br/>${d.variance}&#8451`)
      .style('left', `${d3.event.pageX - 50}px`)
      .style('top', `${d3.event.pageY - 70}px`);
  })
  .on('mouseout', () => {
    div.transition().duration(500).style('opacity', 0);
  });

// add legend
const legend = svg.selectAll('.legend')
  .data(colors)
  .enter().append('g')
  .attr('class', 'legend')
  .attr('transform', (d, i) =>
    `translate(${width - ((colors.length - i) * 35)}, ${height + 50})`);

legend.append('rect')
  .attr('width', 35)
  .attr('height', 20)
  .style('fill', d => d);

legend.append('text')
  .attr('x', (d) => {
    const text = String(Math.floor(color.invertExtent(d)[0] * 10) / 10);
    if (text.length === 1) {
      return 12;
    }
    if (text.length === 3) {
      return 5;
    }
    return 0;
  })
  .attr('y', 35)
  .attr('dy', '.35em')
  .text(d => Math.floor(color.invertExtent(d)[0] * 10) / 10);
