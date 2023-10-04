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
        this.router.post('/verificate-repassword', this.VerificateRepassword);
        this.router.post('/re-password', this.ForgotPassword);
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
            const { name, email, password, metadata } = req.body

            const response  = await AuthController.RegisterUser({ name, email, password, metadata })

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
            const { uid, phone, country, position, company, companyId, store } = req.body

            const response  = await AuthController.CompleteProfile({ uid, phone, country, position, company, companyId, store })

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
            const { email, repassword } = req.body

            const response  = await AuthController.VerificationCode(email, repassword)

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

    private VerificateRepassword = async(req: Request, res: Response) => {
        try {
            const { uid, code } = req.body

            const response  = await AuthController.VerificateRepassword(uid, code)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private ForgotPassword = async(req: Request, res: Response) => {
        try {
            const { uid, password } = req.body

            const response  = await AuthController.ForgotPassword(uid, password)

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