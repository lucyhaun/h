const firebaseConfig = {
    apiKey: "AIzaSyD5kZRmmEcyJy8mO4nvsZXX2j41RDs74Vo",
    authDomain: "cloud-9c0b7.firebaseapp.com",
    projectId: "cloud-9c0b7",
    storageBucket: "cloud-9c0b7.firebasestorage.app",
    messagingSenderId: "323590350527",
    appId: "1:323590350527:web:dc6aa9fdba08d46efa480a",
    measurementId: "G-RD29PBYJG0"
  };

firebase.initialiseApp(firebaseConfig);
const db = firebase.firestore();

async function loadWords() {
    const snapshot = await db.collection("words").get();
    words = snapshot.docs.map(doc => doc.data());

    updateCloud();
}

// Load words when the page loads
loadWords();

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
 
async function addWord() {
    const input = document.querySelector("#word-input");
    const word = input.value.trim();
    input.value = "";
    if (word === "") return;

    const wordRef = db.collection("words").doc(word);
    const doc = await wordRef.get();

    if (doc.exists) {
        await wordRef.update({ quantity: doc.data().quantity + 1 });
    } else {
        await wordRef.set({ word, quantity: 1 });
    }

    loadWords(); // Reload the cloud
}

function updateCloud() {
    const maxSize = 100;
    layout.words(
        words.map(w => ({
            text: w.word,
            size: Math.min(w.quantity * 20, maxSize),
        }))
    );

    layout.start();
}

async function clearCloud() {
    const snapshot = await db.collection("words").get();
    snapshot.forEach(doc => doc.ref.delete());

    words = [];
    updateCloud();
}

console.log(words);