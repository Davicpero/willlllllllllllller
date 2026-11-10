import express from "express"
import cors from "cors"
import pool from "../db.js"
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"

const app = express()

const JWT_SECRET = "senai"

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(express.static('public'))

const PORT = 3000

const SALT = await bcrypt.genSalt(10)

function autentificarToken(req, res, next){
    const token = req.cookies.token

    if(!token){
        return res.status(401).json({message: "Acesso negado."})
    }

    try{
        const usuarioJWT = jwt.verify(token, JWT_SECRET)
        req.usuarioJWT = usuarioJWT
        next()
    }catch(erro){
        return res.status(403).json({message: "Token inválido."})
    }
}

app.post('/registro', async (req, res) => {
    const {nome, email, senha} = req.body
    try{
        if(!nome || !email || !senha){
            return res.status(400).json({
                erro: "Todos os campos são obrigatórios"
            })
        }

        const senhaHash = await bcrypt.hash(senha, SALT)
        const novoUsuario = await pool.query("INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email", [nome, email, senhaHash])

        res.json(novoUsuario.rows[0])
        }catch(erro){
            res.json({message: "erro"})
        }
    }
)

app.post('/login', async (req, res) => {
    const {email, senha} = req.body
    const resultado = await pool.query("SELECT * FROM usuario WHERE email = $1", [email])

    if(resultado.rows.length === 0){
        return res.status(401).json({
            erro: "Email e senha inválidos"
        })
    }

    const usuario = resultado.rows[0]

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)

    if(!senhaCorreta){
        return res.status(401).json({
            erro: "Email e senha inválidos"
        })
    }

    const token = jwt.sign(
        {id: usuario.id, email: usuario.email},
        JWT_SECRET,
        {expiresIn: "1h"}
    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 3600000
    })

    return res.status(200).json({
        message: "Login realizado com sucesso!",
        user: {
            "nome": usuario.nome
        }
    })
})

app.get('/solicitantes', autentificarToken, async (req, res) => {
    try{
    const registros = await pool.query('SELECT id, nome, email FROM solicitantes')
    res.json(registros.rows)
    }catch(erro){
        res.json({message: "Erro ao consultar o registro."})
    }
})

app.post('/solicitantes', autentificarToken, async (req, res) => {
    const {nome, email} = req.body
    try{

        const novoRegistro = await pool.query('INSERT INTO solicitantes (nome, email) VALUES ($1, $2) RETURNING *', [nome, email])

        res.json(novoRegistro.rows[0])
    }catch(erro){
            res.json({message: "Erro ao cadastrar solicitante!"})
        }
})

app.put('/solicitantes/:id', autentificarToken, async (req, res) => {
    const {id} = req.params
    const {campo1, campo2, campo3} = req.body

    try{

    const atualizarRegistro = await pool.query('UPDATE solicitantes SET informaçao = $1, numero = $2, WHERE id = $3 RETURNING *', [informaçao, numero, id])

    res.json(atualizarRegistro.rows[0])
    }catch(erro){
            res.json({message: "Erro ao atualizar solicitantes!"})
        }
})

app.delete('/solicitantes/:id', autentificarToken, async (req, res) => {
    const {id} = req.params

    try{
    const deletarRegistro = await pool.query('DELETE FROM solicitantes WHERE id = $1 RETURNING *', [id])
    res.json(deletarRegistro.rows[0])
    }catch(erro){
            res.json({message: "Erro ao deletar solicitante!"})
        }
})

app.get('/tecnicos', autentificarToken, async (req, res) => {
    try{
    const registros = await pool.query('SELECT id, iformaçao, numero FROM tecnicos')
    res.json(registros.rows)
    }catch(erro){
        res.json({message: "Erro ao consultar tecnico!"})
    }
})

app.post('/tecnicos', autentificarToken, async (req, res) => {
    const {campo1, campo2, campo3} = req.body
    try{

        const novoRegistro = await pool.query('INSERT INTO tecnicos (campo1, campo2, campo3) VALUES ($1, $2, $3) RETURNING *', [campo1, campo2, campo3])
        res.json(novoRegistro.rows[0])
    }catch(erro){
        res.json({message: "Erro ao cadastrar entidade 1!"})
    }
})

app.put('/tecnicos/:id', autentificarToken, async (req, res) => {
    const {id} = req.params
    const {campo1, campo2, campo3} = req.body
    try{

        const atualizarRegistro = await pool.query('UPDATE tecnicos SET campo1 = $1, campo2 = $2, campo3 = $3 WHERE id = $4 RETURNING *', [campo1, campo2, campo3, id])
        res.json(atualizarRegistro.rows[0])
    }catch(erro){
        res.json({message: "Erro ao atualizar entidade 1!"})
    }
})

app.delete('/tecnicos/:id', autentificarToken, async (req, res) => {
    const {id} = req.params
    try{
        const deletarRegistro = await pool.query('DELETE FROM tecnicos WHERE id = $1 RETURNING *', [id])
        res.json(deletarRegistro.rows[0])
    }catch(erro){
        res.json({message: "Erro ao deletar entidade 1!"})
    }
})

app.get('/vinculo', autentificarToken, async (req, res) => {
    try{
        const registros = await pool.query(`
            SELECT
                vinculo.id,
                TO_CHAR(vinculo.data_vinculo, 'YYYY-MM-DD') AS data_vinculo,
                vinculo.id_registros,
                registros.campo1 AS registros,
                registros.campo2,
                vinculo.id_tecnicos,
                tecnicos.campo1 AS tecnicos,
                vinculo.id_solicitantes,
                solicitantes.campo1 AS solicitantes
            FROM vinculo
            JOIN registros ON registros.id = vinculo.id_registros
            JOIN tecnicos ON tecnicos.id = vinculo.id_tecnicos
            JOIN solicitantes ON solicitantes.id = vinculo.id_solicitantes
            ORDER BY vinculo.data_vinculo
        `)
        res.json(registros.rows)
    }catch(erro){
        res.status(500).json({message: "Erro ao consultar vínculos!"})
    }
})

app.post('/vinculo', autentificarToken, async (req, res) => {
    const {data_vinculo, id_registros, id_tecnicos, id_solicitantes} = req.body
    try{
        const novoRegistro = await pool.query('INSERT INTO vinculo (data_vinculo, id_registros, id_tecnicos, id_solicitantes) VALUES ($1, $2, $3, $4) RETURNING *', [data_vinculo, id_registros, id_tecnicos, id_solicitantes])
        res.json(novoRegistro.rows[0])
    }catch(erro){
        res.json({message: "Erro ao cadastrar vínculo!"})
    }
})

app.put('/vinculo/:id', autentificarToken, async (req, res) => {
    const {id} = req.params
    const {data_vinculo, id_registros, id_tecnicos, id_solicitantes} = req.body

    try{
        const atualizarRegistro = await pool.query('UPDATE vinculo SET data_vinculo = $1, id_registros = $2, id_tecnicos = $3, id_solicitantes = $4 WHERE id = $5 RETURNING *', [data_vinculo, id_registros, id_tecnicos, id_solicitantes, id])
        res.json(atualizarRegistro.rows[0])
    }catch(erro){
        res.json({message: "Erro ao atualizar vínculo!"})
    }
})

app.delete('/vinculo/:id', autentificarToken, async (req, res) => {
    const {id} = req.params
    try{
        const deletarRegistro = await pool.query('DELETE FROM vinculo WHERE id = $1 RETURNING *', [id])
        res.json(deletarRegistro.rows[0])
    }catch(erro){
        res.json({message: "Erro ao deletar vínculo!"})
    }
})

app.get('/registros', autentificarToken, async (req, res) => {
    try{
        const registros = await pool.query("SELECT id, campo1, campo2 FROM registros")
        return res.status(200).json(registros.rows)
    }catch(erro){
        return res.status(400).json({
            message: "Erro ao consultar entidade 3."
        })
    }
})

app.post('/registros', autentificarToken, async (req, res) => {
    const {campo1, campo2} = req.body
    try{
        const novoRegistro = await pool.query("INSERT INTO registros (campo1, campo2) VALUES ($1, $2) RETURNING *", [campo1, campo2])
        return res.status(200).json(novoRegistro.rows[0])
    }catch(erro){
        return res.status(400).json({
            message: "Não foi possível cadastrar entidade 3."
        })
    }
})

app.put('/registros/:id', autentificarToken, async (req, res) => {
    const { id } = req.params
    const { campo1, campo2 } = req.body
    try {
        const resultado = await pool.query(
            'UPDATE registros SET campo1 = $1, campo2 = $2 WHERE id = $3 RETURNING *',
            [campo1, campo2, id]
        )
        if (!resultado.rows.length) return res.status(404).json({ message: "Registro não encontrado." })
        return res.json(resultado.rows[0])
    } catch (erro) {
        return res.status(400).json({ message: "Não foi possível atualizar entidade 3." })
    }
})

app.delete('/registros/:id', autentificarToken, async (req, res) => {
    try {
        const resultado = await pool.query('DELETE FROM registros WHERE id = $1 RETURNING *', [req.params.id])
        if (!resultado.rows.length) return res.status(404).json({ message: "Registro não encontrado." })
        return res.json(resultado.rows[0])
    } catch (erro) {
        return res.status(400).json({ message: "Não foi possível excluir. Verifique se ele possui vínculos." })
    }
})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
