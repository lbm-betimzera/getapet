const User = require('../models/User')
const bcrypt = require('bcrypt');
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const jwt = require('jsonwebtoken')

module.exports = class UserController {
    static async register(req, res) {
        const {name, email, phone, password, confirmpassword} = req.body;

        if(!name){
            res.status(422).json({ message: 'o nome é obrigatorio'})
        }

        if(!email){
            res.status(422).json({ message: 'o email é obrigatorio'})
        }

        if(!phone){
            res.status(422).json({ message: 'o telefone é obrigatorio'})
        }

        if(!password){
            res.status(422).json({ message: 'a senha é obrigatorio'})
        }

        if(!confirmpassword){
            res.status(422).json({ message: 'a confirmação de senha é obrigatorio'})
        }

        if(password !== confirmpassword){
            res.status(422).json({ message: 'a senha e confirmação não conferem'})
            return
        }

        const userExists = await User.findOne({ email: email})

        if(userExists){
            res.status(422).json({ message: 'por favor utilize outro email'})
            return
        }

        //create password

        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        const user = new User({
            name,
            email,
            phone,
            password : passwordHash
        })

        try {
            const newUser = await user.save()
            await createUserToken(newUser, req, res)

        } catch (error) {
            res.status(500).json({ message: error})
        }

    }

    static async login(req, res){
        const {email, password} = req.body

        if(!email){
            res.status(422).json({ message: 'o email é obrigatorio'})
            return
        }

        if(!password){
            res.status(422).json({ message: 'a senha é obrigatoria'})
            return
        }

        const user = await User.findOne({ email: email})

        if(!user){
            res.status(422).json({
                 message: 'Não há usuario para esse email',
            })
            return
        }
        console.log(password, user.password)
        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword){
            res.status(422).json({
                message: 'Senha invalida',
           })
           return
        }

        await createUserToken(user, req, res)

    }

    static async checkUser(req, res){
        let currentUser

        if(req.headers.authorization){

           const token = getToken(req)
           const decoded = jwt.verify(token, 'nossosecret')

           currentUser = await User.findById(decoded.id)

           currentUser.password = undefined

        }else{
            currentUser = null
        }

        res.status(200).send(currentUser)

    }


}