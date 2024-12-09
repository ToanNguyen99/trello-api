/* eslint-disable no-useless-catch */
// Nơi xử lý dữ liệu
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'

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

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }
    // Xóa column
    await columnModel.deleteOneById(columnId)

    // Xóa card
    await cardModel.deleteManyByColumnId(columnId)

    // Xóa ColumnId trong mảng orderColumnIds của cái board chứa nó
    await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteResult: 'Column and its Cards are delete successfully' }
  } catch (error) { throw error }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}
