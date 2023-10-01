import { ControllerResponse } from "../types/app";
import Joi from "joi";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import User from "../models/UserSchema";
import customErrors from "../utils/errors";
import Profile from "../models/ProfileSchema";
import { UserSchemaI } from "../types/user";
import { ProfileSchemaI } from "../types/profile";
import { ToolsDate } from "../utils/toolsDate";
import moment from 'moment'

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

    static ExpirationDate = (hours: number) => {
        return Math.floor(Date.now() / 1000) + (hours * 3200) // 3200 es igual a 60 * 60 ( 3200 equivale a 1hr en segundos )
    }

    static VerificationNumber = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
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

    static VerificationCode = async (email: string): Promise<ControllerResponse<Object>> => {

        if(!email){
            return {
                success: false,
                code: 400,
                error: {
                    msg: "El email es requerido"
                }
            }
        }

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

        
        if(user.metadata?.authVerify){
            let now = ToolsDate.getNow()
            let expireIn = user.metadata?.authVerify?.expireIn

            if(new Date(now) < new Date(expireIn)){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: `Tu código esta vigente hasta: ${ moment(expireIn).format('LTS') }`,
                    }
                }
            }

        }

        try {
            const authData = {
                uid: user.uid,
                code: this.VerificationNumber(),
                expireIn: ToolsDate.expireInOneHour()
            }
    
            await User.findOneAndUpdate({ email },{ "metadata.authVerify": authData },{ new: true })

            return {
                success: true,
                code: 200,
                res: authData
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

    static VerificateAccount = async (uid: string, code: string): Promise<ControllerResponse<Object>> => {

        const user = await User.findOne({ uid, "metadata.authVerify.code": code })
        if(!user){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Datos de verificación incorrectos"
                }
            }
        }

        if(!user.metadata?.authVerify){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Usuario sin datos de verificación"
                }
            }
        }

        let now = ToolsDate.getNow()
        let expireIn = user.metadata?.authVerify?.expireIn

        if(new Date(now) >= new Date(expireIn)){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "El código ha expirado"
                }
            }
        }

        
        try {

            await User.findOneAndUpdate(
                { "metadata.authVerify.code": code },
                {
                    $unset: { "metadata.authVerify": 1 },
                    $set: { "identity_verified": true }
                },
                {
                    new: true
                }
            )

            return {
                success: true,
                code: 200,
                res: {
                    msg: "Usuario verificado correctamente"
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Error at VerificateAccount"
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
                exp: this.ExpirationDate(12)
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