import { App } from "./app";
import dotenvConfig from "./config/dotenvConfig";
import connectDb from "./database/connect";

const startApp = async() => {
    dotenvConfig()
    const app = App.getInstance()
    const port = process.env.PORT || 5000

    connectDb()
    app.listen(port, () => { console.log(`Server running in port ${port}`) })
}

startApp()