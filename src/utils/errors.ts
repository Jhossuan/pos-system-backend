const customErrors = (code: number | string, component?: string) => {
    switch (code) {
        case 11000:
            return "Algún dato definido como único ha sido duplicado"
        default:
            return `Error at ${component || "Not Found"}`
    }
}

export default customErrors