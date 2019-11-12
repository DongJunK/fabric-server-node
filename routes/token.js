const express = require('express');
let router = express.Router();
const makeToken = require('../safeticket_net/maketoken');

const bcrypt = require('bcrypt');
const { Ticket_platform } = require('../models');

/* POST token create or show request */
router.post('/platform', async function(req, res) {
    const { ticket_platform_name, contract_date } = req.body;

    try{
        const ticket_platform = await Ticket_platform.findOne({ where: { name:ticket_platform_name, contract_date:contract_date }});
        
        if(ticket_platform){ // Whether exist ticket_platfrom info
            if(ticket_platform.token){ // Whether exist token of ticket_platform info 
                res.send({result:true,token:ticket_platform.token,msg:'Successfully get token'});
            } else {
                const hash = await bcrypt.hash(JSON.stringify(ticket_platform), 12);
                console.log(hash);
                Ticket_platform.update({token:hash},{where: {name:ticket_platform_name,contract_date:contract_date}})
                
                .then(() =>{
                    res.send({result:true,token:hash,msg:'Successfully created token'});
                })
                .catch(err => {
                    console.error(err);
                    res.send({result:false,token:'',msg:err});
                });
            }
        } else {
            res.send({result:false,token:'',msg:'Invalid Token'});
        }
    } catch(error){
        console.error(error);
        res.send({result:false,token:'',msg:error});
    }

});

// Register and enroll user
router.post('/jwt',async function(req, res) {
    var result = await makeToken();
    if(result.success){
      res.send({result:true});
    } else {
      res.send({result:false});
      makeToken();
    }
    
});

module.exports = router;