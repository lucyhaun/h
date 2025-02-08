import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyD5kZRmmEcyJy8mO4nvsZXX2j41RDs74Vo",
    authDomain: "cloud-9c0b7.firebaseapp.com",
    projectId: "cloud-9c0b7",
    storageBucket: "cloud-9c0b7.firebasestorage.app",
    messagingSenderId: "323590350527",
    appId: "1:323590350527:web:dc6aa9fdba08d46efa480a",
    measurementId: "G-RD29PBYJG0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize words array and other variables
let words = [];
let colors = ["#ffc300", "#00B050"];
const width = 800;
const height = 400;

// Function to load words from Firestore
async function loadWords() {
    const querySnapshot = await getDocs(collection(db, "words"));
    words = querySnapshot.docs.map(doc => doc.data());
    updateCloud(); // Update the word cloud once data is fetched
}

// Load words when the page loads
loadWords();

// D3 setup for the word cloud
const svg = d3
    .select("section")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const layout = d3.layout.cloud()
    .size([width, height])
    .words([])
    .padding(10)
    .rotate(0)
    .fontSize(d => d.size)
    .spiral("rectangular")
    .on("end", draw);

function draw(words) {
    svg.selectAll("*").remove(); // Clears previous words
    svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`) // Centers words
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", d => d.size + "px")
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
        .text(d => d.text);
}

// Function to add a new word to Firestore
async function addWord() {
    const input = document.querySelector("#word-input");
    const word = input.value.trim();
    input.value = "";
    if (word === "") return;

    const wordRef = doc(db, "words", word);
    const docSnap = await getDoc(wordRef); // Use getDoc for single document retrieval

    if (docSnap.exists()) {
        // If the word already exists, update the quantity
        await updateDoc(wordRef, { quantity: docSnap.data().quantity + 1 });
    } else {
        // If the word doesn't exist, create it with quantity 1
        await setDoc(wordRef, { word, quantity: 1 });
    }

    loadWords(); // Reload words and update cloud
}

// Function to update the word cloud layout with the current words
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

// Function to clear the word cloud (delete all words from Firestore)
async function clearCloud() {
    const querySnapshot = await getDocs(collection(db, "words"));
    for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref); // Delete each document from Firestore
    }

    words = []; // Reset words array
    updateCloud(); // Update the cloud with no words
}

console.log(words); // Debugging line to check the current words array