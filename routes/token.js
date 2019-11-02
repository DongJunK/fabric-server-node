var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const { Ticket_platform } = require('../models');

/* POST token create or show request */
router.post('/', async function(req, res) {
    const { name, contract_date } = req.body;

    try{
        //  Inquire about the ticket_platform info
        const ticket_platform = await Ticket_platform.findOne({ where: { name:name, contract_date:contract_date }});
        console.log(ticket_platform);
        if(ticket_platform){ // Whether exist ticket_platfrom info
            if(ticket_platform.token){ // Whether exist token of ticket_platform info 
                res.send({result:true,token:ticket_platform.token,msg:'Successfully get token'});
            }else{
                const hash = await bcrypt.hash(JSON.stringify(ticket_platform), 12);
                console.log(hash);
                Ticket_platform.update({token:hash},{where: {name:name,contract_date:contract_date}})
                .then(() =>{
                    res.send({result:true,token:hash,msg:'Successfully created token'});
                })
                .catch(err => {
                    console.error(err);
                    res.send({result:false,msg:err});
                });
            }
            

        } else {
            res.send({result:false,msg:'not exist'});
        }
    } catch(error){
        console.error(error);
        res.send({result:false,msg:error});
    }

});

module.exports = router;