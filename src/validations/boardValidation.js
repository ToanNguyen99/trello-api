import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title length must be at least 3 characters long',
      'string.max': 'Title length must be less than or equal to 50 characters long',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict().messages({
      'string.max': 'Title length must be less than or equal to 256 characters long',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    type: Joi.string().valid(...Object.values(BOARD_TYPES)).required()
  })

  try {
    // Chỉ định abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi.
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validate dữ liệu xong hợp lệ thì cho đi tiếp qua Controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const update = async (req, res, next) => {
  // Không require trong trường hợp update
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict().messages(),
    description: Joi.string().min(3).max(256).trim().strict().messages(),
    type: Joi.string().valid(...Object.values(BOARD_TYPES))
  })

  try {
    //allowUnknown là mình được đẩy thêm fields ngoài những field đã định nghĩa trong correctCondition
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const boardValidation = {
  createNew,
  update
}