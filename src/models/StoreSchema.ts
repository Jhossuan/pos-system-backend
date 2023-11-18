import { Schema, model } from "mongoose";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length:20 });

const InitPost = { 
    posId: `posId-${() => uid.rnd()}`,
    name: 'Principal'
}

const StoreSchema = new Schema({
    companyId: {
        type: String,
        require: true
    },
    storeId: {
        type: String,
        require: true,
        default: `storeId-${() => uid.rnd()}`
    },
    name: {
        type: String,
        require: true,
    },
    pos: {
        type: Array,
        require: false,
        default: InitPost
    }
})

const Store = model('Store', StoreSchema)
export default Store