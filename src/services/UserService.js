import prisma from "../db/index.js"; 

export class UserService {
  async create(data) {
    const user = await prisma.user.create({ data });

    if (user.role === "STUDENT") {
      await prisma.student.create({
        data: {
          userId: user.id,
        },
      });
    } else if (user.role === "TEACHER") {
      await prisma.teacher.create({
        data: {
          userId: user.id,
        },
      });
    }

    return user;
  }

  async findById(id) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async updateUser(id, data) {
    return await prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id) {
    return await prisma.user.delete({ where: { id } });
  }

  async changePassword(id, password) {
    return await prisma.user.update({
      where: { id },
      data: { password },
    });
  }

}
