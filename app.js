//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require('mongoose')
const lodash= require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://suryankaghosh19:Test123@cluster0.lz72v6v.mongodb.net/todolistDB",{useNewUrlParser: true});
//mongodb://127.0.0.1:27017
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemSchema=new mongoose.Schema({
  name: String
});
const Item= new mongoose.model("Item", itemSchema);

const buy=new Item({
  name: "Buy Food"
});
const cook= new Item({
  name: "Cook Food"
});
const eat= new Item({
  name: "Eat Food"
});

const listSchema= new mongoose.Schema({
  name:String,
  items: [itemSchema]
});

const List = new mongoose.model("List", listSchema);

// Item.insertMany([buy, cook, eat]).then(function(){
// mongoose.connection.close();
//   console.log("Successfully saved items to the database");
// }).catch(function(err){
//   console.log(err);
// });



app.get("/", function(req, res) {

  Item.find({}).then(
    items =>{
      if(items.length === 0){
        Item.insertMany([buy, cook, eat]).then(function(){
          console.log("Successfully saved items to the database");
        }).catch(function(err){
          console.log(err);
        });
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: items});
      }
    }
  ).catch(function(err){
    console.log(err);
  })
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem= new Item({
    name:itemName
  });

  if(listName === "Today")
  {
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then((result)=>{
      result.items.push(newItem);
      result.save();
      res.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    });
  }
  
  
});

app.post("/delete", function(req, res){
  const checkedItemId= req.body.checkbox;
  const listName= req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(docs){
      console.log("Removed this id: "+docs);
    }).catch(function(err){
      console.log(err);
    })
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}).then((results)=>{
      res.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    })
  }

  
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:topic", function(req, res){
  
  const customName= lodash.capitalize(req.params.topic);


  List.findOne({name: customName}).then((results)=>{
    // console.log("This doc is existing: ",results);

    if(!results){
      //Create new List
      const list = new List({
        name: customName,
        items: [buy, cook, eat]
      })

      list.save();
      res.redirect("/"+ customName);
      }
    else{
      //Show the existing one.
      res.render("list", {listTitle: customName, newListItems: results.items});
    }
    
  }).catch(function(err){
    console.log(err);
  });

})


const port= process.env.PORT || 3000;
app.listen(port , function() {
  console.log("Server started successfully.");
});
