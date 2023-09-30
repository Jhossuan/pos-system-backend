import dotenv from 'dotenv'

const dotenvConfig = () => {
    if (process.env.NODE_ENV === 'development') {
        dotenv.config({ path: '.env.development' });
        console.log('Development server')
      } else if (process.env.NODE_ENV === 'production') {
        dotenv.config({ path: '.env.production' });
        console.log('Production server')
    }
}

export default dotenvConfig