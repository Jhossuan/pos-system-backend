import { ControllerResponse } from "../types/app";
import Profile from "../models/ProfileSchema";
import User from "../models/UserSchema";

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

}