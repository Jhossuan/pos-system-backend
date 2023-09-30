import { Router } from "express";
import { AuthRouter } from "./AuthRouter";
import verifyToken from "../middlewares/validate-token";
import { UserRouter } from "./UserRouter";

export class RootRouter {
    private static instance: RootRouter;
    private router: Router;

    constructor() {
        this.router = Router();
        this.router.use('/v1/auth', AuthRouter.getRouter());
        this.router.use(verifyToken)
        this.router.use('/v1/user', UserRouter.getRouter());
    }

    static getRouter(): Router {
        if(!RootRouter.instance) {
            RootRouter.instance = new RootRouter();
        }
        return RootRouter.instance.router;
    }

}