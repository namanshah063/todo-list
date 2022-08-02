import express from "express";
// const bodyparser = require("body-parser");
import bodyparser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
const app = express();
app.use(express.static("public"));
app.use(bodyparser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");
mongoose.connect("mongodb+srv://admin-naman:test123@cluster0.abjjftj.mongodb.net/todolistdb");
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "a"
});
const item2 = new Item({
  name: "b"
});
const item3 = new Item({
  name: "c"
});

const defaultitem = [item1, item2, item3];

const listsSchema ={
  name:String ,
  items : [itemsSchema]
};
const List =mongoose.model("List",listsSchema);

app.get("/", function(req, res) {
  // var today = new Date();
  // var option = {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "long"
  // };
  // var day = today.toLocaleDateString("hi-IN", option);
  Item.find({}, function(err, foundItem) {
    if (foundItem.length === 0) {
      Item.insertMany(defaultitem, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listtitle: "today",
        addeditems: foundItem
      })
    }
  });
});

app.post("/", function(req, res) {
  const newitem = req.body.newlistitem;
  const listname = req.body.list;
  const item = new Item({
    name: newitem
  });

if(listname==="today"){
  item.save();
  res.redirect("/");

}else{
  List.findOne({name:listname},function(err,foundlist){
       foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listname);
    });
}
});




app.post("/delete", function(req, res) {
const checkeditemid = req.body.checkbox;
const listname = req.body.listname;

if(listname==="today"){
  Item.deleteOne({
    _id:req.body.checkbox
  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("successfully deleted");
    }
  });
  res.redirect("/");
} else{
  List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkeditemid}}},function(err,foundItem){
    if(!err){
      res.redirect("/"+listname);
    }
  });
}



});
app.get("/:coustomlistname",function(req,res){
  const coustomlistname = _.capitalize(req.params.coustomlistname);

   List.findOne({name:coustomlistname},function(err,foundlist){
     if(!err){
       if(!foundlist){
         const list = new List({
           name:coustomlistname,
           items: defaultitem
         });
         list.save();
         res.redirect("/" + coustomlistname);
       }
        else{
         res.render("list",   { listtitle:foundlist.name ,
             addeditems: foundlist.items});
       }
     }
   });


});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

// app.listen(3000, function() {
//   console.log("server started on port 3000")
// });
