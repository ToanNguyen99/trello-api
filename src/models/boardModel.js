import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'

// Xử lý validate data lần nữa để lưu vào database
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(255).trim().strict(),
  type: Joi.string().valid(...Object.values(BOARD_TYPES)).required(),

  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Chỉ định ra những trường k cho phép cập nhật
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)
  } catch (error) { throw Error(error) }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
  } catch (error) { throw Error(error) }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(id)),
        _destroy: false
      } },
      { $lookup: {
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField: '_id', // id board hiện tại đang đứng để query
        foreignField: 'boardId', // Tìm tới collection khác mà ta muốn tìm và kết nối
        as: 'columns'
      } },
      { $lookup: {
        from: cardModel.CARD_COLLECTION_NAME,
        localField: '_id', // id board hiện tại đang đứng để query
        foreignField: 'boardId', // Tìm tới collection khác mà ta muốn tìm và kết nối
        as: 'cards'
      } }
    ]).toArray()
    return result[0] || null
  } catch (error) { throw Error(error) }
}

// Func này push 1 giá trị columnId từ component columnService vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $push: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: 'after' } // Nếu k có sẽ trả về bảng trước khi cập nhật.
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    // Loại bỏ các field có trong INVALID_UPDATE_FIELDS
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(String(_id))))
    }
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(boardId)) },
      { $set: updateData },
      { returnDocument: 'after' } // Nếu k có sẽ trả về bảng trước khi cập nhật.
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy 1 phần tử columnId ra từ mảng columnOrderIds
// dùng pull trong trường hợp này là để lấy 1 phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $pull: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: 'after' } // Nếu k có sẽ trả về bảng trước khi cập nhật.
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds
}
