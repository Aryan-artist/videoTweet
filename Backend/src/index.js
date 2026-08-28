import 'dotenv/config'

import { DB_NAME } from './constants.js'
import connectDB from './db/index.js'
import { app } from './app.js'

const port = process.env.PORT || 3000



connectDB()
.then(() => {
    app.listen(port, () => {
    console.log(`App listening on port ${port}`)})
})

.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
})

