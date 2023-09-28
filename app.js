//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
let _=require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//creating database
mongoose.connect('mongodb+srv://gowrisubha44:Tt7cpkXruyIZgGaa@cluster0.xhhtsqg.mongodb.net/todoListDB');

const itemsSchema={
  name:String
}

//declaring model
const Item=mongoose.model("Item",itemsSchema);

//list Schema creation
const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);

const item1=new Item({
  name:"Welcome to your ToDo List"
})

const item2=new Item({
  name:"Hit the + button to add new item"
})

const item3=new Item({
  name:"<-- Hit this to delete an item"
})

//putting all the data into 1 single array
const defaultItems = [item1,item2 ,item3 ];



app.get("/", function(req, res) {
  
  Item.find({}).then(foundItems =>{
    if(foundItems.length===0){
      //inserting default items into todoListDB
       Item.insertMany(defaultItems);
      //to display all the default items we are redirecting it to the same function again
       res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems:foundItems });
    }
   
    
  })

 

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  //convert the new item to an object of schema
  const newItem=new Item({
    name: itemName
  })
  //if it is the home page then just save it in the data base and redirect it to home router again
  if(listName==="Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then(foundList =>{
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }
 
});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);
   List.findOne({name: customListName}).then(foundList =>{
    if(!foundList){
      //create new list since there is no list already exists
      const list=new List({
        name:customListName,
        items:defaultItems
      })
      list.save();
    res.redirect("/"+customListName);
   }else{
    //display existing list
    res.render("list", {listTitle:foundList.name , newListItems:foundList.items });
   }
   })
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete",function(req,res){
  const removeElementId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(removeElementId).then(ele =>{
    })
    res.redirect("/");
  }else{
    //find the list and delete that lists-> items-> one element
    List.findOneAndUpdate({name: listName},{$pull:{items: {_id:removeElementId}}}).then(elem =>{
      elem.save();
      res.redirect("/"+ listName);
    })

  }
 
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
