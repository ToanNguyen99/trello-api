/* eslint-disable no-useless-catch */
// Nơi xử lý dữ liệu
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    // Gọi tới tầng modal để xử lý lưu bảng ghi newCard vào database
    const createdCard = await cardModel.createNew(newCard)
    // Lấy data card mới nhất sau khi gọi
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)
    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew
}