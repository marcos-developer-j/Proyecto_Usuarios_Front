const route = require('express').Router()
const axios = require('axios');
const jwt_decode = require('jwt-decode');
route.get('/', async (req, res) => {
    const sessions = await session(req, res)
    if (sessions) {
        res.redirect('/users')
    } else {
        res.render('login', { title: "Login" })
    }
})
route.get('/users', async (req, res) => {
    const sessions = await session(req, res)
    if (!sessions) {
        res.redirect('/')
    }else{
        const result = await axios.get(`http://localhost:3001/api/session/sessions`)
        const data = await getUsers(result.data.data[0].token)
        res.render('watchuser', { title: "watchuser", 'data': data.data, 'session': sessions })
    }

})
route.get('/register', async (req, res) => {
    const sessions = await session(req, res)
    if (!sessions) {
        res.redirect('/')
    } else {
        if (sessions != 'Administrador') {
            res.redirect('/forbiden')
        } else {
            res.render('register', { title: "register" })
        }
    }


})
route.get('/delete', async (req, res) => {
    try {
        const sessions = await session(req, res)
        if (!sessions) { res.redirect('/') }
        else {
            if (sessions != 'Administrador') {
                res.redirect('/forbiden')
            }
            else {
                res.render('delete', { title: "delete" })
            }
        }
    } catch (error) {
        console.log(error);
    }


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
    /*     const data = JSON.parse(await fs.readFileSync(path.join(__dirname, '../databse/users.json'), 'utf-8')) */
    let result = null
    try {
        result = await authUser({ correo: correo, contraseña: contraseña })
    } catch (error) {
        console.log(error, correo);
        res.redirect('/unauthorized')
        return null
    }
    if (result.data.error) {
        res.redirect('/unauthorized')
    }
    else {
        try {
            await createSession(result.data.token, { token: result.data.token })
            res.redirect('/users')
        } catch (error) {
            res.redirect('/users')
            console.log(error);
        }
    }
})
route.post('/delete', async (req, res) => {
    const { correo } = req.body
    let out = null
    try {
        const res = await axios.get(`http://localhost:3001/api/session/sessions`)
        const result = await deleteUsers(res.data.data[0].token, correo)
        res.redirect('/successDelete')
    } catch (error) {
        console.log(error);
        res.redirect('/failDelete')
    }
})
route.post('/create', async (req, res) => {
    const { nombre, apellido, correo, fecha_nacimiento, rol, contraseña } = req.body
    const data = {
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        contraseña: contraseña,
        rol: rol,
        fecha_nacimiento: fecha_nacimiento
    }
    let result = null
    try {
        const res = await axios.get(`http://localhost:3001/api/session/sessions`)
        result = await createUsers(res.data.data[0].token, data)
        res.redirect('/successCreate')
    } catch (error) {
        console.log(error);
        res.redirect('/failCreate')
    }

})
route.get('/logout', async (req, res) => {
    try {
        const result = await axios.get(`http://localhost:3001/api/session/sessions`)
        await deleteSession(result.data.data[0].token)
    } catch (error) {
        console.log("errorDeleteSession", error);
    }

    res.redirect('/')
})
const getUser = async (token, id) => {
    const result = await axios.get(`http://localhost:3001/api/user/users/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    return result
}
const getUsers = async (token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    const result = await axios.get(`http://localhost:3001/api/user/users`, config)
    return result.data
}
const deleteUsers = async (token, correo) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: { correo: correo }
    }
    const data = {
        correo: correo
    }
    const result = await axios.delete(`http://localhost:3001/api/user/users`, config)
    return result
}
const createUsers = async (token, data) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }

    const result = await axios.post(`http://localhost:3001/api/user/register`, data, config)
    return result.data
}
const authUser = async (data) => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const result = await axios.post(`http://localhost:3001/api/user/login`, data,
        config,
    )
    return result.data
}
const session = async () => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        }
    }
    let decoded = null
    try {
        const result = await axios.get(`http://localhost:3001/api/session/sessions`, config)
        decoded = result.data.data[0] ? await jwt_decode(result.data.data[0].token) : null
    } catch (err) {
        console.log("decodedError", err);
        return null
    }
    if (decoded) {
        return decoded.rol
    } else {
        return null
    }
}
const createSession = async (token, data) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    const result = await axios.post(`http://localhost:3001/api/session/session`, data, config)
    return result.data
}
const deleteSession = async (token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    const result = await axios.delete(`http://localhost:3001/api/session/session`, config)
    return result.data
}
module.exports = route;