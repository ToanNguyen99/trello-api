import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'

const Router = express.Router()

// Check API v1 status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API V1 are Ready to use.' })
})

// Boards API
Router.use('/boards', boardRoute)
// Columns API
Router.use('/columns', columnRoute)
// Cards API
Router.use('/cards', cardRoute)

export const API_V1 = Router
