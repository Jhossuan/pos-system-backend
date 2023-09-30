export type SubscriptionsT = 
    "FREE" |
    "BASIC" |
    "MEDIUM" |
    "PROFESIONAL"

export type MetadataI = {
    pos: Array<string> | [] // ["posId1002031", "posId2202081", "posId9022215"]
    lastConnection: Date | null
    subscription: SubscriptionsT
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