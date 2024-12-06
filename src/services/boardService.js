/* eslint-disable no-useless-catch */
// Nơi xử lý dữ liệu
import { slugify } from '~/utils/formmatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'

const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng modal để xử lý lưu bảng ghi newBoard vào database
    const createdBoard = await boardModel.createNew(newBoard)

    // Lấy data board mới nhất sau khi gọi
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Làm thêm các xử lý khác với các Collection khác tùy đặc thù dự án ...vv
    // Bắn email, notification về cho admin khác khi có 1 cái board mới được tạo ...vv

    // Trong service luôn bắt buộc phải có return trả kết quả về
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Clone ra trước khi sửa vào mảng tránh ảnh hưởng mảng ban đầu
    const resBoard = cloneDeep(board)

    resBoard.columns.forEach(column => {
      // Cách dùng equals vì ObjectId trong mongodb có support method .equals
      // .equals sẽ hỗ trợ gửi lỗi nếu gửi card.columnId là 1 string không có dạng objectId
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))

      // Cách thường dùng js
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    delete resBoard.cards

    return resBoard
  } catch (error) { throw error }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)
    return updatedBoard
  } catch (error) { throw error }
}
const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // B1. Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của card ra khỏi mảng trong column cũ)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    // B2. Cập nhật mảng cardOrderIds của column tiếp theo (Hiểu bản chất là thêm _id của card này vào mảng cardOrderIds trong column mới)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    // B3. Cập nhật lại trường ColumnId mới của cái card đã kéo.
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })
    return { updateResult: 'Success' }
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn
}
