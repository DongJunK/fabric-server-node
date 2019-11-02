var express = require('express');
var os = require('os');
var router = express.Router();

const bcrypt = require('bcrypt');
const { Ticket_platform } = require('../models');




/* User Join : /app/users/join */
router.post('/join',async function(req, res) {
    const { token } = req.body;
    
    try{
        const exUser = await Ticket_platform.findOne({where: { token }});
        if(exUser){
            res.send({result:false});
        } 
        console.time('암호화시간');
        const hash = await bcrypt.hash(token, 12);
        console.timeEnd('암호화시간');

        await User.create({
            email,
            password: hash,
            name,
            phone_num
        });
        res.send({result:true});
    }catch(error){
        console.error(error);
        //done(error);  
        res.send({result:false});
    }
});

router.post('/login',async (req,res)=>{ // req.body.email, req.body.password
    try{
        var name = req.body.name;
        const exUser = await Ticket_platform.findOne({ where:{ name }});
        console.log(exUser);
        //const result = await bcrypt.compare(password, exUser.password);
        res.send(exUser);
    }catch(error){
        console.error(error);
        res.send({reuslt:false,msg:error});
    }
});

module.exports = router;