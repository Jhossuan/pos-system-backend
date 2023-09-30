import { ControllerResponse } from "../types/app";
import Joi from "joi";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import User from "../models/UserSchema";
import customErrors from "../utils/errors";
import Profile from "../models/ProfileSchema";
import { UserSchemaI } from "../types/user";
import { ProfileSchemaI } from "../types/profile";

export class AuthController {

    static SchemaRegister = Joi.object({
        name: Joi.string().min(4).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required(),
    })

    static SchemaLogin = Joi.object({
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required(),
    })

    static ExpirationDate = () => {
        return Math.floor(Date.now() / 1000) + (12 * 3200)
    }

    static RegisterUser = async ({name, email, password}: UserSchemaI): Promise<ControllerResponse<Object>> => {

        const isEmailExist = await User.findOne({ email })
        if(isEmailExist){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Email ya registrado"
                }
            }
        }

        const { error } = this.SchemaRegister.validate({ name, email, password })

        if(error){
            return {
                success: false,
                code: 404,
                error: {
                    msg: error.details[0].message
                }
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: hashPassword
        })

        try {

            const response = await user.save()

            return {
                success: true,
                code: 200,
                res: response
            }
        } catch (error: any) {
            console.log('error', error)
            return {
                success: false,
                code: 500,
                error: {
                    msg: customErrors(error?.code, "RegisterUser")
                }
            }
        }
    }

    static CompleteProfile = async ({ uid, phone, country, position, company }: ProfileSchemaI): Promise<ControllerResponse<Object>> => {

        if(!uid || !phone || !country || !position || !company){
            return {
                success: false,
                code: 400,
                error: {
                    msg: 'Todos los campos son requeridos'
                }
            }
        }

        const user = await User.findOne({ uid })
        if(!user){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Usuario no encontrado"
                } 
            }
        }

        const profile = new Profile({
            uid,
            phone,
            country,
            position,
            company
        })

        try {

            await profile.save()

            return {
                success: true,
                code: 200,
                res: {
                    msg: 'Perfil completado correctamente'
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at CompleteProfile'
                }
            }
        }
    }

    static ValidateUser = async (email: string): Promise<ControllerResponse<Object>> => {

        const user = await User.findOne({ email })
        if(!user){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Usuario no encontrado"
                }
            }
        }

        try {
            return {
                success: true,
                code: 200,
                res: {
                    msg: 'Ok'
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: "Error at ValidateUser"
                }
            }
        }
    }

    static Login = async ({email, password}: {email: string, password: string}): Promise<ControllerResponse<Object>> => {

        try {
            const { error } = this.SchemaLogin.validate({ email, password })
            if(error) {
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: error.details[0].message
                    }
                }
            }

            const user = await User.findOne({ email })
            if(!user) {
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'Usuario no encontrado'
                    }
                }
            }

            const hashPassword = await bcrypt.compare(password, user.password);
            if(!hashPassword) {
                return {
                    success: false,
                    code: 400,
                    error: {
                        msg: 'Contraseña incorrecta'
                    }
                }
            }

            const token = jwt.sign({
                name: user.name,
                email: user.email,
                id: user._id,
                exp: this.ExpirationDate()
            }, process.env.TOKEN_SECRET as string)

            return {
                success: true,
                code: 200,
                res: {
                    msg: "Sesión iniciada correctamente",
                    token
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at Login'
                }
            }
        }
    }

}