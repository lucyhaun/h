let words = [{word: "hello!", quantity: 1}];

let colors = ["#ffc300", "#00B050"];

const width = 800;
const height = 400;

const svg = d3
    .select("section")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const layout = d3.layout
    .cloud()
    .size([width, height])
    .words(
        words.map((word) => ({
            text: word.word,
            size: word.quantity * 20,
        }))
    )
    .padding(10)
    .rotate(0)
    .fontSize((d) => d.size)
    .spiral("rectangular")
    .on("end", draw);

layout.start();

function draw(words) {
    svg.selectAll("*").remove();

    svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .selectAll("text")
    .data(words)
    .enter()
    .append("text")
    .style("font-size", (d) => d.size + "px")
    .attr("text-anchor", "middle")
    .attr("transform", (d) => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
    .text((d) => d.text);
}
 
function addWord() {
    const input = document.querySelector("#word-input");
    const word = input.value;
    input.value = "";

    const index = words.findIndex((w) => w.word === word);
    if (index === -1) {
        words.push({ word, quantity: 1 });
    } else {
        words[index].quantity += 1;
    }

    updateCloud();
}

function updateCloud() {
        const maxSize = 100;
        layout.words(
            words.map((w) => ({
                text: w.word,
                size: Math.min(w.quantity * 20, maxSize),
             }))
        );

        layout.start();
}

console.log(words);