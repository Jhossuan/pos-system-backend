import { Router, Request, Response } from "express"
import { AuthController } from "../controllers/AuthController";

export class AuthRouter {
    private static instance: AuthRouter
    private router: Router

    private constructor() {
        this.router = Router();
        this.router.post('/register', this.RegisterUser);
        this.router.post('/complete-profile', this.CompleteProfile);
        this.router.post('/login', this.Login);
    }

    static getRouter(): Router {
        if(!AuthRouter.instance) {
            AuthRouter.instance = new AuthRouter();
        }
        return AuthRouter.instance.router;
    }

    private RegisterUser = async(req: Request, res: Response) => {
        try {
            const { name, email, password } = req.body

            const response  = await AuthController.RegisterUser({ name, email, password })

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private CompleteProfile = async(req: Request, res: Response) => {
        try {
            const { uid, phone, country, position, company } = req.body

            const response  = await AuthController.CompleteProfile({ uid, phone, country, position, company })

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private Login = async(req: Request, res: Response) => {
        try {
            const { email, password } = req.body

            const response  = await AuthController.Login({ email, password })

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

}