import { ControllerResponse } from "../types/app";
import Profile from "../models/ProfileSchema";
import User from "../models/UserSchema";
import { ProfileSchemaI } from "../types/profile";
import { UserSchemaI } from "../types/user";

export class UserController {

    static getUsers = async(): Promise<ControllerResponse<any>> => {
        try {

            const response = await User.find()

            return {
                success: true,
                code: 200,
                res: response
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at getUsers'
                }
            }
        }
    }

    static deleteUser = async(uid: string): Promise<ControllerResponse<Object | string>> => {

        if(!uid){
            return {
                success: false,
                code: 400,
                error: {
                    msg: 'UID es requerido'
                }
            }
        }

        const user = await User.deleteOne({ uid })
        const profile = await Profile.deleteOne({ uid })

        if(!user || !profile){
            return {
                success: false,
                code: 400,
                error: {
                    msg: 'Error a la hora de eliminar el perfil'
                }
            }
        }

        try {
            return {
                success: true,
                code: 200,
                res: {
                    msg: 'Usuario eliminado correctamente'
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at userDelete'
                }
            }
        }
    }

    static EditProfile = async (uid: string, newData: ProfileSchemaI): Promise<ControllerResponse<Object>> => {

        const profile = await Profile.findOne({ uid })
        if(!profile){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Perfil no encontrado"
                }
            }
        }

        if(newData.uid || newData.companyId){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Datos no modificables"
                }
            }
        }

        const update: any = { $set: {  } }
        const values = Object.values(newData)
        const keys = Object.keys(newData)

        keys.forEach((item: string, i: number) => update['$set'][item] = values[i])

        if(Object.keys(update['$set']).length <= 0){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Campos a actualizar no proporcionados"
                }
            }
        }

        await Profile.findOneAndUpdate(
            { uid },
            update,
            { new: true }
        )

        try {
            return {
                success: true,
                code: 200,
                res: {
                    msg: "Perfil actualizado correctamente"
                }
            }
        } catch (error) {
            console.log('error-profile', error)
            return {
                success: false,
                code: 500,
                error: {
                    msg: "Error at EditProfile"
                }
            }
        }
    }

    static EditUserData = async (uid: string, newData: UserSchemaI): Promise<ControllerResponse<Object>> => {

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

        if( newData.uid ||
            newData.password ||
            newData.created_at ||
            newData.identity_verified ||
            newData.metadata
        ){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Solo se pueden editar el email y nombre"
                }
            }
        }

        const update: any = { $set: {  } }
        const values = Object.values(newData)
        const keys = Object.keys(newData)

        keys.forEach((item: string, i: number) => update['$set'][item] = values[i])

        if(Object.keys(update['$set']).length <= 0){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Campos a actualizar no proporcionados"
                }
            }
        }

        await User.findOneAndUpdate(
            { uid },
            update,
            { new: true }
        )

        try {
            return {
                success: true,
                code: 200,
                res: {
                    msg: "Usuario actualizado correctamente"
                }
            }
        } catch (error) {
            console.log('error-profile', error)
            return {
                success: false,
                code: 500,
                error: {
                    msg: "Error at EditUserData"
                }
            }
        }
    }

}