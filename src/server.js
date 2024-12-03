/* eslint-disable no-console */

import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors'
import { CONNECT_DB, CLOSE_DB } from './config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from './config/environment'
import { API_V1 } from './routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'


const START_SERVER = () => {
  const app = express()

  // Xử lý CORS
  app.use(cors(corsOptions))

  app.use(express.json())

  app.use('/v1', API_V1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`3. Hello Toan Toan Dev, Backend server is running at ${ env.APP_HOST }:${ env.APP_PORT }`)
  })

  // Cleanup trước khi dừng server
  exitHook(() => {
    CLOSE_DB()
    console.log('4. Disconnected from MongoDB Atlas!')
  })
}

// IIFE và chỉ khi kết nối tới database thì mới start server backend lên
(async () => {
  try {
    console.log('1. Connecting to MongoDB Atlas...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Atlas!')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

// Cách khởi tạo then catch
// console.log('1. Connecting to MongoDB Atlas...')
// CONNECT_DB()
//   .then(() => console.log('2. Connected to MongoDB Atlas!'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })
