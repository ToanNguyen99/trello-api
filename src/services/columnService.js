/* eslint-disable no-useless-catch */
// Nơi xử lý dữ liệu
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    // Gọi tới tầng modal để xử lý lưu bảng ghi newColumn vào database
    const createdColumn = await columnModel.createNew(newColumn)
    // Lấy data column mới nhất sau khi gọi
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      // Thêm 1 mảng cards rỗng cho chuẩn dữ liệu
      getNewColumn.cards = []
      // Cập nhật mảng columnOrderIds trong collection boards
      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn
  } catch (error) { throw error }
}


const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)
    return updatedColumn
  } catch (error) { throw error }
}

export const columnService = {
  createNew,
  update
}
