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
import ShortUniqueId from "short-unique-id";

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

    static SchemaNewPassword = Joi.object({
        password: Joi.string().min(6).max(1024).required(),
    })

    static ExpirationDate = (hours: number) => {
        return Math.floor(Date.now() / 1000) + (hours * 3200) // 3200 es igual a 60 * 60 ( 3200 equivale a 1hr en segundos )
    }

    static VerificationNumber = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static uid = new ShortUniqueId({ length:20 });

    static RegisterUser = async ({name, email, password, metadata}: UserSchemaI): Promise<ControllerResponse<Object>> => {

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
            password: hashPassword,
            ...( metadata?.subscription && { "metadata.subscription": metadata.subscription } )
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

    static CompleteProfile = async ({ uid, phone, country, position, company, companyId, store }: ProfileSchemaI): Promise<ControllerResponse<Object>> => {

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
            company,
            ...(companyId ? { companyId } : { companyId: this.uid.rnd() }),
            ...(store && { store }),// store es de type [{ storeId: string, name: string }]
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

    static VerificationCode = async (email: string, repassword?: boolean): Promise<ControllerResponse<Object>> => {

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

        if(user.identity_verified && !repassword){
            return {
                success: false,
                code: 400,
                error: {
                    msg: "Este usuario ya ha sido válidado"
                }
            }
        }
        
        try {
            const authData = {
                uid: user.uid,
                code: this.VerificationNumber(),
                expireIn: ToolsDate.expireInOneHour(),
                ...(repassword && { validate: false })
            }

            if(repassword){
                await User.findOneAndUpdate({ email },{ "metadata.passwordVerify": authData },{ new: true })
                return {
                    success: true,
                    code: 200,
                    res: authData
                }
            }
    
            await User.findOneAndUpdate({ email },{ "metadata.codeVerify": authData },{ new: true })

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

        const user = await User.findOne({ uid, "metadata.codeVerify.code": code })
        if(!user){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Datos de verificación incorrectos"
                }
            }
        }

        if(!user.metadata?.codeVerify){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Usuario sin datos de verificación"
                }
            }
        }

        let now = ToolsDate.getNow()
        let expireIn = user.metadata?.codeVerify?.expireIn

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
                { "metadata.codeVerify.code": code },
                {
                    $unset: { "metadata.codeVerify": 1 },
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

    static VerificateRepassword = async (uid: string, code: string): Promise<ControllerResponse<Object>> => {
        const user = await User.findOne({ uid, "metadata.passwordVerify.code": code })
        if(!user){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "El código ingresado es el incorrecto"
                }
            }
        }

        if(!user.metadata?.passwordVerify){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Usuario sin datos de verificación"
                }
            }
        }

        let now = ToolsDate.getNow()
        let expireIn = user.metadata?.passwordVerify?.expireIn

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
                { "metadata.passwordVerify.code": code },
                {
                    $set: { "metadata.passwordVerify.validate": true },
                },
                {
                    new: true
                }
            )

            return {
                success: true,
                code: 200,
                res: {
                    msg: "Código correcto, restablece tu contraseña"
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at VerificateRepassword'
                }
            }
        }



    }

    static ForgotPassword = async (uid: string, password: string): Promise<ControllerResponse<Object>> => {
        try {

            const user = await User.findOne({ uid })
            if(!user){
                return {
                    success: false,
                    code: 400,
                    error: {
                        msg: "Usuario no encontrado"
                    }
                }
            }

            if(!user.metadata?.passwordVerify?.validate){
                return {
                    success: false,
                    code: 400,
                    error: {
                        msg: "El usuario no ha solicitado recuperación de contraseña"
                    }
                }
            }
            
            if(!password){
                return {
                    success: false,
                    code: 400,
                    error: {
                        msg: "La contraseña es requerida"
                    }
                }
            }

            const { error } = this.SchemaNewPassword.validate({ password })

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

            await User.findOneAndUpdate(
                { uid },
                {
                    $unset: { "metadata.passwordVerify": 1 },
                    $set: { "password": hashPassword }
                },
                {
                    new: true
                }
            )

            return {
                success: true,
                code: 200,
                res: {
                    msg: "Contraseña restablecida correctamente"
                }
            }

        } catch (error) {
            console.log('error', error)
            return {
                success: false,
                code: 500,
                error: {
                    msg: "Error at ForgotPassword"
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

            if(!user.identity_verified){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "Debes verificar tu cuenta"
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