import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export class ClassController {
  constructor(classService) {
    this.classService = classService;
  }

  createClass = async (req, res, next) => {
    try {
      console.log(req.user.role);
      const { name } = req.body;
      if (!name) {
        throw new ApiError(400, "Class name is required");
      }
      const newClass = await this.classService.createClass({ name });
      return res
        .status(201)
        .json(new ApiResponse(201, newClass, "Class created"));
    } catch (err) {
      next(err);
    }
  };

  getAllClasses = async (req, res, next) => {
    try {
      const classes = await this.classService.getAllClasses();
      return res.status(200).json(new ApiResponse(200, classes));
    } catch (err) {
      next(err);
    }
  };

  getClassById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const classs = await this.classService.getClassById(id);
      if (!classs) {
        throw new ApiError(404, "Class not found");
      }
      return res.status(200).json(new ApiResponse(200, classs));
    } catch (err) {
      next(err);
    }
  };

  deleteClass = async (req, res, next) => {
    try {
      if (req.user.role !== "ADMIN") {
        return res
          .status(403)
          .json(
            new ApiError(403, "You are not authorized to perform this action")
          );
      }
      const { id } = req.params;
      const deletedClass = await this.classService.deleteClass(id);
      return res
        .status(200)
        .json(new ApiResponse(200, deletedClass, "Class deleted"));
    } catch (err) {
      next(err);
    }
  };

  updateClass = async (req, res, next) => {
    try {
      if (req.user.role !== "ADMIN") {
        return res
          .status(403)
          .json(
            new ApiError(403, "You are not authorized to perform this action")
          );
      }
      const { id } = req.params;
      const { name } = req.body;
      const updatedClass = await this.classService.updateClass(id, { name });
      return res
        .status(200)
        .json(new ApiResponse(200, updatedClass, "Class updated"));
    } catch (err) {
      next(err);
    }
  };
}
