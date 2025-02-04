let words = JSON.parse(localStorage.getItem("wordCloudData")) || [{ word: "The world", quantity: 1 }];

let colors = ["#ffc300", "#00B050"];

const width = 800;
const height = 400;

const svg = d3
    .select("section")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const layout = d3.layout // codes for how words are positioned in cloud
    .cloud()
    .size([width, height])
    .words(
        words.map((word) => ({
            text: word.word,
            size: word.quantity * 20, //size based on quantity
        }))
    )
    .padding(10) //space between words
    .rotate(0) //no rotation of words
    .fontSize((d) => d.size) //sets font size based on word quantity
    .spiral("rectangular") //words placed in regular pattern
    .on("end", draw); //calls draw function when layout is complete

layout.start();

function draw(words) {
    svg.selectAll("*").remove(); //clears previous words

    svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`) //centers words
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

    const index = words.findIndex((w) => w.word === word); //checks if word already exists in array
    if (index === -1) { //if not found
        words.push({ word, quantity: 1 }); //added with quantity 1
    } else {
        words[index].quantity -= 1; //if found quantity is incremented other way
    }

    localStorage.setItem("wordCloudData", JSON.stringify(words)); // Save to localStorage
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

        localStorage.setItem("wordCloudData", JSON.stringify(words)); // Save updated data
    layout.start();
}

function clearCloud() {
    words = [{ word: "The world", quantity: 1 }];
    localStorage.removeItem("wordCloudData"); // Remove from storage
    updateCloud();
}

console.log(words);