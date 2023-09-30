import { Router } from "express"
import { UserController } from "../controllers/UserController";

export class UserRouter {
    private static instance: UserRouter
    private router: Router

    private constructor() {
        this.router = Router();
        this.router.get('/users', this.GetUsers);
        this.router.delete('/delete-user', this.DeleteUser);
    }

    static getRouter(): Router {
        if(!UserRouter.instance) {
            UserRouter.instance = new UserRouter();
        }
        return UserRouter.instance.router;
    }

    private GetUsers = async(req: any, res: any) => {
        try {
            const response = await UserController.getUsers()

            if(!response.success) {
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private DeleteUser = async(req: any, res: any) => {
        try {
            const { uid } = req.body

            const response  = await UserController.deleteUser(uid)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

}