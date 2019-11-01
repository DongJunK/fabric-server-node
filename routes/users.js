var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const { User } = require('../models');




/* User Join : /app/users/join */
router.post('/join',async function(req, res) {
    const { email, password, name, phone_num} = req.body;
    try{
        const exUser = await User.findOne({where: {email}});
        if(exUser){
            res.send({result:false});
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
        res.send({result:true});
    }catch(error){
        console.error(error);
        //done(error);  
        res.send({result:false});
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
                res.send({result:true,msg:'로그인되었습니다.'});
            } else {
                res.send({result:false, msg:'이메일-비밀번호 조합이 맞지 않습니다.'});
            }
        }else {
            res.send({result:false, msg: '이메일-비밀번호 조합이 맞지 않습니다.'});
        }
    }catch(error){
        console.error(error);
        res.send({reuslt:false,msg:error});
    }
});

module.exports = router;