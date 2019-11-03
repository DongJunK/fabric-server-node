var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const { User } = require('../models');


/* User Join : /app/users/join */
router.post('/join',async function(req, res) {
    const { email, password, name, phone_num} = req.body;

    try{
        const exUser = await User.findOne({where: {email:email}});
        if(exUser){
            res.send({result:false,msg:'exist'});
            return;
        } 
        console.time('암호화시간');
        const hash = await bcrypt.hash(password, 12);
        console.timeEnd('암호화시간');

        await User.create({
            email,
            password: hash,
            name,
            phone_num
        });
        res.send({result:true,msg:'success'});
    }catch(error){
        console.error(error);
        res.send({result:false,msg:'error'});
    }
});

router.post('/login',async (req,res)=>{ // req.body.email, req.body.password
    try{
        var email = req.body.email;
        var password = req.body.password;
        const exUser = await User.findOne({ where:{email}});
        if(exUser){
            // 비밀번호 검사
            const result = await bcrypt.compare(password, exUser.password);
            if(result){
                res.send({result:true,msg:'success login'});
            } else {
                res.send({result:false, msg:'The combination of email and password is incorrect.'});
            }
        }else {
            res.send({result:false, msg: 'The combination of email and password is incorrect.'});
        }
    }catch(error){
        console.error(error);
        res.send({reuslt:false,msg:error});
    }
});

module.exports = router;