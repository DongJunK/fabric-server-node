var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const { User } = require('../models');


// Query user info
router.post('/',async function(req, res){
   const { email, password } = req.body;
   try{
        const exUser = await User.findOne({where: {email:email}});
        console.log(exUser);
        if(exUser){
            // password check
            const result = await bcrypt.compare(password, exUser.password);
            if(result){ // password true
                res.send({result:true,info:{name:exUser.name, phone_num:exUser.phone_num},msg:'success'});
            } else {
                res.send({result:false,info:'', msg:'Abnormal approach'});
            }
        }
        //not exist email
        res.send({result:false,info:'',msg:'not exist email'});
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
        console.log(exUser);
        if(exUser){
            // password check
            const result = await bcrypt.compare(previous_password, exUser.password);

            if(result){ // password true
                const hash = bcrypt.hash(password,12); // password to hash
                User.update({
                    password: hash,
                    name: name,
                    phone_num: phone_num
                },{where:{email:email}})
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
        res.send({result:false,msg:'error'});
     }
});

// Reset user password
router.post('/update/password',async function(req, res){
    const { email, name } = req.body;

    try{
        const exUser = await User.findOne({where: {email:email}});
        console.log(exUser);
        if(exUser){
            // name check
            const result = compare(name, exUser.name);

            if(result){ // name true
                const hash = bcrypt.hash(password,12); // password to hash
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
        console.log(exUser);
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

/* User Join : /users/join */
router.post('/join',async function(req, res) {
    const { email, password, name, phone_num} = req.body;

    try{
        const exUser = await User.findOne({where: {email:email}});
        console.log(exUser);
        if(exUser){
            res.send({result:false,msg:'exist'});
            return;
        } 
        console.time('암호화시간');
        const hash = await bcrypt.hash(password, 12); // password to hash
        console.timeEnd('암호화시간');
        
        // insert User
        await User.create({ 
            email,
            password: hash,
            name,
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
// user withdrawal 
router.post('/withdrawl',async function(req, res){
    const { email, password } = req.body;

    try{
        const exUser = await User.findOne({where: {email:email}});
    
        if(exUser){
            // password check
            const result = await bcrypt.compare(password, exUser.password);

            if(result){ // password true
                User.destory({where:{email:email}})
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