
			// var link = svg.append("g")
			// 		.attr("class", "links")
			// 		.selectAll("line")
			// 		.data(links)
			// 		.enter()
			// 		.append("g")
			
			// 	link
			// 		.attr("class", function(d) {
			// 			return `text ${d.source}-${d.target}`
			// 		})
			// 		.append("line")
			// 		.attr("stroke", function(d){
			// 			return `rgba(255,255,255, ${d.value})`;
			// 		})
			// 		.attr("stroke-width", function(d) {
			// 			return d.value;
			// 		})

				
			// 	link
			// 		.append("text")
			// 		.attr("text-anchor", "middle")
			// 		.attr("dx", 0)
			// 		.attr("dy", 0)
			// 		.attr("fill", "white")
			// 		.attr("opacity", 0)
			// 		.text(function(d) {
			// 			return d.value.toFixed(3)
			// 		})
			// 		.on('mouseover', function (d, i) {
      //     	d3.select(this).attr('opacity', '.85');
			// 		})
			// 		.on('mouseout', function (d,i) {
			// 			d3.select(this).attr('opacity', '0');
			// 		})



// const KEYS = {
// 	SPACE: 32,
// 	DELETE: 8,
// 	V: 86
// }

// const detectPaste = (e) => {
// 	return (
// 		e.metaKey && e.keyCode === KEYS.V ||
// 		e.ctrlKey && e.keyCode === KEYS.V
// 	)
// }
