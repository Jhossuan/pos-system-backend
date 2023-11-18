import { Schema, model } from "mongoose";
import { ProfileSchemaI } from "../types/profile";

const ProfileSchema = new Schema({
    uid: {
        type: String,
        require: true,
        unique: true
    },
    phone: {
        type: String,
        require: true
    },
    country: {
        type: String,
        require: true,
    },
    position: {
        type: String,
        require: true,
    },
    company: {
        type: String,
        require: false
    },
    companyId: {
        type: String,
        require: true
    },
    store: {
        type: Array,
        require: false
    },
})

const Profile = model<ProfileSchemaI>('Profile', ProfileSchema)
export default Profile;