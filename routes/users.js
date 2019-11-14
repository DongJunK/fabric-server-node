var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const { User } = require('../models');


// Query user info
router.post('/',async function(req, res){
   const { email, password } = req.body;
   try{
        const exUser = await User.findOne({where: {email:email}});
        if(exUser){
            // password check
            const result = await bcrypt.compare(password, exUser.password);
            if(result){ // password true
                res.send({result:true,info:{name:exUser.name, phone_num:exUser.phone_num},msg:'success'});
            } else {
                res.send({result:false,info:'', msg:'Abnormal approach'});
            }
        } else {
            //not exist email
            res.send({result:false,info:'',msg:'not exist email'});
        }
    }catch(error){
        console.error(error);
        res.send({result:false,info:'',msg:'error'});
    }
   
});

// Update user info
router.post('/update',async function(req, res){
    const { email, previous_password, password, name, phone_num } = req.body;

    try{
        const exUser = await User.findOne({where: {email:email}});
        if(exUser){
            // password check
            const result = await bcrypt.compare(previous_password, exUser.password);

            if(result){ // password true
                const hash = await bcrypt.hash(password,12); // password to hash
                User.update({
                    password:hash,
                    name,
                    phone_num
                },{where:{email:email}})
                .then(function(){
                    res.send({result:true,msg:'success'});
                })
                .catch(function(err){
                    console.log(err);
                    res.send({result:false,msg:'error'});
                });
            } else {
                res.send({result:false, msg:'Abnormal approach'});
            }
        } else {
            res.send({result:false,msg:'not exist email'});
        }
        
     }catch(error){
        console.error(error);
        res.send({result:false,msg:'error'});
     }
});

// Reset user password
router.post('/update/password',async function(req, res){
    const { email, password, name } = req.body;

    try{
        const exUser = await User.findOne({where: {email:email}});
        if(exUser){
            // name check
            const result = compare(name, exUser.name);

            if(result){ // name true
                const hash = await bcrypt.hash(password,12); // password to hash
                User.update({
                    password:hash
                },{where:{email:email}})
                .then(function(){
                    res.send({result:true,msg:'success'});
                })
                .catch(function(){
                    res.send({result:false,info:'',msg:'error'});
                });
                
            } else {
                res.send({result:false, msg:'Abnormal approach'});
            }
        } else {
            res.send({result:false,info:'',msg:'not exist email'});
        }
         
    }catch(error){
        console.error(error);
        res.send({result:false,info:'',msg:'error'});
    }
});

/* whether exist email : /users/email */
router.post('/email',async function(req, res) {
    const { email } = req.body;

    try{
        const exUser = await User.findOne({where: {email:email}});

        if(exUser){ // exist email
            res.send({result:false,msg:'exist'});
            return;
        } else {
            res.send({result:true,msg:'success'});
        }
        
    }catch(error){
        console.error(error);
        res.send({result:false,msg:'error'});
    }
});

/* whether exist sns_id : /users/sns_id */
router.post('/sns_id',async function(req, res) {
    const { sns_id } = req.body;
    try{
        const exUser = await User.findOne({where: {sns_id:sns_id}});
        if(exUser){ // exist email
            res.send({result:true,info:{email:exUser.email,password:exUser.password,name:exUser.name},msg:'exist'});
            return;
        } else {
            res.send({result:false,info:'',msg:'not exist'});
        }
        
    }catch(error){
        res.send({result:false,info:'',msg:'error'});
    }
});

/* User Join : /users/join */
router.post('/join',async function(req, res) {
    const { email, sns_id, password, name, phone_num} = req.body;
    const exUser;
    try{
        exUser = await User.findOne({where: {email:email}});
        
        if(exUser){
            res.send({result:false,msg:'exist'});
            return;
        } 
        const hash = await bcrypt.hash(password, 12); // password to hash
        if(sns_id === undefined){
            sns_id = null;
        }
        // insert User
        await User.create({ 
            email,
            password: hash,
            name,
            sns_id,
            phone_num
        })
        .then(function() { // success
            res.send({result:true,msg:'success'});
        }).catch(function() { // error
            res.send({result:false,msg:'error'});
        });
        
    }catch(error){
        console.error(error);
        res.send({result:false,msg:'error'});
    }
});

// User Login : /users/login
router.post('/login',async function(req,res){ // req.body.email, req.body.password
    try{
        var email = req.body.email;
        var password = req.body.password;
        const exUser = await User.findOne({ where:{email}});
        if(exUser){ // exist email
            // password check
            const result = await bcrypt.compare(password, exUser.password);
            if(result){ // password true
                res.send({result:true,msg:'success login'});
            } else {
                res.send({result:false, msg:'The combination of email and password is incorrect.'});
            }
        }else { // not exist email
            res.send({result:false, msg: 'The combination of email and password is incorrect.'});
        }
    }catch(error){
        console.error(error);
        res.send({reuslt:false,msg:error});
    }
});

// User email name check : /users/update/check
router.post('/update/check',async function(req,res){ // req.body.email, req.body.password
    try{
        var email = req.body.email;
        var name = req.body.name;
        const exUser = await User.findOne({ where:{email:email,name:name}});
        if(exUser){ 
            res.send({result:true,msg:'success'});
        }else { // not exist email
            res.send({result:false, msg: 'The combination of email and name is incorrect.'});
        }
    }catch(error){
        console.error(error);
        res.send({reuslt:false,msg:error});
    }
});

// user withdrawal 
router.post('/withdrawal',async function(req, res){
    const { email, password } = req.body;

    try{
        const exUser = await User.findOne({where: {email:email}});
    
        if(exUser){
            // password check
            const result = await bcrypt.compare(password, exUser.password);

            if(result){ // password true
                User.destroy({where:{email:email}})
                .then(function(){
                    res.send({result:true,msg:'success'});
                })
                .catch(function(){
                    res.send({result:false,msg:'error'});
                });
            } else {
                res.send({result:false, msg:'Abnormal approach'});
            }
        } else {
            res.send({result:false,msg:'not exist email'});
        }
        
     }catch(error){
        console.error(error);
        res.send({result:false,info:'',msg:'error'});
     }
});

module.exports = router;