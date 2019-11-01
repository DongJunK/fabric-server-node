const localStorage = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { User } = require('../models');


// 아이디, 비밀번호 존재 여부 확인
module.exports = (passport)=>{
    passport.use(new localStorage({
        usernameField: 'email', //req.body.email
        passwordField: 'password',  // req.body.password
    }, async(email, password, done)=>{ // done ( 에러, 성공, 실패)
        try{
            const exUser = await User.findOne({ where:{email}});
            console.log(exUser);
            if(exUser){
                // 비밀번호 검사
                const result = await bcrypt.compare(password, exUser.password);
                console.log(result);
                if(result){
                    done(null, exUser);
                } else {
                    done(null, false, {message:'이메일-비밀번호 조합이 맞지 않습니다.'});
                }
            }else {
                done(null,false,{message: '이메일-비밀번호 조합이 맞지 않습니다.'});
            }
        }catch(error){
            console.error(error);
            done(error);
        }
    }));
};