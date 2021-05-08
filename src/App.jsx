import React from 'react';
import * as d3 from 'd3';
import './App.css';

const FONT_SIZE = 16;

const tokenize = (input) => {
	const match = input.match(/\S+/g);
	if (match) {
		return match
	}

	return []
}

const useD3 = (renderChartFn, dependencies) => {
    const ref = React.useRef();

    React.useEffect(() => {
        renderChartFn(d3.select(ref.current));
        return () => {};
      }, dependencies);
    return ref;
}

function GraphViz({ data, onNodeMouseover, onNodeMouseout }) {

	// node names as strings
	let nodes = []
	Object.keys(data).forEach(k => {
		nodes.push({
			id: k
		})
	})

	// // format as source, target, value
	let links = []
	Object.entries(data).forEach(e => {
		// original token
		const source = e[0]
		const nextTokens = e[1]
		Object.entries(nextTokens).forEach(_e => {
			//next token 
			const target = _e[0]
			const value = _e[1].chance
			links.push({ source, target, value })
		})
	})
	
	const linkedByIndex = {};
  links.forEach(d => {
    linkedByIndex[`${d.source}-${d.target}`] = 1;
  });

	function isConnected(a, b) {
    return linkedByIndex[`${a.id}-${b.id}`] || linkedByIndex[`${b.id}-${a.id}`];
  }

	const simulationRef = React.useRef();
	const nodeRef = React.useRef();
	const linkRef = React.useRef();

  const ref = useD3(
    (svg) => {
			// only calculate on resize
			const rect = ref.current.getBoundingClientRect();
			const width = rect.width;
			const height = rect.height;

			// Draw the links
			if(!linkRef.current) {
				linkRef.current = svg
				.append("g")
				.attr("class", "links")
				.selectAll("link")
				.data(links)
				.enter()
				.append("path")
				.attr("class", "link")
			}

			// Draw the nodes container on top
			if(!nodeRef.current) {
				nodeRef.current = svg
					.append("g")
					.attr("class", "nodes")
					.selectAll("node")
					.data(nodes)
					.enter()
					.append("g")
					.attr("class", "node")
			}

			// Setup the initial simulation
			if(!simulationRef.current) {
				simulationRef.current = d3.forceSimulation()
						.force("link",
							d3.forceLink()
							.id(function(d) {
								return d.id;
							})
							.distance(100)
							.strength(0.5)
						)
						.force("charge", d3.forceManyBody())
						.force("center", d3.forceCenter(width / 2, height / 2))

				simulationRef.current.nodes(nodes).on("tick", ticked);
				simulationRef.current.force("link").links(links);
				
				nodeRef.current.on('mouseover', function(e, d) {
					// parent callback
					if(onNodeMouseover) {
						onNodeMouseover(d)
					}
					nodeRef.current.style('opacity', function (o) {
						return isConnected(d, o) || d.id === o.id ? 1.0 : 0.1;
					})
					linkRef.current.style('opacity', function(o) {
						return (o.source.id === d.id || o.target.id === d.id) ? 1.0 : 0.1;
					})
				})

				nodeRef.current.on('mouseout', function(e,d) {
					if(onNodeMouseout) {
						onNodeMouseout(d)
					}
					nodeRef.current.style('opacity', 1)
					linkRef.current.style('opacity', 1)
				})

			} else {
				// UPDATE THE SIMULATION
				simulationRef.current.stop()

				const old = new Map(nodeRef.current.data().map(d => [d.id, d]));
				nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
				links = [...links]

				linkRef.current = linkRef.current
					.data(links)
					.join(enter => enter.append("svg:path"))
					.attr("class", "link")
					.attr("stroke-width", 1)
				linkRef.current.exit().remove()

				// TODO: better for updates for removing inner / repeated content from the DOM 
				d3.selectAll("g circle").remove()
				d3.selectAll("g text").remove()
				nodeRef.current = nodeRef.current
							.data(nodes, d => d.id)	
							.join( enter => enter.append("g")
																	.attr("class","node"))
				nodeRef.current.exit().remove()

			// excess circles and text being added on on each update.
				nodeRef.current.append("circle")
					.attr("r", function(d) {
						return d.id.length * (FONT_SIZE/3)  + 5
					})
					.attr("x", -8)
					.attr("y", -8)
					.attr("stroke", "rgba(255,255,255,0.5)")

				nodeRef.current.append("text")
						.attr("class", "text")
						.attr("text-anchor", "middle")
						.attr("dx", 0)
						.attr("dy", 5)
						.attr("fill", "white")
						.text(function(d) {
							return d.id
				})
				nodeRef.current.on('mouseover', function(e, d) {
					// parent callback
					if(onNodeMouseover) {
						onNodeMouseover(d)
					}
					nodeRef.current.style('opacity', function (o) {
						return isConnected(d, o) || d.id === o.id ? 1.0 : 0.1;
					})
					linkRef.current.style('opacity', function(o) {
						return (o.source.id === d.id || o.target.id === d.id) ? 1.0 : 0.1;
					})

				})

				nodeRef.current.on('mouseout', function(e,d) {
					if(onNodeMouseout) {
						onNodeMouseout(d)
					}
					nodeRef.current.style('opacity', 1)
					linkRef.current.style('opacity', 1)
				})

				simulationRef.current.nodes(nodes).on("tick", ticked);
				simulationRef.current.force("link").links(links);
				simulationRef.current.alpha(0.5).restart();
			}

			function ticked() {
				// on tick adjust the the locations
				linkRef.current.attr("d", function(d) {
					var dx = d.target.x - d.source.x,
							dy = d.target.y - d.source.y,
							dr = Math.sqrt(dx * dx + dy * dy);

					return "M" + 
							d.source.x + "," + 
							d.source.y + "A" + 
							dr + "," + dr + " 0 0,1 " + 
							d.target.x + "," + 
							d.target.y;
					});

				nodeRef.current
					.attr("transform",
					function(d) {
						return `translate(${d.x},${d.y})`;
				});	
			}

    },
		[nodes]
  );

  return (
    <svg
      ref={ref}
      style={{
        height: "100%",
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    >
    </svg>
  );
}

function generateMarkovChain(tokens) {
	/*
		returns an object in the form:
		{
			token: {
				otherToken: {
					count: 5
					chance: 0.5
				}
				...
			} ...
		}
	*/

	const chain = {}
	// for every token, 
	// have i seen this token before?
	// if no, add to chain with empty list
	// add token to prob obj
	// increment the number o
	// record the number of times every other token
	for(let i = 0; i < tokens.length; i++) {
		// have i seen this token before? if not, add it to the chain with an empty list
		const currT = tokens[i]
		if(!chain[currT]) {
			chain[currT] = {}
		}
		
		// if you are past the first token,
		// check the previous token, and increment the count of the current token
		if(i > 0) {
			// get the previous token
			const prevT = tokens[i-1];

			// if you've never seen this current token token before after the last one, set its value to one
			if(!chain[prevT][currT]) {
				chain[prevT][currT] = {
					count: 1,
				}
			} else {
				// otherwise, increment its count
				chain[prevT][currT].count += 1
			}
			
			// to calculate the chance, take the percentage of this count out of all counts from the next tokens of this.
			const totalCount = Object.entries(chain[prevT]).reduce(
				(acc, curr) => {
				return acc + curr[1].count
			}, 0)

			// calculate ALL new chances
			Object.entries(chain[prevT]).forEach(e => {
				chain[prevT][e[0]].chance = e[1].count / totalCount;
			})
			
		}
	} 

	return chain
}


function App() {
	const [input, setInput] = React.useState('')
	const inputRef = React.useRef(null);
	const [currHoveredNode, setCurrHoveredNode] = React.useState(null);

	// Generated from input
	const tokens = tokenize(input)
	const chain = generateMarkovChain(tokens)

	// formats the data
	const visibleData = currHoveredNode ? {
		[currHoveredNode]: chain[currHoveredNode]
	}: chain

  return (
    <div className="container">
			<textarea
				className="input"
				ref={inputRef}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => {
					// on space.
					// how to trigger?
					if(e.keyCode === 32) {
						
					}
				}}
				placeholder="Start typing a sequence to see the markov chain update, like 1 2 3 4 3 2 1"
			/>
			<div className="output">
				<GraphViz
					data={chain}
					onNodeMouseover={(node) => setCurrHoveredNode(node.id)}
					onNodeMouseout={()=> setCurrHoveredNode(null)}/>
				<pre>{JSON.stringify(visibleData, null, 2)}</pre>
			</div>
    </div>
  );
}

export default App;