export type SubscriptionsT = 
    "FREE" |
    "BASIC" |
    "MEDIUM" |
    "PROFESIONAL"

type CodeVerify = {
    uid: string,
    code: string | null,
    expireIn: Date,
    validate?: boolean
}

export type MetadataI = {
    lastConnection: Date | null
    subscription?: SubscriptionsT
    codeVerify?: CodeVerify,
    passwordVerify?: CodeVerify,
}

export interface UserSchemaI {
    uid?: string
    name: string
    email: string
    password: string
    identity_verified?: boolean
    metadata?: MetadataI
    created_at?: Date
}