// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating x-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}


// Function used for updating text in circles group with a transition to new text.
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circletextGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  return circletextGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
    xlabel = "Poverty: ";
  }else if (chosenXAxis === "income") {
    xlabel = "Median Income: "
  }else{
    xlabel = "Age: ";
  }

  // Conditional for Y Axis.
  if (chosenYAxis === "healthcare") {
    ylabel = "Lacks Healthcare: ";
  } else if (chosenYAxis === "smokes") {
    ylabel = "Smokers: "
  } else {
    ylabel = "Obesity: "
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([120, -60])
    .html(function(d) {if (chosenXAxis === "age") {
      // All yAxis tooltip labels presented and formated as %.
      // Display Age without format for xAxis.
      return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
      } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
      // Display Income in dollars for xAxis.
      return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
      } else {
      // Display Poverty as percentage for xAxis.
      return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
      }
    });

    console.log(toolTip);

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data, this);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(data, err) {
  if (err) throw err;

  // parse data
  data.forEach(function(d) {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.healthcare = +d.healthcare;
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("Circle")
    .data(data)
    .enter()
    .append("circle")    
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "rgb(3, 90, 172)")
    .attr("opacity", ".7");

  var circleLabels = chartGroup.selectAll(null)
    .data(data)
    .enter()
    .append("text");

  circleLabels
    .attr("x", function(d) {
      return xLinearScale(d[chosenXAxis]);
    })
    .attr("y", function(d) {
      return yLinearScale(d[chosenYAxis]);
    })
      .text(function(d) {
        return d.abbr;
    })
      .attr("font-family", "sans-serif")
      .attr("font-size", "9px")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("fill", "white");

  // Create group for two x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") // value to grab for event listener
    .attr("stroke", "#2d2d2ee0")
    .attr("font-weight", "bold")
    .classed("inactive", true)
    .text("In Poverty (%)");
    

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value to grab for event listener
    .attr("stroke", "rgb(3, 90, 172)")
    .attr("font-weight", "bold")
    .classed("inactive", true)
    .text("Age (Median)");
  
  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .attr("stroke", "#520303")
    .attr("font-weight", "bold")
    .classed("inactive", true)
    .text("Household Income (Median)");
    
    // Add y labels group and labels.
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");
    
    // append y axis
  var healthcareLabel = ylabelsGroup.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .attr("stroke", "rgb(3, 90, 172)")
    .attr("font-weight", "bold")
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 20 - margin.left)
    .attr("dy", "1em")
    .attr("value", "smokes")
    .attr("stroke", "#2d2d2ee0")
    .attr("font-weight", "bold")
    .classed("inactive", true)
    .text("Smokes (%)");
    
  var obeseLabel = ylabelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 40 - margin.left)
    .attr("dy", "1em")
    .attr("value", "obesity")
    .attr("stroke", "#520303")
    .attr("font-weight", "bold")
    .classed("inactive", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var xvalue = d3.select(this).attr("value");
      if (xvalue !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = xvalue;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleLabels);

        // Update circles text with new values.
        circleLabels = renderText(circleLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true)
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }

      ylabelsGroup.selectAll("text")
      .on("click", function() {
          // Grab selected label.
          var yvalue = d3.select(this).attr("value");
          if(yvalue != chosenYAxis){

          // replaces chosenXAxis with value
          chosenYAxis = yvalue;

          // Update yLinearScale.
          yLinearScale = yScale(data, chosenYAxis);
          
          // Update yAxis.
          yAxis = renderYAxes(yLinearScale, yAxis);
          
          // Update circles with new y values.
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          
          // Update tool tips with new info.
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleLabels);

          // Update circles text with new values.
          circleLabels = renderText(circleLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // Changes classes to change bold text.
          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenYAxis === "smokes"){
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obeseLabel
             .classed("active", false)
             .classed("inactive", true);
          } else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        };
      
      });
})
});
