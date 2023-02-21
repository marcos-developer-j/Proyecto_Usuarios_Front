const express = require('express')
const path = require('path')

const app = express()

app.use(express.static(path.join(__dirname,'public')))

//setters
try{
app.set('port',process.env.PORT || 3000 )
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
}catch{err=>{console.log(err);}

}
app.use(express.urlencoded({extended:false}));
//middleware
app.use('/',require('./routes/index'))



app.listen(app.get('port'),()=>console.log(`Listen ${app.get('port')}`))