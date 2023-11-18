import { Router } from "express"
import { StoreController } from "../controllers/StoreController";

export class StoreRouter {
    private static instance: StoreRouter
    private router: Router

    private constructor() {
        this.router = Router();
        this.router.post('/store/create', this.createStore)
    }

    static getRouter(): Router {
        if(!StoreRouter.instance) {
            StoreRouter.instance = new StoreRouter();
        }
        return  StoreRouter.instance.router;
    }

    private createStore = async() => {
        // try {

        //     // const response  = await StoreController.createStore()

        //     if(!response.success){
        //         return res.status(response.code).send(response.error)
        //     }
        //     return res.status(response.code).send(response.res)
        // } catch (error: any) {
        //     return res.status(500).send(error.message)
        // }
    }

}