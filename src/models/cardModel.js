import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']

const validateBeforeCreate = async (data) => {
  return CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    return await GET_DB().collection(CARD_COLLECTION_NAME).insertOne({
      ...validData,
      boardId: new ObjectId(String(validData.boardId)),
      columnId: new ObjectId(String(validData.columnId))
    })
  } catch (error) { throw Error(error) }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
  } catch (error) { throw Error(error) }
}

const update = async (cardId, updateData) => {
  try {
    // Loại bỏ các field có trong INVALID_UPDATE_FIELDS
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Đối với những dữ liệu liên quan tới ObjectId biến đổi nó ở đây
    if (updateData.columnId) updateData.columnId = new ObjectId(String(updateData.columnId))

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(cardId)) },
      { $set: updateData },
      { returnDocument: 'after' } // Nếu k có sẽ trả về bảng trước khi cập nhật.
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByColumnId = async (columnId) => {
  try {
    return await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
      columnId: new ObjectId(String(columnId))
    })
  } catch (error) { throw Error(error) }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId
}
