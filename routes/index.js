const route = require('express').Router()
const fs = require('fs')
const path = require('path')

route.get('/', async (req, res) => {
    const sessions = await session(req, res)
    if (sessions) {
        res.redirect('/users')
    }else{
        res.render('login', { title: "Login" })
    }

})
route.get('/users', async (req, res) => {
    const sessions = await session(req, res)
    if (!sessions) res.redirect('/')
    const data = JSON.parse(await fs.readFileSync(path.join(__dirname, '../databse/users.json'), 'utf-8'))
    res.render('watchuser', { title: "watchuser", 'data': data, 'session': sessions })
})
route.get('/register', async (req, res) => {
    const sessions = await session(req, res)
    if (!sessions) res.redirect('/')
    if (sessions != 'Administrador') res.redirect('/forbiden')
    res.render('register', { title: "register" })
})
route.get('/delete', async (req, res) => {
    try {
        const sessions = await session(req, res)
        if (!sessions) res.redirect('/')
        if (sessions != 'Administrador') res.redirect('/forbiden')
    } catch (error) {
        console.log(error);
    }

    res.render('delete', { title: "delete" })
})
route.get('/successCreate', async (req, res) => {
    res.render('successCreate', { title: "successCreate" })
})
route.get('/failCreate', async (req, res) => {
    res.render('failCreate', { title: "failCreate" })
})
route.get('/successDelete', async (req, res) => {
    res.render('successDelete', { title: "successDelete" })
})
route.get('/failDelete', async (req, res) => {
    res.render('failDelete', { title: "failDelete" })
})
route.get('/unauthorized', async (req, res) => {
    res.render('failAuth', { title: "failAuth" })
})
route.get('/forbiden', async (req, res) => {
    res.render('unauthorized', { title: "unauthorized" })
})
route.post('/auth', async (req, res) => {
    const { correo, contraseña } = req.body
    const data = JSON.parse(await fs.readFileSync(path.join(__dirname, '../databse/users.json'), 'utf-8'))
    const exist = data.filter(data => data.data.correo === correo)
    if (exist.length == 0) {
        res.redirect('/unauthorized')
    }
    else if (exist[0].data.contraseña != contraseña) {
        res.redirect('/unauthorized')
    } else {
        try {
            fs.writeFileSync(path.join(__dirname, '../databse/session.json'), JSON.stringify(exist[0]))
            res.redirect('/users')
        } catch (error) {
            console.log(error);
        }
    }
})
route.post('/delete', async (req, res) => {
    const { correo } = req.body
    let out = null

    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../databse/users.json'), 'utf-8'))
    const exist = data.filter(data => data.data.correo === correo)
    if (exist.length == 0) { res.redirect('/failDelete') }
    out = data.filter(data => data.data.correo != correo)
    try {
        await fs.writeFileSync(path.join(__dirname, '../databse/users.json'), JSON.stringify(out));
        res.redirect('/successDelete')
    } catch (error) {
        console.log(error);
        res.redirect('/failDelete')
    }
})
route.post('/create', async (req, res) => {
    const { nombre, apellido, correo, fecha_nacimiento, rol, contraseña } = req.body
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../databse/users.json'), 'utf-8'))
    const exist = data.filter(data => data.data.correo === correo)
    console.log(exist);
    if (exist.length > 0) { res.redirect('/failCreate') }
    data.push({
        id: Math.floor(Math.random() * 1000000),
        data: {
            nombre: nombre,
            apellido: apellido,
            correo: correo,
            fecha_nacimiento: fecha_nacimiento,
            rol: rol,
            contraseña: contraseña
        }
    })
    await fs.writeFileSync(path.join(__dirname, '../databse/users.json'), JSON.stringify(data));
    res.redirect('/successCreate')
})

route.get('/logout', async (req, res) => {
    fs.writeFileSync(path.join(__dirname, '../databse/session.json'), JSON.stringify({}))
    res.redirect('/')
})


const session = async () => {
    const data = JSON.parse(await fs.readFileSync(path.join(__dirname, '../databse/session.json'), 'utf-8'))
    if (data.data) {
        return data.data.rol
    } else {
        return null
    }
}
module.exports = route;