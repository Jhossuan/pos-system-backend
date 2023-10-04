export interface ProfileSchemaI {
    uid?: string
    phone: string
    country: CountryCodes
    position: Position
    company: string
    companyId: string
    store?: StoreT[]
}

export type StoreT = {
    storeId: string
    name: string
}

export enum Position {
    OWNER = 'OWNER', //Propietario
    MANAGER = 'MANAGER', //Gerente
    ADMIN = 'ADMIN', //Administrador
    CASHIER = 'CASHIER', //Cajero
}

export enum CountryCodes {
    COLOMBIA = 'CO',
    PERU = 'PE',
    CHILE = 'CH'
}