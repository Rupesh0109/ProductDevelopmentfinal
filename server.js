const express = require('express');
const app = express();
const path=require("path");
const bodyParser = require('body-parser');
const multer = require('multer');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'/views'));
app.use('/assets',express.static(__dirname+'/public'));


const session=require("express-session");
const MongoDBSession=require("connect-mongodb-session")(session)
const MONGOURI="mongodb+srv://rupesh:rupesh@photos.qztzlxo.mongodb.net/?retryWrites=true&w=majority";
const colors=require("colors");
const mongoose=require("mongoose");
const UserModel=require("./models/User")

const connectDB = async () => {
   try {
     const conn = await mongoose.connect(MONGOURI,{useNewUrlParser:true,
     useUnifiedTopology:true,
     });
     console.log(
       `Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white
     );
   } catch (error) {
     console.log(`Error in Mongodb ${error}`.bgRed.white);
   }
 };
 connectDB();


 const storage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, 'uploads/');
   },
   filename: function (req, file, cb) {
     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
   }
 });


 const upload = multer({ storage: storage });


 const store=new MongoDBSession({
   uri:MONGOURI,
   databaseName:"Photos",
   collection:"sessions"
 })

app.use(session({
   secret:"key that signs the cookie",
   resave:true,
   saveUninitialized:false,
   store:store,
}))

//middleware
const isAuth=async(req,res,next)=>{
   if(req.session.isAuth){
    await next()
   }
   else{
      res.redirect("/login?error=notlogin")  
   }
}


//end of middleware


//routes
app.get('/', function(req, res) {
   var logout=false;
   var admincheck=false;
   if(req.query.logout==="sucessfull"){
      logout=true
   }
   if(req.query.error==="notadmin"){
      admincheck=true
   }
   res.render('pages/home',{auth:req.session.isAuth,logout:logout,data:req.session.data,admin:req.session.isAdmin,admincheck:admincheck});
});
app.get('/login', async(req, res)=> {
   if(await req.session.isAuth){
     await res.redirect("/dashboard?error=logged");

   }
   else{
   var password=false;
   var register=false;
   var modal=false;
   var login=false;
   if(req.query.error==="userexists"){
      modal=true;
   }
   if(req.query.error==="notlogin"){
      login=true;
   }
   if(req.query.error==="passworddoesnotmatch"){
      password=true;
   }
   if(req.query.register==="success"){
      register=true;
   }
   res.render('pages/login',{condition:modal,success:register,password1:password,login:login,auth:req.session.isAuth,data:req.session.data,admin:req.session.isAdmin});
   }
});
app.get('/register', function(req, res) {
   if(req.session.isAuth){
      res.redirect("/dashboard?error=logged");
   }
   else{
   var exists=false;
   if(req.query.error==="usernotexists"){
      exists=true;
   }
   res.render('pages/register',{modal:exists,auth:req.session.isAuth,data:req.session.data,admin:req.session.isAdmin});
   }
});

app.get('/dashboard',isAuth,async(req,res)=>{
   var logged=false;
   if(await req.query.error==="logged"){
      logged=true;
   }
   res.render("pages/dashboard",{auth:req.session.isAuth,data:req.session.data,admin:req.session.isAdmin,logged:logged});
});


//end of routes

//form handling
app.post("/register",async(req,res)=>{
   const {name,roll,password}=req.body;
   
   let user =await UserModel.findOne({"rollno":roll});
   if(user){
      return res.redirect("/login?error=userexists")
   }
   
   
    user= new UserModel({
      username:name.toUpperCase(),
      roll:roll,
      password:password,
   });
   

   user.save();
   res.redirect("/login?register=success");
  
   
   
})

app.post('/login',async(req,res)=>{
   try{
   const {roll,password}=req.body;
   let check= await UserModel.findOne({"roll":roll});
   if(!check){
     return res.redirect("/register?error=usernotexists")
   }
   if(password!==check.password){
      res.redirect("/login?error=passworddoesnotmatch")
   }
   req.session.data=check;
  
   
   req.session.isAuth=true;

   res.redirect("/dashboard")
}
catch(error){
   console.log(error.message)
}
  
})

app.post('/upload', upload.single('image'), async (req, res) => {
   try {
     const newImage = await UserModel.findOne({"rollno":req.session.rollno});
     newImage.photos.push({
      name:req.file.originalname,
      data:fs.readFileSync(req.file.path),
      contentType:req.file.mimetype
     }) 
     await newImage.save();
     res.send('Image uploaded and saved successfully');
   } catch (error) {
     res.status(500).send(error.message);
   }
   
 });








//end of form handling

//logout
app.get("/logout",function(req,res){
req.session.destroy((err)=>{
   if(err) throw err;
   res.redirect("/?logout=sucessfull");
})
});
app.listen(3000);
console.log('Server is listening on port 3000');