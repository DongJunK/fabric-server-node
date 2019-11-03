var express = require('express');
var router = express.Router();


/* GET qr code page. */
router.get('/qrcode', function(req, res) {
  const token = req.headers.authorization;
  const { ticket_no, name, phone_num, event_id, venue, event_date, event_time } = req.body;
  try{
    if(token){ // exist token
      
    }else {
      res.send({result:false,msg:'Not authorization'});
    }
  }catch(error){
    
  }

});

module.exports = router;