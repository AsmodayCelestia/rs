const {User, Patient, MedicalRecord, Transaction, Cart} = require('../models')
const {comparePassword} = require('../helpers/bcrypt')
const {signToken} = require('../helpers/jwt')
const { Op } = require("sequelize");
const axios = require('axios');

// const {OAuth2Client} = require('google-auth-library');
// const client = new OAuth2Client();

class Controller{
    static async login(req, res, next){
        try {
            const {email, password} = req.body
            // console.log(req.body,"<<<<<<<<< THIS IS BODY");
            if(!email){
                res.status(404).json({message: "Email is required"})
            }
            if(!password){
                res.status(404).json({message: "Password is required"})
            }
            const user = await User.findOne({where:{email}})
            // console.log(user,"<<<<<<< THIS IS USER");
            if(!user){
                res.status(404).json({message: "Invalid email/password"})
            }
            if(!user){
                res.status(401).json({message: "Invalid email/password"})
            }
            const compare = comparePassword(password, user.password)
            if(!compare){
                res.status(401).json({message: "Invalid email/password"})
            }
            const access_token = signToken({id:user.id})
            console.log(access_token);
            res.status(200).json({Authorization: `Bearer ${access_token}`})
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal Server Error"})
        }
    }

    static async allPatient(req, res, next){
        const { filter, page, sort, keyword } = req.query;
        // console.log(page, keyword, filter);
        const paramQuerySQL = {
            // include: [
            //     {model: MedicalRecord,
            //     }
            // ],
            order: [
                ['id', 'ASC'] 
            ]
        };
        let limit = 9
        let offset = 0

        //search
        // if(keyword["title"] !== '' && typeof keyword["title"] !== 'undefined'){
        //     const name = {[Op.iLike]: `%${keyword.title.name}%`};
        //         paramQuerySQL.where = {name};
        // }

        // sorting
        if (sort){
            paramQuerySQL.order = [["id", sort]]
        }

        // filtering by category
        // if (filter?.category) {
        //     paramQuerySQL.where = {
        //         categoryId: filter.category,
        //     }
        // }
        
        // pagination
        if (page !== '' && typeof page !== 'undefined') {
            if (page.size !== '' && typeof page.size !== 'undefined') {
                limit = page.size;
                paramQuerySQL.limit = limit;
            }
            if (page.number !== '' && typeof page.number !== 'undefined') {
                offset = page.number * limit - limit;
                paramQuerySQL.offset = offset;
            }
        } else {
        paramQuerySQL.limit = limit;
        paramQuerySQL.offset = offset;
        }
        console.log(paramQuerySQL, '<<<< ini yg bakal di findall');
        try {
            const menu = await Patient.findAll(paramQuerySQL)
            console.log(menu);
            res.status(200).json({message: 'Read Success', menu})
        } catch (error) {
            next(error)
        }
    }

    static async patient(req, res, next){
        const {id} = req.params
        console.log(id, "ini id dari params");
        try {
            const patient = await this.patient.findOne({
                where: {
                    id
                  },
                  include: [
                    {
                        model: ModelRecord, 
                    },
                ]
                });
            if(!menu){
                throw {name: "Error Not Found"}
            }
            res.status(200).json({patient, message: "Read Articles Detail Success"})
        } catch (error) {
            next(error);
        }
    }

    static async addPatient(req, res, next) {
        try {
            // if(req.body.data == undefined){
                const {firstName, lastName, address, phoneNumber} = req.body
                const data = await Patient.create({firstName, lastName, address, phoneNumber});
                console.log(data, "<<<<");
                
                res.status(200).json(data);
            // }else{
            //     const {firstName, lastName, address, phoneNumber} = req.body.data;
            //     const data = await Patient.create({firstName, lastName, address, phoneNumber});
            //     res.status(200).json(data);
            // }
            // const {firstName, lastName, address, phoneNumber} = req.body.data;
            // // Ensure "userId" is not included if it's not part of the Cart model
            // const data = await Patient.create({firstName, lastName, address, phoneNumber});
            // res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
module.exports = Controller