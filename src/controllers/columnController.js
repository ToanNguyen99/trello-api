import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const createNew = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng service
    const createColumn = await columnService.createNew(req.body)
    // Sau khi có kq trả về phía client
    res.status(StatusCodes.CREATED).json(createColumn)
  } catch (error) { next(error) }
}

export const columnController = {
  createNew
}