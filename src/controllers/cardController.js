import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng service
    const createCard = await cardService.createNew(req.body)
    // Sau khi có kq trả về phía client
    res.status(StatusCodes.CREATED).json(createCard)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew
}
