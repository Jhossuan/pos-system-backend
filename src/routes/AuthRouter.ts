import { Router, Request, Response } from "express"
import { AuthController } from "../controllers/AuthController";

export class AuthRouter {
    private static instance: AuthRouter
    private router: Router

    private constructor() {
        this.router = Router();
        this.router.post('/register', this.RegisterUser);
        this.router.post('/complete-profile', this.CompleteProfile);
        this.router.post('/verification-code', this.VerificationCode);
        this.router.post('/verificate-account', this.VerificateAccount);
        this.router.post('/re-password', this.GenerateNewPassword);
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

    private VerificationCode = async(req: Request, res: Response) => {
        try {
            const { email } = req.body

            const response  = await AuthController.VerificationCode(email)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private VerificateAccount = async(req: Request, res: Response) => {
        try {
            const { uid, code } = req.body

            const response  = await AuthController.VerificateAccount(uid, code)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private GenerateNewPassword = async(req: Request, res: Response) => {
        try {
            const { uid, code, password } = req.body

            const response  = await AuthController.GenerateNewPassword(uid, code, password)

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