import Store from "../models/StoreSchema"
import { ControllerResponse } from "../types/app"

export class StoreController {

    static createStore = async (name: string, pos?: Array<{ posId: string, name: string }>): Promise<ControllerResponse<Object>> => {

        if(!name){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Todos los usuarios son requeridos"
                }
            }
        }

        const newStore = new Store({
            name,
            pos: pos || []
        })

        try {

            await newStore.save()

            return {
                success: true,
                code: 200,
                res: {
                    msg: 'Sucursal / Tienda creada correctamente'
                }
            }
            
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: "Error at createStore"
                }
            }
        }
    }

    static updateStore = async (name: string, pos?: Array<{ posId: string, name: string }>): Promise<ControllerResponse<Object>> => {

        if(!name){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Todos los usuarios son requeridos"
                }
            }
        }

        const newStore = new Store({
            name,
            pos: pos || []
        })

        try {

            await newStore.save()

            return {
                success: true,
                code: 200,
                res: {
                    msg: 'Sucursal / Tienda creada correctamente'
                }
            }
            
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: "Error at createStore"
                }
            }
        }
    }

}