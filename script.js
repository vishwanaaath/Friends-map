// Get viewport dimensions
const width = window.innerWidth;
const height = window.innerHeight;
const colors = [
  "#ebe8e8", 
  "#ebe8e8", 
  "#ebe8e8", 
  "#ebe8e8", 
  "#ebe8e8", 
  "#ebe8e8", 
  "#ebe8e8", 
  "#ebe8e8", 
  "#ebe8e8", 
  "#ebe8e8"
];

const svg = d3
  .select("#graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("position", "fixed")
  .style("left", 0)
  .style("top", 0);

// Handle window resize
window.addEventListener("resize", () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  svg.attr("width", newWidth).attr("height", newHeight);

  // Redraw/update your graph here if needed
});
d3.json("data.json").then((data) => {
  const links = data.links.map((d) => Object.create(d));
  const nodes = data.nodes.map((d) => Object.create(d));

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance((d) => 800 - d.value * 60)
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // Define a clip path for circular images
  svg
    .append("defs")
    .selectAll("clipPath")
    .data(nodes)
    .enter()
    .append("clipPath")
    .attr("id", (d) => `clip-${d.id}`)
    .append("circle")
    .attr("r", 25); // Radius of the circle (same as image size / 2)

  const link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke-width", (d) => d.value*0.3)
    .attr("stroke", (d) => colors[10 - d.value]);

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g");
  // Add images for nodes
  node
    .append("image")
    .attr("id", (d) => d.id) // Set the ID of the node image
    .attr("class", "node-image")
    .attr("xlink:href", (d) => `images/${d.id}.jpg`) // Use the id to reference the image file
    .attr("x", -25) // Adjust to center the image
    .attr("y", -25) // Adjust to center the image
    .attr("width", 50) // Set image size
    .attr("height", 50) // Set image size
    .attr("clip-path", (d) => `url(#clip-${d.id})`) // Apply the circular clip path
    .attr("usn", (d) => d.usn) // Add the "usn" attribute from the JSON data
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  // Add text labels for nodes (optional)
  node
    .append("text")
    .attr("class", "node-text")
    .attr("dy", -30) // Position text below the image
    .attr("text-anchor", "middle") // Center the text horizontally
    .text((d) => d.id)
    .style("fill", "black") // Text color
    .style("font-size", "12px"); // Adjust font size

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
});

document.getElementById("hamburger").addEventListener("click", () => {
  document.getElementById("sidebar").style.display =
    document.getElementById("sidebar").style.display == "none"
      ? "block"
      : "none";
});

document.getElementById("graph").addEventListener("click", () => { 
  document.getElementById("sidebar").style.display =
    document.getElementById("sidebar").style.display == "block"
      ? "none"
      : "none";
});


// Handle input field for changing node style and creating connectionslet input = document.getElementById("input");
input.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    let elementKey = input.value.trim(); // Get input and trim spaces

    // Try selecting by ID first using getElementById to avoid selector issues
    let targetNode = d3.select(document.getElementById(elementKey));

    // If no node is found by ID, try selecting by "usn" attribute
    if (targetNode.empty()) {
      targetNode = d3.select(`[usn="${elementKey}"]`);
    }

    if (!targetNode.empty()) {
      // Reset all links to default color
      svg.selectAll(".link").attr("stroke", "transparent");

      // Get the actual node ID
      const nodeId = targetNode.attr("id");

      // Highlight connected links
      svg
        .selectAll(".link")
        .filter((d) => d.source.id === nodeId || d.target.id === nodeId)
        .attr("stroke", "#C4C4C4"); // Darken the connected links
    } else {
      console.error(`Node with ID or USN "${elementKey}" not found.`);
    }
  }
});
