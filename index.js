import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import {readFile} from 'fs/promises';

const app = express();
const port = 3000;
const apiJoke = "https://v2.jokeapi.dev/joke/Miscellaneous,Dark,Pun,Spooky?type=single";
const apiImage = "https://api.unsplash.com/search/photos";
const clientIdPath = 'clientId.txt';
const client_id = await readClientID();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.get('/', async (req,res)=>{
    try {
        const jokeResponse = await axios.get(apiJoke);
        var jokeCategory = jokeResponse.data.category; //Read joke category (Miscellaneous,Dark,Pun,Spooky) and used to specify the searched image.
        if(jokeCategory === "Misc"){ jokeCategory = "Miscellaneous"};
    
        const response = await axios.get(apiImage,{    //return an array of about 10000 image object
            params:{
                query: jokeCategory,
                orientation: "landscape",
                client_id: client_id
            }
        })
        console.log('Rate Limit Remaining:', response.headers.get('x-ratelimit-remaining'));
        const images = response.data.results;
        const randomIndex = Math.floor(Math.random()*images.length);
        const small_Img_URL = images[randomIndex].urls.small;

        res.render('index.ejs',{
            renderJoke: jokeResponse.data.joke,
            bgImage: small_Img_URL
        });
    } catch (error) {
        res.render('index.ejs',{
            renderJoke: error.message,
            bgImage: error.message
        });
    }

});

app.listen(port, ()=>{
    console.log(`server running in port ${port}`);
});

async function readClientID(){
    try {
        const cliendID = await readFile(clientIdPath,'utf-8');
        return cliendID;
    } catch (error) {
        console.error("Error reading file",error.message);
    }
}