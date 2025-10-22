const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())

app.post('/Codigo_Projeto/HTML/autenticacao.html', (req, res) => {

})

app.listen(3000, () => {console.log('server up & running');
})