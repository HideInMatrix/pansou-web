import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  const config = useRuntimeConfig();
  const ADMIN_EMAIL = (config.public.adminEmail as string).toString() ?? "";
  const ADMIN_PASSWORD = (config.public.password as string).toString() ?? "";

  if (email === ADMIN_EMAIL && password.toString() === ADMIN_PASSWORD) {
    await setUserSession(event, {
      user: {
        name: "管理员",
        email: ADMIN_EMAIL,
        role: "Admin",
      },
    });
    return {
      code: 200,
      message: "登录成功",
    };
  }
  throw createError({
    statusCode: 401,
    message: "用户名或密码错误",
  });
});
