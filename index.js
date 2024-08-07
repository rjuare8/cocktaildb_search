import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import methodOverride from 'method-override';

const app = express();
const port = 3000;

const API_URL = "https://www.thecocktaildb.com/api/json/v1/1";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method
      delete req.body._method
      return method
    }
}))


//Once the page is loaded the first 25 drinks will appear in alphabetical order
app.get("/", async (req, res) => {

    try {
        const result = await axios.get(`${API_URL}/search.php?s=a`);
        const drinks = result.data.drinks;

        
        var cocktails = [];
        drinks.forEach(function(drink) {
            cocktails.push({ name: drink.strDrink, icon: drink.strDrinkThumb })
        });

        
        res.render("index.ejs", {cocktails: cocktails});
    } catch (error) {
        console.log("Server error: " + error.message);
        res.status(500);
        
    }

});

//Using the search bar you can look up for specific drinks
app.post("/search", async (req, res) => {
    var query = req.body["query"];
    


    try {
        const result = await axios.get(`${API_URL}/search.php?s=${query}`);
        const drinks = result.data.drinks;

        
        var cocktails = [];
        drinks.forEach(function(drink) {
            cocktails.push({ name: drink.strDrink, icon: drink.strDrinkThumb })
        });

        
        res.render("index.ejs", {cocktails: cocktails});
    } catch (error) {
        console.log("Server error: " + error.message);
        res.status(500);
        
    }

});

app.get("/cocktail/:name", async (req, res) => {
    const cocktailName = req.params.name;
    try {
        const result = await axios.get(`${API_URL}/search.php?s=${encodeURIComponent(cocktailName)}`);
        const drink = result.data.drinks[0];

        
        //Added the name of the cocktail, a picture, and instructions
        var cocktail = { name: drink.strDrink, icon: drink.strDrinkThumb, instructions:  drink.strInstructions};
        
        
        var ingredients = [];
        for (var i = 1; i < 16; i++) {
            if (drink[`strIngredient${i}`] != null) {
                ingredients.push({ingredient: drink[`strIngredient${i}`], measure: drink[`strMeasure${i}`], icon: `www.thecocktaildb.com/images/ingredients/${encodeURIComponent(drink[`strIngredient${i}`])}-Medium.png`})
            }
        }

        

        
        res.render("cocktail.ejs", {cocktail: cocktail, ingredients: ingredients});
        
    } catch (error) {
        console.log("Error: " + error.message);
        res.status(500).json({ error: 'Failed to fetch cocktail' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});